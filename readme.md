# Business Management System Backend

An Express API for user registration, login, profiles, and role-protected dashboards. MongoDB is accessed through Mongoose, and authentication uses JWTs.

## Requirements

- Node.js and npm
- A running MongoDB instance

## Setup

From the repository root, install the backend dependencies and create `Backend/.env`:

```bash
cd Backend
npm install
```

```env
PORT=3000
MONGODB_URL=mongodb://127.0.0.1:27017
DB_NAME=business_management
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

`PORT`, `MONGODB_URL`, `DB_NAME`, and `JWT_SECRET` must be set. The database connection combines `MONGODB_URL` and `DB_NAME` (for example, `mongodb://127.0.0.1:27017/business_management`).

Start the API from `Backend`:

```bash
npm run dev
```

For a regular Node.js start, use `npm start`. The server listens at `http://localhost:<PORT>`; `GET /` returns a backend status message.

## API

All API endpoints are prefixed with `/api`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/register` | Public | Create an account. `role` is optional and defaults to `customer`. |
| `POST` | `/api/login` | Public | Verify email and password, then set the JWT cookie. |
| `GET` | `/api/profile` | Authenticated | Get the signed-in user's profile. |
| `GET` | `/api/users` | Authenticated | Get the user list. |
| `GET` | `/api/admin` | `admin` | Get the admin dashboard. |
| `GET` | `/api/manager` | `admin`, `manager` | Get the manager dashboard. |
| `GET` | `/api/employee` | `admin`, `manager`, `employee` | Get the employee dashboard. |
| `GET` | `/api/customer` | Any authenticated role | Get the customer dashboard. |

Supported roles are `admin`, `manager`, `employee`, and `customer`. Registration and login accept JSON request bodies. Registration requires `username`, `email`, and `password`; login requires `email` and `password`.

Authenticated endpoints accept a JWT from either the `token` cookie or an `Authorization: Bearer <token>` header. The token is set as an HTTP-only cookie during registration and login. In production, the cookie is marked `secure` when `NODE_ENV=production`.
