# OHOPRS — One Humanitarian One Poverty Response System

OHOPRS is a prototype operations platform for coordinating social protection interventions across government agencies: creating and approving interventions, tracking beneficiaries and the households they belong to, distributing cash and in-kind benefits with full traceability, collecting field outcome data, and visualizing coverage geographically down to the local government area (LGA).

This is a **prototype**. There is no real backend — every module reads from and writes to in-memory mock data (some of it mirrored to `localStorage` so state survives a page reload). It exists to demonstrate the intended user experience and data model ahead of a production build.

## Table of contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Signing in](#signing-in)
- [Roles & permissions](#roles--permissions)
- [Routes](#routes)
- [Project structure](#project-structure)
- [The mock service pattern](#the-mock-service-pattern)
- [Domain-by-domain guide](#domain-by-domain-guide)
- [Seed data](#seed-data)
- [Geospatial data](#geospatial-data)
- [Data & persistence notes](#data--persistence-notes)
- [Verifying a change](#verifying-a-change)
- [Known gotchas](#known-gotchas)
- [Known limitations / explicitly out of scope for now](#known-limitations--explicitly-out-of-scope-for-now)

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack, React Server/Client Components)
- **Language:** TypeScript, strict mode
- **UI:** React 19, Tailwind CSS 4
- **Data fetching / state:** TanStack Query (server-shaped mock data), Zustand (client state — auth/session, theme)
- **Forms & validation:** React Hook Form, Zod
- **Charts:** Recharts
- **Maps:** `d3-geo` rendering static GeoJSON directly to SVG — no external map tile service, no API key required
- **Toasts:** Sonner
- **Package manager:** Yarn (the committed lockfile is `yarn.lock` — use `yarn`, not `npm`, to avoid a second, conflicting lockfile)

## Getting started

Requires Node.js 20+.

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The `/` route is a public landing page; sign in at `/login`.

Other scripts:

```bash
yarn build   # production build (also type-checks and lints as part of the Next.js build step)
yarn start   # run a production build
yarn lint    # ESLint only
```

There are no environment variables to configure and no external services to provision — everything the app needs ships in the repo.

## Signing in

There is no real authentication. The login screen has a **Role** dropdown that logs you in as a pre-seeded mock user for that role (see `src/mock/auth.mock.ts`). Any non-empty password is accepted.

## Roles & permissions

Permissions are defined once in `src/constants/permissions.ts` and checked everywhere via `hasPermission(role, permission)` (`src/lib/rbac.ts`). Route-level guarding uses the same map (`routePermissionMap` / `getRoutePermissionForPath`), and the sidebar (`src/components/layout/sidebar.tsx`) hides any nav item the current role can't open — so different roles genuinely see a different app, not just a disabled button.

| Role | Summary | Key permissions |
|---|---|---|
| `SUPER_ADMIN` | National oversight. Creates interventions, gives final governance approval on distributions, manages agencies and settings. | Everything except day-to-day distribution edits (`create_distribution`/`edit_distribution` are deliberately agency-side only) |
| `ORG_ADMIN` (Agency Admin) | Runs one agency's operations: intervention visibility, distribution creation/editing, the agency's own distribution-approval chain, payment reversal. | `create_distribution`, `edit_distribution`, `change_distribution_status`, `reverse_payment`, `edit_households`, `manage_settings` |
| `PROGRAM_OFFICER` | Same agency-side distribution rights as Agency Admin, scoped to programs they're assigned to. | `create_distribution`, `edit_distribution`, `edit_households`, `submit_outcome_records` |
| `AUDITOR` | Read-only across the whole system, including audit logs. | Every `view_*` permission, nothing else |
| `ORGANIZATION_MANAGER` / `STORE_MANAGER` / `DISTRIBUTION_MANAGER` | Agency-side steps in a **distribution's** approval chain. | View-only outside their approval action, which is checked separately (see [Domain-by-domain guide](#domain-by-domain-guide)) |
| `AGENCY_ACCOUNTANT` | Final agency-side approval step, then initiates payment. | `initiate_distribution_payment` |
| `SYSTEM_ACCOUNTANT` / `DIRECTOR` | Sequential internal approval steps on a newly created **intervention**, before it reaches an agency. | `approve_program` |
| `FIELD_OFFICER` | Mobile/field data collection only. | `view_households`, `submit_outcome_records` — explicitly **no** `edit_households`, so a field officer can submit outcome feedback but can't add/remove household members or move a household's journey stage |

Some actions (e.g. "which specific user can approve this specific pending step") are checked with dedicated helpers rather than a blanket permission — see `src/features/distributions/lib/distribution-permissions.ts` and the intervention approval module for examples. If you're adding a new gated action, prefer this pattern over overloading an existing permission when the real-world eligibility rule is narrower than "has this permission."

## Routes

All routes live under `src/app/(platform)/`, one folder per top-level module:

| Route | Module |
|---|---|
| `/dashboard` | Landing dashboard after login |
| `/organizations` | Agencies |
| `/programs` | Interventions (creation, edit, internal + distribution approval chains) |
| `/beneficiaries` | Central beneficiary registry (create, edit, bulk upload) |
| `/households` | Household roster, journey stage, outcome records |
| `/field` | Field Officer's household finder + outcome feedback form |
| `/distributions` | Cash & in-kind distributions (creation, approval, payments, in-kind item tracking) |
| `/payments` | Payment records |
| `/reports` | Executive reporting (chart view + geospatial map view), plus sub-reports for organizations/interventions/beneficiaries/distributions |
| `/audit-logs` | Audit trail |
| `/notifications` | Notification center and templates |
| `/settings` | Users, roles, approvals, integrations, security, profile |
| `/workspace` | Agency-scoped workspace view |

`/programs` is labeled "Interventions" in the UI — the codebase still uses `program` as the internal name for historical reasons, so expect that mismatch throughout `src/types/program.ts`, `src/services/program.service.ts`, etc.

## Project structure

```
src/
  app/(platform)/         Route segments — thin wrappers that render a feature module, nothing else
  features/<domain>/       Feature UI: components, forms, schemas, per-domain permission helpers
  services/                 Mock "API" layer — every screen goes through a *.service.ts, never mock data directly
  mock/                     Seed data generators
  types/                    Shared domain types
  constants/                Static reference data (roles, permissions, Nigeria states/regions, navigation)
  data/                     Static GeoJSON assets used by the map
  components/               Cross-feature UI primitives (layout, shared states like EmptyState/LoadingState/PermissionDeniedState)
  lib/                      Small framework-agnostic helpers (rbac, formatters, local-storage, in-kind item generation, role labels)
  hooks/                    Small reusable hooks (e.g. `useDebouncedValue`)
  store/                    Zustand stores (auth/session, theme)
```

## The mock service pattern

Every domain follows the same shape, and new work should follow it too:

1. **`mock/<domain>.mock.ts`** — deterministic seed data, generated from a small set of builder functions (not hand-written one-by-one). Cross-domain links are derived by ID convention rather than duplicated foreign keys where possible (e.g. `getHouseholdIdForBeneficiary(beneficiaryId)` in `mock/households.mock.ts` computes `household_${beneficiaryId}` instead of every beneficiary record carrying a stored `householdId`).
2. **`services/<domain>.service.ts`** — an object of `async` methods (`getX`, `getXById`, `createX`, `updateX`, ...) that filter/paginate/mutate a module-level array copied from the mock data, and return `Promise<ApiResponse<T>>` (`{ success, message, data }`). This is the seam where a real backend would slot in later — components never import a `mock/*` file directly for data, only for cross-referencing static lookups.
3. **`features/<domain>/components/*`** — client components that call the service through TanStack Query (`useQuery`/`useMutation`), gate rendering on `hasPermission(role, ...)`, and invalidate the relevant query keys on mutation success.

Two persistence styles are in use, and it matters which one a given service uses:

- **In-memory only** (`households.mock.ts`/`household.service.ts`, `reports.mock.ts`): a module-level `let store = [...seedData]` that survives client-side navigation within one tab but resets on a hard reload.
- **`localStorage`-backed** (`distribution.service.ts`, `program.service.ts`): the same in-memory array, but hydrated from and written back to `localStorage` on every mutation, so it survives reloads too.

If you add a mutation, always invalidate the TanStack Query keys that read the same data (e.g. both `["household", id]` and any list query like `["field-households"]`) — a mutation that writes to the store but doesn't invalidate the right query key will appear to silently do nothing on whichever screen you navigate to next.

## Domain-by-domain guide

**Interventions (`/programs`)**
Created by Super Admin, who also defines the intervention's own internal approval chain (ordered `SYSTEM_ACCOUNTANT`/`DIRECTOR` steps). Each assignee approves/rejects in order; once fully approved, the intervention can have its agency-side **distribution approval template** configured by that agency's `ORG_ADMIN` (`/programs/[id]/distribution-approval`) — required before any distribution can target it.

**Beneficiaries (`/beneficiaries`)**
The individual-level registry: identity, verification status, benefit status, program enrollment. This is the original data model and is still the anchor for payments (a `Distribution`'s recipients are beneficiary IDs).

**Households (`/households`)**
Added as the primary unit of *outcome tracking*, layered on top of the beneficiary registry without changing it: `src/mock/households.mock.ts` derives one household per beneficiary, synthesizing a member roster (spouse/children/dependents) from that beneficiary's existing `numberOfWives`/`numberOfChildren`/`householdDependents` fields. A household tracks:
- **Members** (`HouseholdMember`) — relationship, gender, DOB, status (`ACTIVE`/`DECEASED`/`DEPARTED`), and whether they're the designated recipient. Only a member who is *also* a registered beneficiary can be set as designated recipient (see `householdService.changeDesignatedRecipient`).
- **Journey stage** (`JourneyStage`: `SOCIAL_REGISTER → BENEFICIARY_REGISTER → GRADUATED`/`TRANSITIONED`), with a full `journeyHistory` of stage changes and the actor/reason for each.
- **Outcome records** (`OutcomeRecord`) — periodic field feedback: meals/day, school attendance, income estimate, skills gained. Submitted via the Field Officer flow.

**Field data collection (`/field`)**
A deliberately narrow flow for the `FIELD_OFFICER` role: find a household, submit one outcome record against it. Nothing else on this route is editable by that role.

**Distributions (`/distributions`)**
Cash and non-cash distributions share one pipeline: agency-side approval chain (per the intervention's distribution-approval template) → Super Admin final governance approval → payment initiation. Non-cash distributions additionally carry `inKindItems: InKindItem[]` — one record per recipient, each with a batch/serial code, a QR code string, a delivery location, and its own `deliveryStatus`, independent of the distribution's overall execution status. See `src/lib/in-kind-items.ts` for how these are generated from a distribution's recipient list, and `distribution-inkind-items.tsx` for the tracking UI. Marking an item delivered/failed/returned is gated by `canTrackInKindItems` (Super Admin, or an agency role matching the distribution's organization with edit or payment-initiation rights) — deliberately *not* the same check as "can edit this distribution's targeting," since that lock is meant to freeze once approval starts, which is exactly when delivery confirmation happens.

**Reports (`/reports`)**
Executive dashboard with a Chart View / Map View toggle (`ReportViewToggle`). Map View (`NigeriaChoroplethMap`, lazy-loaded via `next/dynamic` since its GeoJSON assets are several MB) is a state-level choropleth that can drill into a state's LGAs, plus a household search box that jumps straight to a household's LGA and highlights it. Selecting a state on the map also filters every other report widget on the page via the shared `ReportFiltersState`.

## Seed data

Roughly: 21 organizations, ~28 interventions, 53 beneficiaries (and therefore 53 derived households), 21 distributions. All of it is generated by small parameterized builder functions in `src/mock/*.mock.ts` rather than hand-authored per record — if you need more volume for testing a list/pagination UI, extend the builder loop rather than adding records by hand.

## Geospatial data

`src/data/nigeria-states.geo.json` (state/admin1 boundaries) and `src/data/nigeria-lgas.geo.json` (LGA/admin2 boundaries, 774 features) are sourced from OCHA's COD-AB Nigeria administrative boundaries dataset, stripped down to just `{ state, lga }` properties plus geometry to keep file size manageable. **Both files have had their polygon ring winding order reversed from the OCHA source.** The source data is wound per the GeoJSON RFC 7946 convention, but this project's `d3-geo` version interprets that convention as "the outside of the shape" and renders a filled rectangle covering the whole map — reversing every ring's point order fixes it. If you ever re-source or regenerate either file, you will hit this exact bug again; verify with `d3.geoBounds(feature)` on a single feature — if it reports something close to `[[-180,-90],[180,90]]` instead of a small bounding box, the winding needs reversing.

## Data & persistence notes

- See [The mock service pattern](#the-mock-service-pattern) for which services persist to `localStorage` and which are in-memory only for the current tab.
- The map's GeoJSON is only fetched when a user actually opens Map View (dynamic import, `ssr: false`) — don't turn that back into a static import, it adds ~6MB to the `/reports` page's initial bundle.

## Verifying a change

There is no automated test suite. Changes in this repo have been verified with:

1. `npx tsc --noEmit -p tsconfig.json` — must be silent.
2. `npx eslint <changed files>` — check for new errors (warnings on `distribution-form.tsx`/`role-permission-matrix.tsx`-adjacent files predate most feature work and can be ignored unless you're touching those exact lines).
3. `npx next build` — must succeed and register the expected routes.
4. Manual browser verification for anything UI-facing: run `yarn dev`, log in as the relevant role, and click through the actual flow. For scripted verification, `playwright-core` (installed as a temporary devDependency, then removed — see git history) plus a real local Chrome install works without needing Playwright's bundled browser download.

## Known gotchas

- **Never run a Node script that imports `playwright-core` (or anything else) from inside this project's directory while `yarn dev` is running.** The dev server's file watcher will pick up the script file being created/deleted and trigger a Fast Refresh rebuild, which can reset in-memory mock service state mid-test and produce confusing false negatives. Run such scripts with `NODE_PATH="$(pwd)/node_modules" node /path/outside/the/repo/script.js` instead.
- **In-memory-only services reset on a hard reload, not just on new tabs.** If a change you just made "disappeared," check whether the service you touched persists to `localStorage` or not before assuming it's a bug.
- **Shared React Query cache keys across routes.** If two different pages both fetch `["household", id]` (or any other key), a mutation on one page must invalidate that key or the other page will show stale data when you navigate to it — this bit the field-officer outcome-submission flow once; see the fix in `field-outcome-form-module.tsx`'s `onSuccess`.

## Known limitations / explicitly out of scope for now

- Ward, village, and compound-level map drill-down: no public boundary dataset of usable quality exists yet for Nigeria at that granularity.
- Benefit types are a fixed (if generous) enum, not yet an admin-configurable list.
- No predictive/early-warning analytics ("Poverty Intelligence Lab") — this would require external data feeds and cross-ministry integration and is a separate future workstream.
