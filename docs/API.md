# API Documentation

## Overview

School Flight Sync uses Supabase as its backend, providing real-time database functionality with PostgreSQL. All API interactions are handled through the Supabase JavaScript client library.

## Authentication

Currently, the application uses Supabase's anonymous authentication. Row Level Security (RLS) policies are configured to allow all operations.

## Database Tables

### Flights Table

Stores flight information for school terms.

#### Schema

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Unique identifier | Primary Key, Auto-generated |
| `term_id` | TEXT | Reference to school term | NOT NULL |
| `type` | TEXT | Flight direction | NOT NULL, IN ('outbound', 'return') |
| `airline` | TEXT | Airline name | NOT NULL |
| `flight_number` | TEXT | Flight number | NOT NULL |
| `departure_airport` | TEXT | Departure airport code | NOT NULL |
| `departure_date` | DATE | Date of departure | NOT NULL |
| `departure_time` | TEXT | Time of departure | NOT NULL |
| `arrival_airport` | TEXT | Arrival airport code | NOT NULL |
| `arrival_date` | DATE | Date of arrival | NOT NULL |
| `arrival_time` | TEXT | Time of arrival | NOT NULL |
| `confirmation_code` | TEXT | Booking reference | Optional |
| `notes` | TEXT | Additional notes | Optional |
| `created_at` | TIMESTAMP | Creation timestamp | Auto-generated |
| `updated_at` | TIMESTAMP | Last update timestamp | Auto-updated |

#### Operations

##### Create Flight
```javascript
const { data, error } = await supabase
  .from('flights')
  .insert({
    term_id: 'term-123',
    type: 'outbound',
    airline: 'British Airways',
    flight_number: 'BA123',
    departure_airport: 'LHR',
    departure_date: '2025-09-01',
    departure_time: '10:30',
    arrival_airport: 'JFK',
    arrival_date: '2025-09-01',
    arrival_time: '14:30',
    confirmation_code: 'ABC123',
    notes: 'Window seat requested'
  });
```

##### Read Flights
```javascript
// Get all flights for a term
const { data, error } = await supabase
  .from('flights')
  .select('*')
  .eq('term_id', 'term-123')
  .order('departure_date', { ascending: true });
```

##### Update Flight
```javascript
const { data, error } = await supabase
  .from('flights')
  .update({
    airline: 'Virgin Atlantic',
    flight_number: 'VS001'
  })
  .eq('id', 'flight-uuid');
```

##### Delete Flight
```javascript
const { data, error } = await supabase
  .from('flights')
  .delete()
  .eq('id', 'flight-uuid');
```

### Transport Table

Manages ground transportation arrangements.

#### Schema

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Unique identifier | Primary Key, Auto-generated |
| `term_id` | TEXT | Reference to school term | NOT NULL |
| `type` | TEXT | Transport type | NOT NULL, IN ('school-coach', 'taxi') |
| `driver_name` | TEXT | Driver's name | NOT NULL |
| `phone_number` | TEXT | Contact number | NOT NULL |
| `license_number` | TEXT | Vehicle license | NOT NULL |
| `pickup_time` | TEXT | Scheduled pickup | NOT NULL |
| `notes` | TEXT | Additional notes | Optional |
| `created_at` | TIMESTAMP | Creation timestamp | Auto-generated |
| `updated_at` | TIMESTAMP | Last update timestamp | Auto-updated |

#### Operations

##### Create Transport
```javascript
const { data, error } = await supabase
  .from('transport')
  .insert({
    term_id: 'term-123',
    type: 'taxi',
    driver_name: 'John Smith',
    phone_number: '+44 7700 900000',
    license_number: 'ABC 123',
    pickup_time: '08:00',
    notes: 'Blue Toyota Prius'
  });
```

##### Read Transport
```javascript
// Get transport for a term
const { data, error } = await supabase
  .from('transport')
  .select('*')
  .eq('term_id', 'term-123')
  .single();
```

##### Update Transport
```javascript
const { data, error } = await supabase
  .from('transport')
  .update({
    pickup_time: '08:30',
    notes: 'Delayed by 30 minutes'
  })
  .eq('id', 'transport-uuid');
```

##### Delete Transport
```javascript
const { data, error } = await supabase
  .from('transport')
  .delete()
  .eq('id', 'transport-uuid');
```

### Not Travelling Table

Tracks terms where travel arrangements are not needed.

#### Schema

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | UUID | Unique identifier | Primary Key, Auto-generated |
| `term_id` | TEXT | Reference to school term | NOT NULL, UNIQUE |
| `no_flights` | BOOLEAN | No flights needed | Default: false |
| `no_transport` | BOOLEAN | No transport needed | Default: false |
| `created_at` | TIMESTAMP | Creation timestamp | Auto-generated |
| `updated_at` | TIMESTAMP | Last update timestamp | Auto-updated |

#### Operations

##### Create/Update Not Travelling Status
```javascript
const { data, error } = await supabase
  .from('not_travelling')
  .upsert({
    term_id: 'term-123',
    no_flights: true,
    no_transport: false
  }, {
    onConflict: 'term_id'
  });
```

##### Read Not Travelling Status
```javascript
// Get all not travelling statuses
const { data, error } = await supabase
  .from('not_travelling')
  .select('*');

// Get status for specific term
const { data, error } = await supabase
  .from('not_travelling')
  .select('*')
  .eq('term_id', 'term-123')
  .single();
```

## Hooks

The application provides custom React hooks for data management:

### useFlights()

Manages flight data with real-time updates.

```javascript
const {
  flights,        // Array of flight records
  loading,        // Loading state
  addFlight,      // Function to add a flight
  editFlight,     // Function to edit a flight
  removeFlight    // Function to remove a flight
} = useFlights();
```

### useTransport()

Manages transport data with real-time updates.

```javascript
const {
  transport,          // Array of transport records
  isLoading,          // Loading state
  addTransport,       // Function to add transport
  editTransport,      // Function to edit transport
  removeTransport,    // Function to remove transport
  getTransportForTerm // Function to get transport for a specific term
} = useTransport();
```

### useNotTravelling()

Manages not travelling status.

```javascript
const {
  notTravelling,         // Array of not travelling records
  loading,               // Loading state
  setNotTravellingStatus // Function to set status
} = useNotTravelling();
```

## Real-time Subscriptions

The application uses Supabase's real-time functionality to automatically update the UI when data changes:

```javascript
// Example subscription setup
const subscription = supabase
  .channel('flights-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'flights'
  }, (payload) => {
    // Handle real-time updates
    console.log('Change received:', payload);
  })
  .subscribe();
```

## Error Handling

All database operations return an error object that should be checked:

```javascript
const { data, error } = await supabase
  .from('flights')
  .select('*');

if (error) {
  console.error('Error fetching flights:', error);
  // Handle error appropriately
} else {
  // Process data
}
```

## Environment Variables

Required environment variables for Supabase connection:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **flights**: Allow all operations (can be restricted with user authentication)
- **transport**: Allow all operations (can be restricted with user authentication)
- **not_travelling**: Allow all operations (can be restricted with user authentication)

### Best Practices

1. Always validate input data before database operations
2. Use TypeScript types for type safety
3. Handle errors gracefully with user-friendly messages
4. Implement optimistic updates for better UX
5. Use transactions for related operations
6. Sanitize user input to prevent injection attacks

## Migration Management

Database schema changes are managed through migration files in `/supabase/migrations/`.

To apply migrations:
1. Use Supabase CLI: `supabase db push`
2. Or apply through Supabase Dashboard

## Performance Considerations

1. **Indexing**: Primary keys are automatically indexed
2. **Query Optimization**: Use specific selects instead of `*` when possible
3. **Pagination**: Implement pagination for large datasets
4. **Caching**: React Query handles caching automatically
5. **Real-time**: Subscribe only to necessary changes