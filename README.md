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

Deployed URL - https://test-versal-be.vercel.app

For frontend instructions, see [../devsphere_fe/README.md](../devsphere_fe/README.md).
