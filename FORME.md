# FORME.md

## 1. The Big Picture (Project Overview)

Metapharsic Lifesciences EHR is a modern electronic health record prototype: a web app where clinic staff can log in, view patients, explore clinical dashboards, draft prescriptions, use voice-assisted workflows, and experiment with AI-style clinical features. In plain language, it is trying to be the clinic's digital command center. The important honesty note: this codebase currently behaves like a convincing demo or MVP, not a production system ready for real patient data, because most API routes still return mock data instead of saving to the database.

The problem it solves is clinic overload. Doctors, nurses, front desk staff, and administrators all need the same patient story, but each role sees a different part of it: appointments, vitals, medications, prescriptions, documents, voice notes, risk alerts, and audit trails. This project gathers those pieces into one web dashboard so a care team can move through a patient visit without jumping between disconnected tools.

The basic user journey is simple. A staff member logs in at `/login`, lands in the protected dashboard, chooses an area such as Patients, Prescribe, Voice, Transcript, Diagnosis, Genomics, Digital Twin, or Admin, and interacts with cards, tables, charts, and AI-flavored panels. Behind the curtain, the browser calls API routes under `/api/...`; those routes check whether the user has a session and then return data. Today, much of that returned data is sample data living inside the route files.

If this were a hospital building, the dashboard would be the reception lobby, the patient pages would be the medical records room, the prescription area would be the pharmacy desk, the voice assistant would be a fast-moving medical scribe, and Prisma/PostgreSQL would be the official filing cabinet in the basement. The building has signs, rooms, counters, and equipment, but many counters are still staffed by actors using sample paperwork. It looks and feels like the future clinic, but it needs the real operating staff connected before real patients walk in.

**Project facts inferred from the code**

- **Project name:** Metapharsic Lifesciences EHR / `metapharsic-ehr`
- **What it does:** A web-based electronic health record system with patient management, clinical decision support, AI prescription help, voice workflows, and administrative dashboards.
- **Likely role fit:** Founder, product owner, clinical stakeholder, or technical decision-maker reviewing an MVP.
- **Tech stack:** Next.js 14, React 18, TypeScript, Prisma, PostgreSQL, NextAuth, Tailwind CSS, TanStack Query, Zod, Radix UI, Recharts, Framer Motion, Vitest.
- **Stage:** Demo / pre-production MVP. The schema is ambitious; the production data plumbing is not finished.

## 2. Technical Architecture -- The Blueprint

Here is the simple version: the app is a Next.js web application. Next.js is the framework, meaning it provides the house frame: pages, server routes, routing, and build commands. React builds the visible screens. API route files act like mini back-office counters. Prisma is the database translator, turning TypeScript calls into PostgreSQL queries. NextAuth handles login sessions.

```
                 User in browser
                       |
                       v
        +------------------------------+
        | Next.js pages in src/app     |
        | Dashboards, forms, tables    |
        +------------------------------+
                       |
                       v
        +------------------------------+
        | React components + hooks     |
        | Buttons, panels, data fetch  |
        +------------------------------+
                       |
                       v
        +------------------------------+
        | API routes in src/app/api    |
        | Patients, voice, AI, admin   |
        +------------------------------+
             |                  |
             v                  v
 +---------------------+  +------------------------+
 | Mock/demo data      |  | Prisma client          |
 | arrays in route     |  | database translator    |
 +---------------------+  +------------------------+
                                   |
                                   v
                          +----------------+
                          | PostgreSQL DB  |
                          | intended store |
                          +----------------+
```

Think of the system as a clinic:

- **Frontend pages are the exam rooms.** Files under `src/app/(dashboard)` are the rooms users walk into: Patients, Prescribe, Voice, Transcript, Digital Twin, Genomics, Admin, and so on.
- **Components are reusable furniture.** Files under `src/components` are chairs, monitors, cabinets, and forms reused across rooms.
- **Hooks are the runners.** Files under `src/hooks` know how to fetch or update data. For example, `usePatients.ts` calls `/api/patients` and keeps the patient list fresh using TanStack Query.
- **API routes are service counters.** Files under `src/app/api` receive requests, check sessions, validate data, and return results.
- **Prisma is the records clerk.** Files under `src/lib/db.ts`, `src/lib/prisma.ts`, and `prisma/schema.prisma` describe how the app should talk to PostgreSQL.
- **NextAuth is the front-door guard.** `src/lib/auth/index.ts`, `src/app/api/auth/[...nextauth]/route.ts`, and `src/middleware.ts` decide who is logged in and what rooms they can enter.

### Why These Choices?

**Why Next.js instead of a separate React app plus separate backend?**  
Next.js lets the same project contain both the screens and the server-side API routes. For an MVP, that is like putting the clinic and the back office in the same building. It is faster to build, easier to deploy, and simpler to reason about. The trade-off is that a very large production EHR may eventually want separate services for prescriptions, audit logging, integrations, reporting, and AI pipelines.

**Why TypeScript instead of plain JavaScript?**  
TypeScript adds labels to data shapes. In healthcare software, that matters. A patient has a date of birth, not a random string called `thing1`. TypeScript helps catch mistakes before the app runs. The trade-off is more setup and stricter compiler errors, but this is a good trade for clinical software.

**Why Prisma and PostgreSQL instead of raw database queries?**  
Prisma is a translator. The developer can write patient-focused code instead of hand-writing SQL for every database action. PostgreSQL is a strong general-purpose database, especially for structured records like patients, prescriptions, encounters, and audit events. The trade-off is that Prisma can hide some database details, so performance-sensitive areas still need engineering attention later.

**Why NextAuth instead of custom login code?**  
Authentication is the front door. Writing a secure front door from scratch is harder than it looks. NextAuth provides sessions, JWTs, provider support, and route helpers. The current implementation uses mock credentials, but the choice of NextAuth gives the project a clear upgrade path to database-backed users and OAuth.

**Why Tailwind and Radix/shadcn-style UI pieces?**  
Tailwind is a styling toolbox, like having labeled paint cans and spacing rulers. Radix components provide accessible building blocks such as tabs, buttons, cards, and dialogs. This makes a polished dashboard faster to build. The trade-off is that visual consistency depends on disciplined usage across many files.

**Why mock data right now?**  
Mock data is useful for quickly proving the product experience. It lets designers, founders, and clinicians click through workflows before the database is ready. The danger is that a mock can look production-ready when it is not. In this project, that line must be taken seriously: mock routes mean data disappears or is not truly persisted.

### Clever Or Unusual Choices

The clinical decision engine has a thoughtful fallback pattern. `src/lib/clinicalEngine.ts` first tries to load diagnoses from Prisma. If the database is unavailable, it falls back to `prisma/data.ts`. That is like a doctor checking the hospital records system first, then using a local reference book if the network is down.

The symptom parser includes local-language mappings for Hindi and Telugu symptom words. That is a product-minded choice. It recognizes that patients do not always describe symptoms using textbook English.

The Prisma schema is much more mature than the API routes. It includes FHIR-aligned patients, practitioners, encounters, observations, conditions, allergies, prescriptions, drug catalogs, interactions, refills, lab results, analytics, and audit events. FHIR means "Fast Healthcare Interoperability Resources," a healthcare data standard; think of it as a shared grammar hospitals use so systems can exchange patient information.

## 3. Codebase Structure -- The Filing System

Top-level structure:

```text
EHR/
|-- prisma/
|   |-- schema.prisma
|   |-- seed.ts
|   |-- seed_clinical.ts
|   `-- data.ts
|-- src/
|   |-- app/
|   |-- components/
|   |-- hooks/
|   |-- lib/
|   `-- types/
|-- .env.example
|-- next.config.js
|-- package.json
|-- tailwind.config.ts
|-- tsconfig.json
`-- plan.md
```

### `src/app`

This is the map of the building. Next.js uses the App Router, which means folders become routes. A file named `page.tsx` is a screen. A file named `route.ts` is an API endpoint.

Open this folder when you want to change what users can visit or what the browser can call. It relates to components because pages assemble components, and it relates to API routes because pages often fetch from `/api/...`.

Important entry points:

- `src/app/layout.tsx`: wraps the whole app with fonts, global CSS, and providers.
- `src/app/(dashboard)/layout.tsx`: protects dashboard pages by checking the session.
- `src/app/login/page.tsx`: login screen.
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth's login API endpoint.

The folder name `(dashboard)` is a Next.js route group. The parentheses mean "organize these files together without adding `(dashboard)` to the URL." So `src/app/(dashboard)/patients/page.tsx` becomes `/patients`, not `/(dashboard)/patients`.

### `src/app/(dashboard)`

This is the clinic floor. It contains user-facing screens:

- `patients`: patient list, patient detail, new patient.
- `prescribe`: prescription workflow and medication safety UI.
- `voice`: voice assistant features.
- `transcript`: consultation transcript and SOAP-style note workflow. SOAP means Subjective, Objective, Assessment, Plan -- a common clinical note format.
- `diagnosis`, `symptom-mapper`, `predictive-timeline`, `digital-twin`, `genomics`, `swarm`: advanced clinical and AI-style demo features.
- `admin`: admin dashboard with users, audit logs, and system health.

Open this folder when you want to change what a clinician or admin sees.

### `src/app/api`

This is the service counter area. Each `route.ts` file receives requests from the frontend. For example, `/api/patients` is implemented by `src/app/api/patients/route.ts`.

Open this folder when a button appears to work visually but the data does not save, filter, fetch, or authenticate correctly. In this project, this folder is also where the biggest production gap lives: many routes return mock data.

Important API areas:

- `api/patients`: list, create, update, and soft-delete patients using mock arrays.
- `api/prescriptions`: returns and creates mock prescriptions.
- `api/med-gemini/prescribe`: medication suggestion engine using an in-file simulated drug database.
- `api/symptom-mapper`: symptom network and differential diagnosis demo.
- `api/voice`: voice command/session/analytics routes, mostly mock with TODOs for database writes.
- `api/admin`: mock users, audit logs, and system health.
- `api/dashboard/metrics`: dashboard metrics, currently sample calculations.

### `src/components`

This is the equipment closet. Components are reusable UI pieces: layout shells, metric cards, buttons, tabs, prescription panels, voice interfaces, clinical panels, and transcript widgets.

Open this folder when the screen looks wrong, a shared widget needs a design change, or multiple pages use the same UI.

Main subfolders:

- `components/ui`: reusable primitives such as `button`, `card`, `tabs`, `badge`, `input`, and `table`.
- `components/layout`: dashboard frame and floating navigation.
- `components/prescription`: prescription writer and Med-Gemini panel.
- `components/voice`: voice and bilingual consultation interfaces.
- `components/clinical`, `components/ai`, `components/innovation`, `components/transcript`: feature-specific UI.

### `src/hooks`

This is the messenger team. Hooks are small frontend helpers that fetch data, manage state, and package behavior for components.

Open this folder when a page needs to call an API, cache results, refresh after saving, or coordinate browser features like voice input.

Examples:

- `usePatients.ts`: calls `/api/patients` and invalidates cached patient lists after create/update/delete.
- `useVoiceAssistant.ts`, `useVoice.ts`, `useAdvancedVoice.ts`, `useMettaVoice.ts`: voice-related browser behavior.
- `useAIDashboard.ts`, `useDashboardMetrics.ts`: dashboard data helpers.

### `src/lib`

This is the back-office toolbox. It contains authentication configuration, permission rules, database clients, validation schemas, utilities, and the clinical engine.

Open this folder when changing rules rather than screens: who can do what, how data is validated, how Prisma is created, or how symptoms become diagnoses.

Important files:

- `lib/auth/index.ts`: NextAuth configuration with mock users.
- `lib/auth/roles.ts`: role and permission map.
- `lib/clinicalEngine.ts`: symptom parsing and diagnosis matching.
- `lib/db.ts` and `lib/prisma.ts`: duplicate Prisma client helpers.
- `lib/validation/patient.ts`: Zod validation for patient input.
- `lib/utils.ts`: shared helpers, including MRN generation and FHIR date helpers.

### `src/types`

This is the dictionary. It defines shared TypeScript types so the project can agree on what a patient, user role, API response, or FHIR resource looks like.

Open this folder when adding a new shared data shape used across multiple pages, API routes, or components.

### `prisma`

This is the blueprint for the official filing cabinet. `schema.prisma` defines what tables should exist in PostgreSQL. The seed files add sample organizations, users, practitioners, patients, and clinical diagnosis data.

Open this folder when changing the true data model: patients, prescriptions, observations, encounters, users, or analytics.

### Non-Obvious Naming Conventions

- `route.ts` means "server endpoint," not a visible page.
- `page.tsx` means "visible screen."
- `[id]` and `[patientId]` mean dynamic routes, like `/patients/123`.
- `(dashboard)` is a route group used for organization only.
- `MOCK_...` arrays are demo data, not permanent storage.
- `Med-Gemini` appears to be an in-project simulated AI prescription assistant, not a live external Gemini API integration.

## 4. Connections & Data Flow -- How Things Talk to Each Other

The simple version: the browser shows pages, pages use components, components call hooks or `fetch`, API routes answer, and the session system decides whether the user is allowed in. The database is designed but not consistently used yet.

### Action 1: A User Logs In

When a user signs in, the system behaves like a front desk checking a badge.

1. The user opens `/login` and enters email and password.
2. NextAuth sends those credentials to `src/app/api/auth/[...nextauth]/route.ts`.
3. That route uses `authOptions` from `src/lib/auth/index.ts`.
4. `CredentialsProvider` checks the submitted email and password against the hardcoded `MOCK_USERS` array.
5. If the pair matches, NextAuth creates a JWT session. A JWT is a signed digital wristband: it tells the app who the user is without checking the database on every page load.
6. `src/app/(dashboard)/layout.tsx` checks the session before showing protected dashboard pages.
7. `src/middleware.ts` also checks protected routes and redirects unauthenticated users to `/login`.

What could go wrong?

- Passwords are currently plain text in code. That is fine for a toy demo and unacceptable for production.
- Auth logs print user emails and names to the server console. In healthcare, logs can become a privacy risk.
- Some admin API routes call `getServerSession()` without passing `authOptions`, which can produce inconsistent session checks.
- The frontend route protection is stronger than the API protection in places. Production systems need both.

### Action 2: A Staff Member Searches Or Creates A Patient

This is like asking the records room for a chart.

1. The user visits `/patients`, implemented by `src/app/(dashboard)/patients/page.tsx`.
2. The page uses patient data logic from `src/hooks/usePatients.ts`.
3. `usePatients.ts` sends a request to `/api/patients` with search, page, limit, and sorting details.
4. `src/app/api/patients/route.ts` checks the session using NextAuth.
5. It checks role permission through `hasPermission()` from `src/lib/auth/roles.ts`.
6. It validates search or patient input using Zod schemas from `src/lib/validation/patient.ts`. Zod is a bouncer for data: it refuses malformed requests before they enter the party.
7. It filters or updates `MOCK_PATIENTS`, an in-memory array inside the route file.
8. The API returns JSON to the browser, and TanStack Query caches it briefly.

What could go wrong?

- Created patients are pushed into a local array, not saved to PostgreSQL. On server restart or redeploy, they disappear.
- Duplicate detection currently compares first and last names, which is too weak for real healthcare. Two people can share a name.
- The Prisma schema already has richer patient models, but this route does not use them yet.
- Patient data in a real EHR requires careful audit logging, access control, encryption policies, and retention rules.

### Action 3: A Clinician Requests Prescription Help

This is the pharmacy desk consulting a medication reference book.

1. The user visits `/prescribe`, implemented by `src/app/(dashboard)/prescribe/page.tsx`.
2. The prescription UI can call `/api/med-gemini/prescribe`.
3. `src/app/api/med-gemini/prescribe/route.ts` reads the request body: diagnosis, symptoms, patient context, current medications, allergies, and lab values.
4. It uses an in-file `DRUG_DATABASE` and `INTERACTION_DATABASE` to suggest medications and flag possible interactions.
5. It checks special situations like renal dosing. Renal dosing means changing medication dose when kidney function is reduced.
6. It returns suggestions, interactions, warnings, confidence, processing time, and a model label.

What could go wrong?

- This is not a live medical AI service. It is a simulated rules-and-data engine.
- Some guideline references are hardcoded and may become outdated.
- Clinical recommendations must be reviewed by licensed clinicians before any production use.
- The route currently does not appear to enforce physician-only access, so production prescribing permissions need tightening.
- If the simulated drug database is incomplete, the system may miss interactions or suggest unsuitable alternatives.

### Action 4: Voice Commands And Clinical Scribing

This is the scribe walking beside the clinician with a clipboard.

1. Voice-related pages and components use browser speech capabilities through hooks such as `useVoiceAssistant.ts`, `useVoice.ts`, and `useMettaVoice.ts`.
2. Commands can be sent to `/api/voice/commands`.
3. The route checks the user's session.
4. It builds a command log object with command text, mode, success flag, result, session ID, and timestamp.
5. The route has TODO comments where database logging should happen later.
6. Analytics are currently printed or simulated rather than persisted.

What could go wrong?

- Browser speech support varies by browser and device.
- Voice transcripts can contain protected health information, so they need strong privacy controls.
- The current command history is mock data.
- If voice analytics are only logged to console, operational teams cannot reliably audit or improve usage.

### External Service Connections

The codebase includes placeholders for several external services, but most are not actively wired into live calls.

- **PostgreSQL:** Intended database via `DATABASE_URL`. Prisma schema and seed scripts are present. Many API routes still bypass it.
- **Google OAuth:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` exist in `.env.example`, but the current auth provider is credentials-based mock login.
- **OpenAI / Azure OpenAI:** `OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` exist as future placeholders. The current AI-style features are mostly local rules or mock responses.
- **SMTP email:** SMTP variables exist for future email sending, but no clear live email flow is wired in.
- **FHIR:** `FHIR_VERSION` and `FHIR_BASE_URL` exist, and FHIR types/utilities exist, but there is no full `/api/fhir` implementation visible in the current route list.
- **File uploads:** `UPLOAD_DIR` and `MAX_FILE_SIZE` exist as config placeholders. Document references exist in the schema, but production-grade upload/storage flow is not yet clear.

If an external service fails today, most user-facing features still return mock data. That makes the demo resilient, but also hides production problems. Once real services are connected, each route needs clear failure behavior: friendly user message, audit log, retry strategy, and no silent data loss.

## 5. Technology Choices -- The Toolbox

| Technology | What It Does Here | Why This One | Watch Out For |
|-----------|------------------|-------------|---------------|
| Next.js 14 | Provides pages, routing, API routes, server rendering, and build tooling. | Keeps frontend and backend routes in one project, which is ideal for an MVP dashboard. | Large production systems may eventually need separate services for sensitive workflows. |
| React 18 | Builds the interactive screens users see. | Mature, widely supported, and pairs naturally with Next.js. | Complex pages can become hard to maintain if state is scattered. |
| TypeScript | Adds explicit data shapes to JavaScript. | Useful for healthcare records because mistakes in fields are easier to catch early. | Type safety is only as good as the real runtime validation and API contracts. |
| Prisma | Translates TypeScript database calls into PostgreSQL queries. | Developer-friendly and matches the rich schema already designed. | Many routes are not using Prisma yet; there are duplicate Prisma client files. |
| PostgreSQL | Intended permanent database for users, patients, clinical records, prescriptions, audit logs, and analytics. | Strong structured database for relational healthcare data. | Hosting, backups, encryption, migrations, and connection limits must be planned. |
| NextAuth | Manages login sessions and protected access. | Avoids writing all auth plumbing from scratch and supports future providers. | Current implementation uses hardcoded plaintext demo users. |
| Zod | Validates incoming data before using it. | Prevents malformed patient inputs from slipping into workflows. | Validation exists in some routes, but coverage should be consistent everywhere. |
| TanStack Query | Fetches and caches frontend API data. | Keeps dashboards responsive and refreshes data after mutations. | Cache can show stale data if invalidation rules are incomplete. |
| Tailwind CSS | Handles styling through utility classes. | Fast, consistent visual development for dashboards. | Design can become inconsistent if every screen invents its own patterns. |
| Radix UI / shadcn-style components | Provides accessible UI primitives like tabs, cards, inputs, and tables. | Saves time and gives solid interaction foundations. | Accessibility still depends on how components are composed. |
| Framer Motion | Adds animation and polished transitions. | Makes advanced dashboards feel alive and modern. | Too much motion can distract clinical users or hurt performance. |
| Recharts | Draws charts and visual metrics. | Good fit for dashboard graphs without building charting from scratch. | Clinical reporting may need stricter validation and export controls. |
| Lucide React | Provides consistent icons. | Lightweight, clean icons for navigation and dashboard actions. | Icons need labels/tooltips so meaning is clear. |
| bcryptjs | Hashes passwords in seed scripts. | Password hashing is necessary for real user accounts. | Auth route is not currently using hashed database passwords. |
| Vitest | Runs automated tests. | Fast TypeScript-friendly test runner. | Test coverage appears limited; clinical and auth paths need more tests. |
| FHIR types | Defines healthcare-standard shapes for data exchange. | Good preparation for interoperability with hospitals and health systems. | Types alone are not an integration; actual FHIR endpoints are not complete. |

Cost implications: the libraries in `package.json` are open-source packages, so there is no direct per-user license shown in the repo. Real costs will come from where this is hosted, the PostgreSQL provider, logging/monitoring, file storage, email provider, and any future paid AI APIs. The current code has placeholders for paid or usage-based services, but it is not yet making obvious live calls to them.

## 6. Environment & Configuration

Environment variables are settings kept outside the code. Think of them as labeled keys in the clinic manager's safe: database address, login secret, email server, AI API keys, and upload limits. The code reads the label, but the real secret value should not be committed to Git.

Variables shown in `.env.example`:

| Variable | Plain-Language Meaning | Used For | Be Careful Because |
|----------|------------------------|----------|-------------------|
| `DATABASE_URL` | Address and password for the PostgreSQL database. | Prisma database connection. | Wrong value means the app cannot read/write real records. Never expose it publicly. |
| `NEXTAUTH_URL` | The public base URL NextAuth expects. | Login callbacks and session handling. | Must match local, staging, or production URL. |
| `NEXTAUTH_SECRET` | Secret signing key for sessions. | Protecting JWT/session integrity. | If leaked, sessions may be forgeable; rotate carefully. |
| `GOOGLE_CLIENT_ID` | Google OAuth app ID. | Future Google login. | Only useful if Google provider is configured. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app secret. | Future Google login. | Treat like a password. |
| `APP_NAME` | Human-readable app name. | Display/config metadata. | Cosmetic unless other code depends on it. |
| `APP_URL` | Base app URL. | Links, callbacks, generated URLs. | Must change per environment. |
| `FHIR_VERSION` | Healthcare data standard version. | Intended FHIR behavior. | The schema says FHIR R4-aligned, but full endpoint support is incomplete. |
| `FHIR_BASE_URL` | Planned FHIR API base path. | Future FHIR endpoints. | No complete `/api/fhir` route is visible right now. |
| `OPENAI_API_KEY` | Key for OpenAI API. | Future AI services. | Empty today; real use would be usage-based and privacy-sensitive. |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI service URL. | Future Azure-hosted AI. | Empty today; requires compliance and network planning. |
| `UPLOAD_DIR` | Local folder for uploaded files. | Future document/file handling. | Local disk storage is usually not enough for production. |
| `MAX_FILE_SIZE` | Upload size limit in bytes. | Preventing oversized uploads. | Needs matching frontend and backend enforcement. |
| `SMTP_HOST` | Email server host. | Future email sending. | Empty today; production email needs secure credentials. |
| `SMTP_PORT` | Email server port. | Future email sending. | Use provider-recommended secure settings. |
| `SMTP_USER` | Email account username. | Future email sending. | Secret if paired with password. |
| `SMTP_PASSWORD` | Email account password. | Future email sending. | Treat like a password. |
| `NODE_ENV` | Tells the app whether it is development or production. | Runtime behavior and optimizations. | Production should not behave like development. |

### Development, Staging, Production

The repo clearly supports **development**: `npm run dev`, local `DATABASE_URL`, and `NEXTAUTH_URL=http://localhost:3000`.

There is no dedicated staging config visible. Staging would normally be a rehearsal environment: same app, separate database, separate secrets, and fake/test integrations.

Production is not ready based on the current code. Before production, the project needs database-backed APIs, secure password auth, stronger API authorization, audit logging, secret management, real backups, secure file storage, and clinical safety review.

If you need to change the database, update `DATABASE_URL`, but be careful because pointing local code at production could accidentally alter real records. If you need to change login behavior, update `src/lib/auth/index.ts`, but be careful because that file currently controls the mock users and session payload. If you need to change who can access what, update `src/lib/auth/roles.ts` and `src/middleware.ts`, but be careful because API routes also need their own checks.

## 7. Lessons Learned -- The War Stories

This section is the map of the hidden stairs.

### Bugs & Fixes

**Plaintext demo passwords are still in the auth file.**  
Cause: the project needed an easy demo login and used a `MOCK_USERS` array in `src/lib/auth/index.ts`.  
Fix needed: replace mock users with the Prisma `User` table and compare passwords using `bcryptjs`. The seed script already hashes sample passwords, so the project has the ingredients.  
Avoid it later: never let demo auth become production auth. Put a bright label on it, then remove it before launch.

**The database schema exists, but most APIs ignore it.**  
Cause: the product surface was built first, using mock arrays to make screens work.  
Fix needed: replace route-level arrays with Prisma calls like `db.patient.findMany`, `db.patient.create`, and `db.prescription.create`.  
Avoid it later: for every screen, define whether it is "demo-only" or "database-backed." Mixing the two creates false confidence.

**There are two Prisma client helpers.**  
Cause: both `src/lib/db.ts` and `src/lib/prisma.ts` instantiate/export a Prisma client with slightly different names.  
Fix needed: pick one canonical file and make the other re-export it.  
Avoid it later: one database doorway per app. If people enter through two doors, they eventually disagree about which one is official.

**Some admin routes call `getServerSession()` without `authOptions`.**  
Cause: inconsistent session-check pattern across routes.  
Fix needed: standardize a helper such as `requireSession()` and `requireRole()`, then use it everywhere.  
Avoid it later: auth should be a shared guardrail, not copied by hand into every route.

**Clinical engine fallback is useful but can hide database failures.**  
Cause: `src/lib/clinicalEngine.ts` catches DB errors and falls back to local data.  
Fix needed: keep the fallback for demos, but log and monitor the failure clearly in production.  
Avoid it later: graceful fallback is good; silent fallback is dangerous.

### Pitfalls & Landmines

**Patients look real, but may not be real records.**  
If you change patient screens, check whether the data comes from mock arrays, API routes, or Prisma. A beautiful edit form is not enough if the save button talks to a temporary array.

**Prescribing is safety-critical.**  
The prescription assistant has useful rules, but medication advice is not just another autocomplete feature. If you change dose logic, interaction rules, allergy checks, or lab thresholds, it affects clinical risk.

**Role-based access is split across layers.**  
The middleware protects pages. Some API routes check permissions. Some sensitive routes need stronger role checks. If you add a new admin screen, protect both the page and the API behind it.

**FHIR-aligned does not mean FHIR-complete.**  
The schema and types borrow from FHIR R4, which is good. But a real FHIR integration also needs endpoints, search behavior, bundles, authentication, mapping, validation, and interoperability testing.

**Local file uploads are not a production document system.**  
`UPLOAD_DIR` exists, and document models exist, but real clinical documents need durable object storage, virus scanning, access control, retention, and audit trails.

**CORS is wide open for APIs.**  
`next.config.js` sets `Access-Control-Allow-Origin: *` for API paths. CORS means "which websites are allowed to call this API from a browser." For production healthcare software, this should be narrowed.

**Content Security Policy allows unsafe script behavior.**  
`src/middleware.ts` includes `unsafe-eval` and `unsafe-inline`. This can be common during development, but production security should tighten it.

### Discoveries

The strongest discovery is that the product vision is ahead of the data wiring. The project already sketches a compelling next-generation EHR: voice assistant, transcript notes, predictive timeline, genomics, digital twin, swarm intelligence, symptom mapping, prescription safety, dashboards, and admin tooling.

The second discovery is that the database model is surprisingly ambitious. The schema is not a toy: it includes real healthcare concepts like encounters, observations, conditions, allergies, medications, documents, audit events, drug interactions, refills, lab results, and prescription analytics.

The third discovery is that local-language symptom mapping is a meaningful differentiator. Healthcare software often assumes polished English input. This project starts to meet patients and clinicians closer to how symptoms are actually spoken.

If starting over, I would keep the UI ambition but connect one vertical slice end-to-end earlier. For example: login with database-backed users, create a patient in PostgreSQL, view the patient detail page from PostgreSQL, audit the access, and write one clinical note. One real hallway is more valuable than twenty painted doors.

### Engineering Wisdom

Reliable systems are built in vertical slices. A vertical slice means one complete path from button to database and back. For this app, "create patient" should go from form to validation to authorization to Prisma to audit log to refreshed UI.

Security is not one feature. It is a habit repeated at every doorway. The page checks who you are. The API checks who you are. The database stores only what it should. The logs avoid sensitive details. The deployment protects secrets.

Mock data is a stage prop. Stage props are useful when designing the scene, but dangerous when mistaken for equipment. Keep mock data clearly labeled, and replace it deliberately.

Healthcare software needs boring foundations before magical features. Voice, AI, and digital twins are exciting, but the basics matter first: patient identity, access control, audit logs, backups, data accuracy, and clinician review.

## 8. Quick Reference Card

### How To Run Locally

1. Install Node.js if it is not installed.
2. Open a terminal in the project folder:

```powershell
cd "C:\Users\SAMEER PASHA\OneDrive\Documents\Projects\EHR"
```

3. Install dependencies:

```powershell
npm install
```

4. Copy `.env.example` to `.env` and fill in local values. At minimum, the app expects `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.

5. Generate the Prisma client:

```powershell
npm run db:generate
```

6. Run migrations if a local PostgreSQL database is available:

```powershell
npm run db:migrate
```

7. Seed sample database data if needed:

```powershell
npm run db:seed
```

8. Start the dev server:

```powershell
npm run dev
```

9. Open:

```text
http://localhost:3000
```

### Common Commands

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Starts the local development server. |
| `npm run build` | Builds the app for production. |
| `npm run start` | Runs the production build. |
| `npm run lint` | Runs Next.js linting. |
| `npm run type-check` | Checks TypeScript without building. |
| `npm run test` | Runs Vitest tests. |
| `npm run db:generate` | Generates the Prisma client after schema changes. |
| `npm run db:migrate` | Creates/applies a local database migration. |
| `npm run db:studio` | Opens Prisma Studio, a visual database browser. |
| `npm run db:seed` | Adds sample data to the database. |

### Key Local URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3000/login` | Login page. |
| `http://localhost:3000/` | Main dashboard after login. |
| `http://localhost:3000/patients` | Patient list. |
| `http://localhost:3000/prescribe` | Prescription workflow. |
| `http://localhost:3000/voice` | Voice assistant page. |
| `http://localhost:3000/admin` | Admin dashboard. |
| `http://localhost:3000/test-prescription` | Test prescription page. |

Production and staging URLs are not documented in the repo.

### Demo Login Accounts

These are hardcoded demo accounts in `src/lib/auth/index.ts`. They should not be used for production.

| Role | Email | Purpose |
|------|-------|---------|
| Admin | `admin@metapharsic.com` | Full administrative demo access. |
| Physician | `physician@metapharsic.com` | Clinician demo access. |
| Nurse | `nurse@metapharsic.com` | Nursing demo access. |
| Front Desk | `frontdesk@metapharsic.com` | Registration/scheduling demo access. |

### When Something Breaks

If the app will not start, check `npm install`, `.env`, and `DATABASE_URL`.

If login fails, check `src/lib/auth/index.ts`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.

If a dashboard shows old or fake data, check the matching route under `src/app/api`. Many routes intentionally use mock arrays.

If database calls fail, check `prisma/schema.prisma`, `src/lib/db.ts`, `src/lib/prisma.ts`, and whether PostgreSQL is running.

If permissions look wrong, check `src/lib/auth/roles.ts`, `src/middleware.ts`, and the API route's own session/role checks.

If clinical recommendations look wrong, check `src/lib/clinicalEngine.ts`, `prisma/data.ts`, `prisma/seed_clinical.ts`, and `src/app/api/med-gemini/prescribe/route.ts`.

### The One-Sentence Owner Warning

This is a strong, polished EHR MVP with a serious architecture foundation, but before it touches real patient data, the mock data, demo auth, API authorization, audit logging, and clinical safety controls must be replaced with production-grade implementations.
