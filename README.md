# School Flight Sync

A comprehensive travel management application designed for parents to track their daughters' school term dates and coordinate travel arrangements for Benenden School and Wycombe Abbey School.

## 🎯 Overview

School Flight Sync helps parents manage complex academic calendars, track flight bookings, arrange ground transport, and stay organized with an intelligent to-do system. The application provides a unified view of both schools' schedules with intuitive filtering and management capabilities.

## ✨ Key Features

### 📅 Academic Calendar Management
- **Dual School Support**: Manage terms for both Benenden School and Wycombe Abbey School
- **Academic Year Filtering**: View terms by specific academic year or see all years
- **School-Specific Filtering**: Focus on one school or view both simultaneously
- **Term Types**: Support for terms, half-terms, exeats, holidays, and various leave periods
- **Smart Layout**: Automatic responsive layout adjustment based on selected filters

### ✈️ Flight Management
- **Comprehensive Flight Tracking**: Manage outbound and return flights for each term
- **Flight Details**: Store airline, flight numbers, departure/arrival airports, dates, and times
- **Confirmation Codes**: Track booking confirmations and notes
- **Quick Actions**: Add, edit, and view flights with intuitive interfaces
- **Not Travelling Status**: Mark terms when flights aren't needed

### 🚗 Transport Coordination
- **Ground Transport Planning**: Arrange pickup and drop-off transport
- **Driver Information**: Store driver names, contact details, and vehicle information
- **Pickup Scheduling**: Track pickup times and locations
- **License Tracking**: Maintain driver license numbers for security
- **Transport Status**: Mark when ground transport isn't required

### ✅ Intelligent To-Do System
- **Smart Recommendations**: Automatically identifies missing flight and transport arrangements
- **Urgency Levels**: Color-coded priority system based on upcoming dates
  - **High Priority**: Red (30 days or less for flights, 14 days or less for transport)
  - **Medium Priority**: Orange (60 days or less for flights, 30 days or less for transport)
  - **Low Priority**: Gray (more than 60/30 days respectively)
- **Contextual Actions**: Click any to-do item to view the full term details in a popup
- **Filtering Options**: Filter to-dos by type (flights/transport) and school
- **Live Counter**: Real-time badge showing outstanding tasks

### 🎨 User Interface
- **Modern Design**: Clean, professional interface with consistent styling
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Expandable Cards**: Collapsible term cards for detailed information
- **Popup Modals**: Contextual popups for detailed term management
- **Consistent Controls**: Uniform button sizing and styling throughout
- **Visual Feedback**: Smooth animations and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser
- Git for version control

### Local Development

```bash
# Clone the repository
git clone https://github.com/timlihk/school-flight-sync.git

# Navigate to project directory
cd school-flight-sync

# Install dependencies
npm install

# Start development server
npm run dev

# View at http://localhost:8080
```

### Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Unstyled, accessible UI primitives

### State Management
- **React Query**: Server state management and caching
- **React Hooks**: Local state management with useState and useEffect
- **Custom Hooks**: Reusable logic for flights, transport, and travel status

### Database Integration
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Secure data access patterns
- **Migrations**: Version-controlled database schema changes
- **TypeScript Integration**: Fully typed database client

### Data Models
```typescript
interface Term {
  id: string;
  name: string;
  school: 'benenden' | 'wycombe';
  type: 'term' | 'half-term' | 'exeat' | 'holiday' | 'short-leave' | 'long-leave';
  startDate: Date;
  endDate: Date;
  academicYear: string;
}

interface FlightDetails {
  id: string;
  termId: string;
  type: 'outbound' | 'return';
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: Date;
  departureTime: string;
  arrivalDate: Date;
  arrivalTime: string;
  confirmationCode?: string;
  notes?: string;
}

interface TransportDetails {
  id: string;
  termId: string;
  type: 'pickup' | 'dropoff';
  driverName: string;
  phoneNumber: string;
  pickupTime: string;
  pickupLocation: string;
  licenseNumber: string;
  notes?: string;
}
```

## 🎮 User Guide

### Navigation & Filtering
1. **Academic Year Filter**: Select specific academic year or view all years
2. **School Filter**: Choose between Benenden School, Wycombe Abbey, or both schools
3. **Expand/Collapse**: Use "Expand All" to open all term cards simultaneously

### Managing Flights
1. **Adding Flights**: Click "Add Flight" on any term card
2. **Viewing Flights**: Click on existing flight information to view/edit details
3. **Flight Status**: Mark terms as "Not travelling" when flights aren't needed
4. **Editing**: Click any flight detail to modify booking information

### Managing Transport
1. **Adding Transport**: Click "Add Transport" for ground transportation needs
2. **Driver Details**: Store comprehensive driver and vehicle information
3. **Scheduling**: Set pickup times and locations for seamless coordination
4. **Transport Status**: Mark when ground transport isn't required

### Using the To-Do System
1. **Accessing To-Dos**: Click the "To Do" button to see outstanding tasks
2. **Priority Understanding**: 
   - Red badges indicate urgent items requiring immediate attention
   - Orange badges show medium priority items
   - Gray badges represent future planning items
3. **Taking Action**: Click any to-do item to see the full term context in a popup
4. **Filtering**: Use type and school filters to focus on specific categories

### Working with Term Cards
1. **Expanding Details**: Click term headers to expand full information
2. **Quick Actions**: Use buttons within cards for immediate actions
3. **Popup Context**: Access full term details via to-do system clicks
4. **Status Indicators**: Visual badges show flight and transport completion status

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Create a new Supabase project
2. Run the provided migrations in `/supabase/migrations/`
3. Configure Row Level Security policies as needed
4. Update environment variables with your Supabase credentials

## 📱 Deployment

### Railway Deployment
This application is configured for Railway deployment:

```toml
# railway.toml
[build]
  builder = "NIXPACKS"

[deploy]
  startCommand = "npm run preview"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10

[environments.production.variables]
  NODE_ENV = "production"
```

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables in your hosting platform
4. Ensure proper routing for SPA (Single Page Application)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or support:
1. Check the GitHub Issues page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide browser and system information for technical issues

## 🎓 School Information

### Benenden School
- Official website: [benenden.school](https://www.benenden.school/)
- Term dates: [benenden.school/news/term-dates](https://www.benenden.school/news/term-dates/)

### Wycombe Abbey School  
- Official website: [wycombeabbey.com](https://www.wycombeabbey.com/)
- Term dates: [wycombeabbey.com/term-dates](https://www.wycombeabbey.com/term-dates/)

---

Built with ❤️ for parents managing complex academic schedules
