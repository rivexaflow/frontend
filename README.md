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

Routes:
- `/super-admin`
- `/super-admin/tenants`
- `/super-admin/audit`

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

Routes:
- `/dashboard`
- `/dashboard/crm`
- `/dashboard/team`
- `/dashboard/kyc`
- `/dashboard/invoices`
- `/dashboard/ai-services`
- `/dashboard/settings`

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

Routes:
- `/agent`
- `/agent/contacts`
- `/agent/kyc`
- `/agent/ai-tools`

## Public Website and Auth Flow

Public marketing/entry routes:
- `/` (website: vision, services, impact, testimonials, FAQ)
- `/login` (workspace login for Organization Admin/User)
- `/admin/login` (super admin login)
- `/signup` (new workspace request flow)
- `/forgot-password`
- `/invite/[token]`

Post-login role redirection:
- `SUPER_ADMIN` -> `/super-admin`
- `ADMIN` -> `/dashboard`
- `USER` -> `/agent`

## Security and Route Guards

`middleware.ts` enforces:
- AuthGuard: unauthenticated users redirected to login
- RoleGuard: route-role mismatch redirected to forbidden page
- WorkspaceGuard: tenant context required for workspace routes

Other security-oriented conventions:
- role + workspace claims expected in JWT payload
- no secret hardcoding; env-driven config
- private repository and PR-first workflow required

## State Management Design

Zustand stores:
- `authStore`: current user, role, token, login/logout state
- `workspaceStore`: workspace context data
- `socketStore`: real-time presence + activity feed
- `uiStore`: notifications and modal states

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
    page.tsx
    (auth)/
      login/
      signup/
      forgot-password/
    admin/login/
    (super-admin)/super-admin/
      page.tsx
      tenants/
      audit/
    (admin)/dashboard/
      page.tsx
      crm/
      team/
      kyc/
      invoices/
      ai-services/
      settings/
    (agent)/agent/
      page.tsx
      contacts/
      kyc/
      ai-tools/
    invite/[token]/
  components/
    layout/
    providers/
  stores/
  lib/
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
