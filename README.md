# 🔐 Node.js MongoDB Authentication Starter

A production-ready, secure authentication system built with Node.js, Express, TypeScript, and MongoDB. Implements industry best practices for security and scalability.

## ✨ Features

### 🛡️ Security First
- **JWT Authentication** with access + refresh tokens
- **HttpOnly Cookies** (NO localStorage)
- **bcrypt** password hashing (12+ rounds)
- **Token rotation** for enhanced security
- **Account locking** after failed login attempts
- **Rate limiting** (brute force protection)
- **Helmet** for security headers
- **CORS** properly configured
- **Zod** for input validation
- **Password strength enforcement**

### 🏗️ Architecture
- Clean, modular folder structure
- TypeScript for type safety
- Centralized error handling
- Async error handling wrapper
- Environment-based configuration
- Graceful shutdown handling

### 📦 Tech Stack
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Validation:** Zod
- **Authentication:** JWT + bcrypt
- **Security:** Helmet, CORS, express-rate-limit

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── env.ts               # Environment configuration
│   │   ├── db.ts                # Database connection
│   │   └── cookie.ts            # Cookie settings
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       ├── auth.routes.ts
│   │       ├── auth.service.ts
│   │       ├── auth.schema.ts
│   │       └── auth.middleware.ts
│   ├── models/
│   │   └── user.model.ts        # User model with security features
│   ├── middlewares/
│   │   ├── error.middleware.ts  # Global error handler
│   │   ├── rateLimit.middleware.ts
│   │   └── auth.middleware.ts
│   ├── utils/
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── hash.ts             # Password hashing
│   │   └── logger.ts           # Logging utility
│   └── types/
├── .env                         # Environment variables (DO NOT COMMIT)
├── .env.example                 # Environment template
├── .gitignore
├── tsconfig.json
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Important:** Generate strong secrets for production:

```bash
# Generate random secrets (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start MongoDB

Make sure MongoDB is running locally or update `MONGO_URI` in `.env` with your MongoDB Atlas connection string.

### 4. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication Routes

All auth routes are prefixed with `/api/auth`

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
}
```

**Password Requirements:**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    }
  }
}
```

Refresh token is set as an HttpOnly cookie.

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=<token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Cookie: refreshToken=<token>
```

#### Logout All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer <access_token>
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### Health Check
```http
GET /health
```

## 🔒 Security Features Explained

### 1. JWT Access + Refresh Tokens
- **Access token:** Short-lived (15 minutes), sent in response body
- **Refresh token:** Long-lived (7 days), stored in HttpOnly cookie
- Prevents XSS attacks by not storing tokens in localStorage

### 2. Token Rotation
- New refresh token generated on every refresh
- Old token is invalidated
- Prevents token reuse attacks

### 3. Account Locking
- Locks account after 5 failed login attempts
- Lock duration: 2 hours
- Prevents brute force attacks

### 4. Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- Additional layer of brute force protection

### 5. Password Security
- Hashed with bcrypt (12 rounds)
- Never returned in API responses
- Strong password requirements enforced

### 6. Input Validation
- Zod schema validation
- Email normalization (lowercase, trim)
- Type-safe with TypeScript

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `4000` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_ACCESS_SECRET` | Secret for access tokens | Required |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Required |
| `ACCESS_TOKEN_EXPIRES` | Access token expiration | `15m` |
| `REFRESH_TOKEN_EXPIRES` | Refresh token expiration | `7d` |
| `COOKIE_DOMAIN` | Cookie domain | `localhost` |

### TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:
- Strict mode enabled
- No unused locals/parameters
- No implicit returns
- No fallthrough cases

## 📝 Scripts

```bash
npm run dev          # Run development server with hot reload
npm run build        # Build for production
npm start            # Run production server
npm run type-check   # Check TypeScript types
```

## 🧪 Testing Client Requests

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!@#"}'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!@#"}' \
  -c cookies.txt
```

**Get Profile:**
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## 🚦 Production Checklist

Before deploying to production:

- [ ] Change JWT secrets to strong random values
- [ ] Update `MONGO_URI` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origin to production domain
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set up proper logging (e.g., Winston, Pino)
- [ ] Configure MongoDB indexes
- [ ] Set up monitoring and alerting
- [ ] Enable automatic database backups
- [ ] Review and adjust rate limits
- [ ] Add request logging middleware
- [ ] Set up CI/CD pipeline

## 🎯 Next Steps

This starter provides a solid foundation. Consider adding:

- [ ] Email verification
- [ ] Password reset functionality
- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Session management dashboard
- [ ] User roles and permissions
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] Kubernetes deployment configs

## 📖 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## 📄 License

MIT

---

**Built with ❤️ for secure, production-ready authentication**
