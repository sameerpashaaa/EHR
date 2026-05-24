# EHR Project — Pre-Production Audit & Action Plan

> **Audit Date:** May 2026
> **Auditor Role:** Senior Software Engineer & Code Reviewer
> **Status:** DEMO / PRE-PRODUCTION — Not cleared for any real patient data
> **Constraint:** This document is read-only. No code has been modified.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview & Tech Stack](#2-project-overview--tech-stack)
3. [Architecture Map](#3-architecture-map)
4. [Critical Findings (P0 — Blockers)](#4-critical-findings-p0--blockers)
5. [High-Priority Issues (P1)](#5-high-priority-issues-p1)
6. [Medium-Priority Issues (P2)](#6-medium-priority-issues-p2)
7. [Low-Priority / Polish (P3)](#7-low-priority--polish-p3)
8. [Prioritized Action Plan](#8-prioritized-action-plan)
9. [Module-by-Module Analysis](#9-module-by-module-analysis)
10. [Risk Register](#10-risk-register)

---

## 1. Executive Summary

This is an **Electronic Health Record (EHR) system** built for the fictional organization *Metapharsic Medical Center*. The project is architecturally well-structured — Next.js 14 App Router, Prisma ORM, next-auth for sessions, Zod validation — and the UI is polished with Framer Motion animations, Tailwind CSS, and advanced components like a voice assistant ("Metta"), an AI prescription writer, and a clinical decision engine.

**However, the application is fundamentally operating as a demo.** Almost every API route returns hardcoded mock data. The database schema is complete and production-quality, but no API route actually reads from or writes to the database. The authentication system uses plaintext passwords compared in memory. Patient data, prescriptions, scribe sessions, medications, voice commands, and admin users are all stubbed arrays in server-side memory that reset on every deploy/restart.

**This application MUST NOT handle real patient data in its current state.** The risks are HIPAA-related, clinical-safety-related, and security-related all at once.

The plan below is structured to bring the application from demo to production-ready in a phased, backward-compatible manner.

---

## 2. Project Overview & Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL (via Prisma) | N/A (connection string in `.env`) |
| Auth | next-auth (Credentials + JWT) | 4.x |
| Validation | Zod | 3.x |
| State / Data-fetching | TanStack Query v5 | 5.x |
| UI | Tailwind CSS + shadcn/ui | 3.x |
| Animations | Framer Motion | 11.x |
| Icons | Lucide React | latest |
| Charts | Recharts | 2.x |
| Testing | Vitest | 1.x |
| Linting | ESLint | 8.x |
| Package Manager | npm | (lock file present) |

**Entry Points:**
- `src/app/layout.tsx` — Root layout with `<Providers>` (SessionProvider + QueryClientProvider)
- `src/app/(dashboard)/layout.tsx` — Protected dashboard layout (server-side session guard, redirects to `/login`)
- `src/middleware.ts` — Route-level RBAC using `withAuth` from next-auth
- `src/lib/auth/index.ts` — `authOptions` defining mock CredentialsProvider
- `prisma/schema.prisma` — Full database schema (20+ models)

---

## 3. Architecture Map

```
src/
├── app/
│   ├── (auth)/              — Login page
│   ├── (dashboard)/         — All protected pages
│   │   ├── page.tsx         — Main dashboard (stats, NeuralAI panel, charts)
│   │   ├── patients/        — Patient list + detail + new patient
│   │   ├── prescribe/       — E-Prescribing page (tabs: MedGemini, New Rx, Interactions, Refills, History)
│   │   ├── scribe/          — Ambient Scribe page
│   │   ├── admin/           — Admin panel (users, audit logs, system health)
│   │   ├── timeline/        — Predictive timeline
│   │   ├── genomics/        — Genomics profile
│   │   └── ...              — Other specialty pages
│   └── api/
│       ├── auth/            — next-auth callback routes
│       ├── patients/        — CRUD (all mock)
│       ├── medications/     — Search + AI suggest (all mock)
│       ├── prescriptions/   — CRUD (all mock)
│       ├── scribe/          — Session management (all mock)
│       ├── voice/           — Voice command processing (all mock)
│       ├── admin/
│       │   ├── users/       — User CRUD (all mock)
│       │   ├── audit-logs/  — Log access (all mock)
│       │   └── system-health/ — Health metrics (all mock)
│       ├── clinical/        — Clinical decision support
│       ├── dashboard/       — Dashboard metrics
│       └── search/          — Global search
├── components/
│   ├── layout/              — DashboardLayout, FloatingNav
│   ├── ui/                  — shadcn/ui primitives
│   ├── prescription/        — AIPrescriptionWriter, MedGeminiPrescriptionPanel
│   ├── voice/               — MettaVoiceInterface
│   └── ...
├── hooks/
│   ├── usePatients.ts       — TanStack Query hooks (points to real API)
│   ├── useAdmin.ts          — Admin hooks (fetch-based, no TanStack Query)
│   └── useVoiceAssistant.ts — Web Speech API wrapper
├── lib/
│   ├── auth/index.ts        — NextAuth config with mock users
│   ├── auth/roles.ts        — RBAC nav definitions
│   ├── db.ts                — PrismaClient singleton (named `db`)
│   ├── prisma.ts            — PrismaClient singleton (named `prisma`) [DUPLICATE]
│   ├── clinicalEngine.ts    — Clinical decision support (uses `prisma`)
│   ├── validation/          — Zod schemas
│   └── utils.ts             — `cn()` and helpers
├── types/
│   ├── index.ts             — App-specific TypeScript types
│   └── fhir.ts              — FHIR standard types
└── middleware.ts            — Next.js middleware (RBAC)
```

---

## 4. Critical Findings (P0 — Blockers)

These issues **MUST** be resolved before any real patient data is allowed in the system. Each one represents either a HIPAA violation, a data-loss risk, or a security breach vector.

---

### P0-01 — Plaintext Passwords in Source Code

**File:** `src/lib/auth/index.ts` (lines 12–57)

**Finding:** The authentication system uses a hardcoded `MOCK_USERS` array where passwords are stored as plain strings (`"admin123"`, `"physician123"`, `"nurse123"`, `"frontdesk123"`). Authentication is performed by comparing `u.password === validated.password` — no hashing, no salting.

**Risk:** CRITICAL. If the source code is ever exposed (GitHub leak, `.env` misconfiguration, etc.), all credentials are immediately compromised. This also violates every basic security standard.

**Migration Path (backward-compatible):**
1. Replace `MOCK_USERS` with a database-backed user table (Prisma `User` model already exists in the schema).
2. Hash passwords using `bcryptjs` on user creation.
3. Compare using `bcrypt.compare(validated.password, user.passwordHash)` in `authorize()`.
4. The JWT/session contract stays identical; no frontend changes needed.

---

### P0-02 — No Real Database Integration — All APIs Are Mock

**Affected Files:** Every file under `src/app/api/` except `src/app/api/auth/`

**Finding:** Every API route in the application serves responses from hardcoded in-memory arrays. Examples:
- `src/app/api/patients/route.ts` — `MOCK_PATIENTS` array (line 10), no Prisma calls
- `src/app/api/patients/[id]/route.ts` — same `MOCK_PATIENTS` array
- `src/app/api/medications/route.ts` — `MEDICATION_INVENTORY` hardcoded array (line 6)
- `src/app/api/prescriptions/route.ts` — mock prescription returned (line 22)
- `src/app/api/scribe/route.ts` — mock scribe session (line 21)
- `src/app/api/voice/route.ts` — mock command result (line 21)
- `src/app/api/admin/users/route.ts` — `mockUsers` array (line 15)

**Risk:** CRITICAL. Data written via the UI is never persisted. Patients created disappear on server restart. The entire system produces zero clinical value. The Prisma schema and Zod validators are ready for real database calls — they just aren't wired up.

**Migration Path:** Replace mock arrays with `prisma.patient.findMany(...)`, `prisma.patient.create(...)`, etc. The Zod validation schemas and TypeScript types are already aligned with the Prisma schema.

---

### P0-03 — Duplicate PrismaClient Instantiation

**Files:** `src/lib/db.ts` and `src/lib/prisma.ts`

**Finding:** Two nearly identical files both instantiate `PrismaClient` using the same global caching pattern, but export different named variables (`db` vs `prisma`). The `clinicalEngine.ts` imports from `./prisma`. No API routes import from either (they use mocks). When real DB integration begins, this split will cause confusion and potential double-connection pool initialization.

**Risk:** HIGH. In production, running two Prisma instances doubles connection pool usage and can lead to connection exhaustion on a database with a limited connection limit (e.g., a Neon serverless instance).

**Migration Path:**
1. Choose one canonical file — recommend keeping `src/lib/db.ts` (more commonly named convention in Next.js).
2. Update `src/lib/prisma.ts` to simply re-export from `db.ts`:
   ```typescript
   export { db as prisma, db as default } from './db';
   ```
3. No application logic changes needed; just a re-export alias.

---

### P0-04 — No Role-Based Authorization in API Routes

**Finding:** While the middleware (`src/middleware.ts`) correctly restricts page-level routes by role, the API routes do **not** verify the caller's role. For example:
- Any authenticated user (e.g., a FRONT_DESK role) can call `POST /api/prescriptions` and write a prescription.
- Any authenticated user can call `GET /api/admin/audit-logs`.
- The `/api/admin/users` route calls `getServerSession()` *without* `authOptions` (line 24 and 72), meaning it may return `null` in some contexts even when the user is logged in.

**Risk:** CRITICAL. Once real data is in the system, a NURSE could approve prescriptions, a FRONT_DESK could view audit logs, or a PATIENT role account could create other patients.

**Migration Path:**
- Add a role-check helper and call it at the top of each sensitive API handler:
  ```typescript
  const session = await getServerSession(authOptions);
  if (!session?.user || !['PHYSICIAN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  ```
- Fix the `getServerSession()` calls missing `authOptions` in admin routes.

---

### P0-05 — Sensitive Data Exposure in Logs

**File:** `src/lib/auth/index.ts` (lines 77–91)

**Finding:** Multiple `console.log` statements in the auth flow log the user's email address and authentication status to stdout:
```
console.log("Auth attempt with:", credentials?.email)  // line 77
console.log("Validated:", validated.email)              // line 79
console.log("User found:", user.name)                  // line 91
console.log(`User ${user.email} signed in`)            // line 142
```

**Risk:** HIGH. In production environments (cloud providers, log aggregators), these logs are stored and often accessible to ops teams. In a HIPAA-regulated environment, logging PII (email, names) in application logs requires explicit log management controls. More critically, failed auth attempts with email information can facilitate account enumeration attacks.

**Migration Path:** Remove all `console.log` statements from the auth provider. Use a structured logger (e.g., `pino` or `winston`) with PII redaction if audit logging of auth events is needed.

---

### P0-06 — Content Security Policy Allows Unsafe Eval / Unsafe Inline

**File:** `src/middleware.ts` (line 68)

**Finding:**
```
"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
```
The CSP allows `'unsafe-eval'` (which permits `eval()` and `new Function()`) and `'unsafe-inline'` (which permits inline `<script>` tags). These two directives completely neutralize XSS protection.

**Risk:** HIGH. A Cross-Site Scripting (XSS) vulnerability anywhere in the application would allow attackers to execute arbitrary JavaScript, steal session tokens, and access patient data.

**Migration Path:**
- Remove `'unsafe-eval'`. Next.js 14 generally does not need `unsafe-eval` in production builds.
- Replace `'unsafe-inline'` with nonce-based CSP using Next.js's built-in nonce support, or use a strict hash-based policy.
- Test thoroughly — some third-party UI libraries may need adjustments.

---

## 5. High-Priority Issues (P1)

These issues are important for correctness, maintainability, and security but are not immediate blockers for a demo environment.

---

### P1-01 — useAdmin Hook Uses Manual Fetch, Not TanStack Query

**File:** `src/hooks/useAdmin.ts`

**Finding:** The `useAdmin` hook uses raw `fetch()` calls wrapped in `useState`/`useCallback`, duplicating request deduplication, caching, error handling, and loading state logic that TanStack Query already provides for `usePatients.ts`. The pattern is inconsistent across the codebase and harder to test.

**Recommendation:** Migrate `useAdmin` to TanStack Query patterns, consistent with `usePatients.ts`. This will also improve admin page rendering performance through automatic request deduplication.

---

### P1-02 — `any` Type Overuse in API Handlers and Hooks

**Finding:** Several files use TypeScript's `any` type as an escape hatch:
- `src/hooks/usePatients.ts` — `Promise<ApiResponse<any>>` (lines 10, 36, 48, 64)
- `src/app/api/prescriptions/route.ts` — `(item: any, idx: number)` (line 95)
- `src/hooks/useAdmin.ts` — `metadata?: any` (line 17)
- `src/app/(dashboard)/layout.tsx` — `session.user as any` (line 18)
- `src/lib/auth/index.ts` — `return { ... } as any` (line 101), `(user as any).id` (lines 112–116)

**Recommendation:** Replace `any` with explicit TypeScript interfaces, especially in API handlers where the return shape is known. The `ApiResponse<T>` generic is already defined in `src/types/index.ts` — use it with concrete types.

---

### P1-03 — Mock Patient Data Duplicated Across Three Files

**Finding:** The `MOCK_PATIENTS` array (same patient IDs: `"p-1"`, `"p-2"`, etc.) appears independently in:
1. `src/app/api/patients/route.ts`
2. `src/app/api/patients/[id]/route.ts`
3. `src/app/api/search/route.ts`
4. `src/app/(dashboard)/prescribe/page.tsx` (client-side `MOCK_PATIENTS`)

These are not shared — they are separate arrays with overlapping but not identical data. This means a "patient" returned by `/api/patients` may not match the one returned by `/api/patients/p-1`.

**Recommendation:** In the short term, consolidate into a single shared `src/lib/mock-data/patients.ts` module. In the long term, replace with real database calls.

---

### P1-04 — Clinical Engine Imports Prisma but Has No Database Fallback Safety

**File:** `src/lib/clinicalEngine.ts`

**Finding:** The clinical decision support engine imports `prisma` from `./prisma` and performs database queries (e.g., `prisma.clinicalDiagnosis.findMany()`). The engine has a fallback to a local `DIAGNOSIS_DB`, but the fallback is inside a `try/catch` block that only activates if the DB query throws. If the database is not configured (which it currently is not in the demo), the engine will throw silently and fall back without warning.

**Recommendation:**
1. Add explicit environment detection: if `DATABASE_URL` is not set, skip the DB query and log a clear warning, not silently fall back.
2. Consider making the DB lookup optional with a feature flag.

---

### P1-05 — Voice Assistant Logs to `/api/voice` Fire-and-Forget

**File:** `src/hooks/useVoiceAssistant.ts` (lines 304–314)

**Finding:** After processing a voice command, the hook posts to `/api/voice` with `await fetch(...)` inside the `stopListening` function. However, if this network request fails, the error is silently swallowed — the `try/catch` around `stopListening` will catch the error but only set `this.error` state, not propagate it in a user-visible way. More importantly, the fire-and-forget pattern here means the function returns *before* the logging call completes, as `lastResponse` is returned from a stale closure (the `await` for the fetch is inside the function, but `return lastResponse` at line 321 references a stale state value from the closure, not the updated state).

**Recommendation:** Fix the stale `lastResponse` return by capturing the response as a local variable before the `setLastResponse` call.

---

### P1-06 — `NEXTAUTH_SECRET` and `DATABASE_URL` Not Validated at Startup

**Finding:** There is a `.env.example` file, but no startup validation to ensure required environment variables are present. If `NEXTAUTH_SECRET` is missing, next-auth silently generates an insecure secret in development — but in production, this can lead to JWT verification failures.

**Recommendation:** Add a startup environment validation file (e.g., `src/lib/env.ts`) using Zod or the `@t3-oss/env-nextjs` library that hard-fails at build/startup time if required variables are missing.

---

### P1-07 — No Input Sanitization for Clinical Text Fields

**Finding:** The clinical engine (`clinicalEngine.ts`) processes raw text strings for symptom parsing. The prescription page and scribe page accept free-text clinical notes. None of these paths have explicit sanitization for injection attacks.

**Recommendation:** While Next.js/React handles output escaping automatically for JSX, any text stored to the database should be explicitly sanitized before storage, especially clinical notes that might later be rendered as HTML (e.g., in a PDF export feature).

---

## 6. Medium-Priority Issues (P2)

These issues affect code quality, developer experience, and long-term maintainability.

---

### P2-01 — Overly Large Page Components

**Finding:** Several page components are excessively large:
- `src/app/(dashboard)/prescribe/page.tsx` — 662 lines
- `src/components/prescription/MedGeminiPrescriptionPanel.tsx` — ~1,300 lines (50KB)
- `src/components/prescription/AIPrescriptionWriter.tsx` — ~700 lines (28KB)
- `src/app/(dashboard)/patients/page.tsx` — 432+ lines

**Recommendation:** Extract sub-components (e.g., `<RefillQueue>`, `<DrugInteractionChecker>`, `<PrescriptionHistory>`) into their own files under `src/components/prescribe/`. This improves testability, code navigation, and hot-reload performance during development.

---

### P2-02 — Dynamic Tailwind Class Construction (CSS Purge Risk)

**File:** `src/app/(dashboard)/prescribe/page.tsx` (lines 512–516)

**Finding:** Tailwind class names are assembled dynamically using template literals:
```tsx
className={`p-3 rounded-xl bg-${color}-50 border border-${color}-200 text-center`}
```
Where `color` is `"rose"`, `"amber"`, or `"blue"`. Tailwind's build-time purge will NOT detect these classes because they are assembled at runtime.

**Recommendation:** Use a static mapping object:
```typescript
const colorMap = {
  rose: 'bg-rose-50 border-rose-200',
  amber: 'bg-amber-50 border-amber-200',
  blue: 'bg-blue-50 border-blue-200',
};
```
This is a production correctness issue — the styles will disappear in production builds.

---

### P2-03 — `useAdmin` Hook: Single `isLoading` / `error` State for Multiple Concurrent Requests

**File:** `src/hooks/useAdmin.ts`

**Finding:** The hook exposes a single `isLoading` boolean that is set to `true` for any active request. If two calls are made simultaneously (e.g., `fetchAuditLogs` and `fetchSystemHealth`), the loading state will flicker and the `error` state from one call will be overwritten by the other.

**Recommendation:** Use separate loading/error states per operation, or migrate to TanStack Query (see P1-01).

---

### P2-04 — `patientSchema` Requires Addresses and Telecoms on Creation, but Patient API Ignores Validation

**Finding:** The `patientSchema` in `src/lib/validation/patient.ts` correctly enforces `addresses: z.array(addressSchema).min(1, ...)` and `telecoms: z.array(telecomSchema).min(1, ...)`. However, the `POST /api/patients` route uses the mock path that doesn't call `patientSchema.parse(body)` — the validation is defined but never executed in the API layer.

**Recommendation:** When wiring up real database calls, ensure all API routes use the corresponding Zod schema for request body parsing before any database operation.

---

### P2-05 — Hardcoded Lab Values in Prescription Page

**File:** `src/app/(dashboard)/prescribe/page.tsx` (lines 461–468)

**Finding:**
```tsx
labResults: {
  eGFR: 72, creatinine: 1.1, A1c: 8.2,
  potassium: 4.5, ALT: 28, AST: 32,
}
```
These are hardcoded lab values that will never reflect real patient data, even after database integration, unless this page is updated to fetch lab results from the API.

**Recommendation:** Once real patient data is wired up, replace with an API call to fetch the selected patient's latest lab results.

---

### P2-06 — Prescribe Page Defaults to Mock Patient Instead of URL Parameter

**File:** `src/app/(dashboard)/prescribe/page.tsx` (lines 300–313)

**Finding:**
```typescript
const patientId = searchParams.get("patientId") || "p-123";
const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
```
The page reads `patientId` from the URL but initializes `selectedPatient` to the first mock patient regardless. The `useEffect` to match the URL param to a patient searches only `MOCK_PATIENTS` (a local array), so a real patient ID from a DB-backed flow will never match.

**Recommendation:** Replace local `MOCK_PATIENTS` lookup with an API call (`usePatient(patientId)`) to fetch the real patient.

---

### P2-07 — `getServerSession()` Called Without `authOptions` in Admin Routes

**File:** `src/app/api/admin/users/route.ts` (lines 24, 72)

**Finding:**
```typescript
const session = await getServerSession(); // Missing authOptions!
```
Next-auth `getServerSession()` requires `authOptions` to be passed explicitly in Next.js App Router to correctly reconstruct the session from the JWT. Without it, the function may return `null` even for authenticated users, or it may use a default session strategy that doesn't include custom fields like `role`.

**Recommendation:** Change all calls to `await getServerSession(authOptions)` and import `authOptions` from `@/lib/auth/index`.

---

### P2-08 — No Error Boundaries on Dashboard Pages

**Finding:** The dashboard pages use complex client components (NeuralAI panel, charts, voice assistant) with multiple `useEffect` hooks. There are no React Error Boundaries to gracefully handle failures in individual widgets. A crash in the Recharts component would white-screen the entire dashboard.

**Recommendation:** Wrap major UI sections in `<ErrorBoundary>` components (either React's built-in class component or a library like `react-error-boundary`) so a single widget failure doesn't destroy the entire page.

---

## 7. Low-Priority / Polish (P3)

---

### P3-01 — Debug `console.log` Statements in Production Code

**Files:** `src/lib/auth/index.ts`, `src/components/voice/MettaVoiceInterface.tsx`, `src/app/api/voice/commands/route.ts`

All debug `console.log` calls should be removed or replaced with a structured logger before production deployment. Auth flow logs are especially dangerous as they log PII (see P0-05).

---

### P3-02 — No Test Coverage

**Finding:** A `vitest.config.ts` exists and Vitest is a dependency, but no test files (`.test.ts`, `.spec.ts`) were found anywhere in the project.

**Recommendation:** At minimum, add unit tests for:
- `src/lib/clinicalEngine.ts` — logic-heavy, safety-critical
- `src/lib/validation/patient.ts` — schema edge cases (SSN format, date validation)
- `src/lib/auth/roles.ts` — RBAC permission logic

---

### P3-03 — Accessibility (a11y) Gaps

**Finding:** Several custom interactive elements lack proper ARIA attributes:
- Tab buttons in `prescribe/page.tsx` use `<button>` with `onClick` but no `role="tab"`, `aria-selected`, or `aria-controls`.
- The voice assistant microphone button likely has insufficient screen-reader context.
- Color-only status indicators (e.g., the colored dot in the refill queue) need text alternatives.

**Recommendation:** Use proper `role="tablist"` / `role="tab"` / `aria-selected` semantics and ensure all interactive elements have accessible labels.

---

### P3-04 — `.gitignore` Does Not Exclude `.env.example`

**Finding:** The `.gitignore` correctly excludes `.env` and `.env*.local`, but `.env.example` is a file that should be committed (it's a template). However, the project appears to have separate `.env` and `.env.example` — this is correct, but worth documenting: `.env.example` should contain only placeholder values, never real credentials or secrets.

---

### P3-05 — FHIR Types Defined But Not Used

**File:** `src/types/fhir.ts`

**Finding:** The project imports FHIR types via `export * from "./fhir"` in `src/types/index.ts`, suggesting FHIR compliance was planned. However, none of the current API routes or components use FHIR-formatted responses. The Prisma schema does not use FHIR resource IDs.

**Recommendation:** If FHIR compliance is a goal (required for CMS interoperability rules), plan a dedicated FHIR API layer. If not, remove the unused types to reduce cognitive overhead.

---

### P3-06 — `stopListening` Returns Stale `lastResponse`

**File:** `src/hooks/useVoiceAssistant.ts` (line 321)

**Finding:** The `stopListening` function awaits command processing and calls `setLastResponse(response)`, but then `return lastResponse` at line 321 returns the *previous* value of `lastResponse` (captured in the closure), not the newly set one. This is a React state batching issue.

**Recommendation:** Return the local `response` variable directly instead of the stale `lastResponse` state:
```typescript
setLastResponse(response);
return response; // not lastResponse
```

---

### P3-07 — Drug Interaction Check is Client-Only Mock

**File:** `src/app/(dashboard)/prescribe/page.tsx` (lines 329–331)

**Finding:** The "Run Check" button for drug interactions calls `handleRunInteractionCheck()` which just toggles a loading spinner for 1.5 seconds and does nothing else. The interactions displayed are always the static `MOCK_INTERACTIONS` array — the check never actually cross-references the patient's current medications.

**Recommendation:** Wire this button to the `POST /api/medications` suggestion endpoint (which already has an allergy/interaction checking algorithm), or to a dedicated interaction check API.

---

## 8. Prioritized Action Plan

The following phases are designed to be **backward-compatible** — each phase produces a working system.

---

### Phase 1: Security Hardening (Do First, Before Any Real Data)

| # | Task | Priority | Effort |
|---|---|---|---|
| 1.1 | Replace plaintext passwords with bcrypt hashing | P0-01 | M |
| 1.2 | Connect auth to database User table | P0-01 | M |
| 1.3 | Add role checks to all API route handlers | P0-04 | M |
| 1.4 | Fix `getServerSession()` → `getServerSession(authOptions)` in admin routes | P2-07 | S |
| 1.5 | Remove all `console.log` PII leaks from auth code | P0-05 | S |
| 1.6 | Harden Content Security Policy (remove `unsafe-eval`, `unsafe-inline`) | P0-06 | M |
| 1.7 | Add environment variable validation at startup | P1-06 | S |

---

### Phase 2: Database Integration (Core Functionality)

| # | Task | Priority | Effort |
|---|---|---|---|
| 2.1 | Consolidate dual Prisma client (`db.ts` + `prisma.ts`) | P0-03 | S |
| 2.2 | Wire `GET/POST /api/patients` to Prisma | P0-02 | L |
| 2.3 | Wire `GET/PATCH/DELETE /api/patients/[id]` to Prisma | P0-02 | L |
| 2.4 | Wire `GET/POST /api/prescriptions` to Prisma | P0-02 | M |
| 2.5 | Wire `GET/POST/PATCH /api/scribe` to Prisma | P0-02 | M |
| 2.6 | Wire `/api/admin/users` to Prisma | P0-02 | M |
| 2.7 | Wire `/api/admin/audit-logs` to Prisma | P0-02 | M |
| 2.8 | Add Zod validation parsing to all POST/PATCH handlers | P2-04 | M |

---

### Phase 3: Clinical Correctness

| # | Task | Priority | Effort |
|---|---|---|---|
| 3.1 | Fix stale `lastResponse` return in voice assistant | P3-06 | S |
| 3.2 | Add explicit DB-not-configured warning in clinical engine | P1-04 | S |
| 3.3 | Wire prescribe page `selectedPatient` to real API call | P2-06 | M |
| 3.4 | Replace hardcoded lab values with API-fetched results | P2-05 | M |
| 3.5 | Wire drug interaction check to medication suggestion API | P3-07 | M |

---

### Phase 4: Code Quality & Maintainability

| # | Task | Priority | Effort |
|---|---|---|---|
| 4.1 | Fix dynamic Tailwind class construction (CSS purge risk) | P2-02 | S |
| 4.2 | Migrate `useAdmin` hook to TanStack Query | P1-01 | M |
| 4.3 | Extract sub-components from large page files | P2-01 | L |
| 4.4 | Replace `any` types with concrete TypeScript interfaces | P1-02 | M |
| 4.5 | Consolidate mock data into shared module (short-term) | P1-03 | S |
| 4.6 | Add React Error Boundaries to dashboard widgets | P2-08 | M |
| 4.7 | Fix separate loading/error states in `useAdmin` | P2-03 | S |

---

### Phase 5: Testing & Compliance

| # | Task | Priority | Effort |
|---|---|---|---|
| 5.1 | Add unit tests for `clinicalEngine.ts` | P3-02 | L |
| 5.2 | Add unit tests for `validation/patient.ts` | P3-02 | M |
| 5.3 | Add unit tests for `auth/roles.ts` RBAC logic | P3-02 | M |
| 5.4 | Fix ARIA/accessibility gaps in tab and status components | P3-03 | M |
| 5.5 | Decide on FHIR compliance strategy | P3-05 | L |

---

## 9. Module-by-Module Analysis

### 9.1 Authentication (`src/lib/auth/index.ts`)

| Aspect | Finding |
|---|---|
| Provider | CredentialsProvider (JWT strategy) |
| Session duration | 8 hours (appropriate) |
| Password storage | PLAINTEXT IN CODE — critical issue (P0-01) |
| Token enrichment | Role, practitionerId, patientId, organizationId — well designed |
| Debug logging | PII logged to console — must be removed (P0-05) |
| Missing | Two-factor auth (designed in types, not implemented) |

---

### 9.2 Route Protection (`src/middleware.ts`)

| Aspect | Finding |
|---|---|
| Page-level RBAC | Working — uses `withAuth` + `ROUTE_PERMISSIONS` map |
| API-level RBAC | Missing — APIs only check `session?.user`, not role (P0-04) |
| Security headers | Present but CSP is too permissive (P0-06) |
| Public routes | Correctly defined and excluded |

---

### 9.3 Patient API (`src/app/api/patients/`)

| Aspect | Finding |
|---|---|
| GET /api/patients | Mock data, search filtering works but non-persistent |
| POST /api/patients | Mock — Zod schema defined but not used in handler |
| GET /api/patients/[id] | Mock — correct 404 for missing ID |
| PATCH /api/patients/[id] | Mock — updates in-memory only |
| DELETE /api/patients/[id] | Mock — sets `status: "INACTIVE"` |
| Validation | Zod schemas exist, not enforced in handlers |

---

### 9.4 Clinical Engine (`src/lib/clinicalEngine.ts`)

| Aspect | Finding |
|---|---|
| Architecture | Keyword-based + DB lookup with local fallback |
| DB dependency | Imports `prisma` — will try real DB if `DATABASE_URL` set |
| Safety | Fallback to local `DIAGNOSIS_DB` prevents crashes |
| Medication scoring | Basic: indications match, contraindication penalty, stock bonus |
| Weakness | No real pharmacokinetic or allergy cross-reference |

---

### 9.5 Hooks Layer (`src/hooks/`)

| Hook | Pattern | Issues |
|---|---|---|
| `usePatients` | TanStack Query | `any` return type |
| `useAdmin` | Manual fetch + useState | No deduplication, single error state |
| `useVoiceAssistant` | Web Speech API wrapper | Stale `lastResponse` return |

---

### 9.6 UI Components

| Component | Size | Issues |
|---|---|---|
| `MedGeminiPrescriptionPanel` | 50KB / ~1300 lines | Should be split into 4–5 sub-components |
| `AIPrescriptionWriter` | 28KB / ~700 lines | Should be split |
| `DashboardLayout` | 23KB / ~560 lines | Acceptable but large |
| `FloatingNav` | 12KB | Acceptable |

---

## 10. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Real patient data entered before security hardening | HIGH | CRITICAL (HIPAA) | Block production deploy until Phase 1 complete |
| R-02 | Database connection exhaustion from dual Prisma clients | MEDIUM | HIGH | Consolidate clients immediately (P0-03) |
| R-03 | CSS purge removes dynamic Tailwind classes in production | HIGH | MEDIUM | Fix dynamic class construction (P2-02) |
| R-04 | Auth logging exposes PII in cloud log streams | MEDIUM | HIGH | Remove console.logs before cloud deployment |
| R-05 | Unauthorized role escalation via direct API calls | HIGH | CRITICAL | Add API-level role checks (P0-04) |
| R-06 | Mock data treated as real by users/testers | MEDIUM | HIGH | Clear "DEMO MODE" banner in UI |
| R-07 | XSS attack bypasses CSP due to unsafe-eval/unsafe-inline | LOW | HIGH | Harden CSP (P0-06) |
| R-08 | Clinical engine silently falls back, giving wrong diagnosis data | LOW | HIGH | Add explicit DB config warning (P1-04) |

---

*End of Audit — Total Issues: 6 Critical (P0), 7 High (P1), 8 Medium (P2), 7 Low (P3)*
