<img width="8460" height="3796" alt="logora" src="https://github.com/user-attachments/assets/da94e0d4-42af-4cbc-bc2e-bdee147d85e0" />

# Logora

**AI-powered event analytics.** Logora ingests product events through a
protected HTTP API, queues and batches them reliably, then uses the DeepSeek
model to turn raw event streams into concise, actionable analysis — surfaced
through a modern dashboard.

## What it does

- **Ingest events** via an authenticated HTTP API.
- **Queue & batch** events reliably with BullMQ + Redis.
- **Analyze** with DeepSeek to produce summaries, insights, risks, and
  recommendations.
- **Explore** results in a dark, real-time dashboard.
- **Chat** with an in-product AI agent.
- **Manage** workspace users and monitor backend/Redis health.

## Repository layout

| Directory   | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `backend/`  | Bun API server, queue worker, Redis storage, DeepSeek analysis. |
| `frontend/` | Next.js app — landing page, authentication, and the dashboard.  |

See the per-package docs for setup details:

- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)

## Tech stack

| Layer    | Technologies                                                     |
| -------- | ---------------------------------------------------------------- |
| Backend  | Bun, BullMQ, Redis (ioredis), DeepSeek (LangChain), Zod, Pino    |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, lucide-react |

## Prerequisites

- [Bun](https://bun.sh) (backend)
- [Node.js](https://nodejs.org) 20+ (frontend)
- A running [Redis](https://redis.io) instance
- A [DeepSeek](https://platform.deepseek.com) API key (for AI features)

## Quick start

1. **Configure the backend** — copy `backend/.env.example` to `backend/.env`
   and fill in `REDIS_URL` and `DEEPSEEK_API_KEY`.

2. **Start the backend**

   ```sh
   cd backend
   bun install
   bun run dev
   ```

3. **Configure & start the frontend**

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. Open <http://localhost:3000>.

## Environment variables

### Backend (`backend/.env`)

| Variable           | Required | Default             | Description                            |
| ------------------ | -------- | ------------------- | -------------------------------------- |
| `REDIS_URL`        | Yes      | —                   | Redis connection URL.                  |
| `REDIS_PASSWORD`   | No       | —                   | Redis password (if required).          |
| `DEEPSEEK_API_KEY` | No\*     | —                   | API key for DeepSeek AI features.      |
| `DEEPSEEK_MODEL`   | No       | `deepseek-v4-flash` | Model used for analysis and the agent. |
| `PORT`             | No       | `9095`              | Backend HTTP port.                     |
| `NODE_ENV`         | No       | `development`       | `development` or `production`.         |
| `CORS_ORIGINS`     | No       | —                   | Comma-separated allowed origins.       |

\* Required for AI-powered analysis and the agent chat.

### Frontend (`frontend/.env`)

| Variable      | Required | Default                 | Description                               |
| ------------- | -------- | ----------------------- | ----------------------------------------- |
| `BACKEND_URL` | No       | `http://localhost:9095` | Backend base URL for server-side fetches. |

## License

All rights reserved. See [LICENSE](LICENSE).
