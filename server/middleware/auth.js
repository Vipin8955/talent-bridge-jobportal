const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

// Protect routes - verifies JWT from Authorization header
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Not authorized to access this route. Please provide a token.', 401)
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_key_jobportal'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Not authorized to access this route. Invalid token.', 401));
  }
};

// Grant access to specific roles (e.g. 'recruiter', 'applicant')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: User role '${req.user.role}' is not authorized to perform this action.`,
          403
        )
      );
    }

    next();
  };
};

// Optional auth middleware: extracts user if token exists, but doesn't block if absent
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_key_jobportal'
    );
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
};
