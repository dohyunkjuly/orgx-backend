# Auth — Two-Factor Authentication (2FA) — Frontend Guide

What changed for the frontend: login can now require a second step, and there are endpoints to set up / enable / disable 2FA (TOTP authenticator app).

## Conventions
- **Base path:** `/auth`
- **Auth:** cookie-based (httpOnly cookies, sent automatically).
- **Response envelope:** unwrap `data` → `{ statusCode, code, data, message }`.
- **2FA type:** TOTP — 6-digit codes from an authenticator app (Google Authenticator, Authy, etc.).

---

## 1. Login now has two possible outcomes

`POST /auth/login` — body `{ email, password }`.

The `data` comes back in **one of two shapes**:

**a) 2FA is OFF (unchanged):** cookies are set, login is complete.
```json
{ "ok": true }
```

**b) 2FA is ON:** no cookies yet — a second step is required.
```json
{ "twoFactorRequired": true, "challengeToken": "<short-lived JWT>" }
```

Frontend handling:
```ts
const { data } = await login(email, password)
if (data.twoFactorRequired) {
  // show the 6-digit code input, then call /auth/2fa/verify with data.challengeToken
} else {
  // logged in (cookies set)
}
```
> `challengeToken` is valid for **5 minutes** and is **not** a session — it only works at `/auth/2fa/verify`.

---

## 2. Complete login (when 2FA required)

`POST /auth/2fa/verify` — **public**
```ts
{ challengeToken: string, code: string }   // code = 6 digits from the app
```
- On success: sets the session cookies, returns `{ ok: true }`.
- Errors: `2009` invalid code, `2010` 2FA not set up, `2003` challenge token invalid/expired.

---

## 3. Setting up 2FA (logged-in user)

### Step 1 — `POST /auth/2fa/setup`
Returns the secret + QR. **2FA is not on yet.**
```json
{ "secret": "JBSWY3DPEHPK3PXP",
  "otpauthUrl": "otpauth://totp/OrgX:user@example.com?secret=...",
  "qrCode": "data:image/png;base64,iVBORw0KGgo..." }
```
Render `qrCode` directly in an `<img src={qrCode} />` for the user to scan. Show `secret` as a manual-entry fallback.
- Error: `2011` 2FA already enabled.

### Step 2 — `POST /auth/2fa/enable`
Confirm with a code from the app; this turns 2FA on.
```ts
{ code: string }   // 6 digits
```
- Success: `{ ok: true }`.
- Errors: `2009` invalid code, `2010` not set up (call setup first), `2011` already enabled.

### Disable — `POST /auth/2fa/disable`
```ts
{ code: string }   // 6 digits, required
```
- Success: `{ ok: true }`. Errors: `2009` invalid code, `2010` not enabled.

---

## 4. `GET /auth/me` now includes 2FA status

```ts
{
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'
  isEmailVerified: boolean
  twoFactorEnabled: boolean   // ← NEW: drives the "2FA on/off" UI in settings
}
```

---

## Error codes

| code | HTTP | meaning |
|---|---|---|
| `2003` | 400 | Challenge token invalid or expired (restart login) |
| `2009` | 401 | Invalid two-factor code |
| `2010` | 400 | 2FA has not been set up |
| `2011` | 409 | 2FA is already enabled |

---

## Suggested flows

**Enable 2FA (settings page):**
1. `POST /auth/2fa/setup` → show QR (`qrCode`) + manual `secret`.
2. User scans, enters a code → `POST /auth/2fa/enable { code }`.
3. Refetch `/auth/me` → `twoFactorEnabled: true`.

**Login with 2FA:**
1. `POST /auth/login` → `{ twoFactorRequired: true, challengeToken }`.
2. Prompt for code → `POST /auth/2fa/verify { challengeToken, code }` → cookies set.

**Disable 2FA:**
1. Prompt for a current code → `POST /auth/2fa/disable { code }`.
2. Refetch `/auth/me` → `twoFactorEnabled: false`.
