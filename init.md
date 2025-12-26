# init.md — Product-First, TSX-Only, Lovable-Style Full-Stack Standard

This repository is **product-led**.

You (Claude, Codex, or any coding agent) are responsible for choosing a **sensible, modern, boring stack** that ships fast and feels great — **without asking the user to decide**.

All authored logic MUST be written in `.tsx`.

This document is the **single source of truth** for how code is planned, implemented, reviewed, and shipped.

---

## 0) Core Principles (Non-Negotiable)

### Product over tech
- Users should understand the product in under 30 seconds.
- Reduce cognitive load before adding power.
- Prefer clarity over cleverness.
- Never expose internal or technical jargon to users.

### Lovable bar (how it should feel)
Every interaction must feel:
- **Warm** — friendly, human, calm
- **Guiding** — always show the next step
- **Forgiving** — mistakes are easy to fix
- **Safe** — destructive actions are explicit

If something feels cold, confusing, or fragile, it is wrong.

---

## 1) TSX-Only Rule (Hard Constraint)

### Allowed
- `*.tsx` (ALL logic: frontend, backend, shared)
- `*.md`
- `*.json`
- `*.css`
- `*.svg`
- `*.sql` (migrations)
- `*.env.example`

### Forbidden
- `*.ts`
- `*.js`
- `*.jsx`

If a tool or library expects `.ts`, still write `.tsx` and configure the tool accordingly.

This rule is **never debated**.

---

## 2) Stack Selection Rules (Agents MUST Follow)

The user does **not** choose frameworks.
You do.

Choose the **simplest modern stack** that:
- Is widely used
- Has strong TypeScript support
- Avoids premature abstraction

### Default stack (use unless there is a strong reason not to)

This reflects how **Lovable-style teams actually build**.

#### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod

#### Backend
- Node.js
- Hono (preferred) or Express
- Zod for validation
- Postgres
- Lightweight SQL or minimal ORM

#### Tooling
- TypeScript (configured for TSX-only)
- Vitest
- Playwright (optional, encouraged)

### Explicit exclusions (unless clearly required)
- Next.js
- Redux
- GraphQL
- Microservices
- Heavy UI frameworks
- Premature performance optimizations

---

## 3) Repository Structure (Default)

Use this structure unless the repo already exists:

```
/app        # frontend
/server     # backend
/shared     # types + schemas
/tests
```

Rules:
- All shared domain types live in `/shared`
- Frontend and backend import from `/shared`
- Do NOT duplicate types across layers

---

## 4) Agent Responsibilities

### Claude (Product Architect)

Claude must:
1. Infer requirements from context.
2. Define the user goal and happy path.
3. Design failure and edge states.
4. Choose the stack per these rules.
5. Define shared schemas and types.
6. Write UX copy in a human tone.
7. Prevent over-engineering.

Claude always starts with:
- User goal
- Happy path
- Failure states
- Acceptance criteria

### Codex (Implementer)

Codex must:
1. Implement exactly what Claude specifies.
2. Follow existing patterns.
3. Keep diffs minimal.
4. Add loading, empty, and error states.
5. Respect TSX-only at all times.

Codex never bikesheds tools.

---

## 5) Lovable UI & UX Rules (Mandatory)

### Tone & copy
Use:
- "You're all set"
- "Let's fix that"
- "Try again"

Never:
- Blame the user
- Show stack traces
- Show raw error codes

### Empty states
Every empty state includes:
1. Friendly headline
2. One-line explanation
3. Primary action
4. Optional secondary action or illustration

### Loading states
- Buttons show progress text (e.g. "Saving…")
- Lists use skeletons
- No frozen screens > 300ms

### Destructive actions
- Confirmation required
- Consequences explained
- Cancel is the default focus

---

## 6) API & Data Contracts

All API responses MUST follow this shape:

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
```

Rules:
- Validate all inputs with Zod
- Schemas live in `/shared`
- Backend never trusts the client

---

## 7) Error Handling Philosophy

Errors must:
- Say what happened
- Say what to do next
- Be recoverable when possible

Bad:
> "Something went wrong"

Good:
> "We couldn't save your changes. Check your connection and try again."

---

## 8) Accessibility (Required)

- Keyboard navigation for all interactions
- Visible focus states
- Labels for all inputs
- Dialogs trap focus and restore it on close
- Errors announced to screen readers

Accessibility is not optional.

---

## 9) Testing (Right-Sized)

Minimum expectations:
- Shared schema tests
- Backend handler tests for critical paths
- UI tests for primary flows

Rules:
- Bug fix → add regression test
- Tests should be deterministic
- Avoid brittle snapshots

---

## 10) Definition of Done (Self-Enforced)

Before work is complete:
- [ ] TSX-only respected
- [ ] Shared types used correctly
- [ ] UI has loading, empty, error states
- [ ] Copy sounds human
- [ ] Forms disable submit while pending
- [ ] API follows contract
- [ ] No dead ends for users
- [ ] No unnecessary abstractions

---

## 11) Decision Rule

When unsure:
- Choose the simpler option
- Optimize for speed to first value
- Avoid cleverness
- Ship, then iterate
