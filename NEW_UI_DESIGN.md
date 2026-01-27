# School Flight Sync - Complete UI Reimagination

## 🎯 Core Design Principle: "Journey-Centric"

Every **flight** is a journey that requires **transport**. The UI must show them as a connected, inseparable unit.

---

## 🎨 New Design System: "Orbit"

### Philosophy
- **Connection over separation**: Flights and transport are visually linked
- **Progressive clarity**: Start simple, expand for details
- **Calm confidence**: Soft colors, clear hierarchy, breathing room
- **Motion with purpose**: Animations guide, don't distract

---

## Color Palette

```css
:root {
  /* Core */
  --background: 0 0% 98%;
  --foreground: 222 25% 12%;
  --card: 0 0% 100%;
  
  /* Primary - Soft Indigo */
  --primary: 230 55% 48%;
  --primary-foreground: 0 0% 100%;
  --primary-subtle: 230 55% 96%;
  
  /* Schools */
  --benenden: 265 60% 45%;
  --benenden-subtle: 265 60% 95%;
  --wycombe: 160 55% 35%;
  --wycombe-subtle: 160 55% 95%;
  
  /* Journey States */
  --journey-complete: 145 55% 42%;
  --journey-pending: 38 92% 50%;
  --journey-missing: 0 70% 55%;
  
  /* Transport Types */
  --transport-flight: 217 70% 55%;
  --transport-ground: 25 85% 52%;
  
  /* Neutral */
  --muted: 220 14% 96%;
  --border: 220 13% 90%;
  --ring: 230 55% 48%;
  
  /* Dark Mode */
  --dark-background: 222 25% 8%;
  --dark-card: 222 25% 11%;
  --dark-border: 222 20% 18%;
}
```

---

## 🧩 Key Component: Journey Card

The Journey Card is the atomic unit of the UI. It represents one trip segment (outbound or return).

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ●─────[ Journey Header ]─────────────────────────[Status]── │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [FLIGHT CARD]                                      │   │
│  │                                                     │   │
│  │  ✈️  CX 238                    Jan 30, 11:45 PM     │   │
│  │     Hong Kong → London                             │   │
│  │     HKG ───────────────✈️───────────────→ LHR      │   │
│  │                                                     │   │
│  │  ╔═══════════════════════════════════════════════╗ │   │
│  │  ║ 🚗 Transport                                  ║ │   │
│  │  ║ ───────────────────────────────────────────── ║ │   │
│  │  ║ Taxi to Airport    Pickup: 8:30 PM           ║ │   │
│  │  ║ Driver: John Smith  📱 +44 7700 900123       ║ │   │
│  ║  ║                                              ║ │   │
│  │  ║ [✓ Confirmed]                                ║ │   │
│  │  ╚═══════════════════════════════════════════════╝ │   │
│  │                                                     │   │
│  │  OR (if no transport):                            │   │
│  │                                                     │   │
│  │  ╔═══════════════════════════════════════════════╗ │   │
│  │  ║ ⚠️ Transport Not Booked                       ║ │   │
│  │  ║ You need transport to catch this flight      ║ │   │
│  │  ║                                               ║ │   │
│  │  ║ [+ Book Transport]                           ║ │   │
│  │  ╚═══════════════════════════════════════════════╝ │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Design Details

- **Flight Card**: Always visible, primary information
- **Transport Panel**: Visually nested/connected to flight
- **Visual Connector**: Line or bracket showing relationship
- **Status**: Overall journey status (complete/partial/missing)

---

## 📱 Page Layouts

### 1. Home Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  School Flight Sync                          [🔔] [👤]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NEXT JOURNEY                              3 days away      │
│  ════════════════════════════════════════════════════════   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ●───── OUTBOUND ───────────────────────── [READY]   │   │
│  │                                                     │   │
│  │  ✈️  CX 238                    Thu, Jan 30          │   │
│  │     Hong Kong → London          11:45 PM            │   │
│  │     Terminal 1                    Gate TBD          │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ 🚗 Taxi    Pickup: 8:30 PM    John Smith   │   │   │
│  │  │            📱 +44 7700 900123              │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  RETURN JOURNEY                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ●───── RETURN ──────────────────────────── [NEEDS]  │   │
│  │                                                     │   │
│  │  ✈️  Not booked                                     │   │
│  │                                                     │   │
│  │  [+ Book Return Flight]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  UPCOMING JOURNEYS                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🏫 Half Term    Feb 14 - Feb 28    Benenden        │   │
│  │                 [2 journeys to book]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. All Journeys View

```
┌─────────────────────────────────────────────────────────────┐
│  All Journeys                    [🔍] [Filter ▼]            │
│  [All] [Benenden] [Wycombe]                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  JANUARY 2026                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● Jan 30, Thursday                                  │   │
│  │                                                     │   │
│  │  OUTBOUND ───────────── Benenden ───────── [READY]  │   │
│  │  ✈️ CX 238    11:45 PM    HKG → LHR                 │   │
│  │  🚗 Taxi      8:30 PM     John Smith                │   │
│  │                                                     │   │
│  │  RETURN ──────────────── Benenden ───────── [NEEDS] │   │
│  │  ✈️ Not booked                                      │   │
│  │  [+ Add Return]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  FEBRUARY 2026                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● Feb 14, Saturday                                  │   │
│  │                                                     │   │
│  │  OUTBOUND ───────────── Wycombe ───────── [READY]   │   │
│  │  ✈️ BA 032    9:00 PM     LHR → HKG                 │   │
│  │  🚗 School Coach  6:00 PM                           │   │
│  │                                                     │   │
│  │  RETURN ──────────────── Wycombe ───────── [READY]  │   │
│  │  ✈️ CX 239    11:45 PM    HKG → LHR                 │   │
│  │  🚗 Taxi      8:30 PM     Mike Chen                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Specifications

### JourneyCard Component

```typescript
interface JourneyCardProps {
  // The term this journey belongs to
  term: Term;
  
  // Direction
  direction: 'outbound' | 'return';
  
  // Flight (optional - could be unbooked)
  flight?: FlightDetails;
  
  // Associated transport (optional)
  transport?: TransportDetails;
  
  // Visual variant
  variant: 'compact' | 'detailed' | 'full';
  
  // Actions
  onAddFlight: () => void;
  onEditFlight: () => void;
  onAddTransport: () => void;
  onEditTransport: () => void;
}
```

### Journey Status Logic

```typescript
type JourneyStatus = 
  | 'complete'      // Has both flight and transport
  | 'flight-only'   // Has flight, needs transport
  | 'transport-only'// Has transport, needs flight (rare)
  | 'empty'         // Nothing booked
  | 'not-travelling'; // Explicitly marked as not needed

function getJourneyStatus(
  flight?: FlightDetails, 
  transport?: TransportDetails,
  notTravelling?: boolean
): JourneyStatus {
  if (notTravelling) return 'not-travelling';
  if (flight && transport) return 'complete';
  if (flight && !transport) return 'flight-only';
  if (!flight && transport) return 'transport-only';
  return 'empty';
}
```

---

## 🎨 Visual Design Details

### 1. Flight-Transport Connection

The flight and transport are visually connected through:

**Option A: Nested Panel**
```
┌─────────────────┐
│  FLIGHT INFO    │
│                 │
│ ┌─────────────┐ │
│ │ TRANSPORT   │ │  ← Nested with left border
│ └─────────────┘ │
└─────────────────┘
```

**Option B: Timeline Connector**
```
✈️ FLIGHT
│
├──── 🚗 TRANSPORT  ← Connected by line
```

**Option C: Unified Card**
```
┌─────────────────────────────────────┐
│  ✈️ → 🚗  JOURNEY                   │
│  Flight + Transport                 │
└─────────────────────────────────────┘
```

**Selected Approach: Option A with visual connector**

### 2. Status Indicators

| Status | Visual | Color |
|--------|--------|-------|
| Complete | ✓ | Green |
| Flight Only | ⚠️ | Amber |
| Empty | ○ | Gray |
| Not Travelling | − | Slate |

### 3. Typography Scale

```
Display:     2rem    (32px)  - Page titles
Heading:     1.5rem  (24px)  - Section headers
Title:       1.25rem (20px)  - Card titles
Body:        1rem    (16px)  - Primary content
Small:       0.875rem(14px)  - Secondary info
Caption:     0.75rem (12px)  - Metadata
```

---

## 📲 Mobile-First Interactions

### Swipe Actions on Journey Card

```
┌─────────────────────────────────────┐
│  [← Edit]  JOURNEY CARD  [Delete →] │
└─────────────────────────────────────┘
```

- **Left swipe**: Edit options
- **Right swipe**: Delete/archive
- **Tap**: Expand details

### Quick Actions

Long press on any journey reveals:
- Share journey details
- Add to calendar
- Mark as not travelling
- Duplicate journey

---

## 🌗 Dark Mode Adaptation

```css
.dark {
  /* Background layers */
  --bg-primary: 222 25% 8%;
  --bg-secondary: 222 25% 11%;
  --bg-tertiary: 222 25% 14%;
  
  /* Transport panel gets subtle glow */
  --transport-panel-bg: 222 25% 13%;
  --transport-panel-border: 222 20% 20%;
  
  /* Status colors stay vibrant */
  --status-complete: 145 60% 50%;
  --status-pending: 38 95% 55%;
}
```

---

## 🔄 Data Flow: Flight-Transport Coupling

### Backend Integration

```typescript
// API returns journeys, not separate entities
interface Journey {
  id: string;
  termId: string;
  direction: 'outbound' | 'return';
  school: 'benenden' | 'wycombe';
  
  // Coupled data
  flight?: FlightDetails;
  transport?: TransportDetails;
  
  // Computed status
  status: JourneyStatus;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Fetch all journeys for a user
GET /api/journeys?school=both&from=2026-01-01
```

### Frontend State Structure

```typescript
// Journeys are the primary entity
interface JourneysState {
  byId: Record<string, Journey>;
  allIds: string[];
  byTerm: Record<string, string[]>; // termId -> journeyIds
  byDate: Record<string, string[]>; // date -> journeyIds
}

// Selectors
const selectJourneyStatus = (journey: Journey) => journey.status;
const selectNeedsTransport = (journey: Journey) => 
  journey.flight && !journey.transport;
```

---

## 🎯 Success Metrics

1. **Task Completion Rate**
   - % of flights that get transport booked within 24 hours
   - Target: >90%

2. **Time to Complete Journey Planning**
   - Time from adding flight to adding transport
   - Target: <2 minutes

3. **Visual Scanning Efficiency**
   - Can users identify incomplete journeys at a glance?
   - Measured via eye-tracking or click-test

4. **Error Reduction**
   - Fewer instances of flights without transport
   - Target: 50% reduction

---

## 🚀 Implementation Phases

### Phase 1: Foundation
- [ ] Update CSS variables
- [ ] Create JourneyCard component
- [ ] Build journey status utilities

### Phase 2: Data Layer
- [ ] Create journey hooks (useJourneys)
- [ ] Migrate from separate flights/transport to journeys
- [ ] Build journey selectors

### Phase 3: UI Implementation
- [ ] Build Home Dashboard
- [ ] Build All Journeys view
- [ ] Build Journey Detail modal

### Phase 4: Polish
- [ ] Swipe interactions
- [ ] Animations
- [ ] Accessibility audit

---

*This design reimagines School Flight Sync around the core user need: planning complete journeys, not just booking isolated flights.*
