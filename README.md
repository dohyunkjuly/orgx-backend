# Organization X — Backend

## Prerequisites

Node.js 18+, npm, Docker (Optional).

## Setup

```bash
npm install
docker compose up -d
npx prisma generate
npx prisma migrate dev
```

Create `.env`:

```env
DATABASE_URL="mysql://root:root@localhost:3306/orgx"
```

## Run

```bash
npm run start:dev
```

Server runs on `http://localhost:3000`.

## Common commands

```bash
npx prisma migrate dev --name <description>   # new migration
npx prisma generate                           # regenerate client
docker compose down                           # stop database
docker compose down -v                        # stop + wipe data
npm run format                                # prettier
```

## Project structure

src/                  App entry, feature modules
lib/core/             Shared primitives (response, errors, filters, interceptors)
lib/modules/          Reusable Nest modules (Prisma)
prisma/               Database schema and migrations

See `AGENTS.md` for conventions.