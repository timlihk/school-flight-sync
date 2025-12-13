# Changelog

All notable changes to the School Flight Sync project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.6.0] - 2025-12-14

### Added
- **Calendar Event Filtering**: Calendar events now only show future events (including today)
  - Historical events (yesterday and earlier) are automatically hidden
  - Uses `date-fns` `isAfter` and `isToday` functions for accurate date comparison
  - Consistent filtering across both full calendar and compact calendar views

### Technical
- Updated `use-calendar-events.ts` hook with date filtering logic
- Added `isAfter` and `isToday` imports from `date-fns`
- Maintained backward compatibility with existing calendar components
- TypeScript compilation passes cleanly after dependency updates

## [2.3.0] - 2025-09-06

### Added
- **Smart Transport Card Separation**: Implemented index-based filtering to separate transport between departure and return travel cards
- **Enhanced Travel Card UI**: Improved dual travel card layout for exeats and half-terms
- **Frontend-Only Solution**: Transport filtering works without database schema changes

### Fixed
- **Transport Duplication Bug**: Resolved issue where transport details appeared in both "Travel from School" and "Return to School" cards
- **Transport Saving Errors**: Fixed database errors when adding transport details
- **UI Consistency**: Improved transport display consistency across travel cards

### Changed
- **Simplified Transport Management**: Removed complex database direction field approach in favor of frontend-only filtering
- **Index-Based Organization**: Even-indexed transport entries appear in departure card, odd-indexed in return card
- **Improved User Experience**: Clear separation between outbound and return transport arrangements

### Technical
- Reverted database migration approach to maintain backward compatibility
- Simplified transport filtering logic using array index modulation
- Enhanced error handling for transport operations
- Improved TypeScript type safety for transport interfaces

## [2.2.0] - 2025-01-17

### Added
- **FlightAware Integration**: Direct link to FlightAware for real-time flight status tracking
  - Automatic airline code conversion (IATA to ICAO format)
  - Support for 20+ major airlines including CX→CPA, BA→BAW, AY→FIN
  - One-click status refresh button on flight cards
- **Enhanced Flight Data System**:
  - Intelligent flight correction system for manual data updates
  - 60-day caching system for API efficiency
  - OpenSky Network integration with airport prioritization
  - Static flight schedules for common routes (CX238, CX239, BA31, BA32)
- **Improved Terminal Data**: Enhanced terminal capture from AviationStack API
- **TypeScript Improvements**: Fixed all strict mode errors and improved type safety

### Changed
- **UI Rebranding**: Application renamed from "School Flight Sync" to "UK Schedules"
- **Simplified Interface**: 
  - Removed verbose descriptive text from header
  - Removed "Family Account" label for cleaner design
  - Minimalist approach to UI elements
- **Flight Status System**: Replaced API-based status with FlightAware redirect
- **API Architecture**: Implemented robust fallback system with multiple data sources

### Fixed
- **TypeScript Errors**: Resolved all critical TypeScript compilation errors
- **API Rate Limiting**: Fixed OpenSky API rate limiting with intelligent prioritization
- **Flight Corrections**: Fixed correction system for editing existing flights
- **Transport Dialog**: Fixed loading errors and eliminated lazy loading issues
- **Terminal Assignments**: Fixed Cathay Pacific terminal assignment at LHR to T3
- **First-Click Issues**: Fixed flight status update issue on first click

### Technical
- **Code Quality**: Implemented proper error handling and type safety
- **Performance**: Extended cache duration to 60 days for maximum efficiency
- **API Integration**: Added comprehensive debugging for API calls
- **Build System**: All TypeScript errors resolved for clean builds

### Security
- 🚨 **CRITICAL**: Identified major security vulnerabilities requiring immediate attention
- Added comprehensive security documentation (SECURITY.md)
- Security warnings added to all project documentation
- CTO-level technical review completed with security assessment

### Documentation
- Complete overhaul of README.md with current project status and security notices
- Added detailed security vulnerability documentation
- Enhanced development guidelines and contribution requirements
- Updated branding from "School Flight Sync" to "UK Schedules"

## [2.1.1] - 2025-01-14

### Removed
- **PDF Export Functionality**: Completely removed due to implementation issues
  - Removed ExportDialog component and all related imports
  - Deleted PDF service files (pdf-export.ts, pdf-export-visual.ts, pdf-export-exact.ts)
  - Uninstalled PDF-related dependencies (jspdf, jspdf-autotable, @types/jspdf)
  - Cleaned up handleExportPDF function and related code

### Fixed
- Flight confirmation code display in half-term/exeat travel sub-cards
- Improved data filtering for confirmation code display

## [2.1.0] - 2025-01-14

### Added
- **School Filter Dropdown**: New dropdown menu to filter view by school
  - Options: Both Schools (default), Benenden School, Wycombe Abbey School
  - Smart layout adjustment: single column when filtering by one school
  - Maintains responsive design across all filter options

- **Popup Term Card Functionality**: Enhanced To-Do system interaction
  - Click any To-Do item to view full term card in a popup modal
  - Interactive term card within popup with all standard functionality
  - Seamless navigation from To-Do → Term Card → Action dialogs
  - Automatic popup closure when taking actions (Add Flight/Transport)

- **UI Consistency Improvements**:
  - Standardized button sizing across all filter controls
  - Consistent font weights between dropdowns and buttons
  - Improved visual alignment and spacing
  - Enhanced accessibility with proper focus states

### Changed
- **Removed "Show Cards with Flights to Book" button** in favor of school filter
- **Improved To-Do workflow**: Context-first approach with popup term cards
- **Enhanced user experience**: Better visual feedback and interaction patterns
- **Layout optimization**: Dynamic grid system based on selected filters

### Technical
- Added `Dialog` component integration for popup modals
- Enhanced state management for popup term card display
- Improved component prop interfaces with optional callbacks
- Added unique ID system for term cards to support scroll targeting
- Optimized component rendering with conditional display logic

## [2.0.0] - 2025-01-13

### Added
- **"Not Travelling" Status System**: Ability to mark terms when flights/transport aren't needed
- **Enhanced Transport Management**: Comprehensive ground transportation tracking
- **Improved To-Do System**: Smart priority detection with urgency levels
- **Visual Status Indicators**: Color-coded badges for completion status

### Changed
- **Database Schema Updates**: New columns for travel status tracking
- **UI/UX Improvements**: Enhanced card layouts and visual feedback
- **Performance Optimizations**: Better state management and rendering

### Fixed
- **Data Persistence**: Improved reliability of status updates
- **Migration Issues**: Resolved database migration conflicts
- **UI Consistency**: Standardized component styling

## [1.0.0] - 2025-01-10

### Added
- **Initial Release**: Core application functionality
- **Dual School Support**: Benenden School and Wycombe Abbey School
- **Flight Management**: Complete flight booking and tracking system
- **Transport Coordination**: Ground transportation planning
- **Academic Calendar**: Term date management and filtering
- **To-Do System**: Intelligent task recommendations
- **Modern UI**: Responsive design with shadcn/ui components
- **Database Integration**: Supabase backend with TypeScript
- **Railway Deployment**: Production-ready hosting configuration

### Technical Foundation
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase** for backend services
- **shadcn/ui** component library
- **React Query** for state management

---

## 🚨 Critical Security Issues (Identified but Unresolved)

### Database Security
- **Hardcoded Credentials**: Supabase URL and API keys exposed in client-side code
- **No Authentication**: Application lacks user authentication system
- **Over-Permissive Policies**: Database policies allow unrestricted access (`USING (true)`)

### Data Privacy
- **Missing COPPA Compliance**: No parental consent for children's data
- **Missing GDPR Compliance**: No privacy policy, consent mechanisms, or data protection
- **Missing FERPA Compliance**: Educational data not properly protected
- **Unencrypted Sensitive Data**: Personal information stored in plain text

### Technical Debt
- **No Testing Infrastructure**: Zero test coverage
- **Disabled TypeScript Strict Mode**: Safety features turned off
- **Missing Error Boundaries**: No proper error handling
- **Performance Issues**: No code splitting or optimization

### Required Immediate Actions
1. Move database credentials to environment variables
2. Implement user authentication system
3. Add proper database security policies
4. Implement privacy compliance measures
5. Add comprehensive testing suite

**⚠️ WARNING**: This application is NOT suitable for production deployment until these security issues are resolved.

---

## Migration Guide

### From 2.1.0 to 2.1.1
- PDF export functionality has been completely removed
- No breaking changes to core functionality
- Dependencies have been cleaned up automatically

### Environment Setup
```bash
# For new installations
npm install

# For upgrades, PDF dependencies are automatically removed
```

### Security Setup (Required for Production)
```bash
# Create environment file
touch .env.local

# Add required variables (see SECURITY.md for details)
echo "VITE_SUPABASE_URL=your_url_here" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=your_key_here" >> .env.local
```

## Contributing

Before contributing to this project:
1. Review SECURITY.md for security requirements
2. Ensure all changes maintain security best practices
3. Add appropriate tests for new functionality
4. Follow TypeScript strict mode guidelines

## Support & Issues

- **Security Issues**: See SECURITY.md for reporting procedures
- **Bug Reports**: Use GitHub Issues with detailed reproduction steps
- **Feature Requests**: Use GitHub Issues with clear requirements

---

**Last Updated**: 2025-12-14
**Security Status**: ⛔ UNSAFE FOR PRODUCTION
**Next Security Review**: After critical vulnerabilities are addressed