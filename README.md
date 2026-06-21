# The Orange Mate

**Connect, Travel, Share.** The Orange Mate (TOM) is a social platform for solo travelers. Find travel companions, share accommodation and transport costs, and experience incredible adventures alongside people who share your passion for exploring the world.

Built with Next.js 15, Tailwind CSS 4, and Supabase, featuring a brutalist design system with an orange + teal palette.

## ✨ Features

- **Full authentication** — sign up, login, email confirmation, password recovery and change with Supabase Auth
- **Personalized dashboard** — overview, profile, your plans, and discovery in tabs with real-time stats
- **Travel plans** — create, edit, and share plans with type (accommodation, activity, full trip, transport, local outing), dates, budget, and open participation
- **Friends system** — send and receive friend requests, manage your traveler network
- **Real-time chat** — integrated 1-on-1 messaging to coordinate with your travel companions
- **Notifications** — bell with unread badge, real-time notification dropdown
- **Discovery with filters** — browse public plans by type, destination, dates, budget, and more
- **Public profiles** — each user has a public profile with bio, interests, and reviews
- **Reviews system** — rate and review your experiences with other travelers
- **Brutalist design system** — orange + teal palette, bold borders, offset shadows, light and dark themes
- **Dual typography** — Bebas Neue for headings, Oxanium for body
- **Responsive** — optimized for mobile, tablet, and desktop with Tailwind CSS 4
- **TypeScript** — end-to-end type safety
- **E2E tests** — smoke tests with Playwright

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended)
- A [Supabase](https://supabase.com) account

### 1. Clone the repo

```bash
git clone https://github.com/TanisJam/the-orange-mate.git
cd the-orange-mate
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure Supabase

Create a project in Supabase and run the schema:

```bash
# Copy the contents of database-schema.sql into the Supabase SQL Editor
```

Set up the environment variables:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run in development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Project structure

```
.
├── app/                          # Next.js App Router
│   ├── (app)/                   # Authenticated routes (route group)
│   │   ├── dashboard/           # Dashboard with tabs
│   │   ├── discover/            # Discovery page with filters
│   │   ├── friends/             # Friends system
│   │   ├── messages/            # Real-time chat
│   │   ├── notifications/       # Notification center
│   │   ├── plans/               # Plans (detail, creation)
│   │   │   ├── [id]/            # Plan detail
│   │   │   └── new/             # Create plan
│   │   ├── profile/             # Public profile
│   │   └── layout.tsx           # Authenticated shell (nav + footer)
│   ├── auth/                    # Authentication flow
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── sign-up-success/
│   │   ├── confirm/
│   │   ├── forgot-password/
│   │   ├── update-password/
│   │   └── error/
│   ├── demo/                    # Design system demo
│   ├── api/                     # API routes
│   ├── globals.css              # Design system + CSS tokens
│   ├── layout.tsx               # Root layout (fonts, theme provider)
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # shadcn/ui primitives (Button, Card, Badge, Tabs, etc.)
│   ├── auth-button.tsx          # Universal auth button
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   ├── dashboard-content.tsx    # Dashboard with tabs and stats
│   ├── plan-form.tsx            # Plan creation/editing form
│   ├── plan-detail.tsx          # Detailed plan view
│   ├── discover-filters.tsx     # Discovery filters
│   ├── discover-results.tsx     # Search results
│   ├── chat-list.tsx            # Chat list
│   ├── chat-window.tsx          # Chat window
│   ├── message-bubble.tsx       # Message bubble
│   ├── message-input.tsx        # Message input
│   ├── notification-bell.tsx    # Bell with badge
│   ├── notification-dropdown.tsx # Notification dropdown
│   ├── notification-item.tsx    # Notification item
│   ├── friend-card.tsx          # Friend card
│   ├── friend-request-button.tsx # Friend request button
│   ├── friends-page-client.tsx  # Friends page (client)
│   ├── user-profile-form.tsx    # Profile form
│   ├── public-profile-display.tsx # Public profile
│   ├── review-card.tsx          # Review card
│   ├── review-form.tsx          # Review form
│   ├── star-selector.tsx        # Star selector
│   ├── avatar-upload.tsx        # Avatar upload
│   ├── theme-switcher.tsx       # Light/dark toggle
│   ├── back-button.tsx          # Back navigation button
│   ├── page-header.tsx          # Reusable page header
│   ├── app-nav.tsx              # Main authenticated navigation
│   └── app-shell-body.tsx       # Authenticated shell body
├── lib/
│   ├── database.ts              # Server-side Supabase queries
│   ├── database-client.ts       # Client-side queries
│   ├── chat-client.ts           # Chat client
│   ├── notification-client.ts   # Notification client
│   ├── format-date.ts           # Date formatting
│   ├── types.ts                 # Shared types (TravelPlan, UserProfile, etc.)
│   ├── utils.ts                 # General utilities
│   └── supabase/               # Supabase clients (client, server, middleware)
├── supabase/migrations/         # Database migrations
├── tests/                       # E2E tests with Playwright
├── database-schema.sql          # Full database schema
├── middleware.ts                # Authentication middleware
└── package.json
```

## 🎨 Design System

TOM uses a brutalist design system with its own identity:

| Token | Color |
|-------|-------|
| Primary | `#FA8432` (orange) |
| Primary Light | `#FFAE66` |
| Primary Dark | `#D25400` |
| Accent | `#0086A4` (teal) |
| Accent Light | `#14B8C9` |
| Accent Dark | `#006177` |
| Neutral White | `#FDFEFE` |
| Neutral Black | `#191919` |

- **Bold borders** with `border-ink` (black in light mode, white in dark mode)
- **Brutalist offset shadows** (`shadow-[2px_2px_0px_0px]`)
- **Typography**: Bebas Neue (headings) + Oxanium (body)
- **Border radius**: consistent 6px across the entire UI
- **Themes**: light and dark with `next-themes`

## 🧪 Tests

```bash
# E2E smoke tests with Playwright
npx playwright test
```

Configuration in `playwright.config.ts`.

## 🗄️ Database

The full schema is in `database-schema.sql`. Main tables:

- `profiles` — user profiles with bio, interests, country
- `travel_plans` — travel plans with type, status, dates, sharing options
- `plan_participants` — participants and pending members in each plan
- `reviews` — traveler review system
- `friendships` — friend requests and relationships
- `notifications` — notification system
- `messages` — chat messages
- `plan_notes` — collaborative notes on plans

All tables have Row Level Security (RLS) configured.

## 🧰 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint |

## 🏗️ Stack

- [Next.js 15](https://nextjs.org) — App Router, Server Components, Streaming
- [Supabase](https://supabase.com) — Auth, PostgreSQL database, RLS
- [Tailwind CSS 4](https://tailwindcss.com) — Utility-first + CSS-first with `@theme`
- [Radix UI](https://radix-ui.com) — Accessible primitives (Checkbox, Select, Tabs, Dropdown, Label, Slot)
- [shadcn/ui](https://ui.shadcn.com) — Components built on Radix + Tailwind
- [TypeScript](https://typescriptlang.org) — Type safety
- [Lucide React](https://lucide.dev) — Icons
- [next-themes](https://github.com/pacocoursey/next-themes) — Light/dark theme
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — Forms with validation
- [Sonner](https://sonner.emilkowal.ski) — Toasts
- [Playwright](https://playwright.dev) — E2E tests

## 👤 Author

**TanisJam** — [github.com/TanisJam](https://github.com/TanisJam)

## 📄 License

MIT
