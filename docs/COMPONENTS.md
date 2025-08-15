# Component Architecture

## Overview

School Flight Sync follows a component-based architecture using React with TypeScript. Components are organized into logical categories with clear separation of concerns.

## Component Structure

```
src/components/
├── ui/                    # Reusable UI components
│   ├── term-card.tsx     # Main term display card
│   ├── flight-dialog.tsx # Flight management modal
│   ├── transport-dialog.tsx # Transport management modal
│   ├── todo-dialog.tsx   # To-do list modal
│   ├── term-details-dialog.tsx # Term details viewer
│   ├── event-sections.tsx # Event display sections
│   ├── calendar-events.tsx # Calendar event display
│   └── [shadcn components] # Base UI components
├── auth/                 # Authentication components
│   ├── FamilyLogin.tsx   # Family secret phrase login
│   └── ProtectedRoute.tsx # Route protection
├── ErrorBoundary.tsx     # Error handling
└── school-header.tsx     # School section header
```

## Core Components

### TermCard

**Location**: `src/components/ui/term-card.tsx`

The main component for displaying term information with expandable details.

**Props**:
- `term: Term` - Term data object
- `flights: FlightDetails[]` - Associated flights
- `transport: TransportDetails | null` - Transport arrangements
- `notTravellingStatus?: NotTravellingStatus` - Travel status
- `isExpanded: boolean` - Expansion state
- `onExpandedChange: (expanded: boolean) => void` - Expansion handler
- `onAddFlight: (termId: string) => void` - Add flight handler
- `onViewFlights: (termId: string) => void` - View flights handler
- `onAddTransport: (termId: string) => void` - Add transport handler
- `onViewTransport: (termId: string) => void` - View transport handler
- `onSetNotTravelling: (termId: string, type: 'flights' | 'transport') => void` - Not travelling handler

**Features**:
- Collapsible card design
- Status badges for flights and transport
- Quick action buttons
- Date range display
- Academic year indicator

### FlightDialog

**Location**: `src/components/ui/flight-dialog.tsx`

Modal dialog for managing flight information.

**Props**:
- `term: Term` - Associated term
- `flights: FlightDetails[]` - Existing flights
- `open: boolean` - Dialog state
- `onOpenChange: (open: boolean) => void` - State handler
- `onAddFlight: (flight: FlightDetails) => void` - Add flight handler
- `onEditFlight: (flight: FlightDetails) => void` - Edit flight handler
- `onRemoveFlight: (flightId: string) => void` - Remove flight handler

**Features**:
- Add/Edit/Delete flights
- Separate outbound and return sections
- Form validation with Zod
- Date and time pickers
- Confirmation code storage

### TransportDialog

**Location**: `src/components/ui/transport-dialog.tsx`

Modal dialog for managing ground transportation.

**Props**:
- `term: Term` - Associated term
- `transport: TransportDetails | null` - Existing transport
- `open: boolean` - Dialog state
- `onOpenChange: (open: boolean) => void` - State handler
- `onAddTransport: (transport: TransportDetails) => void` - Add handler
- `onEditTransport: (transport: TransportDetails) => void` - Edit handler
- `onRemoveTransport: (transportId: string) => void` - Remove handler

**Features**:
- School coach or taxi selection
- Driver information management
- Contact details storage
- Pickup time scheduling
- Notes field

### FamilyLogin

**Location**: `src/components/auth/FamilyLogin.tsx`

Authentication component for family access.

**Features**:
- Family secret phrase input
- Form validation with Zod
- Password visibility toggle
- Error handling and display
- Loading states

### ErrorBoundary

**Location**: `src/components/ErrorBoundary.tsx`

Global error handling component that catches React errors.

**Features**:
- Catches and displays React errors gracefully
- Development error details
- Recovery options (retry, reload, go home)
- Production error logging
- User-friendly error messages

### SchoolHeader

**Location**: `src/components/school-header.tsx`

Header component for each school section.

**Props**:
- `schoolName: string` - School name
- `termCount: number` - Number of terms
- `variant: 'benenden' | 'wycombe'` - School variant
- `academicYear: string` - Current academic year
- `onAcademicYearClick: () => void` - Click handler for academic year

**Features**:
- School branding with logos
- Term count display
- Academic year link
- Color-coded design

## Authentication Architecture

### FamilyAuthContext

**Location**: `src/contexts/FamilyAuthContext.tsx`

Provides family authentication state and methods throughout the app.

**Features**:
- Family secret phrase validation
- localStorage session persistence
- Authentication state management
- Login/logout functionality

### ProtectedRoute

**Location**: `src/components/auth/ProtectedRoute.tsx`

Wrapper component that protects routes requiring authentication.

**Features**:
- Redirects unauthenticated users to login
- Shows loading state during auth check
- Renders children when authenticated

## UI Component Library

The application uses **shadcn/ui** components as the foundation for the UI. These are customizable, accessible components built on Radix UI primitives.

### Key shadcn Components Used

- **Button**: Primary interactive element
- **Card**: Container component for content
- **Dialog**: Modal dialogs for forms and details
- **Select**: Dropdown selection component
- **Calendar**: Date picker component
- **Badge**: Status indicators
- **Alert**: Information and warning messages
- **Form**: Form handling with validation
- **Input**: Text input fields
- **Label**: Form field labels
- **Tabs**: Tabbed navigation
- **ScrollArea**: Scrollable content areas
- **Separator**: Visual dividers
- **Accordion**: Collapsible content sections

## State Management

### Component State

Local state is managed using React hooks:

```typescript
// Example from Index.tsx
const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
const [showFlightDialog, setShowFlightDialog] = useState(false);
const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
```

### Authentication State

Family authentication is managed via React Context:

```typescript
const { isAuthenticated, login, logout, loading } = useFamilyAuth();
```

### Data Fetching

Custom hooks handle data fetching and caching:

```typescript
// Using custom hooks
const { flights, loading, addFlight, editFlight, removeFlight } = useFlights();
const { transport, isLoading, addTransport, editTransport, removeTransport } = useTransport();
```

### Form State

React Hook Form manages form state with Zod validation:

```typescript
const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    secretPhrase: '',
  }
});
```

## Error Handling

### Global Error Boundary

The ErrorBoundary component catches all React errors and provides recovery options:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Form Validation

Zod schemas provide comprehensive form validation:

```typescript
const loginSchema = z.object({
  secretPhrase: z.string().min(1, 'Please enter the family secret phrase'),
});
```

## Component Patterns

### Container/Presentational Pattern

- **Container Components**: Handle data and logic (e.g., `Index.tsx`)
- **Presentational Components**: Focus on UI rendering (e.g., `TermCard`)

### Compound Components

Dialogs use compound component pattern:

```typescript
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogBody>
      {/* Content */}
    </DialogBody>
  </DialogContent>
</Dialog>
```

## Styling

### Tailwind CSS Classes

Components use Tailwind utility classes:

```typescript
<div className="flex items-center gap-2 p-4 rounded-lg bg-card">
  {/* Content */}
</div>
```

### CSS Variables

Theme colors use CSS variables:

```css
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
--card: 0 0% 100%;
--card-foreground: 222.2 47.4% 11.2%;
```

### Responsive Design

Components are responsive by default:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

## Type Safety

All components use TypeScript for type safety:

```typescript
interface FamilyLoginProps {
  // Props are fully typed
}

export const FamilyLogin: React.FC<FamilyLoginProps> = (props) => {
  // Component implementation
};
```

## Accessibility

Components follow accessibility best practices:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility

## Performance Optimization

### Memoization

Components use React.memo for optimization when needed:

```typescript
export const TermCard = React.memo(({ term, flights, ...props }) => {
  // Component implementation
});
```

### Error Boundaries

Prevent entire app crashes with strategic error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentThatMightFail />
</ErrorBoundary>
```

## Best Practices

1. **Single Responsibility**: Each component has one clear purpose
2. **Prop Types**: All props are typed with TypeScript
3. **Default Props**: Sensible defaults for optional props
4. **Error Boundaries**: Graceful error handling
5. **Composition**: Complex UIs built from simple components
6. **Accessibility**: WCAG compliance considerations
7. **Performance**: Memoization where beneficial
8. **Testing**: Components designed for testability