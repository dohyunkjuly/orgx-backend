# Dashboard API — Frontend Guide

At-a-glance overview endpoints, one per role.

## Conventions
- **Auth:** cookie-based; requires an authenticated user.
- **Response envelope:** unwrap `data` → `{ statusCode, code, data, message }`.

## Endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/dashboard/admin` | admin | Admin overview |
| GET | `/dashboard/member` | any auth | Member overview |

Call the one matching the current user's `role` (from `GET /auth/me`). `/dashboard/admin` returns `4000` for non-admins.

---

## GET `/dashboard/admin` (`role: "ADMIN"`)
```ts
{
  role: 'ADMIN'
  members: {
    total: number
    active: number
    pending: number      // ← members awaiting approval (actionable)
    suspended: number
  }
  upcomingMeetings: Array<{
    id: string
    title: string
    startsAt: string     // ISO
    endsAt: string       // ISO
    location: string
    meetingLink: string | null
  }>                     // next 5 SCHEDULED meetings, soonest first
  ballots: {
    open: number
    draft: number
    items: Array<{ id: string; title: string; question: string; endsAt: string }>  // top 5 open, soonest-closing first
  }
  finance: { totalIncome: number; totalExpense: number; netBalance: number }   // all-time
  documents: { total: number }
}
```
**UI ideas:** stat cards (active members, pending approvals badge → link to member approvals, open ballots, net balance), an "upcoming meetings" list, and an income/expense/net mini-summary.

---

## GET `/dashboard/member` (`role: "MEMBER"`)
```ts
{
  role: 'MEMBER'
  upcomingMeetings: Array<{
    id: string
    title: string
    startsAt: string
    endsAt: string
    location: string
    meetingLink: string | null
  }>                     // next 5 SCHEDULED meetings
  openBallotsToVote: Array<{
    id: string
    title: string
    question: string
    endsAt: string
  }>                     // OPEN ballots the member hasn't voted in yet (actionable)
  unreadNotifications: number
  recentDocuments: Array<{ id: string; title: string; createdAt: string }>   // latest 5
}
```
**UI ideas:** "vote now" cards for `openBallotsToVote` (link to the ballot), upcoming meetings list (with a Join button when `meetingLink` is set), an unread-notifications badge, and a recent-documents list.

---

## Notes
- Counts/lists are computed server-side; arrays are already limited (meetings 5, documents 5) and pre-sorted.
- For deep views, link to the dedicated endpoints: `/meetings`, `/ballots`, `/documents`, `/transactions/summary`, `/notifications`.
- No query params. Call once on dashboard load; refetch when a relevant WebSocket notification arrives (new meeting/ballot) if you want it live.
