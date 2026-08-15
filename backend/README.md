# Logora Backend

Bun-powered API server and event-processing pipeline for Logora. It receives
events, queues them with BullMQ, batches them, and sends them to DeepSeek for
AI analysis. Users, sessions, analyses, and queue state are stored in Redis.

## Tech stack

- **Runtime:** [Bun](https://bun.sh)
- **Queue:** [BullMQ](https://bullmq.io) on Redis
- **Storage:** Redis via [ioredis](https://github.com/redis/ioredis)
- **AI:** [DeepSeek](https://platform.deepseek.com) via [LangChain](https://js.langchain.com)
- **Validation:** [Zod](https://zod.dev)
- **Logging:** [Pino](https://getpino.io)

## Prerequisites

- Bun 1.x
- A running Redis instance
- A DeepSeek API key (for analysis and the agent chat)

## Setup

1. Create your environment file:

   ```sh
   cp .env.example .env
   ```

2. Fill in the required values:

   | Variable           | Required | Default             | Description                        |
   | ------------------ | -------- | ------------------- | ---------------------------------- |
   | `REDIS_URL`        | Yes      | —                   | Redis connection URL.              |
   | `REDIS_PASSWORD`   | No       | —                   | Redis password (if required).      |
   | `DEEPSEEK_API_KEY` | No\*     | —                   | DeepSeek API key.                  |
   | `DEEPSEEK_MODEL`   | No       | `deepseek-v4-flash` | Model for analysis and agent chat. |
   | `PORT`             | No       | `9095`              | HTTP port.                         |
   | `NODE_ENV`         | No       | `development`       | `development` or `production`.     |
   | `CORS_ORIGINS`     | No       | —                   | Comma-separated allowed origins.   |

   \* Required for AI-powered analysis and the agent chat.

3. Install dependencies:

   ```sh
   bun install
   ```

## Running

```sh
# Development (watch mode)
bun run dev

# Production build + start
bun run build
bun run start
```

The worker runs in-process with the server (started from `index.ts`), so a
single process handles both the HTTP API and event processing.

## How the pipeline works

1. `POST /events` enqueues an event into the `event-processing` BullMQ queue.
2. The worker (`lib/processor.ts`) consumes jobs and pushes them into a Redis
   buffer (`lib/analysis.store.ts`).
3. When the buffer reaches `BATCH_SIZE` (10), it is flushed (`lib/batch.analyzer.ts`),
   with a periodic scheduler as a safety net.
4. Batched events are summarized (`lib/analyzer.ts`) and sent to DeepSeek.
5. The resulting analysis (summary, insights, risks, recommendations) is stored
   and listed via `/analysis`.

## Project structure

```
backend/
├── config/        # Environment config & validation
├── controllers/   # HTTP request handlers
├── data/          # Static data (simulated events)
├── lib/           # Queue, processor, analyzer, auth, stores
├── logger/        # Pino logger
├── model/         # DeepSeek model factory
├── prompts/       # Prompt builders
├── routes/        # Route table
├── schema/        # Zod schemas
├── stats/         # Event aggregation helpers
├── types/         # Shared TypeScript types
├── utils/         # JSON/response helpers
└── index.ts       # Server entrypoint
```

## API endpoints

Public routes (no authentication):

| Method | Path           | Description                            |
| ------ | -------------- | -------------------------------------- |
| GET    | `/health`      | Backend + Redis health status.         |
| POST   | `/auth/signup` | Create an account and start a session. |
| POST   | `/auth/login`  | Log in and start a session.            |

Protected routes (require a `Bearer` token):

| Method | Path              | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| GET    | `/auth/me`        | Current authenticated user.                  |
| POST   | `/auth/logout`    | End the current session.                     |
| GET    | `/analysis`       | List stored analyses.                        |
| PATCH  | `/analysis/read`  | Mark an analysis as read.                    |
| DELETE | `/analysis`       | Clear all analyses.                          |
| POST   | `/analysis/flush` | Force-flush the event buffer.                |
| POST   | `/events`         | Enqueue a single event.                      |
| GET    | `/events`         | Queue statistics.                            |
| GET    | `/simulated-data` | Sample events for the live-log simulator.    |
| POST   | `/events/analyze` | Analyze a provided set of events on demand.  |
| POST   | `/agent/chat`     | Conversational AI agent.                     |
| GET    | `/users`          | List workspace users (passwords omitted).    |
| POST   | `/users`          | Create a new user.                           |
| DELETE | `/users?id=…`     | Remove a user and invalidate their sessions. |

## Notes

- Queue metrics (`completed` / `failed`) are cumulative Redis counters rather
  than BullMQ's capped job counts, so they reflect true totals.
- There is currently **no role-based access control** — any authenticated user
  can manage users. Add an admin role before exposing this publicly.
