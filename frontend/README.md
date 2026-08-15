# Logora Frontend

Next.js application for Logora — a marketing landing page, email/password
authentication, and a dark, real-time analytics dashboard.

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **UI:** [React 19](https://react.dev)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Icons:** [lucide-react](https://lucide.dev)

## Prerequisites

- Node.js 20+

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Configure the backend URL (optional — defaults to `http://localhost:9095`):

   ```sh
   # .env.local
   BACKEND_URL=http://localhost:9095
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open <http://localhost:3000>.

## Scripts

| Script         | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Start the development server.        |
| `npm run build`| Create an optimized production build.|
| `npm run start`| Serve the production build.          |
| `npm run lint` | Run ESLint.                          |

## Features

| Feature      | Route                  | Description                                                                  |
| ------------ | ---------------------- | ---------------------------------------------------------------------------- |
| Landing page | `/`                    | Marketing page with features, how-it-works, FAQ, and auth-aware CTAs.        |
| Sign up      | `/signup`              | Create an account with email + password.                                     |
| Log in       | `/login`               | Authenticate and start a persistent session.                                 |
| Overview     | `/dashboard`           | Welcome hero and quick links to every dashboard section.                     |
| Metrics      | `/dashboard/metrics`   | Live queue KPIs with animated counters (queued, in-progress, completed, failed, analyses, events analyzed). |
| Analyses     | `/dashboard/analyses`  | AI summaries, insights, risks, and recommendations — with mark-read, flush, and clear actions. |
| Live logs    | `/dashboard/logs`      | Terminal-style stream of simulated events into the pipeline.                 |
| Agent chat   | `/dashboard/agent`     | Conversational DeepSeek assistant for the workspace.                         |
| Users        | `/dashboard/users`     | Add and remove workspace members.                                            |
| Health       | `/dashboard/health`    | Backend + Redis status, uptime, and memory.                                  |

The dashboard shell (sidebar navigation, animated background, top bar, and
auth guard) is shared across all `/dashboard` pages via a single layout.

## Project structure

```
frontend/
├── app/
│   ├── actions/      # Server actions (auth, dashboard, agent, users)
│   ├── api/          # Route handlers (health proxy)
│   ├── dashboard/    # Dashboard layout + per-feature pages
│   ├── login/        # Login page
│   ├── signup/       # Signup page
│   ├── globals.css   # Theme, glass utilities, and animations
│   └── layout.tsx    # Root layout
├── components/
│   ├── auth/         # Auth forms & shell
│   ├── dashboard/    # Dashboard panels & navigation
│   └── ui/           # Reusable primitives (button, input)
└── lib/              # API client, session handling, types, utils
```
