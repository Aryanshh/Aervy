# Aervy project rules

## Source of truth
- Read `Aervy_Web_App_Product_Specification.md` and `docs/decisions.md` before planning any task.
- If code and spec disagree, stop and ask. Do not silently change product behaviour.

## Safety boundaries (never violate)
- No drone control, flight commands, autonomous takeoff, or hardware integration.
- Submitting a campaign is a REQUEST, never a flight authorization. UI copy must say so.
- Do not invent hardware specs, metrics, regulatory approvals, or impressions. Label demo data as demo.

## Stack and style
- Next.js App Router, TypeScript `strict: true`, Tailwind, shadcn/ui, Prisma + PostgreSQL, Zod.
- No `any`. No non-null assertions without a comment. No unused exports.
- Business logic lives in `lib/` (pure functions, unit-testable). Components only render.
- Server Actions / route handlers are thin: authenticate → authorize → validate (Zod) → call `lib/` → return typed result.
- Small files and components (aim under 200 lines). One responsibility per module.

## Correctness rules
- Money is integer paise (`Int`). Never floats. Currency is INR.
- Price is computed on the server only. Never accept an amount from the client.
- Campaign status changes go ONLY through `lib/campaign-workflow/transition.ts`
  (allowed-transition table). Every transition writes a StatusEvent and an AuditLog row in one DB transaction.
- Authorization is enforced on the server for every protected read and write (RBAC + organization ownership).
  Hiding a button is not authorization.
- Validate on client AND server with the same Zod schema.
- All date/times stored in UTC; display in the zone's timezone (default Asia/Kolkata).
- Payment webhooks and checkout verification must be idempotent.

## Security
- Secrets only in env vars; maintain `.env.example` with placeholders. Never commit real keys.
- Uploads: allowlist types and sizes, verify magic bytes server-side, random storage keys, never trust file extension.
- Never expose Razorpay key secret, webhook secret, or storage credentials to the browser.

## Definition of done for any task
- Typecheck, lint, tests pass. New logic has unit tests. New permissions have a negative test.
- Loading, empty, error, and validation states exist.
- No fake buttons: every control works or is clearly marked "not available yet".
- Summarize what changed, what was tested, and what is still assumed.
