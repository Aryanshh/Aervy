# Aervy Web App: Antigravity Build Plan

**Goal of this build:** an advertiser can **upload an advertisement → choose location → choose duration/schedule → see a price → pay → submit**, and Aervy operations can review it. No drone control, no flight commands.

**Source of truth for product behaviour:** `Aervy_Web_App_Product_Specification.md` (keep it in the repo root and tell Antigravity to read it first).

---

## 0. Decisions this plan makes (change them if you disagree)

| # | Decision | Why |
|---|----------|-----|
| 1 | **Payments are in scope, in Razorpay test mode first.** The spec lists payment settlement as out of scope for the MVP; you asked for it, so this plan adds it behind a provider interface. | You want the upload → pay → duration → location flow. Test mode lets you build and demo it with zero real money. |
| 2 | **Pay at the end of the wizard, refund automatically if Ops rejects.** Payment confirms a *request*, not a flight. | Matches your flow. Keeps the spec rule that "submitted ≠ flight approved". |
| 3 | **Price is always computed on the server** from zone rate × duration × multipliers + GST, stored in integer paise. | The browser must never decide the amount. |
| 4 | **Locations are chosen from admin-defined approved zones** (map shows polygons). Free-form requests are a later feature. | Spec default. Simpler, safer, easier to price. |
| 5 | **Slots are held for 15 minutes during checkout** and double-booking is blocked by a database constraint. | Prevents "paid for a slot someone else took". |
| 6 | **Stack:** Next.js (App Router) + TypeScript strict + Tailwind + shadcn/ui + PostgreSQL + Prisma + Zod + Auth (Clerk or Auth.js) + S3-compatible storage + Razorpay. | Matches spec section 13. Boring and well-supported by AI agents. |
| 7 | **No microservices, no Kubernetes, no live drone integration** in this build. | Spec rule. |

Open decisions from spec section 26 (hardware formats, first pilot city, review ownership) stay open. Where the build needs them, use clearly named config values and mark them `TODO(pilot)`.

---

## 1. Antigravity setup (do this before writing any feature code)

Antigravity agents write better code when they are given persistent rules, a few skills, and the right tool connections. In Antigravity terms:

- **Rules**: always-on guidance loaded before every task (project folder `.agents/rules/`, or global `~/.gemini/GEMINI.md`). Keep each rules file under about 12,000 characters.
- **Workflows**: saved multi-step prompts you trigger on demand (`.agents/workflows/`).
- **Skills**: task instruction packs the agent loads when their description matches (`.agents/skills/<name>/SKILL.md`).
- **MCP servers**: live connections to tools such as GitHub, your database, docs. Configured through **Agent pane → ⋯ → MCP Servers → Manage MCP Servers → View raw config**.

---

## 2. Architecture

```text
Browser (advertiser / ops)
        │
Next.js App (UI + Server Actions + Route Handlers)
        │  auth → RBAC → org ownership → Zod validation
        ├── lib/pricing          (pure: quote calculation)
        ├── lib/availability     (slot check + holds)
        ├── lib/campaign-workflow(state machine + audit)
        ├── lib/payments         (PaymentProvider interface → RazorpayProvider / FakeProvider)
        ├── lib/storage          (presign, finalize, validate)
        └── lib/notifications    (in-app, later email)
        │
PostgreSQL (Prisma)      Object storage (S3-compatible)      Razorpay (test mode)
```

Key design choice: **`PaymentProvider` is an interface.** Real code uses `RazorpayProvider`; tests and demos can use `FakeProvider`. This keeps payment logic testable and lets you switch providers later.

---

## 3. Roles and access

| Role | Can do | Cannot do |
|---|---|---|
| Visitor | View public pages, sign up | See any private data |
| Advertiser | Own org's campaigns: create, edit drafts, upload, pay, submit, cancel (where allowed) | Approve own campaign, mark flown/completed, see other orgs |
| Ops Reviewer | See submitted campaigns, request changes, approve, reject (triggers refund), record notes | Edit zones/pricing, manage users |
| Admin | Zones, pricing rates, users, audit log, all reviewer actions | None by default |

---

## 4. Data model (Prisma, essentials)

Opaque IDs (`cuid()` or UUID). Indexes on `organizationId`, `status`, `zoneId`, `startAt`.
Enums: `Role`, `CampaignStatus`, `PaymentStatus`.
Models: `User`, `Organization`, `OrganizationMember`, `Zone`, `Campaign`, `CreativeAsset`, `Quote`, `SlotHold`, `Payment`, `Refund`, `WebhookEvent`, `StatusEvent`, `ReviewDecision`, `AuditLog`, `Notification`.

---

## 5. Campaign state machine

Allowed transitions in `lib/campaign-workflow/transitions.ts`:
- `DRAFT` -> `PENDING_PAYMENT`
- `PENDING_PAYMENT` -> `SUBMITTED` | `DRAFT`
- `SUBMITTED` -> `UNDER_REVIEW`
- `UNDER_REVIEW` -> `CHANGES_REQUESTED` | `REJECTED` | `APPROVED_FOR_SCHEDULING`
- `CHANGES_REQUESTED` -> `SUBMITTED`
- `REJECTED` -> (terminal, triggers refund)
- `APPROVED_FOR_SCHEDULING` -> `SCHEDULED`
- `SCHEDULED` -> `READY_FOR_OPERATIONS` -> `IN_PROGRESS` -> `COMPLETED`
- most states -> `CANCELLED` | `ON_HOLD`

---

## 6. Pricing engine (`lib/pricing`)

- Integer arithmetic in paise.
- Round half up.
- Recomputed server-side at checkout with hash matching.

---

## 7. Payment flow (Razorpay, test mode first)

- Webhook is source of truth.
- Idempotent processing.
- Slot hold 15 mins.
- Automatic refund on rejection.

---

## 8. Upload and creative handling

- Presigned upload to quarantine.
- Finalize with server-side magic byte validation, dimensions, duration.
- Limits configurable with `TODO(pilot)`.

---

## 9. Location selection

- Leaflet + react-leaflet with OpenStreetMap.
- Admin-defined polygon zones.
- Persistent safety disclaimer.

---

## 10. Advertiser wizard

6 steps:
1. Basics
2. Creative
3. Location
4. Schedule
5. Details
6. Review & Pay
