# Aervy --- Complete Product & Web Application Specification

**Version:** 1.0\
**Purpose:** Product blueprint and implementation guide for building the
Aervy web application first\
**Project category:** Drone-based dynamic advertising / aerial media
platform\
**Document status:** Initial product specification; validate
operational, regulatory, and hardware assumptions before real-world
deployment

------------------------------------------------------------------------

## 1. Executive Summary

**Aervy** is a drone-based dynamic advertising platform that aims to
make outdoor campaigns more flexible, location-aware, and
attention-grabbing. Instead of relying only on fixed billboards or
temporary physical installations, advertisers can use a digital platform
to plan campaigns for approved outdoor locations, events, and
high-footfall areas. The long-term vision is a network of drones
carrying suitable LED banners or programmable display systems, with
campaigns managed through a web dashboard.

The first build should be the **web application and its operating
workflows**, not autonomous flight. The website should let advertisers
create and manage campaigns, upload creative assets, select a requested
location or approved zone, choose a schedule, submit campaigns for
review, see status, and view simulated or later real campaign analytics.
An operations dashboard should let Aervy staff review campaigns, manage
approved zones and equipment, and coordinate deployments.

Aervy's core value proposition is: - **Rapid campaign setup:** the
intended USP is that a brand can prepare and submit an aerial campaign
in about five minutes once the platform workflow is established. This is
a target to validate, not a guarantee of immediate real-world flight. -
**Location-aware delivery:** campaigns can be planned for relevant,
approved areas and time windows. - **Infrastructure-light advertising:**
temporary campaigns may not require a permanent billboard
installation. - **High-attention format:** aerial displays can create a
distinctive brand presence at suitable events and public spaces. -
**Digital campaign management:** assets, scheduling, approvals,
deployment status, and reporting can be managed from one place.

Aervy may eventually support event information, public announcements,
emergency messaging, QR-based interactions, and coordinated multi-drone
displays. These are later-stage capabilities and must not be represented
as available until they are implemented, tested, and approved.

------------------------------------------------------------------------

## 2. Product Vision and Positioning

### Vision

Build a trusted platform that connects advertisers, event organizers,
and authorized drone operations teams to plan and manage aerial media
campaigns safely and transparently.

### Positioning statement

**Aervy is a smart, flying-billboard network managed through a digital
campaign platform---helping brands deliver the right message to the
right approved place at the right time.**

### Problem

Traditional outdoor advertising can be static, difficult to reposition,
and dependent on physical infrastructure, venue access, printing, and
installation. Event organizers and advertisers may also need temporary
visibility in specific locations and time windows.

### Proposed solution

Aervy provides a web-based campaign workflow that centralizes: 1.
Advertiser onboarding and organization profiles. 2. Campaign creation
and creative upload. 3. Location and time-window requests. 4. Campaign
review and operational feasibility checks. 5. Approval, scheduling, and
deployment coordination. 6. Campaign status and performance reporting.

The software coordinates the workflow. It does **not** independently
authorize a flight or replace a trained operator, airspace checks,
permissions, or safety procedures.

### Initial customer segments

-   Brands and marketing agencies.
-   Event organizers, college festivals, expos, sports events, and
    exhibitions.
-   Venue and property operators, subject to permissions.
-   Local businesses seeking short-term promotions.
-   Institutional or public-information partners, where formally
    authorized.

### Example use cases

-   Brand awareness at an approved outdoor event.
-   Launch promotion or product announcement.
-   Event schedule, wayfinding, or sponsor messaging.
-   Temporary campaign in a permitted outdoor zone.
-   Public-information messages from an authorized organization.
-   QR-code interaction or campaign landing page, if the display and
    scanning experience support it.

Emergency alerts and public-safety communication should be treated as a
separate, formally authorized use case---not a casual advertising
feature.

------------------------------------------------------------------------

## 3. Product Principles

1.  **Safety before scheduling:** a requested campaign is not a flight
    authorization.
2.  **Human approval for real operations:** qualified personnel review
    feasibility and authorize deployment.
3.  **Clear status:** users can always see whether a campaign is a
    draft, submitted, under review, approved, scheduled, active,
    completed, rejected, or cancelled.
4.  **Honest analytics:** distinguish measured data from estimates and
    simulations.
5.  **Privacy by design:** collect only necessary account and campaign
    data; avoid identifying or profiling individual spectators by
    default.
6.  **AI assists; operators decide:** generative AI may help with copy,
    summaries, and campaign suggestions. It must not control flight
    systems or bypass review.
7.  **Modular architecture:** begin with a web app and simulated
    operations, then integrate approved systems through defined
    interfaces.
8.  **Accessible, responsive design:** the application should work on
    desktop, tablet, and mobile browsers.

------------------------------------------------------------------------

## 4. Scope: What to Build First

### Phase 1 --- Web-app MVP

Build these before attempting hardware integration:

-   Public landing page explaining Aervy.
-   Sign-up, sign-in, sign-out, and password reset.
-   Advertiser organization/profile setup.
-   Advertiser dashboard.
-   Campaign creation wizard.
-   Creative asset upload and preview.
-   Requested location/zone selection on a map.
-   Date and time-window selection.
-   Campaign budget or quote-request field (final pricing model can be
    configured later).
-   Draft saving and campaign submission.
-   Admin/operations review dashboard.
-   Approval, rejection, and change-request workflow with reasons.
-   Campaign status timeline and notifications inside the app.
-   Basic campaign analytics using clearly labeled demo/simulated data
    until real measurements exist.
-   Responsive UI, form validation, error states, loading states, and
    empty states.
-   Audit log for key campaign and approval actions.
-   Seed/demo data for development and demonstrations.

### Explicitly out of scope for the first MVP

-   Direct autonomous drone control from the browser.
-   Sending flight commands to a drone over a public web API.
-   Automated airspace or legal authorization.
-   Guaranteed real-time crowd counts or individual tracking.
-   Payment settlement or complex invoicing unless required by the first
    pilot.
-   Fully autonomous campaign selection based on live crowd
    surveillance.
-   Claims of guaranteed impressions, reach, or conversion without
    validated measurement.
-   Emergency response dispatch.

### Phase 1 success criteria

-   A new advertiser can register and create a campaign without staff
    assistance.
-   The campaign form can be completed in approximately five minutes in
    usability testing, excluding account verification, approval, and
    flight preparation.
-   An operator can review, approve, reject, or request changes to a
    campaign.
-   Every status change is recorded with timestamp and actor.
-   Users can see campaign details and the reason for the current
    status.
-   The app can be demonstrated end-to-end using simulated deployments
    without connecting to real flight hardware.

------------------------------------------------------------------------

## 5. Users, Roles, and Permissions

### 5.1 Visitor

Can: - View landing page, product overview, use cases, FAQs, and contact
form. - Start registration or sign in.

Cannot: - View private campaigns, organization data, or operations data.

### 5.2 Advertiser / Campaign Manager

Can: - Manage their own profile and organization. - Create, edit,
duplicate, and submit campaigns. - Upload and replace creative assets. -
Request a location and time slot. - See review notes and campaign
status. - Cancel or request changes where allowed. - View analytics for
campaigns belonging to their organization. - Invite team members later,
if organization-level access is implemented.

Cannot: - Approve their own campaign. - Mark a campaign as flown or
completed. - Access another advertiser's private data. - Override safety
or operational restrictions.

### 5.3 Aervy Operations Reviewer

Can: - View submitted campaigns. - Review creative, requested location,
timing, and operational details. - Request edits, approve for
scheduling, or reject with a reason. - Assign an operations owner. -
Record feasibility notes and deployment readiness. - Update deployment
status based on verified operational information.

### 5.4 Administrator

Can: - Manage users, organizations, roles, campaign categories, and
approved zones. - Review audit logs. - Configure campaign workflow
settings. - Manage demo data and system settings. - Suspend accounts or
campaigns when justified.

Use role-based access control (RBAC) on the server. Hiding a button in
the frontend is not authorization.

### 5.5 Pilot operator / drone operations team (later phase)

May receive a restricted operations interface for assigned deployments.
Flight-related access must be separated from advertiser and general
admin permissions and must follow the approved operational process.

------------------------------------------------------------------------

## 6. Information Architecture and Pages

### Public website

1.  `/` --- Landing page
2.  `/how-it-works` --- Workflow and operating model
3.  `/solutions` --- Brand campaigns, events, temporary promotions
4.  `/safety` --- Safety principles, human review, and permissions
5.  `/about` --- Mission and team
6.  `/contact` --- Contact / demo request
7.  `/auth/sign-in`
8.  `/auth/sign-up`
9.  `/auth/forgot-password`
10. `/legal/privacy`
11. `/legal/terms`

### Advertiser application

1.  `/app/dashboard`
2.  `/app/campaigns`
3.  `/app/campaigns/new`
4.  `/app/campaigns/[campaignId]`
5.  `/app/campaigns/[campaignId]/edit`
6.  `/app/analytics`
7.  `/app/organization`
8.  `/app/settings`
9.  `/app/notifications`

### Operations/admin application

1.  `/ops/dashboard`
2.  `/ops/campaigns`
3.  `/ops/campaigns/[campaignId]`
4.  `/ops/calendar`
5.  `/ops/zones`
6.  `/ops/deployments`
7.  `/ops/users`
8.  `/ops/audit-log`
9.  `/ops/settings`

Route names are suggestions. Keep the navigation simple and consistent.

------------------------------------------------------------------------

## 7. Core User Journeys

### Journey A --- Advertiser launches a campaign request

1.  Opens Aervy and reviews the value proposition.
2.  Registers and verifies their account.
3.  Creates or selects an organization.
4.  Opens **Create Campaign**.
5.  Enters campaign name, objective, brand, and campaign type.
6.  Uploads a creative asset or uses a supported template.
7.  Selects a requested location/approved zone and time window.
8.  Adds notes, expected audience context, and budget/quote preference.
9.  Reviews a summary and submits.
10. Sees confirmation that the campaign is **Submitted for Review**, not
    that a flight is approved.
11. Receives an in-app update if the operations team requests changes or
    makes a decision.
12. After approval and operational scheduling, sees the planned
    deployment details.
13. After verified completion, sees available campaign reporting.

### Journey B --- Operations reviews a campaign

1.  Reviewer opens the operations dashboard.
2.  Filters submitted campaigns by status, date, location, or campaign
    type.
3.  Opens a campaign and reviews creative, time, zone, and notes.
4.  Checks feasibility using the organization's approved procedures and
    information sources.
5.  Requests changes, rejects, or approves the campaign for the next
    scheduling step.
6.  Records a reason and any operational constraints.
7.  If approved, assigns an operations owner or scheduling status.
8.  Records deployment milestones only when verified.
9.  Closes the campaign after completion or records
    cancellation/incident details as appropriate.

### Journey C --- Administrator manages an approved zone

1.  Admin opens Zones.
2.  Creates or edits a zone with name, map geometry, description, and
    status.
3.  Records operational notes and any restrictions.
4.  Publishes the zone for campaign requests only after appropriate
    review.
5.  Retires or disables a zone when it is no longer available.

A zone shown in the app is not automatically proof of legal airspace
clearance or permission for a specific flight.

------------------------------------------------------------------------

## 8. Campaign Creation Wizard

Use a short, multi-step wizard with a persistent progress indicator.
Save drafts automatically where practical.

### Step 1 --- Campaign basics

Fields: - Campaign name (required). - Brand / advertiser (required). -
Campaign objective: awareness, event promotion, product launch, sponsor
visibility, public information, other. - Campaign type: static display,
scheduled message rotation, event campaign, other supported format. -
Short campaign description. - Internal campaign reference (optional).

### Step 2 --- Creative

Fields: - Upload image/video or supported display asset. - Preview
asset. - Asset title and optional alt/description text. - Display
duration or message rotation preference, if supported. - Call-to-action
text (optional). - Destination URL / QR landing page (optional). - Brand
guidelines or reviewer notes (optional).

Validation: - Enforce accepted file types, file size limits, and safe
filenames. - Validate actual file content server-side; do not trust
extensions alone. - Scan uploads where infrastructure supports it. -
Show a useful error if an asset is rejected. - Make it clear which
aspect ratios, resolutions, durations, and formats are supported by the
actual display hardware. Do not invent hardware specifications before
they are confirmed.

### Step 3 --- Location

Fields: - Requested location, venue, or approved zone. - Map selection
or searchable place field. - Campaign area / venue notes. - Location
contact or permission status (optional, depending on operating model). -
Any location-specific notes.

Important: - Use approved zones as the default choice. - If free-form
location requests are allowed, label them as **requested locations
pending review**. - Do not calculate or promise flight paths or safety
clearance in the browser. - Keep map-provider API keys on the server
where applicable and follow provider terms.

### Step 4 --- Schedule

Fields: - Requested start date. - Requested end date or duration. -
Preferred time window. - Alternative time window (optional). -
Flexibility: fixed time / flexible within range. - Event date and time
(if applicable).

The UI must distinguish **requested schedule** from **confirmed
schedule**. Check conflicts in the backend and show a conflict state
instead of silently accepting overlapping bookings.

### Step 5 --- Campaign details

Fields: - Target audience description (aggregate/contextual, not
personal profiles). - Expected audience size (optional estimate supplied
by advertiser). - Campaign notes. - Budget range or quote request. -
Required approvals / venue permission information, if applicable. -
Acknowledgement that submission is a request and not flight
authorization.

### Step 6 --- Review and submit

Show: - Campaign summary. - Creative preview. - Location and schedule
request. - Missing information and validation warnings. - Terms and
safety acknowledgement. - Save as draft / Submit for review.

After submission: - Create a status event. - Display a clear
confirmation page. - Notify the operations team. - Do not display
"Flight confirmed" until the required real-world checks and scheduling
process are complete.

------------------------------------------------------------------------

## 9. Campaign Status Model

Use a controlled state machine rather than arbitrary status text.

Suggested statuses: - `draft` - `submitted` - `under_review` -
`changes_requested` - `rejected` - `approved_for_scheduling` -
`scheduled` - `ready_for_operations` - `in_progress` - `completed` -
`cancelled` - `on_hold` - `failed` (use only if a deployment was
actually attempted and failed)

Example allowed transitions: - `draft` → `submitted` - `submitted` →
`under_review` - `under_review` → `changes_requested` / `rejected` /
`approved_for_scheduling` - `changes_requested` → `submitted` -
`approved_for_scheduling` → `scheduled` / `on_hold` - `scheduled` →
`ready_for_operations` / `cancelled` / `on_hold` -
`ready_for_operations` → `in_progress` / `cancelled` / `on_hold` -
`in_progress` → `completed` / `failed` / `on_hold` - `on_hold` → an
explicitly permitted prior/next state after review

Every transition should record: - Previous status. - New status. -
Actor. - Timestamp. - Reason or reviewer note. - Optional supporting
attachment or reference.

Keep the status history append-only for normal application users.
Corrections should be recorded as new events, not silently erase
history.

------------------------------------------------------------------------

## 10. Dashboard Requirements

### Advertiser dashboard

Show: - Welcome message and organization. - Primary CTA: **Create
Campaign**. - Campaign counts by status. - Recent campaigns. - Upcoming
scheduled campaigns. - Action required: changes requested, missing
information, or pending approval. - Recent notifications. - A compact
performance summary for completed campaigns only.

Do not show made-up performance metrics as if they were real. Demo
values must be labeled as sample data.

### Operations dashboard

Show: - Submitted campaigns awaiting review. - Campaigns with requested
changes. - Upcoming scheduled deployments. - Campaigns requiring
operational readiness review. - Calendar/list view. - Filters for
status, date, zone, and owner. - Recent status changes. -
Safety/permission checklist indicators, with explicit distinction
between "not checked," "pending," and "verified."

### Admin dashboard

Show: - User and organization counts. - Campaign pipeline. - Zone
availability. - System notices. - Audit events. - Configuration
shortcuts.

------------------------------------------------------------------------

## 11. Campaign Analytics

Analytics should be incremental and evidence-based.

### MVP analytics

-   Number of campaigns created.
-   Number submitted, approved, completed, cancelled, or rejected.
-   Requested versus confirmed schedule.
-   Campaign duration, where verified.
-   Creative asset and campaign metadata.
-   Reviewer turnaround time.
-   Completion rate based on campaign records.

### Later analytics

-   Verified display uptime.
-   Estimated viewing opportunities, with methodology clearly
    documented.
-   QR scans and landing-page clicks.
-   Campaign-specific engagement events.
-   Aggregated venue/event-level performance.
-   Cost per measured engagement, if the cost and event measurement are
    reliable.

### Data quality rules

-   Separate `measured`, `estimated`, and `simulated` metrics.
-   Include source, collection time, and methodology for each metric.
-   Do not claim unique people reached based only on flight duration or
    area population.
-   Do not use face recognition or identify individual spectators for
    standard campaign analytics.
-   Make missing data visible rather than filling it with invented
    numbers.

------------------------------------------------------------------------

## 12. AI and Gemini Integration

AI should be an optional assistance layer in the web application---not
the source of truth for flight safety or authorization.

### Useful first AI features

1.  **Campaign copy assistant:** generate headline and short message
    options from advertiser-provided brand, objective, and tone.
2.  **Creative checklist:** flag likely readability, text-density, or
    format issues using explicit rules; present AI feedback as
    suggestions.
3.  **Campaign brief summary:** summarize a long brief for the reviewer.
4.  **Variant generation:** produce multiple approved copy variants for
    human review.
5.  **Help assistant:** answer product workflow questions using Aervy's
    own approved documentation.

### AI guardrails

-   Never let a language model send flight commands, alter geofence
    restrictions, or approve a flight.
-   Never treat AI-generated legal or safety advice as authorization.
-   Require human review before generated content is published.
-   Validate AI output against schema and length constraints.
-   Do not send secrets, unnecessary personal information, or sensitive
    operational details to an AI provider.
-   Add rate limits, usage logging, and clear error handling.
-   Keep the app usable if the AI service is unavailable.
-   Store the provider API key in server-side environment variables
    only; never expose it in frontend code.
-   Make it clear to users when content is AI-generated.

### Suggested interface

In the campaign creative step, provide a button such as **Generate copy
ideas**. Return a few options, let the advertiser edit them, and save
only the selected final content. Do not auto-publish.

### Later AI possibilities

-   Context-aware campaign suggestions based on event category, time,
    and approved zone metadata.
-   Creative adaptation for display constraints.
-   Reporting summaries based on verified campaign data.
-   Multilingual copy suggestions with human review.

AI must not use live surveillance of identifiable people to infer
sensitive attributes or target individual spectators.

------------------------------------------------------------------------

## 13. Technical Architecture

Choose a stack the team can build and maintain. The following is a
recommended starting point, not a hard dependency.

### Recommended MVP stack

-   **Frontend:** Next.js with React and TypeScript.
-   **Styling/UI:** Tailwind CSS plus a consistent component system.
-   **Backend:** Next.js server actions/API routes initially, or a
    separate REST API if the product grows.
-   **Database:** PostgreSQL.
-   **ORM:** Prisma or Drizzle.
-   **Authentication:** a reputable managed authentication provider or a
    properly implemented server-side auth library.
-   **File storage:** S3-compatible object storage for creative assets.
-   **Maps:** a provider selected after checking coverage, pricing, and
    terms.
-   **AI:** Gemini API through server-side endpoints only, if AI
    features are enabled.
-   **Deployment:** a managed web host for the app, managed PostgreSQL,
    and object storage.
-   **Monitoring:** application error reporting and structured server
    logs.

Alternatives are acceptable. Avoid introducing microservices,
Kubernetes, or a complex event-streaming stack before there is a real
need.

### High-level architecture

``` text
Advertiser / Operations / Admin
              |
       Responsive Web UI
              |
      Auth + Role Checks
              |
        Application API
      /       |        \
 Campaigns  Assets    Notifications
      |       |             |
 PostgreSQL  Object       Email / In-app
             Storage
              |
       AI Assistance API
       (optional, server-side)

Later, through a separate controlled integration:
Operations Workflow → Approved Deployment Adapter → Authorized Flight/Telemetry Systems
```

The deployment adapter must not be a shortcut around operational
authorization. Flight-control systems should be isolated from the
public-facing campaign application and protected by their own
permissions, validation, and safety procedures.

### Suggested project structure

``` text
aervy/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── analytics/
│   │   ├── organization/
│   │   └── settings/
│   ├── ops/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── calendar/
│   │   ├── zones/
│   │   └── audit-log/
│   └── api/
├── components/
│   ├── ui/
│   ├── marketing/
│   ├── campaigns/
│   ├── dashboard/
│   ├── maps/
│   └── ops/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   ├── permissions/
│   ├── campaign-workflow/
│   ├── storage/
│   ├── ai/
│   └── notifications/
├── prisma/                 # if Prisma is selected
├── tests/
├── public/
├── .env.example
├── README.md
└── package.json
```

This is an illustrative structure. Adapt it to the selected framework
and routing conventions.

------------------------------------------------------------------------

## 14. Data Model

Start with a relational model. Use UUIDs or equivalent opaque IDs. Add
indexes for common filtering fields.

### `User`

-   `id`
-   `name`
-   `email` (unique)
-   `authProviderId` or securely managed credential reference
-   `role` or role assignments
-   `createdAt`
-   `updatedAt`
-   `isActive`

Do not store plaintext passwords.

### `Organization`

-   `id`
-   `name`
-   `organizationType`
-   `website` (optional)
-   `contactEmail`
-   `createdAt`
-   `updatedAt`

### `OrganizationMember`

-   `id`
-   `organizationId`
-   `userId`
-   `membershipRole`
-   `createdAt`

This supports organization-level collaboration without sharing accounts.

### `Campaign`

-   `id`
-   `organizationId`
-   `createdByUserId`
-   `name`
-   `objective`
-   `campaignType`
-   `description`
-   `status`
-   `requestedStartAt`
-   `requestedEndAt`
-   `confirmedStartAt` (nullable)
-   `confirmedEndAt` (nullable)
-   `requestedZoneId` (nullable)
-   `requestedLocationText` (nullable)
-   `budgetMin` (nullable)
-   `budgetMax` (nullable)
-   `currency`
-   `targetAudienceDescription` (aggregate/contextual)
-   `quoteRequested`
-   `submittedAt` (nullable)
-   `createdAt`
-   `updatedAt`

### `CreativeAsset`

-   `id`
-   `campaignId`
-   `uploadedByUserId`
-   `storageKey`
-   `originalFilename`
-   `mimeType`
-   `fileSizeBytes`
-   `assetType`
-   `reviewStatus`
-   `createdAt`

Store the file in object storage; keep metadata and a storage key in the
database. Do not rely on a user-provided URL as a trusted storage path.

### `CampaignStatusEvent`

-   `id`
-   `campaignId`
-   `previousStatus`
-   `newStatus`
-   `actorUserId`
-   `reason`
-   `createdAt`

### `Review`

-   `id`
-   `campaignId`
-   `reviewerUserId`
-   `decision`
-   `notes`
-   `createdAt`

### `Zone`

-   `id`
-   `name`
-   `description`
-   `geometry` (format chosen for the selected map/geospatial database
    approach)
-   `zoneStatus` (`draft`, `under_review`, `approved_for_requests`,
    `inactive`)
-   `operationalNotes`
-   `createdAt`
-   `updatedAt`

A zone marked `approved_for_requests` is a platform workflow
designation, not universal flight permission.

### `Deployment`

-   `id`
-   `campaignId`
-   `assignedOperationsUserId` (nullable)
-   `status`
-   `scheduledStartAt` (nullable)
-   `scheduledEndAt` (nullable)
-   `actualStartAt` (nullable)
-   `actualEndAt` (nullable)
-   `completionNotes` (nullable)
-   `createdAt`
-   `updatedAt`

Do not expose direct vehicle-control fields in the advertiser campaign
model.

### `Notification`

-   `id`
-   `userId`
-   `type`
-   `title`
-   `message`
-   `readAt` (nullable)
-   `createdAt`

### `AuditLog`

-   `id`
-   `actorUserId`
-   `action`
-   `entityType`
-   `entityId`
-   `metadata` (avoid secrets and unnecessary personal data)
-   `createdAt`

### `MetricEvent` (later or optional MVP)

-   `id`
-   `campaignId`
-   `metricType`
-   `value`
-   `unit`
-   `measurementMethod`
-   `dataQuality` (`measured`, `estimated`, `simulated`)
-   `source`
-   `observedAt`
-   `createdAt`

------------------------------------------------------------------------

## 15. API Design

Use consistent JSON responses, server-side validation, authorization
checks, and predictable error codes. The exact routes may vary by
framework.

### Authentication / organization

-   `GET /api/me` --- current user and permitted organization context.
-   `GET /api/organizations` --- organizations accessible to current
    user.
-   `POST /api/organizations` --- create organization.
-   `PATCH /api/organizations/:id` --- update organization, with
    permission checks.

### Campaigns

-   `GET /api/campaigns` --- list only campaigns the caller may access.
-   `POST /api/campaigns` --- create draft.
-   `GET /api/campaigns/:id` --- campaign details and permitted history.
-   `PATCH /api/campaigns/:id` --- edit a draft or a campaign in an
    allowed state.
-   `POST /api/campaigns/:id/submit` --- validate and submit for review.
-   `POST /api/campaigns/:id/cancel` --- request or perform cancellation
    according to state.
-   `GET /api/campaigns/:id/events` --- status history, subject to
    access rules.

### Creative assets

-   `POST /api/campaigns/:id/assets/upload-url` --- request a
    short-lived upload URL, if using direct object-storage uploads.
-   `POST /api/campaigns/:id/assets/complete` --- confirm upload and
    validate metadata.
-   `DELETE /api/assets/:id` --- delete only when permitted and when
    retention rules allow.

### Operations

-   `GET /api/ops/campaigns` --- authorized operations queue.
-   `POST /api/ops/campaigns/:id/review` --- submit review decision.
-   `POST /api/ops/campaigns/:id/schedule` --- record scheduling
    decision.
-   `POST /api/ops/deployments/:id/status` --- update a deployment
    status with audit history.

### Zones

-   `GET /api/zones` --- list zones available for the user's workflow.
-   `POST /api/ops/zones` --- create zone.
-   `PATCH /api/ops/zones/:id` --- update zone.

### AI assistance (optional)

-   `POST /api/ai/campaign-copy` --- generate draft copy from validated
    inputs.
-   `POST /api/ai/campaign-summary` --- summarize a campaign for
    authorized reviewers.

### API rules

-   Enforce access checks on every resource by ID to prevent insecure
    direct object references.
-   Validate all request bodies and query parameters.
-   Rate-limit authentication, upload, and AI endpoints.
-   Use pagination for lists.
-   Use idempotency protection for actions that could be submitted
    twice.
-   Never return internal secrets, private storage credentials, or
    sensitive operational details.
-   Return a clear validation response that the frontend can show field
    by field.

------------------------------------------------------------------------

## 16. Security, Privacy, and Reliability

### Security baseline

-   HTTPS in production.
-   Secure, HttpOnly, appropriately configured cookies if cookie-based
    sessions are used.
-   CSRF protection where applicable.
-   Strict server-side RBAC and resource-level authorization.
-   Rate limiting and abuse protection.
-   Input validation and output encoding.
-   Upload size/type limits, content validation, and malware scanning
    where available.
-   Short-lived, scoped upload/download URLs.
-   Environment variables or a secret manager for API keys.
-   Database backups and a tested restore procedure.
-   Dependency updates and secret scanning.
-   Audit logs for role changes, approvals, and campaign state
    transitions.
-   Avoid exposing internal stack traces to users.

### Privacy principles

-   Collect only necessary account and campaign information.
-   Do not collect precise spectator location or identity for standard
    advertising.
-   Do not introduce facial recognition as a default feature.
-   Use aggregated analytics where possible.
-   Define retention periods for account data, creative assets, audit
    records, and metrics.
-   Publish a clear privacy notice and provide a way to contact the team
    about data requests.
-   Make demo/sample data distinguishable from real customer data.

### Reliability

-   Use database transactions for important status changes.
-   Make status transitions explicit and testable.
-   Provide graceful AI/map/notification failure states.
-   Ensure the core campaign workflow works even if AI features are
    disabled.
-   Back up campaign records and asset metadata.
-   Log errors with correlation IDs, without logging secrets or
    unnecessary personal data.

------------------------------------------------------------------------

## 17. Safety, Permissions, and Operational Governance

Aervy involves physical aircraft and public spaces, so safety is a core
product constraint---not a footer disclaimer.

The web app should: - Clearly state that campaign submission does not
grant flight permission. - Require an operations review before any
campaign can be scheduled for deployment. - Keep requested location,
approved platform zone, and verified flight authorization as distinct
concepts. - Record required permission evidence or references where
appropriate. - Support operational checklists and hold states. - Make it
possible to suspend a campaign or zone. - Record the responsible
reviewer and deployment owner. - Prevent advertiser roles from changing
operational readiness or flight status. - Keep flight-control and
telemetry integration behind a separately secured operational
interface. - Include incident reporting and post-deployment notes in a
later operations phase.

Before any real deployment in India, the team must verify the current
requirements applicable to the specific aircraft, operator, location,
purpose, and operating conditions. This can involve applicable DGCA
rules, the Digital Sky platform, airspace restrictions, local
administration, venue/property consent, and other permissions. The app
must not claim that a map selection or internal approval replaces
official requirements. Obtain qualified regulatory and operational
review before flight testing or public deployment.

------------------------------------------------------------------------

## 18. UX and Visual Design Direction

### Brand feeling

-   Futuristic, precise, trustworthy, and clean.
-   More like a modern aviation-tech SaaS platform than a flashy gaming
    dashboard.
-   Emphasize reliability, visibility, and control.
-   Use motion sparingly; animations should clarify status or navigation
    rather than distract.

### Suggested visual system

-   Dark navy or charcoal as a strong base, with a light-mode option if
    useful.
-   Electric blue or cyan as an accent, paired with restrained neutral
    colors.
-   High-contrast typography and readable form labels.
-   Consistent spacing, border radius, icon style, and button hierarchy.
-   Use real product UI screenshots or clearly labeled conceptual
    illustrations; do not imply prototype imagery is deployed hardware.

### Landing page sections

1.  Hero: concise headline and primary CTA.
2.  Product concept: how Aervy works.
3.  Use cases: events, brand campaigns, product launches, temporary
    promotions.
4.  Workflow: create → review → schedule → deploy → report.
5.  Safety and human oversight.
6.  Analytics and campaign management.
7.  Request a demo / contact.
8.  Footer with legal and contact links.

### Example copy

**Headline:** "Outdoor advertising, ready to move."\
**Subheading:** "Plan distinctive aerial campaigns for approved
locations and events through one campaign management platform."\
**Primary CTA:** "Request a Demo"\
**Secondary CTA:** "Explore How It Works"

Avoid claims such as "fly anywhere," "guaranteed reach," "fully
autonomous advertising," or "launch in five minutes" as an unconditional
promise. The five-minute concept should be presented as a campaign setup
target, not a promise of flight approval or takeoff.

### Accessibility

-   Keyboard-accessible navigation and controls.
-   Visible focus states.
-   Labels and error messages associated with fields.
-   Sufficient contrast.
-   Do not use color alone to convey campaign status.
-   Support responsive layouts and sensible touch targets.
-   Respect reduced-motion preferences.

------------------------------------------------------------------------

## 19. Notifications

### MVP in-app notifications

-   Campaign submitted.
-   Changes requested.
-   Campaign approved for scheduling.
-   Campaign rejected.
-   Schedule confirmed or changed.
-   Campaign cancelled or placed on hold.
-   Campaign completed.
-   Organization invitation (if collaboration is enabled).

### Later channels

-   Email updates.
-   Optional SMS or messaging integration for operationally important
    alerts, only with appropriate consent and provider setup.

Notification copy must clearly describe what changed and what action, if
any, the user needs to take. Do not send a notification that implies a
flight is confirmed when only a campaign review has been approved.

------------------------------------------------------------------------

## 20. Pricing and Business Model (Configurable, Not Locked)

Potential models to validate: - Per-campaign pricing. - Time-window or
event-based packages. - Custom quotes for large events or multi-location
campaigns. - Agency or brand plans for repeat customers. -
Production/creative services as an add-on. - Sponsored institutional
campaigns or partnerships, where appropriate.

The MVP should support a **quote request** or configurable budget range
rather than hard-coding a pricing model before operational costs are
known.

Cost inputs to evaluate: - Aircraft and display hardware. - Battery and
maintenance costs. - Qualified pilot/operator time. - Travel, setup, and
venue coordination. - Insurance and compliance costs. - Creative
production. - Software hosting and support. - Weather delays,
cancellations, and contingency time.

Do not assume a campaign is profitable until real pilot costs,
utilization, demand, and operational limits have been measured.

------------------------------------------------------------------------

## 21. Testing Plan

### Unit tests

-   Campaign field validation.
-   Status transition rules.
-   Role and permission checks.
-   Time-window validation.
-   Metric classification (`measured`, `estimated`, `simulated`).
-   AI output schema and length constraints.

### Integration tests

-   Create campaign → submit → review → approve/reject.
-   Upload asset → validate metadata → preview asset.
-   Organization membership and resource access.
-   Notification creation.
-   Audit log written for status changes.
-   Schedule conflict handling.

### End-to-end tests

1.  Advertiser registers and creates an organization.
2.  Advertiser creates and submits a campaign.
3.  Operations reviewer requests changes.
4.  Advertiser updates and resubmits.
5.  Reviewer approves for scheduling.
6.  Operations records a simulated deployment.
7.  Campaign is marked completed.
8.  Advertiser sees a clearly labeled sample analytics report.

### Security tests

-   Attempt to view another organization's campaign.
-   Attempt to approve a campaign as an advertiser.
-   Attempt invalid status transitions.
-   Attempt oversized or disallowed uploads.
-   Attempt repeated submission or duplicate actions.
-   Confirm API keys are absent from frontend bundles.
-   Confirm server errors do not expose secrets.

### Usability tests

-   Can a first-time user understand the difference between campaign
    submission and flight authorization?
-   Can the campaign request be completed in around five minutes?
-   Can a user tell what is blocking approval?
-   Can an operator find campaigns requiring review quickly?
-   Are sample metrics unmistakably labeled?

------------------------------------------------------------------------

## 22. Implementation Roadmap

### Stage 0 --- Product setup

-   Confirm target users and initial pilot use case.
-   Confirm whether the first demo is entirely simulated.
-   Select framework, database, auth, storage, and map provider.
-   Define the initial campaign status state machine.
-   Create wireframes and a small design system.

**Deliverable:** approved product flow and technical foundation.

### Stage 1 --- UI foundation

-   Build marketing pages.
-   Build app shell, navigation, responsive layout, and reusable
    components.
-   Add authentication and role-aware routing.
-   Add seed data and empty/loading/error states.

**Deliverable:** navigable frontend with working authentication and demo
accounts.

### Stage 2 --- Campaign workflow

-   Build campaign list and detail pages.
-   Build the campaign creation wizard.
-   Add creative uploads and previews.
-   Add requested zone and schedule fields.
-   Add draft save and submission.
-   Add backend validation and audit events.

**Deliverable:** an advertiser can create and submit a complete campaign
request.

### Stage 3 --- Operations workflow

-   Build operations queue and review page.
-   Add review decisions and change requests.
-   Add status history.
-   Add scheduling and deployment records in simulation mode.
-   Add notifications.

**Deliverable:** end-to-end campaign lifecycle with human review.

### Stage 4 --- Reporting and polish

-   Add campaign pipeline analytics.
-   Add simulated sample metrics with clear labels.
-   Add accessibility and responsive refinements.
-   Add automated tests and error monitoring.
-   Improve loading, empty, and failure states.

**Deliverable:** stable MVP suitable for a controlled demonstration.

### Stage 5 --- Pilot readiness

-   Validate hardware display constraints.
-   Define operational procedures and permissions.
-   Review applicable regulations with qualified personnel.
-   Confirm insurance, venue permissions, and incident procedures as
    applicable.
-   Integrate only approved operational data sources.
-   Run controlled tests before any public deployment.

**Deliverable:** pilot plan and verified interfaces---not an assumption
that the web app itself makes flight operations safe.

------------------------------------------------------------------------

## 23. Suggested Initial Backlog

### P0 --- Must have

-   [ ] Public landing page
-   [ ] Authentication
-   [ ] Role-based authorization
-   [ ] Organization profile
-   [ ] Advertiser dashboard
-   [ ] Campaign list and detail
-   [ ] Campaign creation wizard
-   [ ] Creative upload and preview
-   [ ] Requested location/zone selection
-   [ ] Requested schedule
-   [ ] Draft and submit workflow
-   [ ] Operations review queue
-   [ ] Approve / reject / request changes
-   [ ] Campaign status history
-   [ ] Audit logging
-   [ ] Demo/simulated deployment
-   [ ] Clear safety and permission messaging
-   [ ] Responsive design

### P1 --- Should have

-   [ ] In-app notifications
-   [ ] Calendar view
-   [ ] Approved zone management
-   [ ] Quote request / budget range
-   [ ] Basic pipeline analytics
-   [ ] Email notifications
-   [ ] Organization member invitations
-   [ ] AI copy assistant
-   [ ] CSV export for campaign records

### P2 --- Later

-   [ ] QR scan and landing-page event analytics
-   [ ] Verified telemetry ingestion
-   [ ] Multi-drone deployment coordination
-   [ ] More advanced creative validation
-   [ ] Multilingual campaign content
-   [ ] Agency account features
-   [ ] Billing and invoicing
-   [ ] Integrations with authorized operational systems

------------------------------------------------------------------------

## 24. Definition of Done for the First Web-App Release

The first release is ready for a demo when: - An advertiser can
register, create an organization, and submit a campaign. - Creative
assets are stored securely and previewed safely. - Location and timing
are clearly marked as requested until confirmed. - An operations
reviewer can request changes, reject, or approve for scheduling. - Every
important status transition is audited. - Advertisers cannot access
other organizations' records or operations-only controls. - A simulated
deployment can be completed without sending any commands to physical
hardware. - Sample analytics are visibly labeled as simulated. - The app
works on desktop and mobile screen sizes. - Basic automated tests
pass. - No API secrets are shipped to the browser. - Safety, privacy,
and regulatory boundaries are communicated clearly.

------------------------------------------------------------------------

## 25. Instructions for an AI Coding Assistant

Use this specification as the product source of truth when generating
the Aervy web app.

### Build order

1.  Inspect the repository and report its current structure before
    making destructive changes.
2.  Propose the architecture and data model.
3.  Build the visual system and shared app layout.
4.  Implement authentication and role-aware access.
5.  Implement advertiser campaign creation and listing.
6.  Implement the operations review queue and status state machine.
7.  Add storage, notifications, and audit logs.
8.  Add analytics using explicitly simulated data.
9.  Add tests and document local setup.
10. Add optional AI assistance only after the core workflow works.

### Coding rules

-   Use TypeScript and strict types if using Next.js.
-   Keep components small and reusable.
-   Keep business logic out of presentation components.
-   Validate data on both client and server.
-   Enforce authorization on the server for every protected operation.
-   Use database migrations and seed scripts.
-   Use environment variables for secrets and provide `.env.example`
    with placeholders only.
-   Include loading, empty, success, validation, and failure states.
-   Avoid fake buttons: every visible interactive control must work or
    be clearly marked as not yet available.
-   Do not add physical flight control, autonomous takeoff, or live
    drone command features to the MVP.
-   Do not invent operational metrics or regulatory approval.
-   Use realistic demo data, clearly marked as demo data.
-   Do not claim a feature is complete unless it works and has been
    tested.
-   Document any assumptions and unresolved product questions.

### Expected project deliverables

-   Working source code.
-   README with setup, run, test, and deployment instructions.
-   `.env.example`.
-   Database schema and migrations.
-   Seed/demo data.
-   Test suite for core workflow and permissions.
-   Short architecture overview.
-   List of assumptions, limitations, and future integration points.

------------------------------------------------------------------------

## 26. Open Decisions to Resolve During Development

These should be decided based on the first pilot, not guessed: - Which
display hardware will the first campaign use: LED banner, programmable
display, or another verified setup? - What file formats, aspect ratios,
brightness limits, and message durations does the hardware support? -
Which city/venue and customer segment will be the first pilot? - Will
locations be selected only from pre-approved zones, or can advertisers
request new locations? - Who performs operational review and who has
final deployment authority? - Is the first revenue model per campaign,
event package, or quote-based? - Which map provider best fits the target
region and budget? - Which authentication and storage providers will be
used? - Which campaign metrics can actually be measured by the first
hardware setup? - What permissions, insurance, venue approvals, and
operational procedures apply to the pilot? - Which languages are
required for the first release? - Will AI copy assistance be part of MVP
or a later enhancement?

Record decisions in the repository so the implementation does not drift.

------------------------------------------------------------------------

## 27. Final Product Direction

Build Aervy first as a **campaign management SaaS with an
operations-review workflow and simulated deployment lifecycle**. This
creates a real product surface for advertisers and gives the operations
team a structured process before any hardware integration.

The initial objective is not to make a website that merely looks
futuristic. It is to build a reliable workflow that can accept a
campaign request, validate it, route it to the right reviewer, record
the decision, coordinate scheduling, and report only what the system can
substantiate.

**Recommended first milestone:** a polished, end-to-end demo in which an
advertiser creates a campaign, an Aervy reviewer approves it for
scheduling, a simulated deployment is completed, and the advertiser sees
a transparent campaign report.
