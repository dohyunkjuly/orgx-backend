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

Create your `.env` by copying the sample and filling in the values:

```bash
cp .env.sample .env
```

See [Environment variables](#environment-variables) for what each key means.

## Run

For development

```bash
npm run start:dev
```

For production

```bash
npm run build
npm run start
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

## Environment variables

All configuration is read from `.env`. Copy `.env.sample` to `.env` and fill in
the blanks. Values shown are the sample defaults; anything left empty is required.

**Database**

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection string, e.g. `mysql://root:root@localhost:3306/orgx`. Used by Prisma. |

**App**

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`). |
| `PORT` | `8080` | Port the server listens on. |
| `FRONTEND_URL` | `http://localhost:3000` | Base URL of the frontend; used to build links in verification and password-reset emails. |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origin(s) for HTTP and the WebSocket handshake. |

**JWT**

| Variable | Default | Description |
| --- | --- | --- |
| `JWT_ACCESS_SECRET` | — | Secret used to sign JWT access tokens. Use a long random string in production. |
| `JWT_ACCESS_TTL` | `15m` | Access-token lifetime. Units: `s` / `m` / `h` / `d` (e.g. `15s`, `5m`, `1h`, `7d`). |
| `JWT_REFRESH_TTL_DAYS` | `30` | Refresh-token lifetime in days. |

**Tokens**

| Variable | Default | Description |
| --- | --- | --- |
| `EMAIL_VERIFY_TTL_HOURS` | `24` | How long an email-verification link stays valid, in hours. |
| `PASSWORD_RESET_TTL_MINUTES` | `60` | How long a password-reset link stays valid, in minutes. |

**Mail (SMTP)**

| Variable | Default | Description |
| --- | --- | --- |
| `MAIL_HOST` | `smtp.example.com` | SMTP server host. |
| `MAIL_PORT` | `587` | SMTP server port. |
| `MAIL_SECURE` | `false` | Use TLS on connect (`true` for port 465, otherwise `false`). |
| `MAIL_USER` | — | SMTP username. |
| `MAIL_PASS` | — | SMTP password (for Gmail, an app password). |
| `MAIL_FROM` | — | Default `From` header, e.g. `Organization X <noreply@example.com>`. |

**S3 storage (Hetzner Object Storage)**

| Variable | Default | Description |
| --- | --- | --- |
| `S3_ENDPOINT` | `https://hel1.your-objectstorage.com` | S3-compatible endpoint URL. |
| `S3_REGION` | `hel1` | Storage region. |
| `S3_ACCESS_KEY_ID` | — | Access key ID. |
| `S3_SECRET_ACCESS_KEY` | — | Secret access key. |
| `S3_BUCKET` | — | Bucket name for uploads. |

> Never commit real secrets. `.env` is git-ignored; keep credentials only there.

## Project structure

src/                  App entry, feature modules
lib/core/             Shared primitives (response, errors, filters, interceptors)
lib/modules/          Reusable Nest modules (Prisma)
prisma/               Database schema and migrations

See `AGENTS.md` for conventions.