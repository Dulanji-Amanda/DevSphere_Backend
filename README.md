# DevSphere API (Backend)

DevSphere is a MERN + TypeScript learning platform that combines secure user management, AI-assisted quiz generation, and RAD-friendly iteration practices. This package hosts the Express/Node.js API that powers authentication, authoring, AI quizzes, and future content services.

The README captures everything required for the final coursework submission: architecture, setup, security controls, deployment guidance, and compliance notes.

## 1. System Overview

- **Architecture**: RESTful API built with Express + TypeScript, layered controllers, middleware, and Mongoose models.
- **Primary domain**: user lifecycle (register/login/profile/password reset) and AI-generated quizzes for multiple programming languages.
- **Advanced feature**: dynamic quiz creation via Hugging Face chat completions with resilient JSON parsing in [src/controllers/ai.controller.ts](src/controllers/ai.controller.ts).
- **Security**: JWT-based auth, refresh token rotation, bcrypt password hashing, OTP-based password resets, granular role checks.

## 2. Tech Stack

- Node.js 20+, Express 4, TypeScript 5
- MongoDB Atlas with Mongoose 8 for schema validation
- Authentication: jsonwebtoken, bcryptjs, custom middleware in [src/middleware/auth.ts](src/middleware/auth.ts)
- Authorization: role guard in [src/middleware/role.ts](src/middleware/role.ts)
- Messaging: Nodemailer SMTP helper in [src/utils/email.ts](src/utils/email.ts)
- AI Integration: Hugging Face Router (default `mistralai/Mistral-7B-Instruct-v0.2`) with `jsonrepair`

## 3. Folder Structure

```
src/
  controllers/        # Route handlers (auth, ai)
  middleware/         # AuthN/AuthZ guards
  models/             # Mongoose schemas (User)
  routes/             # Express routers mounted in index.ts
  utils/              # Tokens + email helpers
  index.ts            # App bootstrap + Mongo connection
```

## 4. Environment Variables

Place a `.env` file at the project root (never commit secrets):

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devsphere
JWT_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me-too
HUGGINGFACE_API_KEY=
HUGGINGFACE_API_URL=https://router.huggingface.co/v1/chat/completions
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=example@gmail.com
SMTP_PASS=app-password
SMTP_FROM="DevSphere" <no-reply@devsphere.com>
```

Notes:

- Hugging Face values are optional for public/router access but recommended for consistent throughput.
- SMTP credentials are required for OTP delivery; when omitted the app logs a warning and skips sending.

## 5. Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Verify TypeScript types**
   ```bash
   npm run build
   ```
3. **Start local development (watch mode)**
   ```bash
   npm run dev
   ```
4. API runs on `http://localhost:5000` by default and exposes routes under `/api/v1/*` as configured in [src/index.ts](src/index.ts).

### Helpful scripts

| Script          | Purpose                                   |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start Nodemon with ts-node for hot reload |
| `npm run build` | Type-check and emit JS into `dist/`       |
| `npm run lint`  | Run ESLint across the codebase            |

## 6. Core Features & Endpoints

### Authentication & User Management

| Method | Endpoint                       | Description                                                                                                    | Access                  |
| ------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| POST   | `/api/v1/auth/register`        | Register new end users (firstname/lastname enforced) via [auth.controller](src/controllers/auth.controller.ts) | Public                  |
| POST   | `/api/v1/auth/login`           | Email/password login, returns access + refresh tokens                                                          | Public                  |
| POST   | `/api/v1/auth/refresh`         | Exchange refresh token for new access token                                                                    | Public (token required) |
| GET    | `/api/v1/auth/me`              | Retrieve current profile sans password                                                                         | Authenticated           |
| PUT    | `/api/v1/auth/me`              | Update profile & optionally rotate password w/ current password check                                          | Authenticated           |
| POST   | `/api/v1/auth/admin/register`  | Create new admins                                                                                              | Role: ADMIN             |
| POST   | `/api/v1/auth/forgot-password` | Generates 6-digit OTP + email delivery                                                                         | Public                  |
| POST   | `/api/v1/auth/verify-otp`      | Validates OTP hash & expiration                                                                                | Public                  |
| POST   | `/api/v1/auth/reset-password`  | Updates password after OTP verification                                                                        | Public                  |

### AI Quiz Services

| Method | Endpoint                  | Description                                                              |
| ------ | ------------------------- | ------------------------------------------------------------------------ |
| POST   | `/api/v1/ai/generate`     | Produce up to 40 MCQ questions for supported languages with explanations |
| POST   | `/api/v1/ai/generate-one` | Lightweight endpoint for incremental quiz loading                        |
| POST   | `/api/v1/ai/score`        | Scores submitted answers and returns totals/percentage                   |

### Future Content APIs

- `/api/v1/post` currently returns a placeholder response in [src/routes/post.ts](src/routes/post.ts); extend with CRUD for blog drafts vs. published posts to satisfy the “two related entities” requirement.

## 7. Security Practices

- **JWT access + refresh tokens**: signed in [src/utils/tokens.ts](src/utils/tokens.ts) with short-lived access (30m) and 7-day refresh.
- **Role-based authorization**: `requireRole` middleware ensures ADMIN/AUTHOR gating.
- **Password safety**: `bcryptjs` hashing + password change workflow that validates the current password.
- **Password reset OTP**: hashed & time-boxed tokens stored on the user document.
- **CORS hardening**: origins allowlisted inside [src/index.ts](src/index.ts) for local and hosted frontends.

## 8. Advanced Feature — AI-driven Quizzes

- Hugging Face Router acts as a drop-in replacement for paid OpenAI endpoints.
- `jsonrepair` cleans malformed LLM JSON so the quiz UI never crashes.
- Automatic fallback between preferred models ensures resilience when a model is unavailable.
- Supports Java, Python, TypeScript, JavaScript, HTML, CSS, C#, and Go out of the box (see `languageNames`).

## 9. Deployment Guide (Render/Railway)

1. **Provision services**: MongoDB Atlas cluster, Render/Railway web service.
2. **Configure environment**: copy the `.env` values into your hosting dashboard secrets.
3. **Build & run command**:
   - Build: `npm install && npm run build`
   - Start: `node dist/index.js` (Render) or `npm run dev` for preview services.
4. **CORS**: append your deployed frontend origin to the `cors` `origin` array before redeploying.
5. **Health checks**: set `/` as the health endpoint; it responds with “Welcome to Smart Blog API”.

## 10. Coursework Requirement Checklist

| Requirement                  | Status | Notes                                                             |
| ---------------------------- | ------ | ----------------------------------------------------------------- |
| System design & architecture | ✅     | Modular layering (routes/controllers/middleware) documented above |
| Backend implementation       | ✅     | TypeScript-based Express app with MongoDB + secure middleware     |
| Security                     | ✅     | JWT, refresh flow, bcrypt, OTP, role-based guards                 |
| Advanced feature             | ✅     | AI quiz generation + scoring endpoints                            |
| Version control              | ✅     | Use Git with progressive commits; push to public GitHub repo      |
| Deployment readiness         | ✅     | Render/Railway steps documented; `.env` template provided         |
| Documentation                | ✅     | This README plus top-level project README should be kept current  |

## 11. Next Steps

- Complete the Posts module (models + CRUD) to satisfy “two related entities”.
- Add automated tests (Jest or Vitest) for controllers and middleware.
- Harden validation with Zod or class-validator to reject malformed payloads.

For frontend instructions, see [../devsphere_fe/README.md](../devsphere_fe/README.md).
