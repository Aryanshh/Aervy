# Aervy Decisions Log

| Decision ID | Date | Decision | Rationale | Implications |
|---|---|---|---|---|
| DEC-001 | 2026-10-15 | Payments in scope using Razorpay test mode | Advertiser needs full upload → pay → schedule → location demo flow without real money. | Implement behind a `PaymentProvider` interface so `FakeProvider` can be used in CI / tests. |
| DEC-002 | 2026-10-15 | Pay at end of wizard; refund automatically if Ops rejects | Payment confirms a request/reservation, not a flight. Preserves "submitted ≠ flight approved". | Reject action in ops must trigger refund and status update. |
| DEC-003 | 2026-10-15 | Server-computed pricing in integer paise (INR) | Browser/client must never dictate price; avoid floating point bugs. | Quote hash check on checkout. |
| DEC-004 | 2026-10-15 | Approved zones only (admin-defined GeoJSON polygons) | Simplifies MVP, ensures flight safety boundaries. | Free-form location requests deferred. |
| DEC-005 | 2026-10-15 | 15-minute slot hold during checkout + DB exclusion constraint | Prevents double-booking race conditions. | Slot holds expire automatically if payment abandoned. |
| DEC-006 | 2026-10-15 | Tech stack: Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, PostgreSQL, Prisma, Zod, Auth.js / Clerk, S3 storage, Razorpay | Standard, battle-tested modern full-stack web stack with strong typing and AI agent reliability. | Clean separation of pure business logic in `lib/`. |
| DEC-007 | 2026-10-15 | No microservices, no Kubernetes, no live drone hardware control | Strict safety boundary; web operations platform only. Operations lifecycle is simulated. | Strict guardrails against flight control code. |
