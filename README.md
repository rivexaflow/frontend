# Rivexaflow Frontend (POC)

Rivexaflow is an AI-driven, multi-tenant B2B workspace platform.  
This frontend POC demonstrates a production-oriented structure with clear role separation, scalable routing, shared UI shell, and module-ready dashboard flows.

## Product Vision

Rivexaflow is designed as a single digital workspace where companies can operate CRM, KYC, Invoicing, and AI-assisted workflows in one platform.

Key goals:
- Clean and secure role-based operations
- Real-time visibility for team activity
- AI-service enablement per organization
- Scalable architecture from startup to enterprise

## Core Architecture

### Frontend Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (server state + caching)
- Axios (API communication)
- Socket.io client (real-time updates)
- Zod (form validation for auth flows)

### Architecture Principles
- Multi-tenant ready UI and route design
- Role-isolated app lanes
- Shared shell + reusable components
- Strict middleware-based guard model
- Light theme, business-oriented UI for client demos

## Role-Based Access Flow

### 1) Super Admin (Platform Team)
Purpose: manage platform-level operations only.

Can:
- View all workspaces and status
- Monitor platform metrics and incidents
- Manage subscription/billing controls
- Access audit logs

Cannot:
- Access internal business records of a tenant as a regular user

Routes (platform lane):
- `/super-admin`
- `/super-admin/tenants` and `/super-admin/tenants/[tenantId]`
- `/super-admin/audit`, `/super-admin/billing`, `/super-admin/system-health`, `/super-admin/users`

### 2) Organization Admin (Workspace Owner)
Purpose: run one company workspace.

Can:
- Manage team and module access
- Monitor live operations
- Configure workspace settings
- Manage KYC, CRM, invoices, AI services

Cannot:
- Access other organizations
- Access platform super-admin controls

Routes (workspace lane, slug-scoped):
- `/{workspaceSlug}` (workspace home)
- `/{workspaceSlug}/dashboard`
- `/{workspaceSlug}/crm` (+ contacts, leads, pipelines)
- `/{workspaceSlug}/team` (+ members, invites, activity)
- `/{workspaceSlug}/kyc` (+ submissions, reviews, templates)
- `/{workspaceSlug}/invoices` (+ create, `[invoiceId]`)
- `/{workspaceSlug}/ai` (+ tools, history)
- `/{workspaceSlug}/settings` (+ workspace, branding, billing, modules, api-keys)
- `/{workspaceSlug}/reports`, `/{workspaceSlug}/notifications`

### 3) User (Agent)
Purpose: execute assigned operational tasks.

Can:
- Work on assigned contacts/tasks
- Upload KYC documents
- Use assigned AI tools

Cannot:
- Change workspace settings
- Access billing/admin controls
- Access other users' restricted controls

Routes (same workspace lane, restricted navigation for `USER`):
- Users land on `/{workspaceSlug}/dashboard` with a reduced sidebar (CRM/KYC/AI subset).

## Public Website and Auth Flow

Public marketing routes:
- `/`, `/pricing`, `/about`, `/contact`

Auth routes:
- `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `/admin/login` (platform team)
- `/invite/[token]`

Post-login redirects (middleware + client):
- `SUPER_ADMIN` -> `/super-admin`
- `ADMIN` / `USER` -> `/{workspaceSlug}/dashboard` (demo slug `acme-corp` from `config/app.ts`)

## Security and Route Guards

`src/middleware.ts` enforces:
- AuthGuard: unauthenticated users redirected to login
- RoleGuard: route-role mismatch redirected to forbidden page
- WorkspaceGuard: tenant context required for workspace routes

Other security-oriented conventions:
- role + workspace claims expected in JWT payload
- no secret hardcoding; env-driven config
- private repository and PR-first workflow required

## State Management Design

Zustand stores (`src/stores/`):
- `auth.store.ts`: current user, role, token, login/logout state (+ session cookie sync)
- `workspace.store.ts`: workspace id/name/slug/plan
- `socket.store.ts`: real-time presence + activity feed
- `ui.store.ts`: notifications and modal states

## Module Coverage in POC

- Super Admin metrics + tenants + audit panels (dummy data)
- Organization Admin control center (dummy data)
- AI services panel with service status and run counts (dummy data)
- User dashboard and assigned AI tools (dummy data)
- Signup/Forgot Password validation using Zod
- Invite token acceptance state (demo validation)

## Project Structure

```txt
src/
  app/
    (public)/          # marketing site
    (auth)/            # auth flows + invite + platform login
    (platform)/super-admin/
    (workspace)/[workspaceSlug]/...
    layout.tsx
    loading.tsx
    error.tsx
    not-found.tsx
    globals.css
  features/            # domain modules (components/hooks/services/schemas/types)
  components/
    ui/
    shared/
    layout/
  lib/                 # api, auth, workspace, socket, constants, utils
  hooks/
  stores/
  providers/
  schemas/
  types/
  config/
  middleware.ts
```

## Environment

Use `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Local Development

1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Production checks:
   - `npm run lint`
   - `npm run build`

## Current Scope and Next Steps

Current repo is a frontend POC with realistic structure and dummy data for client demonstration.

Recommended next steps:
- Integrate real backend auth and refresh-token flow
- Connect all dashboard modules to API endpoints
- Add E2E tests for role routing and auth flows
- Add charts/tables in internal panels for deeper demo quality
