# 🧠 AI Resume Screener – NestJS Backend

This is the backend service for an AI-powered resume screening & rewriting application. Built with **NestJS**, **TypeORM**, and **MySQL**, it handles authentication, resume/job description processing, and AI integration via OpenAI/Cohere.

---

## 📌 Project Purpose

> Most job seekers submit generic resumes that don't match job descriptions. Recruiters skip these due to lack of relevance or missing keywords.

This project solves that by:

✅ Uploading resumes & job descriptions  
✅ Analyzing match % between them using AI  
✅ Suggesting missing skills  
✅ Rewriting resumes for better relevance  
✅ Ensuring ATS compatibility

---

## 🚀 Tech Stack & Architecture

| Layer         | Technology        | Reason |
|---------------|-------------------|--------|
| **Backend**    | [NestJS](https://nestjs.com) | Scalable, modular, TypeScript-first |
| **ORM**        | [TypeORM](https://typeorm.io) | Entity-based, easy-to-use with decorators |
| **Database**   | MySQL (Docker)    | Reliable RDBMS, production-tested |
| **Auth**       | JWT + Passport.js | Stateless, secure token-based auth |
| **AI APIs**    | OpenAI, Cohere    | Resume analysis, rewrite, scoring |
| **Security**   | Guards + Strategies | Clean separation for token validation |
| **Containerization** | Docker     | Easy local development & deployment |

---

## 🎯 Features (MVP Scope)

- ✅ User registration and login
- ✅ JWT authentication with `JwtStrategy` + `JwtAuthGuard`
- ✅ Protected `/user/me` route
- ⏳ Resume upload + parsing
- ⏳ Job description processing
- ⏳ GPT/Cohere-powered match analysis
- ⏳ One-click resume rewriting
- ⏳ ATS compatibility score

---

## 🧠 Why These Choices?

### 🏗 Why NestJS?
- Modular and scalable from day one
- Clean separation of concerns (Controller, Service, Guard, Strategy)
- Built-in support for middleware, DI, and interceptors
- First-class TypeScript support

### 📊 Why TypeORM?
- Decorator-based entity modeling
- Easy to auto-sync with MySQL
- Strong community and docs
- Pairs perfectly with NestJS

### 🔐 Why JWT + Passport?
- Stateless & scalable auth
- Uses `JwtStrategy` for token validation
- Easy to protect routes with `@UseGuards()`

---

## 🛠️ Getting Started

### ✅ Prerequisites

- Node.js `v18+`
- Docker + Docker Compose
- MySQL client (Workbench/Postico/etc.)
- `.env` file with JWT secret


### 🔧 Clone the Repository

```bash
git clone https://github.com/your-username/ai-resume-backend.git
cd ai-resume-backend
npm install
docker-compose up -d
npm run start:dev
```

---

## ⚠️ Error Model

All API errors are returned with a consistent structure to make handling on the client predictable:

```json
{
  "success": false,
  "code": 400,
  "message": "Validation failed",
  "details": [
    "email must be an email"
  ]
}
```

- `code` is the HTTP status code for the response.
- `message` provides a human-readable description of the problem.
- `details` is optional and is primarily used for validation errors (e.g., field-level messages).

Every response includes an `x-request-id` header that can be used to correlate API responses with server logs.
