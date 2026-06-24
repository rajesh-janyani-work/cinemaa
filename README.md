# Cinemaa — Cinema Booking Backend API

A RESTful backend API for a cinema ticket booking application built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Auth | JWT (access + refresh tokens) |
| Docs | Swagger UI (OpenAPI 3.0) |
| Security | Helmet, CORS, express-rate-limit, bcrypt |
| Logging | Winston |

## Project Structure

```
src/
├── app.ts                        # Express app setup, routes, middleware
├── server.ts                     # Entry point, DB connection, graceful shutdown
├── config/
│   ├── env.ts                    # Environment variable config (Zod-validated)
│   ├── db.ts                     # MongoDB connection
│   ├── cookie.ts                 # Cookie options (httpOnly, secure, sameSite)
│   └── swagger.ts                # Swagger/OpenAPI config
├── middlewares/
│   ├── auth.middleware.ts        # authenticate + requireAdmin
│   ├── error.middleware.ts       # Global error handler + AppError + asyncHandler
│   ├── rateLimit.middleware.ts   # Rate limiting
│   └── swagger.middleware.ts     # Swagger UI router
├── models/
│   ├── user.model.ts             # User schema (roles, refresh tokens, account locking)
│   └── movie.model.ts            # Movie schema (soft delete via isActive)
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.schema.ts        # Zod validation schemas
│   └── movie/
│       ├── movie.controller.ts
│       ├── movie.service.ts
│       ├── movie.routes.ts
│       └── movie.schema.ts       # Zod validation schemas
└── utils/
    ├── jwt.ts                    # Sign + verify access/refresh tokens
    ├── hash.ts                   # bcrypt password hashing
    └── logger.ts                 # Winston logger
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the root:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/cinemaa
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
COOKIE_DOMAIN=localhost
```

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run in development

```bash
npm run dev
```

Server starts at `http://localhost:4000`
Swagger UI at `http://localhost:4000/api-docs`

### 4. Build for production

```bash
npm run build
npm start
```

## Security Features

**JWT Tokens**
- Access token: 15 minutes, returned in response body
- Refresh token: 7 days, stored in httpOnly cookie only
- Token rotation: each refresh issues a new refresh token and invalidates the old one

**Account Protection**
- Account locks after 5 failed login attempts (2-hour lockout)
- Passwords hashed with bcrypt (12 rounds), never returned in responses
- `select: false` on sensitive fields (password, refreshTokens)

**Request Security**
- Rate limiting on all `/api` routes
- Helmet sets secure HTTP headers
- CORS configured per environment
- All input validated with Zod before reaching service layer

**Role-Based Access Control**
- Roles: `USER` (default), `ADMIN`
- `authenticate` middleware verifies the Bearer token and attaches `req.userId`
- `requireAdmin` middleware always runs after `authenticate`, fetches user from DB, checks role

## Soft Delete Pattern

Movies are not removed from the database when deleted. Instead, `isActive` is set to `false`. The `getAllMovies` query filters to `{ isActive: true }` only. This preserves data integrity for future booking history.

## Scripts

```bash
npm run dev          # Development with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled production build
npm run type-check   # TypeScript type check without emitting
```

## Swagger UI

Available at `/api-docs` in development mode. Use the Authorize button (top right) to paste your Bearer token after logging in. The login response includes `accessToken` in the response body for easy copying.

