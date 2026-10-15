---
name: aervy-workflow
description: Business logic, state machine transitions, pricing calculation, and payment sequence rules for the Aervy drone advertising web platform.
---

# Aervy Workflow & Business Logic Skill

## 1. Safety Boundaries
- Never output or generate drone flight control, hardware commands, or autonomous piloting code.
- Every user-facing UI and documentation must reinforce: "Submitting a campaign is a REQUEST, never a flight authorization."

## 2. Campaign State Machine Transitions (`lib/campaign-workflow/transitions.ts`)
Only the following transitions are valid:
- `DRAFT` -> `PENDING_PAYMENT` (Advertiser initiates checkout)
- `PENDING_PAYMENT` -> `SUBMITTED` (Payment verified via webhook or verified checkout)
- `PENDING_PAYMENT` -> `DRAFT` (Hold expired, payment failed, or cancelled by user)
- `SUBMITTED` -> `UNDER_REVIEW` (Ops picks up campaign for review)
- `UNDER_REVIEW` -> `CHANGES_REQUESTED` (Ops requests creative or date modifications, reason required)
- `UNDER_REVIEW` -> `REJECTED` (Ops rejects campaign, reason required, triggers automatic refund)
- `UNDER_REVIEW` -> `APPROVED_FOR_SCHEDULING` (Ops approves feasibility)
- `CHANGES_REQUESTED` -> `SUBMITTED` (Advertiser re-submits after updates)
- `APPROVED_FOR_SCHEDULING` -> `SCHEDULED` (Schedule confirmed by Ops)
- `SCHEDULED` -> `READY_FOR_OPERATIONS` -> `IN_PROGRESS` -> `COMPLETED` (Simulated operational deployment)
- Allowed states -> `CANCELLED` (by advertiser or ops, triggers refund calculation)
- Allowed states -> `ON_HOLD` (by ops for safety/weather/regulatory holds)

Every transition must execute inside a single Prisma transaction:
1. Verify permissions via `can(user, action, resource)`
2. Verify transition is allowed in the transition matrix
3. Verify optimistic lock version (`version` field)
4. Update campaign status & increment version
5. Insert `StatusEvent`
6. Insert `AuditLog`
7. Insert `Notification` for relevant parties

## 3. Pricing Calculation Formula (`lib/pricing/`)
- All monetary amounts stored as integer paise (`Int`, INR). Never floating point.
- Formula:
  - `billableHours = sum of hours active in requested window`
  - `subtotal = zone.ratePerHourPaise * billableHours`
  - `adjusted = Math.round((subtotal * multiplierBps) / 10000)`
  - `gst = Math.round((adjusted * gstBps) / 10000)` (default gstBps = 1800, i.e., 18%)
  - `total = adjusted + gst`
- Recomputed server-side at checkout and compared with client-provided quote hash (`inputsHash`). Reject if inputs changed.

## 4. Payment & Refund Flow (`lib/payments/`)
- `PaymentProvider` interface with `RazorpayProvider` and `FakeProvider`.
- Razorpay test keys only (`rzp_test_...`).
- 15-minute `SlotHold` created upon checkout initiation.
- Webhook (`POST /api/webhooks/razorpay`) is the ultimate source of truth, verified with raw body HMAC SHA-256.
- Idempotency recorded via `WebhookEvent` table.
- Automatic refund triggered when Ops marks campaign `REJECTED`.
