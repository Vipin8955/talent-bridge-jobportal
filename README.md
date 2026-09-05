# 🚀 JobPortal — Full-Stack Role-Based Job Portal

A production-grade, full-stack recruitment platform engineered with **React.js**, **Node.js/Express**, and **MongoDB/Mongoose**, featuring end-to-end **JWT authentication**, **Role-Based Access Control (RBAC)** for Recruiters and Applicants, **Multer resume file uploads**, real-time **candidate pipeline management**, and **server-side search & filtering**.

---

## 🌟 Key Features & Capabilities

### 🔐 Authentication & Security
- **Role-Based Registration & Login**: Users register as either **Applicant** or **Recruiter**.
- **JWT Authentication**: JSON Web Tokens with Bearer authentication and 7-day expiration.
- **Bcrypt Password Hashing**: Pre-save Mongoose hook with 10 salt rounds (passwords never stored or returned in plaintext).
- **Protected Routes & Server Authorization**: Route-level protection on both client (`ProtectedRoute`, `RoleRoute`) and server (`protect`, `authorize`).
- **Data Security**: Express rate limiting (`express-rate-limit`), security headers (`helmet`), and CORS configuration.

### 💼 For Recruiters (Employers)
- **Recruiter Dashboard**: High-level hiring metrics (active jobs, total candidates, candidates under review, shortlisted, hired).
- **Job Management (CRUD)**: Create, edit, publish, and delete/deactivate job postings.
- **Strict Ownership Guard**: Recruiters can only edit/delete their own job postings.
- **Candidate Pipeline**: Filter candidates by job and status (`Applied`, `Reviewing`, `Shortlisted`, `Hired`, `Rejected`).
- **Resume Viewer & Downloader**: Download candidate-submitted PDF/DOCX resumes directly.
- **Application Status Manager**: Update candidate interview stages with optional internal notes.
- **Company Profile**: Customize company logo, description, and website URL.

### 👨‍💻 For Applicants (Job Seekers)
- **Job Search & Advanced Filters**: Search by keyword/title/company with filters for location, job type, experience level, remote-only, and salary range.
- **One-Click Application**: Apply with a cover letter and either an uploaded resume file (PDF/DOC/DOCX up to 5MB) or saved profile resume.
- **Duplicate Prevention**: Compound database index (`applicant + job`) prevents candidates from applying to the same job twice.
- **Applicant Dashboard**: Real-time status tracker for submitted applications, recent updates, and metrics.
- **Candidate Profile Manager**: Maintain skills tags, work experience history, education history, bio, and default resume.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js, RESTful API architecture |
| **Database** | MongoDB, Mongoose ODM (Indexes, Schemas, Virtuals, Pre-save Hooks) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **File Uploads** | `multer` (MIME type verification, 5MB file limits, secure sanitization) |
| **Security & Utilities** | `helmet`, `cors`, `express-rate-limit`, `morgan`, `dotenv` |

---

## 📁 Repository Structure

```
jobPortal/
├── client/                     # Frontend React application (Vite)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── api/                # Axios instance & API service modules
│   │   │   └── axios.js
│   │   ├── components/         # Reusable React components
│   │   │   ├── applications/   # ApplicationModal, StatusUpdateModal
│   │   │   ├── common/         # Navbar, Footer, StatusBadge, Pagination, Modal, etc.
│   │   │   └── jobs/           # JobCard, JobFilters
│   │   ├── context/            # Global AuthContext & hooks
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Role-specific & public page views
│   │   │   ├── applicant/      # ApplicantDashboard, MyApplications, Profile
│   │   │   ├── public/         # HomePage, JobsPage, JobDetailsPage, Login, Register
│   │   │   └── recruiter/      # RecruiterDashboard, MyJobs, CreateJob, Candidates
│   │   ├── App.jsx             # React Router routing configuration
│   │   ├── index.css           # Tailwind CSS & design tokens
│   │   └── main.jsx            # React root entrypoint
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection (Atlas / local / memory fallback)
│   ├── controllers/            # Controller handlers
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── statsController.js
│   │   └── userController.js
│   ├── middleware/             # Express middlewares
│   │   ├── auth.js             # JWT protect & role authorization
│   │   ├── errorHandler.js     # Centralized error handler & AppError
│   │   ├── upload.js           # Multer resume disk storage & filter
│   │   └── validator.js        # Request validation logic
│   ├── models/                 # Mongoose schemas
│   │   ├── Application.js
│   │   ├── Job.js
│   │   └── User.js
│   ├── routes/                 # API route definitions
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── statsRoutes.js
│   │   └── userRoutes.js
│   ├── tests/                  # Integration test suite
│   │   └── verify-all.js
│   ├── uploads/                # Uploaded resume documents (.gitkeep)
│   │   └── resumes/
│   ├── utils/
│   │   └── seeder.js           # Realistic database seeder
│   ├── .env.example
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── .gitignore
├── package.json                # Root orchestration package.json
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone & Install Dependencies
Run the all-in-one installation command from the repository root:

```bash
npm run install:all
```

*(Or install individually: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

---

### 2. Environment Configuration
The backend comes with pre-configured development defaults in `server/.env`. If you want to connect to a custom MongoDB Atlas instance, create or update `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=jobportal_super_secret_jwt_key_2026_production_grade
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=5
```

> **Note on Zero-Friction Setup**: If no local or remote MongoDB daemon is running, the server automatically initializes an in-memory MongoDB instance (`mongodb-memory-server`) for frictionless local evaluation!

---

### 3. Seed Database with Realistic Data
Populate the database with verified recruiters, applicants, 10+ jobs, and multiple application stages:

```bash
npm run seed
```

---

### 4. Start the Application
Run both the frontend client and backend API concurrently with a single command:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Demo Accounts

You can log in using any of the seeded demo accounts (or use the one-click demo credentials on the Login page):

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Recruiter** | Sarah Jenkins | `recruiter@techcorp.com` | `password123` | TechCorp Global (San Francisco) |
| **Recruiter** | Michael Chang | `recruiter@innovate.io` | `password123` | Innovate Labs (New York) |
| **Applicant** | Alex Rivera | `applicant@demo.com` | `password123` | Full-Stack Developer |
| **Applicant** | Emily Watson | `emily@demo.com` | `password123` | UI/UX Product Designer |
| **Applicant** | David Kim | `david@demo.com` | `password123` | DevOps & Cloud Engineer |

---

## 📡 REST API Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Applicant or Recruiter |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/auth/me` | Private | Retrieve currently authenticated user profile |
| `POST` | `/api/auth/logout` | Public | Sign out / invalidate session |

### Job Postings (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | Search and filter jobs with pagination |
| `GET` | `/api/jobs/:id` | Public | Get complete job details (tailored if applicant applied) |
| `POST` | `/api/jobs` | Recruiter | Create a new job posting |
| `PUT` | `/api/jobs/:id` | Recruiter (Owner) | Update an existing job posting |
| `DELETE` | `/api/jobs/:id` | Recruiter (Owner) | Remove a job posting and its applications |
| `GET` | `/api/jobs/recruiter/my` | Recruiter | Get all jobs posted by the logged-in recruiter |

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Applicant | Apply to a job with resume upload (Multer) |
| `GET` | `/api/applications/my` | Applicant | List applications submitted by the logged-in applicant |
| `GET` | `/api/applications/job/:jobId` | Recruiter (Owner) | List all candidate applications for a specific job |
| `GET` | `/api/applications/recruiter/all` | Recruiter | List all candidates across all recruiter's jobs |
| `PATCH` | `/api/applications/:id/status` | Recruiter (Owner) | Update candidate status (`Applied` -> `Hired`) |
| `GET` | `/api/applications/:id/resume` | Applicant / Recruiter | Securely download the candidate's resume |

### User Profiles & Stats (`/api/users`, `/api/stats`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Private | Get user profile details |
| `PUT` | `/api/users/profile` | Private | Update applicant or recruiter profile fields |
| `POST` | `/api/users/resume` | Applicant | Upload/replace default profile resume |
| `GET` | `/api/stats/applicant` | Applicant | Get dashboard metrics and recent applications |
| `GET` | `/api/stats/recruiter` | Recruiter | Get recruiter analytics and active job counts |

---

## 🧪 Automated Testing & Verification

Run the integration test suite covering auth, RBAC, job creation, ownership enforcement, file uploads, duplicate prevention, and status workflows:

```bash
npm run test:api
```

All 13 integration test scenarios run automatically against an isolated test environment.

---

## 🔮 Future Enhancements
- Email notifications on status changes (via SendGrid/Nodemailer).
- Cloud resume storage integration (AWS S3 or Cloudinary).
- Direct real-time recruiter-candidate messaging via WebSockets.
- AI-driven resume scoring and keyword match suggestions.

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
