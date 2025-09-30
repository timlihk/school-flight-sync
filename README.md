# School Flight Sync

A comprehensive web application for managing UK boarding school term dates and travel arrangements for multiple students across different schools.

## Overview

School Flight Sync is designed to help parents efficiently manage and track:
- School term dates for multiple UK boarding schools
- Flight bookings for term start/end dates
- Ground transportation arrangements
- Academic calendars across different schools
- Travel coordination for multiple children

## Features

### 📅 Term Management
- **Multi-School Support**: Track term dates for Benenden School and Wycombe Abbey School
- **Academic Year Filtering**: View terms by academic year (2025-2026, 2026-2027)
- **Term Types**: Differentiate between regular terms, half-terms, exeats, and holidays
- **Detailed Schedules**: View specific arrival/departure times and important dates

### ✈️ Flight Tracking
- **Flight Management**: Add, edit, and remove flight details for each term
- **FlightAware Integration**: Direct link to FlightAware for real-time flight status
- **Airline Code Conversion**: Automatic conversion of IATA codes to FlightAware's ICAO format (CX→CPA, BA→BAW, etc.)
- **Smart Flight Lookup**: Pre-configured schedules for common routes (CX238, CX239, BA31, BA32)
- **Manual Corrections**: Save corrected flight information to improve future lookups
- **Database Updates**: Automatically update similar flights when corrections are saved
- **Outbound & Return**: Separate tracking for outbound and return flights
- **Flight Details**: Store airline, flight numbers, airports, times, and confirmation codes
- **Quick Status Check**: Refresh button opens FlightAware with converted airline codes

### 🚗 Transport Coordination
- **Ground Transportation**: Manage school coach and taxi arrangements
- **Direction-Based Filtering**: Explicit outbound/return direction field for clear transport organization
- **Service Provider Database**: Reusable provider database with auto-complete functionality
- **Provider Management**: Store provider ratings (1-5 stars), contact details, and vehicle information
- **Auto-Fill Forms**: Select existing providers to automatically populate transport forms
- **Driver Information**: Store driver names, phone numbers, and license details
- **Pickup Times**: Track scheduled pickup times for each term
- **Visual Indicators**: ✈️ From School and 🏠 To School labels for easy identification

### 📋 Task Management
- **To-Do List**: View all terms requiring flight or transport bookings
- **Not Travelling Status**: Mark terms where travel isn't needed
- **Smart Filtering**: Automatically filter out completed or marked terms

### 🎨 User Interface
- **Minimalist Design**: Clean, simplified interface with "School Flight Sync" branding
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Expandable Cards**: Quick expand/collapse all term cards
- **Dual Travel Cards**: Separate cards for departure ("Travel from School") and return ("Return to School") journeys
- **School Filtering**: Dropdown to view specific schools or both
- **School Branding**: Color-coded interface for each school (Benenden purple, Wycombe blue)
- **Clean Layout**: Side-by-side school comparison view

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Project Structure

```
school-flight-sync/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── school-header.tsx
│   ├── config/          # Configuration files
│   │   └── airlineCodes.ts  # IATA to ICAO airline code mappings
│   ├── data/            # Mock data and constants
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   │   └── supabase/    # Supabase client and types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── test/            # Test setup and utilities
│   └── types/           # TypeScript type definitions
├── supabase/
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for database)

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/timlihk/school-flight-sync.git
cd school-flight-sync
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**

Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run database migrations**

Apply the database schema using Supabase CLI or through the Supabase dashboard.

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development environment
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run check` - Run both typecheck and lint

## Database Schema

### Tables

#### `flights`
- `id` (UUID): Primary key
- `term_id` (TEXT): Reference to term
- `type` (TEXT): 'outbound' or 'return'
- `airline` (TEXT): Airline name
- `flight_number` (TEXT): Flight number
- `departure_airport` (TEXT): Departure airport code
- `departure_date` (DATE): Departure date
- `departure_time` (TEXT): Departure time
- `arrival_airport` (TEXT): Arrival airport code
- `arrival_date` (DATE): Arrival date
- `arrival_time` (TEXT): Arrival time
- `confirmation_code` (TEXT): Optional booking reference
- `notes` (TEXT): Optional notes

#### `transport`
- `id` (UUID): Primary key
- `term_id` (TEXT): Reference to term
- `type` (TEXT): 'school-coach' or 'taxi'
- `direction` (TEXT): 'outbound' or 'return' (from school vs to school)
- `driver_name` (TEXT): Driver's name
- `phone_number` (TEXT): Contact number
- `license_number` (TEXT): Vehicle license
- `pickup_time` (TEXT): Scheduled pickup time
- `notes` (TEXT): Optional notes

#### `service_providers`
- `id` (UUID): Primary key
- `name` (TEXT): Provider company name
- `phone_number` (TEXT): Contact phone number
- `license_number` (TEXT): Vehicle license (optional)
- `vehicle_type` (TEXT): 'school-coach' or 'taxi'
- `email` (TEXT): Contact email (optional)
- `notes` (TEXT): Additional notes (optional)
- `rating` (INTEGER): Provider rating 1-5 stars (optional)
- `is_active` (BOOLEAN): Active status for soft delete
- `created_at`, `updated_at` (TIMESTAMP): Audit fields

#### `not_travelling`
- `id` (UUID): Primary key
- `term_id` (TEXT): Reference to term
- `no_flights` (BOOLEAN): Not taking flights
- `no_transport` (BOOLEAN): Not using transport

## Usage Guide

### Adding Flight Information
1. Click on a term card or use the "Add Flight" button
2. Enter flight number and departure date
3. Click "Auto-fill" to automatically populate flight details from APIs
4. Edit any incorrect information manually
5. Click "Save Correction" to update cache and database with corrected data
6. Save to store the information in the database

### Manual Flight Corrections
When auto-filled flight information is incorrect:
1. Enable "Show Advanced" to edit auto-filled fields
2. Correct the wrong information (times, airports, terminals)
3. Click "Save Correction" to:
   - Update the 60-day cache with correct data
   - Find and update similar flights in your database
   - Ensure future lookups use the corrected information
4. The correction applies to all flights with the same flight number

### Managing Transport
1. **For Two-Way Trips (Exeats, Half-Terms)**: Each term shows two travel cards
   - "Travel from School" card: Add transport for departure journey
   - "Return to School" card: Add transport for return journey
2. **Adding Transport**: Click "Add Transport" on the specific travel card
3. **Service Provider Selection**: Use the auto-complete combobox to:
   - Select existing service providers (automatically fills form)
   - Filter providers by vehicle type (school-coach vs taxi)
   - Create new providers when entering manual details
4. **Enter Details**: Driver name, phone number, license, pickup time
5. **Provider Ratings**: Rate providers 1-5 stars for future reference
6. **Automatic Separation**: Transport entries are automatically kept separate between departure and return cards

### Marking "Not Travelling"
For terms where travel arrangements aren't needed:
1. Click the appropriate "Not travelling" button
2. This removes the term from the "Flights to Book" filter

### Using Filters
- **Academic Year**: Filter terms by academic year
- **Expand/Collapse All**: Quickly expand or collapse all term cards
- **Show Flights to Book**: Display only terms needing flight bookings

## Flight Data & Status Tracking

### FlightAware Integration

The application now uses FlightAware for real-time flight status:

1. **Direct Status Links** - Click refresh button to open FlightAware for any flight
2. **Airline Code Conversion** - Automatic conversion of 20+ airline codes:
   - Cathay Pacific: CX → CPA
   - British Airways: BA → BAW
   - Finnair: AY → FIN
   - And 17 more major airlines
3. **Known Schedules** - Pre-configured schedules for common routes
4. **Smart Defaults** - Airline-specific fallback times

### Caching System

To maximize API efficiency, the app includes intelligent 2-month caching:

- **Cache Duration**: 60 days per flight lookup
- **Storage**: Browser localStorage  
- **Capacity**: Up to 200 flight lookups
- **Auto-cleanup**: Expired entries removed on app startup

#### Benefits:
- **98%+ API call reduction** - Once looked up, no API calls for 2 months
- Instant response for all previously searched flights
- With 100 API calls/month, you can effectively search 2,000+ flights
- Works completely offline for cached flights

#### How It Works:
1. **First lookup**: Uses AviationStack API (1 call) + caches for 60 days
2. **Subsequent lookups**: Instant from cache (0 API calls)
3. **After 60 days**: Cache expires, fresh API lookup occurs

#### Cache Management:
- Cache automatically expires after 60 days
- Old entries auto-deleted when cache reaches 200 flights
- Cache stats shown in browser console on startup

### API Keys Setup

Add these to your `.env` file:

```bash
# AviationStack - 100 requests/month
VITE_AVIATIONSTACK_API_KEY=your_key_here

# OpenSky Network (optional but recommended)
VITE_OPENSKY_CLIENT_ID=your_client_id
VITE_OPENSKY_CLIENT_SECRET=your_client_secret
```

## Deployment

### Using Lovable
Simply open [Lovable](https://lovable.dev) and click on Share -> Publish.

### Manual Deployment
1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

3. Ensure environment variables are configured in your deployment environment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Recent Updates

### v2.3.0 (September 2025)
- 🎯 **Code Quality**: Reduced ESLint warnings from 57 to 8 (86% reduction)
- 🧪 **Test Suite**: Added Vitest + React Testing Library with 9 passing tests
- ✈️ **Airline Config**: Extracted airline code mappings to reusable config file
- 🚗 **Transport Direction**: Added explicit direction field (outbound/return) replacing index-based filtering
- 🔧 **Better Architecture**: Clearer code organization and improved maintainability
- 📝 **Type Safety**: Enhanced TypeScript definitions across the codebase

### v2.2.0 (September 2025)
- ✨ **Service Provider Database**: Complete provider management system with auto-complete functionality
- ⭐ **Provider Ratings**: 1-5 star rating system for transport providers
- 🔗 **Auto-Fill Integration**: Selecting providers automatically populates transport forms
- 📊 **Provider Analytics**: Track and manage preferred transport providers
- 🗄️ **Soft Delete**: Provider data retention with active/inactive status

### v2.1.0 (September 2025)
- ✨ **Transport Filtering**: Implemented smart transport separation between departure and return travel cards
- 🔧 **UI Improvements**: Enhanced dual travel card layout for exeats and half-terms
- 🚗 **Bug Fix**: Resolved transport duplication issue where same transport appeared in both cards

### v2.0.0 (August 2025)
- ✈️ **FlightAware Integration**: Direct flight status links with automatic airline code conversion
- 📊 **Real-Time Status**: Click refresh to open FlightAware for any flight
- 🔄 **Airline Conversion**: Support for 20+ major airlines (CX→CPA, BA→BAW, etc.)
- 💾 **Smart Caching**: 60-day flight data caching for 98%+ API call reduction
- 🎯 **Flight Corrections**: Save and apply corrections to improve future lookups

## Troubleshooting

### Common Issues

**Transport not saving**: Ensure all required fields are filled (driver name, phone, license, pickup time)

**Service provider not appearing**: Check that the provider is marked as active and matches the correct vehicle type filter

**Flight status not loading**: Check that your API keys are correctly set in the environment variables

**Transport appearing in wrong card**: Ensure the correct direction (outbound/return) is selected when adding transport

**Cache not working**: Check browser console for cache statistics on app startup

## Support

For issues and questions, please contact the project maintainers or open an issue in the GitHub repository.