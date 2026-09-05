class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error for debugging in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error Details]:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Invalid resource ID: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    let message = 'Duplicate field value entered.';
    if (field === 'email') {
      message = 'An account with this email address already exists.';
    } else if (err.keyPattern && err.keyPattern.applicant && err.keyPattern.job) {
      message = 'You have already applied for this job posting.';
    } else if (field) {
      message = `Duplicate value for field '${field}'. Please use another value.`;
    }
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your authentication session has expired. Please log in again.', 401);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File size is too large. Maximum allowed size is 5MB.', 400);
    } else {
      error = new AppError(`File upload error: ${err.message}`, 400);
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Internal Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
};
