# UK Flight Sync - Development & Enhancement Guide

*Last Updated: December 28, 2025*
*Based on codebase analysis and travel app pattern research*

---

## 📋 **Executive Summary**

UK Flight Sync is a well-architected React + TypeScript application for managing UK boarding school term dates and travel arrangements. The app serves as a family coordination tool for parents with children at multiple schools (Benenden School and Wycombe School).

**Current Status:** Production-ready with excellent technical foundations (React Query, TypeScript, PWA support).

**Key Strengths:**
- Clean, focused application for a specific use case
- Modern React patterns (hooks, context, React Query)
- Good TypeScript usage with proper type definitions
- Responsive design with PWA support
- Practical solution for real-world family coordination

---

## 🏗️ **Current Architecture Overview**

### **Technology Stack**
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **State Management:** React Query (TanStack Query) for server state
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Styling:** Tailwind CSS with custom design tokens
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Forms:** React Hook Form with Zod validation
- **Build Tool:** Vite

### **Key Architectural Patterns**
1. **Custom Hooks:** All data operations in hooks (`use-flights.ts`, `use-transport.ts`, `use-service-providers.ts`)
2. **React Query:** Manages server state with optimistic updates, caching, error handling
3. **Modal-Based UI:** Single main page with dialog-based interactions
4. **Error Boundaries:** Critical dialogs wrapped for graceful failure
5. **TypeScript First:** Strict typing throughout

### **Database Schema**
- `flights` table: Flight booking details with outbound/return types
- `transport` table: Ground transportation arrangements
- `service_providers` table: Reusable transport provider database with rating system
- `not_travelling` table: Terms where travel isn't needed

### **External Integrations**
- **Flight APIs:** Hybrid service (OpenSky Network + AviationStack) with FlightAware links
- **PWA:** Service workers, offline support, install prompt
- **Calendar:** Utilities exist for .ics export (not yet integrated into UI)

### **Mobile Dashboard Modules**
- **NextTravelHero (`src/components/dashboard/NextTravelHero.tsx`)**: Compact chip-style hero with the Benenden/Wycombe toggle, departure/countdown/confirmation/note highlights, and a single share action?no inline ?view trip? or ?add booking? clutter.
- **PlanFastCard (`src/components/dashboard/PlanFastCard.tsx`)**: Houses the search/filter inputs plus the Add Flight / Add Transport / Share actions, keeping logic for the quick-add experience out of `Index.tsx`.
- **TodayTab (`src/components/dashboard/tabs/TodayTab.tsx`)**: Composes the hero, Plan Fast card, school pills, and weekly preview into a dedicated component so `Index.tsx` no longer renders the entire Today view inline.
- **MobileBottomNav (`src/components/dashboard/MobileBottomNav.tsx`)**: Renders Today/Trips/Calendar/Settings as high-touch buttons with built-in haptics.
- **usePullToRefresh (`src/hooks/usePullToRefresh.ts`)**: Centralizes pull-to-refresh and horizontal swipe gestures while ignoring touches that originate on interactive elements. `Index.tsx` simply spreads the returned handlers.
- **NextTravel types (`src/types/next-travel.ts`)**: Shared between the hero component and the data computation logic to keep display + calculation in sync.

---

## 🎯 **Core Features Assessment**

### ✅ **Currently Implemented**

1. **Term Management**
   - Track term dates for Benenden and Wycombe schools
   - Filter by academic year and school
   - View detailed term schedules with arrival/departure times

2. **Flight Tracking**
   - Add/edit/remove flight details with outbound/return types
   - FlightAware integration with airline code conversion
   - Status tracking (scheduled, active, delayed, etc.)

3. **Transport Coordination**
   - Ground transportation management (school coach and taxi)
   - Service provider database with auto-complete and ratings (1-5 stars)
   - Driver information and pickup times

4. **Calendar Integration**
   - Unified calendar view showing all events
   - Compact calendar for dashboard display
   - Date filtering to show only future events

5. **User Experience**
   - PWA with offline support
   - Dark/light theme toggle
   - Responsive design
   - Export functionality (CSV, JSON, print view)

6. **Authentication**
   - Simple family authentication with secret phrase
   - Local storage persistence

7. **Mobile Readiness**
   - Solid mobile foundation with installable PWA configuration, responsive layouts, and mobile-aware components.
   - Main gap is the lack of dedicated mobile navigation, but existing responsive components provide a strong base for enhancement.
   - App remains well-positioned for mobile usage because the PWA can be installed on devices and the layouts adapt cleanly on smaller screens.

### ⚠️ **Incomplete/Removed Features**
- **Calendar Export:** Code exists (`src/utils/calendarExport.ts`) but not integrated into UI
- **Keyboard Shortcuts:** Removed due to crashes (code preserved)
- **Search & Filter:** Removed due to infinite render loops (needs re-implementation)
- **Testing:** Vitest configured but no test files found in source

---

## 🚀 **Enhancement Opportunities (Inspired by Travel Apps)**

### 🎯 **Immediate Priorities** (Aligns with NEXT_STEPS.md)

#### 1. **Calendar Export Integration** 📅
**Status:** Code exists (`src/utils/calendarExport.ts`) but not in UI
**Travel App Inspiration:** TripIt's seamless calendar integration
**Implementation:**
- Add "Add to Calendar" buttons in FlightDialog/TransportDialog
- Bulk export option in ExportDialog for all upcoming travel
- Support Google Calendar, Apple Calendar, Outlook (.ics format)
- **Files to modify:** `src/components/ui/flight-dialog.tsx`, `src/components/ui/transport-dialog.tsx`, `src/components/ui/export-dialog.tsx`

#### 2. **Notifications & Reminders** 🔔
**Travel App Inspiration:** Google Travel's proactive notifications
**Implementation:**
- PWA push notifications for upcoming flights/transport (24h/7d before)
- Flight status change alerts (delays, gate changes)
- Email/SMS reminders for check-in times, boarding times
- Leverage existing PWA infrastructure and Supabase Edge Functions
- **Tech needed:** Web Push API, SendGrid/Resend for email, Supabase Edge Functions + Cron

#### 3. **Itinerary Generation** 📋
**Travel App Inspiration:** TripIt's unified itinerary view
**Implementation:**
- Create "Day of Travel" timeline view combining flights + transport
- Generate printable itinerary with all details (times, contacts, confirmation codes)
- Shareable link for family members or drivers
- Extend existing `ExportDialog` with "Generate Itinerary" option
- **Files to modify:** `src/components/ui/export-dialog.tsx`, create new `ItineraryDialog`

### 💡 **High-Value Features from Travel Apps**

#### 4. **Document Storage** 📁
**Travel App Inspiration:** Expedia's trip documents section
**Implementation:**
- Upload ticket PDFs, boarding passes, receipts
- Photo capture for paper tickets
- Secure storage in Supabase with family access
- Attach documents to specific flights/transport entries
- **Database changes:** Add `documents` table with foreign keys to flights/transport
- **Type changes:** Extend `FlightDetails` and `TransportDetails` with `documentIds[]`

#### 5. **Expense Tracking** 💰
**Travel App Inspiration:** Trail Wallet, Splitwise integration
**Implementation:**
- Add cost fields to FlightDetails and TransportDetails
- Track total spend per term, per school year
- Export expense reports for school reimbursement
- Currency conversion for international flights
- **Type changes:** Add `cost?: number`, `currency?: string` to `FlightDetails` and `TransportDetails`
- **UI:** Add cost fields to dialogs, create analytics dashboard

#### 6. **Weather Integration** ☀️
**Travel App Inspiration:** Weather+ travel forecasts
**Implementation:**
- Show weather forecast for travel dates at destination airports
- Alert for potential weather-related delays
- Packing suggestions based on forecast
- Simple integration with OpenWeatherMap API
- **New service:** `src/services/weatherService.ts`
- **UI:** Add weather section to term cards or flight details

#### 7. **Checklists & Packing Lists** ✅
**Travel App Inspiration:** PackPoint, TripCase checklists
**Implementation:**
- School-specific packing lists (uniforms, sports gear, etc.)
- Pre-travel checklist (passport, tickets, medications)
- Mark items as packed
- Reusable templates for each term type
- **Database:** Add `checklists` and `checklist_items` tables
- **UI:** New `ChecklistDialog` component

### 🤝 **Collaboration Features**

#### 8. **Multi-User Support** 👨‍👩‍👧‍👦
**Current limitation:** Single family secret phrase
**Implementation:**
- Individual family member accounts with shared access
- Role-based permissions (parent vs child views)
- Activity log of who made changes
- Comment threads on specific travel arrangements
- **Database changes:** Add `users`, `family_members`, `activity_log` tables
- **Auth:** Migrate from secret phrase to proper authentication

#### 9. **Driver/Provider Portal** 🚗
**Travel App Inspiration:** Uber for Business, professional driver apps
**Implementation:**
- Share transport details directly with service providers
- Driver confirmation/acknowledgement system
- Real-time location sharing (optional, privacy-focused)
- Provider rating system enhancement (already has `rating` field)
- **New feature:** "Share with driver" button in TransportDialog

### 📊 **Analytics & Insights**

#### 10. **Travel Statistics Dashboard** 📈
- Miles/kilometers traveled per child, per school
- Most frequently used airlines and routes
- Cost analysis over time
- Carbon footprint estimation
- Travel time optimization suggestions
- **Implementation:** New `/analytics` route with charts (Recharts or Chart.js)

#### 11. **Predictive Features** 🔮
- Suggest optimal booking times based on historical patterns
- Alert for price drops on frequently flown routes
- Recommend service providers based on ratings and past usage
- **Implementation:** Machine learning service or simple heuristics

### 🛠 **Technical & UX Improvements**

#### 12. **Search & Filter Re-implementation** 🔍
**Note:** Previous attempt caused crashes (mentioned in NEXT_STEPS.md)
**Implementation:**
- Debounced search across flights, transport, terms
- Filter by date range, airline, airport, provider
- Save commonly used filters as presets
- **Approach:** Use simpler state management, avoid render loops
- **Files:** Create new `use-search.ts` hook with proper debouncing

#### 13. **Keyboard Shortcuts Rebuild** ⌨️
**Note:** Previous attempt caused crashes
**Implementation:**
- Modal-based approach instead of global listeners
- Context-aware shortcuts (only active in certain dialogs)
- Visual shortcut cheat sheet (`?` key)
- **Files:** Rebuild `use-keyboard-shortcuts.ts` with event delegation

#### 14. **Offline-First Enhancements** 📱
- Queue mutations when offline, sync when reconnected
- Local backup/restore functionality
- Progressive enhancement of flight status checking
- **Implementation:** Enhance service worker, add local storage queue

### 🎨 **UI/UX Polish** (From NEXT_STEPS.md)

#### 15. **Empty States & Onboarding** 🚀
- Guided first-time experience
- "Getting started" tutorial
- Illustrations for empty states
- **Implementation:** New `OnboardingDialog` component

#### 16. **Loading States & Skeletons** ⏳
- Skeleton loaders for term cards
- Optimistic UI updates with rollback
- Progress indicators for exports
- **Implementation:** Add skeleton components, enhance mutation states

### 🗺 **Map Integration** (Lower priority)

#### 17. **Airport Maps & Directions** 🗺️
- Show airport terminals/gates on maps
- Directions to/from airports
- Estimated travel times based on traffic
- **Implementation:** Google Maps or Mapbox integration

---

## 📋 **Implementation Recommendations**

### **Phase 1: Quick Wins (1-2 weeks)**
1. **Calendar export integration** - Highest user value, code exists
2. **Loading states & empty states** - Improves UX immediately
3. **Search & filter re-implementation** - Fix previous crashes

### **Phase 2: Core Enhancements (2-4 weeks)**
1. **Notifications system** - Leverages existing PWA infrastructure
2. **Itinerary generation** - Natural extension of current data
3. **Document storage** - High user value for families

### **Phase 3: Advanced Features (1-2 months)**
1. **Expense tracking** - Practical for family budgeting
2. **Multi-user support** - Scales collaboration
3. **Analytics dashboard** - Data insights for optimization

### **Phase 4: Polish & Scale (Ongoing)**
1. **Weather integration** - Nice-to-have contextual information
2. **Checklists** - Organizational tool
3. **Map integration** - Visual enhancements

---

## 🏗️ **Architectural Considerations**

### **Patterns to Maintain**
1. **Custom Hooks:** All new data operations should be in hooks
2. **React Query:** Use for all server state with optimistic updates
3. **TypeScript Strictness:** No `any` types in new code
4. **Error Boundaries:** Wrap new critical components
5. **PWA Compatibility:** Ensure new features work offline

### **Database Migration Strategy**
New features requiring database changes should:
1. Create migration files in `supabase/migrations/` with timestamp format
2. Include rollback instructions
3. Update TypeScript definitions in `src/types/school.ts`
4. Add transformation utilities if needed

### **Testing Strategy**
Each new feature should include:
1. Unit tests for utility functions
2. Component tests for new UI components
3. Integration tests for data flow
4. E2E tests for critical user journeys

---

## 🔧 **Technical Debt & Code Quality**

### **Current Issues**
1. **No test suite** - Vitest configured but no tests found
2. **Large components** - Index.tsx is 500+ lines, could be split
3. **Mixed concerns** - Some components handle too many responsibilities
4. **Incomplete features** - Calendar export code not integrated
5. **Removed features** - Search & keyboard shortcuts need re-implementation

### **Recommended Refactoring**
1. **Split Index.tsx** into smaller, focused components
2. **Extract utility functions** from large components
3. **Implement proper testing** with Vitest + React Testing Library
4. **Add code splitting** for better performance

---

## 📁 **File References for Implementation**

### **Key Existing Files**
- Flight hooks: `src/hooks/use-flights.ts:16`
- Transport hooks: `src/hooks/use-transport.ts`
- Calendar export utilities: `src/utils/calendarExport.ts:36`
- Export dialog: `src/components/ui/export-dialog.tsx:32`
- Service worker: `public/sw.js` (for notifications)
- Type definitions: `src/types/school.ts:29`

### **Pattern Examples**
- Custom hook pattern: `src/hooks/use-flights.ts`
- Dialog component: `src/components/ui/flight-dialog.tsx`
- Optimistic updates: `src/hooks/use-flights.ts:61` (onMutate)
- Error handling: `src/hooks/use-flights.ts:81` (onError)

---

## 🎯 **Success Metrics**

### **User Engagement**
- Daily active users
- Number of flights/transport added per user
- Feature usage (which enhancements are used most)
- Session duration

### **Technical Metrics**
- Page load time (< 2s target)
- Time to interactive (< 3s target)
- Bundle size (< 500KB target)
- Test coverage (> 80% target)
- Production error rate (< 0.1% target)

### **Business Value**
- Time saved for families in travel coordination
- Reduction in missed flights/transport
- Improved communication between family members
- Better preparation for travel days

---

## 🔁 Term Sync Operations

1. **Where it lives** – `scripts/check-term-dates.ts` scrapes Benenden + Wycombe term pages, compares the result to `src/data/term-overrides.json`, and writes any delta back to the overrides file.
2. **How to run it** – execute `DEEPSEEK_API_KEY=... npm run check:terms` (or export the variable before running). The CLI output summarizes new/changed terms so you can craft meaningful commit messages.
3. **Secrets management** – keep the same `DEEPSEEK_API_KEY` defined in Railway environment variables *and* as a GitHub Action secret so both manual runs and scheduled workflows share credentials.
4. **Automation path** – schedule a daily GitHub Action/Railway cron that installs dependencies, runs the script, commits `src/data/term-overrides.json` if it changed, and triggers a deploy. Pair it with alerts on workflow failure so scraping issues are discovered quickly.
5. **Runtime effect** – builds read from `mock-terms`, which now merges overrides. Once the updated JSON is deployed, the hero card, Plan Fast context, and CompactCalendar immediately reflect the new dates. Users can always pull to refresh or wait for the automatic hourly refresh to pull the latest server data between deploys.

---

## 🤝 **Contributing Guidelines**

When implementing new features:

1. **Follow existing patterns** - Use custom hooks, React Query, optimistic updates
2. **Update types first** - Modify `src/types/school.ts` before implementation
3. **Write tests** - Add unit, component, and integration tests
4. **Run checks** - `npm run check` (typecheck + lint) before committing
5. **Update documentation** - Keep this file and NEXT_STEPS.md current
6. **Use conventional commits** - `✨ feat:`, `🐛 fix:`, `📚 docs:`

---

## 📞 **Questions & Decisions**

For architectural decisions or implementation questions:

1. **Check existing patterns** in the codebase first
2. **Refer to this document** for guidance on priorities
3. **Consider user value** over technical perfection
4. **Maintain simplicity** - The app's strength is its focused purpose

---

**Remember:** The core value proposition is making school travel coordination easier for families. Every enhancement should serve this goal directly or indirectly.

*Document generated from codebase analysis on December 28, 2025*
