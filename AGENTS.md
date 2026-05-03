# AGENTS.md

Guidance for AI coding agents working on this codebase.

## Project

Organization X portal — Nest.js (Express) backend with Prisma + MySQL.
This is a university project / sample.

## Stack

- Nest.js (v11)
- TypeScript
- Prisma ORM (MySQL)
- Docker (MySQL via docker-compose)
- JWT auth (access + refresh token)
- ESLint + Prettier

## Folder structure

src/                          App entry — composition only
├── app.module.ts
├── main.ts                   Registers global filter + interceptor
└── health/                   Feature modules (controller + service per feature)

lib/                          Internal Nest libraries (registered in nest-cli.json)
├── core/                     Shared primitives
│   ├── api/                  ApiHttpResponse class
│   ├── codes/                Error code constants (1xxx user, 2xxx auth, etc.)
│   ├── filter/               Global exception filter
│   ├── interceptor/          Global response interceptor
│   └── index.ts              Public exports
└── modules/                  Reusable Nest modules
    ├── prisma/               PrismaModule + PrismaService (global)
    └── index.ts              Public exports

prisma/                       Prisma schema and migrations
generated/                    DO NOT COMMIT — build artifacts only
docker-compose.yml            Local MySQL setup

## Conventions

### Imports
- Use path aliases: `@lib/core` and `@lib/modules`
- Never use deep relative imports across libraries
- Use `import type { ... }` for type-only imports
- Within the same library, relative imports are fine (`../api/...`)

### Modules
- Reusable, cross-feature modules go in `lib/modules/`
- Feature-specific modules (e.g., `auth`, `users`, `health`) go directly in `src/`
- Mark cross-cutting modules as `@Global()` (Prisma is already global)

### Controllers and services
- Controllers are thin — they just call services and return data
- Services hold business logic; throw on failure, return data on success
- Don't manually wrap success responses — the global interceptor handles it
- Don't manually shape error responses — throw and let the global filter handle it

### Response shape
- All API responses follow `{ statusCode, code, data, message }`
- Success: global `ApiResponseInterceptor` wraps return values automatically
- Errors: global `HttpExceptionFilter` wraps thrown exceptions automatically
- Throw pre-defined `ApiHttpResponse` constants from `lib/core/codes/`

### Error code numbering
- 1xxx — User errors
- 2xxx — Auth errors
- 3xxx — Validation errors
- 4xxx — Permission errors
- 5xxx — Resource errors
- 9xxx — Server errors

### Database
- Run `npx prisma generate` after any schema change
- Run `npx prisma migrate dev --name <description>` to create migrations
- Default Prisma client output (no custom `output` in schema)
- Connection string: `mysql://root:root@localhost:3307/orgx`
- Table names: snake_case plural (`users`, `user_refresh_tokens`)
- Prefix related tables for grouping (`user_refresh_tokens` not `refresh_tokens`)

### Naming
- File names: kebab-case (`api-http-response.ts`, `http-exception.filter.ts`)
- Class names: PascalCase (`ApiHttpResponse`, `PrismaService`)
- Constants: SCREAMING_SNAKE_CASE (`USER_NOT_FOUND`)

## What NOT to do

- Don't refactor working code "for cleanliness" unless asked
- Don't add features the user didn't ask for
- Don't introduce new packages without confirming
- Don't create new abstractions, helper files, or layers unless explicitly requested
- Don't reach for monorepo tooling — single Nest app with libraries is enough
- Don't hardcode error responses in services — use the constants from `@lib/core`
- Don't manually wrap responses in controllers — the interceptor handles it
- Don't add audit/event tables unless a real feature requires them

## When in doubt

- Match existing patterns in similar files
- Prefer fewer files over more
- Ask one focused question rather than guessing

## Notes

- This project is small and the user prefers minimal changes. When asked to
  modify a file, change only what was requested. Don't restructure, extract
  helpers, or add abstractions unless asked.
- When the user pushes back, stop and re-read the request. Don't keep asking
  clarifying questions if they've been clear.
- Prefer short answers when the task is small. Long explanations are reserved
  for genuinely complex problems.