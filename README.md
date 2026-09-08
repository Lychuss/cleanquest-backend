# CleanQuest — Backend API

CleanQuest turns real-life household chores into RPG-style **quests**. Each user creates a
**Character**, completes chores mapped to quests (e.g. *Dish Duty*, *Bed Making*, *Fridge Patrol*),
and earns XP and stat rewards (attack, defense, speed, critical, luck, etc.) that level the
character up over time.

This repository is the **backend API** that powers the CleanQuest frontend. It handles
authentication, character/profile data, and quest completion logic, backed by a PostgreSQL
database via Prisma.

**Live API:** deployed on [Render](https://render.com)
**Frontend:** [cleanquest-frontend.vercel.app](https://cleanquest-frontend.vercel.app) (deployed on Vercel)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM / `"type": "module"`) |
| Language | TypeScript |
| Web framework | Express 5 |
| Database | PostgreSQL |
| ORM | Prisma (`@prisma/client`, `@prisma/adapter-pg`) |
| Auth | [better-auth](https://www.better-auth.com/) — email/password + Google OAuth |
| Validation | Zod |
| Scheduling | `node-cron` (daily task rotation) |
| Date/timezone handling | Luxon |
| Dev tooling | `tsx` (dev runner), `nodemon` |

---

## Project Structure

```
cleanquest-backend/
├── app/
│   ├── app.ts                  # Express app setup: CORS, middleware, routes, error handler
│   ├── server.ts               # Entry point — starts the HTTP server & the daily quest cron
│   └── src/
│       ├── controllers/        # Request handlers (parse input, call services, shape response)
│       │   ├── character.controller.ts
│       │   ├── profile.controller.ts
│       │   └── quests.controller.ts
│       ├── middlewares/
│       │   └── authentication.ts   # `requireAuth` guard — validates the better-auth session
│       ├── routers/            # Express routers, one per resource
│       │   ├── character.route.ts
│       │   ├── profile.route.ts
│       │   └── quest.route.ts
│       ├── schemas/            # Zod request-body validation schemas
│       │   ├── character.schema.ts
│       │   └── completedquest.schemas.ts
│       ├── services/           # Business logic + Prisma queries
│       │   ├── character-controller.service.ts
│       │   ├── profile-contoller.service.ts
│       │   └── quest-controller.service.ts   # core game logic: XP, leveling, growth power
│       ├── interfaces/
│       │   └── user.ts         # Augments Express's Request.user typing
│       ├── types/
│       │   └── random-quest.ts
│       └── utils/
│           └── helpers.ts      # Leveling math, growth-power formula, response shaping
├── lib/
│   ├── auth.ts                 # better-auth configuration (providers, cookies, hooks)
│   └── prisma.ts               # Shared Prisma client singleton (pg adapter + random ext.)
├── prisma/
│   ├── config.ts                # Prisma config (schema path, migrations, seed command)
│   ├── schema.prisma            # Data models (User, Character, Quest, UserQuest, etc.)
│   ├── seed.ts                  # Seeds the default quest catalogue
│   └── reset.ts                 # Dev utility — clears completed-quest history
├── package.json
└── tsconfig.json
```

> Files under `prisma/generated` (the Prisma Client output) are auto-generated — never edit them
> directly; they're recreated by `prisma generate`.

---

## How It Works (High-Level Flow)

1. **Auth** — better-auth is mounted directly on the Express app at `/api/auth/*` and handles
   sign-up, sign-in (email/password + Google), sessions, and cookies. When a new user signs up,
   a database hook automatically creates their `Character` record.
2. **Session check** — protected routes run through the `requireAuth` middleware, which asks
   better-auth for the current session from the request's cookies and attaches `req.user`.
3. **Character** — a user creates their in-game character name (`/character/creation`). Stats
   (attack, defense, speed, etc.) start at defaults defined in the Prisma schema.
4. **Quests** — a rotating set of "important" quests is picked at random once a day (via
   `node-cron`, resetting at midnight Asia/Manila time). Completing a quest
   (`PUT /quest/completed-quest`) applies its stat/XP rewards to the character, and if enough XP
   has accumulated, levels the character up.
5. **Profile** — `/character/profile/:userId/view-stats` returns the character's current stats,
   today's important quests, which of them are completed, and per-room completion totals
   (kitchen / bedroom / living room).

---

## Environment Variables

Create a `.env` file in the project root (never commit this file):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# better-auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-random-secret

# Google OAuth (for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend origin, used for CORS/trusted-origin allow-listing
VERCEL_BASE_URL=https://cleanquest-frontend.vercel.app

# Server
PORT=3000
```

> ⚠️ **Note:** in the current CORS setup (`app/app.ts`), `process.env.BETTER_AUTH_SECRET` is
> included in the list of allowed CORS origins. That's almost certainly meant to be a frontend
> URL variable rather than the auth secret — worth double-checking, since as written it won't
> actually allow any real frontend origin through that particular entry.

---

## Getting Started (Local Development)

**Prerequisites:** Node.js 18+, a PostgreSQL database (local or hosted, e.g. Neon/Supabase/Render Postgres).

```bash
# 1. Install dependencies
npm install

# 2. Set up your .env file (see Environment Variables above)

# 3. Generate the Prisma client & apply migrations
npx prisma generate
npx prisma migrate dev

# 4. Seed the database with the default quest catalogue
npx prisma db seed

# 5. Start the dev server (auto-restarts on file changes)
npm run dev
```

The API will be available at `http://localhost:3000`. Check it's alive with:

```bash
curl http://localhost:3000/health
# { "status": "Server is running!" }
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the server with `tsx watch` for local development |
| `npm run build` | Runs `prisma generate` then compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled server from `dist/app/server.js` (production) |
| `npx prisma migrate dev` | Creates/applies a new migration in development |
| `npx prisma migrate deploy` | Applies existing migrations (use in production/CI) |
| `npx prisma db seed` | Runs `prisma/seed.ts` to populate the quest catalogue |
| `npx tsx prisma/reset.ts` | Dev-only utility to wipe completed-quest history |

---

## API Reference

All game routes are mounted under `/cleanquest`. All auth routes are handled by better-auth
under `/api/auth`. Protected routes require a valid session cookie (sent automatically by the
browser once logged in).

### Auth (`/api/auth/...`, provided by better-auth)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/sign-up/email` | `{ "name", "email", "password" }` | Register a new account (auto-creates a Character) |
| POST | `/api/auth/sign-in/email` | `{ "email", "password" }` | Log in |
| GET | `/api/auth/sign-in/social?provider=google` | — | Google OAuth login |
| POST | `/api/auth/sign-out` | — | Log out |

*(Exact route names come from better-auth itself — see the [better-auth docs](https://www.better-auth.com/docs) for the full list your configured plugins expose.)*

### Character & Quests (`/cleanquest/...`, require auth)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/character/creation` | `{ "ingameName": "" }` | Create the logged-in user's character |
| GET | `/character/profile/:userId/view-stats` | — | Get character stats, today's quests, and completion totals |
| PUT | `/quest/completed-quest` | `{ "questId", "characterId", "userId" }` | Mark a quest complete and apply rewards/leveling |

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Simple uptime check — returns `{ "status": "Server is running!" }` |

---

## Testing

There's currently **no automated test suite** configured in this repo (no Jest/Vitest in
`package.json` yet). For now, the recommended way to verify behavior is manual API testing:

```bash
# Example: create a character (replace COOKIE with a real session cookie after signing in)
curl -X POST http://localhost:3000/cleanquest/character/creation \
  -H "Content-Type: application/json" \
  -H "Cookie: COOKIE" \
  -d '{ "ingameName": "test" }'

# Example: complete a quest
curl -X PUT http://localhost:3000/cleanquest/quest/completed-quest \
  -H "Content-Type: application/json" \
  -H "Cookie: COOKIE" \
  -d '{ "questId": "...", "characterId": "...", "userId": "..." }'
```

Tools like **Postman** or **Insomnia** are easier for this than raw curl, since they persist
cookies across requests for you.

If you'd like, a follow-up step for this project would be adding `vitest` or `jest` +
`supertest` for automated endpoint tests — happy to help set that up.

---

## How the Frontend Connects to This Backend

- The frontend (Vercel) and this backend (Render) are on **different domains**, so this is a
  cross-site setup. better-auth is configured with `sameSite: "none"` and `secure: true` cookies,
  which is what makes cross-domain, cookie-based sessions work correctly — this **requires HTTPS**
  on both ends (Render and Vercel both provide this by default).
- The backend's CORS config (`app/app.ts`) explicitly allow-lists the frontend's origin and sets
  `credentials: true`, so the browser is permitted to send/receive cookies on cross-origin requests.
- On the frontend, any `fetch`/`axios` call to this API must include `credentials: "include"` (or
  the axios equivalent, `withCredentials: true`) — otherwise the session cookie won't be sent and
  protected routes will return `401 Unauthorized`.
- Typical frontend flow: sign up/sign in via `/api/auth/...` → browser stores the session cookie →
  subsequent calls to `/cleanquest/...` are automatically authenticated via that cookie →
  `requireAuth` middleware verifies the session server-side on every protected request.

---

## Deployment (Render)

1. Push this repo to GitHub and connect it to a new **Web Service** on Render.
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. Add all variables from the [Environment Variables](#environment-variables) section in the
   Render dashboard (use your production database URL, production frontend URL, etc.).
5. After the first deploy, run migrations against the production database — either as an extra
   build step (`npx prisma migrate deploy`) or once via Render's Shell tab.
6. Make sure `BETTER_AUTH_URL` matches your Render service's public URL, and that
   `VERCEL_BASE_URL` matches your deployed frontend's URL, so auth cookies and CORS work correctly.

---

## Data Model Overview (from `prisma/seed.ts` / usage in code)

- **User** — managed by better-auth (email/password or Google identity).
- **Character** — one per user; holds `ingameName`, `level`, `experience`, and stats
  (`attack`, `health`, `defense`, `critical`, `speed`, `evasion`, `resistance`, `luck`,
  `stamina`), plus a computed `growth` power score.
- **Quest** — a chore template with a `room` (kitchen, bedroom, living_room, etc.), a
  `difficulty` (easy/medium/hard), and a `rewards` JSON blob (stat increments + XP).
- **UserQuest** — join record marking that a user completed a specific quest, with a timestamp
  used for daily reset logic.

---

## Notes for Reviewers / Employers

This project demonstrates:
- A typed, layered Express architecture (routes → controllers → services → Prisma).
- Schema validation at the API boundary with Zod.
- Cookie-based session auth with a third-party auth library (better-auth), including social
  login and post-signup database hooks.
- A small scheduled job (`node-cron`) driving daily game-state resets.
- A simple RPG progression system: reward aggregation, XP thresholds, and an exponential
  "growth power" formula (`basePower * multiplier^(level-1)`).
