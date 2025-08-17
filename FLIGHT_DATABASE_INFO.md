# Flight Information Database

## Database Structure

### Supabase Database Table: `flights`

The application stores flight information in a PostgreSQL database hosted on Supabase with the following schema:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier (auto-generated) |
| `term_id` | TEXT | Reference to school term |
| `type` | TEXT | Flight direction ('outbound' or 'return') |
| `airline` | TEXT | Airline name |
| `flight_number` | TEXT | Flight number (e.g., CX238, BA31) |
| `departure_airport` | TEXT | Departure airport code |
| `departure_date` | DATE | Date of departure |
| `departure_time` | TEXT | Time of departure |
| `arrival_airport` | TEXT | Arrival airport code |
| `arrival_date` | DATE | Date of arrival |
| `arrival_time` | TEXT | Time of arrival |
| `confirmation_code` | TEXT | Optional booking reference |
| `notes` | TEXT | Optional additional notes |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

## Pre-configured Flight Schedules

The application has static schedule data for commonly used flights:

### Cathay Pacific Routes

#### CX238 - Hong Kong to London
- **Departure**: HKG at 11:05
- **Arrival**: LHR at 18:00 (same day)
- **Terminal**: T3 at LHR, T1 at HKG
- **Days**: Sunday, Tuesday, Thursday, Saturday

#### CX239 - Hong Kong to London
- **Departure**: HKG at 11:00
- **Arrival**: LHR at 17:55 (same day)
- **Terminal**: T3 at LHR, T1 at HKG
- **Days**: Monday, Wednesday, Friday

#### CX252 - London to Hong Kong
- **Departure**: LHR at 00:05
- **Arrival**: HKG at 18:30 (next day)
- **Terminal**: T3 at LHR, T1 at HKG

#### CX253 - London to Hong Kong
- **Departure**: LHR at 21:45
- **Arrival**: HKG at 17:15 (next day)
- **Terminal**: T3 at LHR, T1 at HKG

### British Airways Routes

#### BA31 - London to Hong Kong
- **Departure**: LHR at 11:25
- **Arrival**: HKG at 06:05 (next day)
- **Terminal**: T5 at LHR, T1 at HKG

#### BA32 - Hong Kong to London
- **Departure**: HKG at 18:40
- **Arrival**: LHR at 23:00 (same day)
- **Terminal**: T1 at HKG, T5 at LHR

## Airport Terminal Mappings

### London Heathrow (LHR)
- **Terminal 5**: BA, IB, EI (British Airways hub)
- **Terminal 3**: CX, VS, DL (Cathay Pacific, Virgin Atlantic)
- **Terminal 4**: AF, KL, EY
- **Terminal 2**: UA, LH, SQ

### Hong Kong International (HKG)
- **Terminal 1**: CX, KA, BA, QF, AA (Cathay Pacific group, OneWorld)

### Other Major Airports
- **Dubai (DXB)**: EK uses T3, BA/LH/AF use T1
- **Singapore (SIN)**: SQ uses T3, BA uses T1
- **Paris CDG**: AF uses T2F, BA uses T2A
- **Frankfurt (FRA)**: LH uses T1

## Airline Code Conversion for FlightAware

The system automatically converts IATA codes to ICAO codes when opening FlightAware:

| IATA | ICAO | Airline |
|------|------|---------|
| CX | CPA | Cathay Pacific |
| BA | BAW | British Airways |
| AY | FIN | Finnair |
| AA | AAL | American Airlines |
| EK | UAE | Emirates |
| QF | QFA | Qantas |
| SQ | SIA | Singapore Airlines |
| LH | DLH | Lufthansa |
| AF | AFR | Air France |
| KL | KLM | KLM |
| UA | UAL | United Airlines |
| DL | DAL | Delta Airlines |
| VS | VIR | Virgin Atlantic |
| JL | JAL | Japan Airlines |
| NH | ANA | All Nippon Airways |
| LX | SWR | Swiss |
| QR | QTR | Qatar Airways |
| EY | ETD | Etihad |
| TG | THA | Thai Airways |
| MH | MAS | Malaysia Airlines |

## Caching System

### Local Cache (Browser localStorage)
- **Duration**: 60 days per flight lookup
- **Capacity**: Up to 200 flight lookups
- **Key Format**: `flight_lookup_cache`
- **Auto-cleanup**: Expired entries removed on app startup

### Cache Benefits
- 98%+ API call reduction for repeated lookups
- Instant response for previously searched flights
- Works offline for cached flights
- Minimizes API costs

## Data Flow

1. **User enters flight number and date**
2. **System checks local cache** (60-day cache)
   - If found and not expired → Return cached data
3. **If not cached, check static schedules** (CX238, CX239, BA31, BA32, etc.)
   - If found → Use static schedule data
4. **If not in static schedules, call APIs** (if configured)
   - AviationStack API (100 requests/month)
   - OpenSky Network (for real-time tracking)
5. **Cache the result** for future use (60 days)
6. **Store in database** when user saves

## API Integration Priority

1. **Local Cache** - Fastest, no API calls
2. **Static Schedules** - Pre-configured common routes
3. **AviationStack API** - Real schedule data (if API key configured)
4. **OpenSky Network** - Real-time tracking (if configured)
5. **Smart Defaults** - Airline-specific fallback times

## Database Access

The flights are stored in Supabase with Row Level Security (RLS) enabled but currently configured to allow all operations (`USING (true)`). This is suitable for family use but should be restricted for production use with proper authentication.

### Environment Variables Required
```
VITE_SUPABASE_URL=https://kwxbjjradsvtaguwdhag.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

## Notes

- The database stores user-entered flight information
- Pre-configured schedules provide quick lookup for common routes
- Terminal information is automatically added based on airline and airport
- FlightAware integration uses converted ICAO codes for accurate tracking
- 60-day cache significantly reduces API usage and costs