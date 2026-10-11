# Business Management System

A role-based business operations application with a React frontend and an Express/MongoDB API. It includes account registration and login, role-specific dashboards, project management, project membership, and ticket management.

## Current features

- Register and log in with email and password; public registration creates a `customer` account.
- Authenticate API requests with a JWT in an HTTP-only cookie or a bearer token.
- View dashboards for admin, manager, employee, and customer roles.
- Create projects, view projects according to role, and use the project-membership API (currently affected by the validation issue noted below).
- Create, view, update, and delete tickets, with role- and project-based access checks.
- Display role-specific frontend dashboard areas. Several dashboard pages are currently placeholders; the admin dashboard currently uses mock data.

## Project structure

```text
Backend/                 Express API and MongoDB models
BM_Frontend/BMS/         React, Vite, and Tailwind CSS frontend
```

## Requirements

- Node.js and npm
- A MongoDB instance, local or hosted

## Setup and run

### Backend

In a terminal, install the backend dependencies:

```bash
cd Backend
npm install
```

Create `Backend/.env` with values for the backend configuration:

```env
PORT=4000
MONGODB_URL=mongodb://127.0.0.1:27017
DB_NAME=business_management
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

`MONGODB_URL`, `DB_NAME`, and `JWT_SECRET` are required. The API builds the MongoDB connection string by joining `MONGODB_URL` and `DB_NAME`. Set `PORT=4000` to match the frontend's current API URL. The backend CORS configuration allows the Vite development origin `http://localhost:5173`.

Start the API:

```bash
npm run dev
```

The backend also provides `npm start` for a regular Node.js start. When running, `GET /` returns a basic service message.

### Frontend

In a second terminal, install and run the frontend:

```bash
cd BM_Frontend/BMS
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173` by default. The frontend currently sends API requests to `http://localhost:4000`.

## Frontend routes

- `/register` and `/login` — account registration and login.
- `/admin/dashboard`, `/manager/dashboard`, `/employee/dashboard`, `/customer/dashboard` — role-specific dashboard routes.
- Each role also has additional navigation routes. Pages marked “under construction” are UI placeholders and are not complete features.

## API

All endpoints are mounted under `/api`. Requests and responses use JSON unless otherwise noted.

### Authentication and users

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/register` | Public | Register a customer account. Requires `username`, `email`, and `password`; any role supplied by a client is not used. |
| `POST` | `/api/login` | Public | Authenticate with `email` and `password`; sets the JWT cookie. |
| `POST` | `/api/logout` | Public | Clear the JWT cookie. |
| `GET` | `/api/profile` | Authenticated | Return the signed-in user's profile. |
| `GET` | `/api/users` | Admin | Return the user list without password fields. |
| `PATCH` | `/api/users/:userId/role` | Admin, manager | Update a user's role. Body: `{"role":"customer|employee|manager|admin"}`. |

### Dashboards

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/admin` | Admin | Return admin dashboard data. |
| `GET` | `/api/status/card` | Authenticated | Return status-card data. |
| `GET` | `/api/manager` | Admin, manager | Return manager dashboard data. |
| `GET` | `/api/employee` | Admin, manager, employee | Return employee dashboard data. |
| `GET` | `/api/customer` | Any authenticated role | Return customer dashboard data. |

### Projects

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/project` | Admin, manager | Create a project. Requires `name`, `startDate`, and `dueDate`; accepts `description`, `status`, `manager`, and `members`. |
| `GET` | `/api/get/project` | Admin, manager, employee | List projects visible to the signed-in user. Admins see all projects, managers see their projects, and employees see projects they belong to. |
| `POST` | `/api/:projectId/members` | Admin, manager | Intended to add an employee to a project. Body: `{"employeeId":"<user-id>"}`. Current employee-ID validation rejects valid IDs, so this endpoint may return `400` until that backend issue is fixed. |

Project status values are `planned`, `active`, `on-hold`, `completed`, and `cancelled`. A project's due date must be on or after its start date.

### Tickets

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/ticket/:projectId` | Admin, manager, employee | Create a ticket in a project. Requires `title` and `description`; optionally accepts `assignedTo` with an employee ID. |
| `GET` | `/api/tickets` | Admin, manager, employee, customer | List tickets visible to the signed-in user. |
| `POST` | `/api/update/ticket/:ticketId` | Admin, manager, assigned employee | Update ticket fields. Accepted fields: `title`, `description`, `status`, and `priority`. |
| `POST` | `/api/delete/ticket/:ticketId` | Admin, manager, assigned employee | Delete a ticket. |

Ticket status values are `open`, `in_progress`, `in_review`, `resolved`, and `closed`. Priority values are `low`, `medium`, `high`, and `critical`. Admins can access all tickets; managers are scoped to tickets in their projects; employees can access tickets assigned to them; customers can view tickets they created.

### Authentication details

Protected API routes accept the JWT from the `token` cookie or the authorization request header. Login and registration set an HTTP-only `token` cookie. For production, configure HTTPS and set `NODE_ENV=production` so the cookie is marked secure.

## Development notes

- Keep secrets and local configuration in environment files; do not commit `.env` files or credentials.
- Public registration creates customer accounts. Assign elevated roles only through a trusted admin-controlled process.
- The frontend currently has dedicated login and registration flows. Some dashboard destinations are placeholders, and the admin dashboard's displayed sample metrics and activity are mock data.
