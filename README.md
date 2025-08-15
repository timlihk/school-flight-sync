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
- **Auto-Fill**: Intelligent flight lookup using flight number and date
- **Manual Corrections**: Save corrected flight information to improve future lookups
- **Database Updates**: Automatically update similar flights when corrections are saved
- **Outbound & Return**: Separate tracking for outbound and return flights
- **Flight Details**: Store airline, flight numbers, airports, times, and confirmation codes
- **Quick Filters**: "Show Cards with Flights to Book" feature for easy identification

### 🚗 Transport Coordination
- **Ground Transportation**: Manage school coach and taxi arrangements
- **Driver Information**: Store driver names, phone numbers, and license details
- **Pickup Times**: Track scheduled pickup times for each term

### 📋 Task Management
- **To-Do List**: View all terms requiring flight or transport bookings
- **Not Travelling Status**: Mark terms where travel isn't needed
- **Smart Filtering**: Automatically filter out completed or marked terms

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Expandable Cards**: Quick expand/collapse all term cards
- **School Branding**: Color-coded interface for each school
- **Clean Layout**: Side-by-side school comparison view

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
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
│   ├── data/            # Mock data and constants
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   │   └── supabase/    # Supabase client and types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
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
git clone <YOUR_GIT_URL>
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
- `driver_name` (TEXT): Driver's name
- `phone_number` (TEXT): Contact number
- `license_number` (TEXT): Vehicle license
- `pickup_time` (TEXT): Scheduled pickup time
- `notes` (TEXT): Optional notes

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
1. Click "Add Transport" on any term card
2. Enter driver details and pickup times
3. Choose between school coach or taxi options

### Marking "Not Travelling"
For terms where travel arrangements aren't needed:
1. Click the appropriate "Not travelling" button
2. This removes the term from the "Flights to Book" filter

### Using Filters
- **Academic Year**: Filter terms by academic year
- **Expand/Collapse All**: Quickly expand or collapse all term cards
- **Show Flights to Book**: Display only terms needing flight bookings

## Flight Data APIs & Caching

### API Configuration

The application uses multiple APIs with an intelligent fallback system:

1. **Known Schedules** - Pre-configured schedules for common routes (CX238, CX239, BA31, BA32)
2. **AviationStack API** - 100 free requests/month for flight schedules
3. **OpenSky Network** - Unlimited requests for real-time tracking
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

## Support

For issues and questions, please contact the project maintainers or open an issue in the GitHub repository.