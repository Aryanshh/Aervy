# Aervy — Dynamic Drone Advertising Web Platform

Aervy is a digital platform for planning, uploading, scheduling, reviewing, and managing dynamic aerial media campaigns for approved outdoor locations and events.

> **CRITICAL SAFETY BOUNDARY**:
> Aervy is a **campaign management and operational review system**. It does **NOT** perform autonomous drone flight control, broadcast live flight commands, or replace licensed drone operators, airspace authorizations, or safety inspections. Submitting a campaign is a **REQUEST for review**, never a flight authorization.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, React 18, Server Actions)
- **Language**: TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Styling**: Tailwind CSS + shadcn/ui design tokens
- **Data & ORM**: PostgreSQL + Prisma ORM (configured in Stage 1)
- **Validation**: Zod (isomorphic client/server schemas)
- **Testing**: Vitest (unit/integration) + Playwright (end-to-end)
- **Quality**: ESLint + Prettier + Husky + lint-staged
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

---

## Getting Started

### Prerequisites

- **Node.js**: >= 20.x (Node 24 supported)
- **npm**: >= 9.x
- **PostgreSQL**: local or hosted (for Stage 1 onwards)

### Setup Instructions

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repo-url>
   cd Aervy
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required local configuration parameters (database URL, auth secrets, test payment keys).

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server at `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Starts production server |
| `npm run lint` | Runs Next.js ESLint with strict TypeScript rules |
| `npm run typecheck` | Checks TypeScript compilation without emitting files (`tsc --noEmit`) |
| `npm test` | Runs Vitest unit tests |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run test:e2e` | Runs Playwright end-to-end tests |
| `npm run format` | Formats all files with Prettier |

---

## Architecture & Correctness Rules

- **Money in Integer Paise**: All monetary amounts are stored in integer paise (`Int`, INR), never floating point.
- **Server-Side Pricing**: The client never dictates prices; quotes are computed and hashed server-side.
- **Finite State Machine**: Campaign status transitions occur only through `lib/campaign-workflow/transition.ts` inside a single atomic database transaction.
- **Double-Booking Protection**: Overlapping zone bookings are prevented via database-level exclusion constraints and live availability checks.
- **Idempotent Webhooks**: Payment processing and status transitions are idempotent.

---

## Documentation

- [`Aervy_Web_App_Product_Specification.md`](./Aervy_Web_App_Product_Specification.md): Complete product specification (source of truth).
- [`docs/build_plan.md`](./docs/build_plan.md): Multi-stage implementation roadmap.
- [`docs/decisions.md`](./docs/decisions.md): Architecture Decision Records (ADR).
- [`.agents/rules/aervy.md`](./.agents/rules/aervy.md): Antigravity AI agent behavioral rules.
