# AGENTS

## Purpose
This file helps AI coding agents understand the architecture and conventions of the Safoua Academy repository.

## Repo overview
- `backend/`: Node.js + Express API server with MongoDB via Mongoose.
- `frontend/safouaacademy/`: React + Vite frontend.
- There is no monorepo package at the repo root; backend and frontend are separate projects.

## Key conventions
- Backend uses CommonJS (`require` / `module.exports`) and runs from `backend/server.js`.
- Backend API is organized into `routes/`, `controllers/`, and `models/`.
- Frontend uses ES modules and React components under `src/components` and pages under `src/pages`.
- Frontend API integration is centralized via `frontend/safouaacademy/src/services/api.js`.

## How to run
- Backend: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend/safouaacademy && npm install && npm run dev`
- Backend health check: `http://localhost:5000/api/health`

## Important environment details
- Backend default MongoDB URI in `backend/server.js` is `mongodb://127.0.0.1:27017/safoua_academy`.
- `backend/check-mongodb.js` exists to help verify local MongoDB installation and service status.
- The backend can start in demo mode if MongoDB is unavailable, but data will not persist.

## Useful files and directories
- `backend/server.js`: application bootstrap, route registration, error handling, MongoDB startup.
- `backend/routes/`: route definitions for users, courses, chat, quizzes, payments, notifications, progress, stats, certifications, Stripe webhook.
- `backend/controllers/`: business logic for each domain.
- `backend/models/`: MongoDB schemas and models.
- `frontend/safouaacademy/src/services/api.js`: Axios instance, backend base URL, request/response interceptors, health-check logic.
- `frontend/safouaacademy/src/pages/`: page route components.
- `frontend/safouaacademy/src/components/`: reusable UI components.

## Agent behavior guidance
- Prefer existing backend route/controller structure when adding or extending endpoints.
- Preserve frontend page/component organization rather than migrating to a different React pattern.
- Do not assume a root package or root build step; treat backend and frontend as separate projects.
- There are no test suites defined in this repository; avoid adding test-related assumptions unless asked.
- Avoid editing `frontend/safouaacademy/README.md` for repo-specific behavior; it is the default Vite template README.

## Notes for future customization
- If the repository later adds workspace-level tooling, consider adding a `.github/copilot-instructions.md` or a separate agent for backend/frontend-specific workflows.
