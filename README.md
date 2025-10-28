# Synapse

Backend-first microservices chat application. This README focuses on the backend services (auth, user, notification), how they fit together, and how to run them locally. A short "frontend essence" section is included at the end to capture the current front-end status and developer commands.

---

## What this repository contains

```
backend/
  ├─ api-gateway/                # Kong config & API gateway assets
  ├─ docker-compose.dev.yml      # Dev compose for infra (databases, kafka, gateway, tools)
  ├─ proto/                      # Protobuf definitions shared by services
  └─ services/
      ├─ auth-service/
      ├─ user-service/
      └─ notification-service/

frontend/
  └─ synapse/                    # Next.js app (work-in-progress)
```

## Architecture (short)

- Services: NestJS microservices (auth, user, notification).
- Inter-service communication: gRPC (protos) and Kafka events.
- Datastores: PostgreSQL (Prisma in user-service), MongoDB (optional), Redis (cache/session).
- Gateway: Kong (declarative config in `backend/api-gateway`).

## Key backend technologies

- NestJS (v11)
- TypeScript
- gRPC (ts-proto)
- Kafka (Confluent images in docker-compose)
- PostgreSQL + Prisma
- Redis
- Kong API gateway
- Jest for tests

## Useful files

- `backend/docker-compose.dev.yml` — brings up infra plus dev tooling (RedisInsight, Kafka UI).
- `backend/proto/*.proto` — protobuf service contracts.
- `backend/services/*/package.json` — scripts and deps per service.

## Prerequisites

- Docker & Docker Compose (v2+)
- Node.js (LTS recommended)
- npm or yarn

## Run the full backend stack (recommended for local development)

Start the infra (Postgres, Mongo, Redis, Kafka, Kong, tooling):

```powershell
cd backend
docker compose -f docker-compose.dev.yml up -d
```

Check status:

```powershell
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs -f kafka
```

Notes:
- Kafka external bootstrap is exposed at `localhost:29092` in the dev compose (use that for services running on the host).

## Run services locally (per-service developer flow)

General pattern for each service:

```powershell
cd backend/services/<service-name>
npm install
npm run start:dev
```

Service-specific notes are below.

### Auth Service (`backend/services/auth-service`)

- Responsibilities: authentication, JWTs, some auth-related RPCs. Uses gRPC + Kafka.
- Useful scripts:
  - `npm run proto:gen` — generate TypeScript gRPC bindings from `backend/proto`.
  - `npm run start:dev` — run in watch mode.

How to run:

```powershell
cd backend/services/auth-service
npm install
npm run proto:gen
npm run start:dev
```

Notes:
- Start the compose infra first if service needs DB/Redis/Kafka.

### User Service (`backend/services/user-service`)

- Responsibilities: primary user data, Prisma ORM + PostgreSQL.
- Useful scripts:
  - `npx prisma generate`
  - `npx prisma migrate dev` (for development migrations)

How to run:

```powershell
cd backend/services/user-service
npm install
npx prisma generate
# run migrations in dev if needed
npx prisma migrate dev --name init
npm run start:dev
```

Notes:
- Ensure `DATABASE_URL` in this service's `.env` points to the Postgres started by compose.

### Notification Service (`backend/services/notification-service`)

- Responsibilities: consume Kafka events and send notifications (email/SMS/in-app).

How to run:

```powershell
cd backend/services/notification-service
npm install
npm run start:dev
```

Notes:
- Ensure Kafka topics are created (compose includes `kafka-setup` to create default topics). Use Kafka UI at `http://localhost:8080` to inspect topics.

## Protobufs

Protos are the contract between services. If you update `backend/proto/*.proto`, regenerate bindings in services that consume them with their `proto:gen` script.

## Testing

Run tests per service:

```powershell
cd backend/services/auth-service
npm run test
```

E2E tests: `npm run test:e2e` (service must include a test configuration and infra available).

## Frontend essence (short)

- Tech: Next.js (v16), React (v19), TypeScript, TailwindCSS.
- Status: front-end app lives at `frontend/synapse` and is currently a work-in-progress. Core backend APIs and gateway are the main focus now.
- How to run dev frontend (when ready):

```powershell
cd frontend/synapse
npm install
npm run dev
```

- When front-end integration begins, ensure the API Gateway (Kong) routes requests to the services or run services and use their direct ports during development.

## Troubleshooting tips

- "Service can't connect to Kafka/Postgres": confirm docker compose is up and use `localhost:29092` for Kafka when running services on the host.
- "Protos not found": run `npm run proto:gen` in the consuming service.
- Prisma migrations: run `npx prisma migrate dev` only in development.

## Developer tooling

- RedisInsight: http://localhost:5540
- Kafka UI: http://localhost:8080

## Recommended small next steps I can implement

- Add `env.example` files for each backend service (scaffold default values matching compose).
- Add a PowerShell helper `backend/scripts/start-backend.ps1` to bring up compose and wait for healthchecks.
- Create `backend/HEALTHCHECK.md` describing health endpoints and Kafka topics for CI.

If you want one of those, tell me which and I will implement it next.
