# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

- `npm run dev` - Start development server (localhost:8080)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run check` - Run both typecheck and lint
- `npm run preview` - Preview production build

## Architecture Overview

### Application Structure
This is a React + TypeScript application for managing UK boarding school term dates and travel arrangements. The app serves as a family coordination tool for parents with children at multiple schools (Benenden School and Wycombe Abbey School).

### Key Architectural Patterns

**Data Flow Architecture:**
- React Query (TanStack Query) for server state management with optimistic updates
- Custom hooks pattern for all data operations (`use-flights.ts`, `use-transport.ts`, `use-service-providers.ts`)
- Supabase for backend (PostgreSQL with Row Level Security policies set to `USING (true)`)
- Family authentication context for simple auth state

**Component Architecture:**
- Single main page (`Index.tsx`) with modal-based interactions
- Reusable dialog components for major features (FlightDialog, TransportDialog)
- TermCard component handles both main term cards and travel sub-cards
- ErrorBoundary wrapping for critical dialog components

**Database Design:**
- `flights` table with `type: 'outbound' | 'return'` for journey direction
- `transport` table uses index-based filtering (even=outbound, odd=return) for journey separation
- `service_providers` table for reusable transport provider auto-complete
- `not_travelling` table for marking when travel arrangements aren't needed

### Critical Implementation Details

**Transport Filtering Logic:**
The app uses a frontend-only approach for transport journey separation:
```typescript
// Even-indexed entries go to "Travel from School" cards
// Odd-indexed entries go to "Return to School" cards
const relevantTransport = termTransport.filter((_, index) => {
  const isFirstCard = isStart;
  const isEvenIndex = index % 2 === 0;
  return isFirstCard ? isEvenIndex : !isEvenIndex;
});
```

**Service Provider Auto-Complete:**
- Combobox component filters providers by vehicle type (school-coach vs taxi)
- Auto-fills transport forms when existing provider is selected
- Automatically saves manually entered details as new service providers

**Flight Data Integration:**
- FlightAware integration with automatic airline code conversion (IATA to ICAO)
- 60-day caching system for API efficiency
- Hybrid service combining AviationStack API with OpenSky Network

### State Management Patterns

**React Query Keys:**
```typescript
const QUERY_KEYS = {
  flights: ['flights'] as const,
  transport: ['transport'] as const,
  serviceProviders: ['serviceProviders'] as const,
} as const;
```

**Form State Pattern:**
All dialogs use local state for forms with reset functions and optimistic updates via React Query mutations.

**Modal Management:**
Centralized modal state in Index.tsx with popup term cards for todo item interactions.

### Database Migration Workflow

New migrations go in `supabase/migrations/` with timestamp format: `YYYYMMDD_HHMMSS_description.sql`

All tables follow the pattern:
- UUID primary keys with `gen_random_uuid()`
- `created_at` and `updated_at` timestamps
- Row Level Security enabled with permissive policies
- Update triggers for `updated_at` columns

### Testing and Quality Assurance

Always run before committing:
```bash
npm run check  # Runs both typecheck and lint
```

The project has no test suite currently - contributions should add tests for new functionality.

### Environment Configuration

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_AVIATIONSTACK_API_KEY` - For flight data (optional)
- `VITE_OPENSKY_CLIENT_ID` - OpenSky Network (optional)
- `VITE_OPENSKY_CLIENT_SECRET` - OpenSky Network (optional)