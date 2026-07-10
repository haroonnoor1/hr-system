# HR Management System — Modules 1 & 2: Authentication + User Management

## Project Structure
```
hr-system/
├── backend/          Flask REST API
│   ├── app/
│   │   ├── __init__.py       App factory + JWT callbacks + DB seed
│   │   ├── config.py         Environment-based config
│   │   ├── extensions.py     SQLAlchemy, JWT, Mail, Bcrypt, CORS singletons
│   │   ├── models/
│   │   │   ├── user.py       User model (RoleEnum: admin|manager|employee)
│   │   │   └── token.py      PasswordResetToken + TokenBlocklist
│   │   ├── routes/
│   │   │   ├── auth.py       /api/auth/* endpoints
│   │   │   └── users.py      /api/users/* endpoints (CRUD, stats, toggle-status)
│   │   ├── errors.py         Custom 404/405/500 JSON error handlers
│   │   └── utils/
│   │       ├── decorators.py role_required() decorator
│   │       └── email.py      HTML reset-email sender
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
└── frontend/         React + Vite + Tailwind CSS
    ├── src/
    │   ├── context/AuthContext.jsx    Global auth state + login/logout
    │   ├── services/api.js            Axios instance + refresh-token interceptor
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx     Auth + role guard for React Router
    │   │   ├── Navbar.jsx             Top bar with role badge + logout
    │   │   ├── UserModal.jsx          Create/edit user form (admin)
    │   │   └── ConfirmDialog.jsx      Reusable confirm modal (delete/toggle status)
    │   └── pages/
    │       ├── Login.jsx              Split-screen login
    │       ├── Dashboard.jsx          Role-specific panels (admin/manager/employee)
    │       ├── ForgotPassword.jsx     Email submission + success state
    │       ├── ResetPassword.jsx      Token-based reset + strength indicator
    │       ├── UserManagement.jsx     Admin/manager user list, filters, CRUD (admin)
    │       └── Profile.jsx            Self-service profile + password change
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## Quick Start

### 1. MySQL — create the database
```sql
CREATE DATABASE hr_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # Fill in DATABASE_URL, mail credentials, etc.
python run.py                   # Tables created + admin seeded automatically
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 — login with `admin@hrms.com / Admin@1234`

## API Reference — Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Returns access + refresh tokens |
| POST | `/api/auth/refresh` | Refresh token | Returns new access token |
| POST | `/api/auth/logout` | Refresh token | Revokes refresh token |
| GET  | `/api/auth/me` | Access token | Returns current user |
| POST | `/api/auth/forgot-password` | — | Sends reset email |
| POST | `/api/auth/reset-password` | — | Validates token, updates password |

## Security Design

| Concern | Implementation |
|---------|---------------|
| Passwords | bcrypt (cost factor 12) |
| Access token | JWT, 15-minute expiry |
| Refresh token | JWT, 7-day expiry, stored in DB blocklist on logout |
| Password reset | SHA-256 hashed token stored; raw token emailed only |
| Email enumeration | Forgot-password always returns identical response |
| RBAC (backend) | `@role_required('admin', 'manager')` decorator on routes |
| RBAC (frontend) | `<ProtectedRoute allowedRoles={['admin']}>` wrapper |
| Session expiry | 401 interceptor silently refreshes; redirects to /login on failure |

## Gmail SMTP Setup
1. Enable 2FA on your Google account
2. Generate an App Password: Account → Security → App passwords
3. Set `MAIL_USERNAME=your@gmail.com` and `MAIL_PASSWORD=<app_password>` in `.env`

## API Reference — User Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/users` | Any role | List users (admin: all, manager: own team, employee: self only) |
| GET    | `/api/users/stats` | Admin, Manager | Total/active/inactive/role counts |
| POST   | `/api/users` | Admin | Create a user |
| GET    | `/api/users/<id>` | Any role (self, or admin/manager) | Get single user |
| PUT    | `/api/users/<id>` | Self or Admin | Update profile / role / password. Changing your **own** password requires `current_password` |
| DELETE | `/api/users/<id>` | Admin | Delete a user (cannot delete self) |
| PATCH  | `/api/users/<id>/toggle-status` | Admin | Activate/deactivate a user (cannot deactivate self) |

## Next Modules
- **Module 3:** Task Assignment — create, assign, status tracking
- **Module 4:** Leave Management — apply, approve/reject, leave balance
