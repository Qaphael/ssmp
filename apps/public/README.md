# SSMP Public Website

A beautiful, compact read-only Next.js website for the School Sports Management Platform (SSMP). Built with modern web technologies and designed for optimal performance and user experience.

## Features

- **Home Page**: Display today's fixtures and active competitions
- **Competition Detail Pages**: View standings, groups, brackets, and fixtures (server-side rendered for SEO)
- **Team Profile Pages**: Display team roster, results, and statistics (server-side rendered for SEO)
- **Player Profile Pages**: Show player stats, personal information, and recent matches (server-side rendered for SEO)
- **Standings Page**: Browse all competitions and their standings tables
- **Beautiful UI**: Built with shadcn/ui components and Tailwind CSS v4
- **Team Branding**: Uses team primary and secondary colors for personalized styling
- **Responsive Design**: Mobile-first approach, works seamlessly on all devices
- **ISR**: Incremental Static Regeneration for optimal caching

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 with Semantic Tokens
- **UI Components**: shadcn/ui (Button, Card, Badge, Tabs, Table, Select)
- **Icons**: Lucide React
- **Types**: Zod schemas from `@ssmp/shared-types` (no custom types)
- **Data Fetching**: Native `fetch()` with Next.js ISR

## Project Structure

```
apps/public/
├── app/
│   ├── layout.tsx              # Root layout with Navigation and Footer
│   ├── page.tsx                # Home page (fixtures & competitions)
│   ├── competitions/
│   │   ├── page.tsx            # Competitions list
│   │   └── [id]/
│   │       └── page.tsx        # Competition detail (SSR)
│   ├── teams/
│   │   └── [id]/
│   │       └── page.tsx        # Team profile (SSR)
│   ├── players/
│   │   └── [id]/
│   │       └── page.tsx        # Player profile (SSR)
│   ├── standings/
│   │   └── page.tsx            # Standings page
│   └── globals.css             # Tailwind v4 global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── fixture-card.tsx        # Sports-specific fixture card
│   ├── standings-table.tsx     # Interactive standings table
│   ├── navigation.tsx          # Top navigation
├── lib/
│   ├── api-client.ts          # API client with ISR caching
│   └── utils.ts               # Utility functions (cn, formatting, colors)
├── package.json
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                 # API URL configuration
```

## Pages

### Home (`/`)
- Displays today's fixtures in a responsive grid
- Shows active competitions with brief details
- Links to competition detail pages
- Static prerendering with ISR

### Competitions List (`/competitions`)
- Browse all competitions
- Filter by name, division, or status
- Click to view competition details
- Static prerendering with ISR

### Competition Detail (`/competitions/[id]`)
- **Standings Tab**: League table with teams, points, W-D-L
- **Fixtures Tab**: All matches in competition
- **Groups Tab**: (if enabled) Group standings
- **Bracket Tab**: (if enabled) Knockout bracket visualization
- Server-side rendered for SEO
- ISR: Revalidates every 5 minutes

### Team Profile (`/teams/[id]`)
- Team hero section with branding colors
- **Roster Tab**: Player grid with jersey numbers and positions
- **Results Tab**: Recent match history
- **Stats Tab**: Win %, goals scored, goals against
- Server-side rendered for SEO
- ISR: Revalidates every 5 minutes

### Player Profile (`/players/[id]`)
- Large player card with jersey number and photo placeholder
- **Stats Grid**: Games, Goals, Assists, Cards
- **Personal Info**: Height, Weight, DOB, Nationality, Status
- **Recent Matches**: Player's match history
- Server-side rendered for SEO
- ISR: Revalidates every 5 minutes

### Standings (`/standings`)
- Competition selector dropdown
- Interactive standings table for each competition
- Sortable columns (rank, team, played, W/D/L, GF/GA, Points)
- Group selector (if groups enabled)
- Client-rendered with React state

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
cd /vercel/share/v0-project
pnpm install

# Install public app dependencies
pnpm add -w --filter @ssmp/public tailwindcss postcss autoprefixer clsx class-variance-authority lucide-react @radix-ui/react-tabs @radix-ui/react-select tailwindcss-animate tailwind-merge
```

### Environment Setup

Create `.env.local` in `apps/public/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Replace `http://localhost:3001` with your API server URL.

### Development

```bash
cd apps/public
pnpm run dev
```

The site will be available at `http://localhost:3000`.

### Production Build

```bash
cd apps/public
pnpm run build
pnpm start
```

## API Integration

The website uses the `apiClient` utility in `lib/api-client.ts` to fetch data. It expects:

**Endpoints** (read-only, no authentication required):
- `GET /api/competitions` - List all competitions
- `GET /api/competitions/:id` - Get competition with standings
- `GET /api/teams` - List teams (optional filter by competitionId)
- `GET /api/teams/:id` - Get team details
- `GET /api/players` - List players (optional filter by teamId)
- `GET /api/players/:id` - Get player details
- `GET /api/matches` - List matches (supports filters: dateFrom, dateTo, status, teamId, competitionId)
- `GET /api/organizations` - List organizations
- `GET /api/seasons` - List seasons

**Data Types**:
All responses use Zod schemas from `@ssmp/shared-types`:
- `Competition`, `Team`, `Player`, `Match`, `Organization`, `Season`
- Enums: `CompetitionStatus`, `MatchStatus`, `PlayerStatus`

## Styling & Theming

### Color System
- **Primary**: Dark backgrounds (#0f172a equivalent) with white text
- **Secondary**: Light greys for accents
- **Accent**: Red/orange for highlights and CTAs
- **Team Colors**: Leverages `Team.primaryColor` and `Team.secondaryColor`

### Design Principles
1. **Compact**: Maximize content density
2. **Bold Typography**: Large headings, clear hierarchy
3. **Team Branding**: Use team colors as accents
4. **Status Colors**: 
   - Green: Completed/Won
   - Orange: Live/In-progress
   - Grey: Scheduled
   - Red: Lost/Cancelled

## Performance Optimizations

1. **ISR (Incremental Static Regeneration)**:
   - Home/Competitions: Revalidate every 5 minutes
   - Live scores: Revalidate every 60 seconds
   - Organization data: Revalidate every hour

2. **Server-Side Rendering**: Competition/Team/Player pages are SSR for search engine indexability

3. **Image Optimization**: Next.js Image component for automatic optimization (configured with `unoptimized: true` for demo)

4. **Code Splitting**: Automatic via Next.js

## Components

### UI Components (shadcn/ui)
- **Button**: Multiple variants and sizes
- **Card**: Container component with header, content, footer
- **Badge**: Status and label badges
- **Tabs**: Tabbed interfaces
- **Table**: Sortable data tables
- **Select**: Dropdown selectors
- **Dialog** (optional): For future modals

### Sports Components
- **FixtureCard**: Match display card with score, teams, status
- **StandingsTable**: League standings with sortable columns
- **Navigation**: Top nav with links
- **Footer**: Site footer with links

## Deployment

### Vercel
```bash
# Connect repository to Vercel
# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL=<your-api-url>

# Deploy
git push
```

### Self-Hosted
```bash
# Build
pnpm run build

# Start
pnpm start
```

Server will run on port 3000 by default.

## Types

All types are imported directly from `@ssmp/shared-types`. No custom types are defined in this project:

```typescript
import type {
  Competition,
  Team,
  Player,
  Match,
  Organization,
  Season,
  CompetitionStatus,
  MatchStatus,
  PlayerStatus,
} from "@ssmp/shared-types"
```

## Future Enhancements

- [ ] Live score updates via WebSocket
- [ ] Search functionality
- [ ] Player stats charts (sparklines)
- [ ] Match detail page with play-by-play
- [ ] Team comparison page
- [ ] Season statistics
- [ ] Advanced filtering and sorting
- [ ] Social sharing
- [ ] Offline mode with service worker

## License

Proprietary - SSMP
