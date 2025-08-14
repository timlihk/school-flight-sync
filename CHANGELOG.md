# Changelog

All notable changes to the School Flight Sync project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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