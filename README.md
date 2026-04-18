# UPAHAN — Digital Apartment Management System
Gordon College | Zambales Properties for Rent/Sale

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (15-min inactivity timeout)
- **Uploads:** Multer (local storage)

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 2. Setup Database
```sql
-- In psql or pgAdmin:
CREATE DATABASE upahan_db;
```

### 3. Configure Environment
```bash
# Root .env is pre-configured for local dev
# Update DB_PASSWORD if yours differs from "postgres"
```

### 4. Install Dependencies
```bash
npm run install:all
```

### 5. Run Schema + Seed
```bash
cd server
npm run schema   # Creates tables
npm run seed     # Inserts demo data
cd ..
```

### 6. Start Dev Servers
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Demo Accounts
| Role   | Email                | Password   | Unit  |
|--------|----------------------|------------|-------|
| Admin  | admin@upahan.com     | admin123   | —     |
| Tenant | maria@tenant.com     | tenant123  | 1A    |
| Tenant | jose@tenant.com      | tenant123  | 1B    |
| Tenant | ana@tenant.com       | tenant123  | 2A    |

Guest users can browse available units without logging in.

## Folder Structure
```
UPahan/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # BottomNav, Calendar, StatusBadge, Logo
│       ├── context/      # AuthContext (JWT + inactivity timer)
│       ├── pages/
│       │   ├── splash/   # Welcome screen
│       │   ├── auth/     # Login, Register, RoleSelect
│       │   ├── admin/    # Dashboard, Units, Maintenance
│       │   ├── tenant/   # Dashboard, Requests, Payments
│       │   └── guest/    # Available units (public)
│       └── utils/        # api.js, format.js
└── server/          # Express backend
    ├── config/       # PostgreSQL pool
    ├── controllers/  # Business logic
    ├── db/           # schema.sql, seed.js
    ├── middleware/   # JWT auth, file uploads
    └── routes/       # REST API endpoints
```

## API Endpoints
| Method | Endpoint                      | Auth    | Description              |
|--------|-------------------------------|---------|--------------------------|
| POST   | /api/auth/login               | None    | Login, returns JWT       |
| POST   | /api/auth/register            | None    | Create account           |
| GET    | /api/units                    | Optional| List units (vacant only for guests) |
| GET    | /api/units/:id                | Optional| Unit details             |
| POST   | /api/units                    | Admin   | Create unit              |
| GET    | /api/tenants/me               | Tenant  | My tenancy info          |
| GET    | /api/payments                 | User    | Payment history          |
| POST   | /api/payments                 | Admin   | Log payment              |
| GET    | /api/maintenance              | User    | Maintenance requests     |
| POST   | /api/maintenance              | Tenant  | Submit new request       |
| PUT    | /api/maintenance/:id          | Admin   | Update request status    |

## Color Scheme
- Primary Green: `#1DB954`
- Admin Dark: `#0F1923`
- Background: `#FFFFFF` / `#F5F5F5`
