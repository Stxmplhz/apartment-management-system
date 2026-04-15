# APARTMENT MANAGEMENT SYSTEM

## TECH STACK

| Component | Technology |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) |
| **Backend** | ![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white) ![Elysia](https://img.shields.io/badge/Elysia.js-711bbc?style=flat) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-39827E?style=flat&logo=prisma&logoColor=white) |
| **Infra** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) |

---

## PROJECT STRUCTURE

```plaintext
/
├── FRONTEND/          # VITE + REACT + TYPESCRIPT
├── BACKEND/           # ELYSIA.JS + BUN RUNTIME
│   └── PRISMA/        # SCHEMA & MIGRATIONS
└── DOCKER-COMPOSE.YML # INFRASTRUCTURE (POSTGRESQL)
```

---

## QUICK START & INSTALLATION

1. **INFRASTRUCTURE SETUP**
```plaintext
docker-compose up -d
```

2. **BACKEND INITIALIZATION**
```plaintext
cd backend
bun install
bunx prisma generate
bunx prisma migrate dev --name init
bunx prisma db seed
bun run dev
```

3. **FRONTEND DEPLOYMENT**
```plaintext
cd ../frontend
bun install
bun run dev
```