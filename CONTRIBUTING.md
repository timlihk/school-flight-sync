# Contributing to School Flight Sync

We love your input! We want to make contributing to School Flight Sync as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. **Fork the repo** and create your branch from `main`
2. **Add tests** if you've added code that should be tested
3. **Update documentation** if you've changed APIs or added features
4. **Ensure the test suite passes** by running `npm test`
5. **Make sure your code lints** by running `npm run lint`
6. **Create a pull request** with a clear description

### Branch Naming Convention

Use descriptive branch names that follow this pattern:
- `feature/description-of-feature`
- `fix/description-of-fix`
- `docs/description-of-documentation-change`
- `refactor/description-of-refactor`

Examples:
- `feature/school-filter-dropdown`
- `fix/popup-modal-overflow`
- `docs/update-api-documentation`

## Code Style Guidelines

### TypeScript & React

- Use **functional components** with hooks
- Prefer **explicit typing** over `any`
- Use **destructuring** for props and state
- Follow **React hooks rules** and conventions
- Use **custom hooks** for reusable logic

```typescript
// Good
interface TermCardProps {
  term: Term;
  onAddFlight: (termId: string) => void;
}

const TermCard: React.FC<TermCardProps> = ({ term, onAddFlight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // ...
};

// Avoid
const TermCard = (props: any) => {
  // ...
};
```

### CSS & Styling

- Use **Tailwind CSS** utility classes
- Follow **responsive design** principles
- Use **CSS variables** for theme consistency
- Prefer **Flexbox** and **Grid** for layouts

```tsx
// Good
<div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">

// Avoid
<div style={{ display: 'flex', padding: '16px' }}>
```

### Component Structure

Organize components with this structure:

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ prop }: ComponentProps) {
  // 4. Hooks and state
  const [state, setState] = useState(false);
  
  // 5. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Testing Guidelines

### Unit Tests
- Write tests for all **utility functions**
- Test **custom hooks** thoroughly
- Mock external dependencies
- Aim for **80%+ code coverage**

### Integration Tests
- Test **user workflows** end-to-end
- Verify **form submissions** work correctly
- Test **data persistence** and retrieval
- Ensure **responsive behavior** works

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Database Changes

### Migrations
When making database changes:

1. **Create a new migration file** in `supabase/migrations/`
2. **Use descriptive names** with timestamps
3. **Include both UP and DOWN migrations** when possible
4. **Test migrations locally** before submitting
5. **Document schema changes** in pull request

### Example Migration
```sql
-- Migration: 20250114120000_add_term_status_column.sql

-- Add status column to terms table
ALTER TABLE public.terms 
ADD COLUMN status TEXT CHECK (status IN ('active', 'cancelled', 'postponed')) 
DEFAULT 'active';

-- Create index for performance
CREATE INDEX idx_terms_status ON public.terms(status);
```

## Documentation Standards

### Code Documentation
- Use **JSDoc comments** for complex functions
- Document **component props** with clear descriptions
- Include **usage examples** in complex components
- Keep comments **up-to-date** with code changes

```typescript
/**
 * Handles flight booking for a specific term
 * @param termId - Unique identifier for the academic term
 * @param flightDetails - Complete flight information
 * @returns Promise that resolves when booking is complete
 * @example
 * await handleFlightBooking('term-123', {
 *   airline: 'BA',
 *   flightNumber: 'BA123',
 *   // ...
 * });
 */
async function handleFlightBooking(
  termId: string, 
  flightDetails: FlightDetails
): Promise<void> {
  // Implementation
}
```

### README Updates
When adding features:
- Update the **Features** section
- Add **usage examples** if applicable
- Update **screenshots** if UI changed
- Update **API documentation** if backend changed

## Issue Reporting

### Bug Reports
Include:
- **Browser and version**
- **Operating system**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Console errors** (if any)

### Feature Requests
Include:
- **Clear description** of the feature
- **Use case** and motivation
- **Proposed solution** (if you have one)
- **Alternative solutions** considered
- **Screenshots/mockups** (if helpful)

## Security Guidelines

### Data Handling
- **Never commit** API keys or secrets
- Use **environment variables** for configuration
- Implement **input validation** on both client and server
- Follow **Row Level Security** patterns in Supabase
- **Sanitize user input** to prevent XSS attacks

### Authentication
- Use **secure authentication** patterns
- Implement **proper authorization** checks
- Follow **OWASP security guidelines**
- **Audit dependencies** regularly for vulnerabilities

## Performance Guidelines

### Frontend Performance
- Use **React.memo()** for expensive components
- Implement **lazy loading** for routes
- **Optimize images** and assets
- **Minimize bundle size** with code splitting
- **Monitor performance** metrics

### Backend Performance
- **Index database queries** appropriately
- **Limit query results** with pagination
- **Cache frequently accessed data**
- **Optimize database queries**
- **Monitor response times**

## Community Guidelines

### Code of Conduct
- **Be respectful** and inclusive
- **Welcome newcomers** and help them contribute
- **Focus on constructive feedback**
- **Celebrate others' contributions**
- **Maintain professional communication**

### Getting Help
- **Search existing issues** before creating new ones
- **Use descriptive titles** for issues and PRs
- **Provide context** and background information
- **Be patient** with review process
- **Ask questions** if something is unclear

## Development Setup

### Prerequisites
```bash
# Node.js 18+
node --version

# npm or yarn
npm --version

# Git
git --version
```

### Environment Setup
1. **Clone the repository**
```bash
git clone https://github.com/timlihk/school-flight-sync.git
cd school-flight-sync
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start development server**
```bash
npm run dev
```

5. **Run tests**
```bash
npm test
```

## Release Process

### Version Bumping
- **Patch** (1.0.x): Bug fixes and minor changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Tagged release in Git
- [ ] Deployed to production

---

Thank you for contributing to School Flight Sync! 🎉