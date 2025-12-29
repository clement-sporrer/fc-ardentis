# Contributing to FC Ardentis

Thank you for your interest in contributing to the FC Ardentis website!

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Project Architecture](#project-architecture)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/clement-sporrer/fc-ardentis.git
cd fc-ardentis

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

---

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `refactor/` | Code refactoring |
| `docs/` | Documentation |
| `style/` | Styling changes |

Examples:
- `feature/add-player-stats`
- `fix/cart-total-calculation`
- `docs/update-readme`

### Development Process

1. Create a branch from `main`
2. Make your changes
3. Test locally
4. Commit with meaningful messages
5. Push and create pull request
6. Address review feedback
7. Merge after approval

---

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define types for props and state
- Avoid `any` type when possible

```typescript
// Good
interface PlayerProps {
  name: string;
  number: number;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
}

// Avoid
const Player = (props: any) => { ... }
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to custom hooks

```typescript
// Good - focused component
const PlayerCard = ({ player }: { player: Player }) => {
  return (
    <Card>
      <CardContent>
        <h3>{player.name}</h3>
        <p>{player.position}</p>
      </CardContent>
    </Card>
  );
};
```

### Styling

- Use TailwindCSS utility classes
- Use CSS variables for theme colors
- Follow mobile-first responsive design

```tsx
// Good - using Tailwind and CSS variables
<Button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 md:px-6">
  Click me
</Button>

// Avoid - inline styles
<button style={{ backgroundColor: '#888ce6', padding: '8px 16px' }}>
  Click me
</button>
```

### File Organization

- One component per file
- Name files after the component
- Group related files in folders

```
components/
├── PlayerCard.tsx       # Single component
├── PlayerList.tsx       # Uses PlayerCard
└── player/              # Complex feature
    ├── PlayerStats.tsx
    ├── PlayerHistory.tsx
    └── index.ts         # Exports
```

---

## Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```
feat(shop): add size guide modal

fix(cart): correct total calculation for multiple items

docs(readme): update installation instructions

refactor(checkout): extract validation logic to utils
```

---

## Pull Requests

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tested on mobile and desktop
- [ ] Updated documentation if needed

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test these changes?

## Screenshots (if UI changes)
Add screenshots for visual changes
```

### Review Process

1. Automated checks run on PR creation
2. Request review from maintainers
3. Address feedback with additional commits
4. Squash and merge after approval

---

## Project Architecture

### Key Concepts

1. **Pages** - Route components in `src/pages/`
2. **Components** - Reusable UI in `src/components/`
3. **Contexts** - Global state in `src/contexts/`
4. **Utils** - Shared functions in `src/lib/utils.ts`
5. **API** - Serverless functions in `api/`

### Data Flow

```
Google Sheets (CSV)
        ↓
   Frontend Fetch
        ↓
   React Component
        ↓
   User Interaction
        ↓
    CartContext
        ↓
   API (/api/checkout)
        ↓
   Stripe + Google Sheets
```

### Adding a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link if needed
4. Update documentation

### Adding a New Component

1. Create in `src/components/NewComponent.tsx`
2. Use TypeScript for props
3. Follow existing patterns
4. Add to exports if needed

---

## Questions?

- Check existing documentation in `/docs`
- Open a GitHub issue for bugs
- Contact the maintainers for guidance

---

Thank you for contributing!

