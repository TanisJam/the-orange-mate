# The Orange Mate

The Orange Mate (TOM) is a modern web application starter kit designed to connect solo travelers, helping them share experiences, split costs on accommodation and transport, and find like-minded companions for their adventures. Built with the powerful combination of Next.js 15, Tailwind CSS 4, and Supabase, TOM provides a solid foundation to make solo travel more accessible, affordable, and enjoyable.

## ✨ Features

- **Robust Authentication**: Secure user login and registration powered by Supabase with email/password authentication
- **Modern UI Components**: Beautiful and accessible components built with Radix UI and styled with Tailwind CSS
- **Design System**: Comprehensive design system with custom color palette optimized for travel applications
- **Dark Mode Toggle**: User-friendly option to switch between light and dark themes using next-themes
- **Responsive Design**: Optimized for seamless experience across various devices using Tailwind CSS 4
- **Protected Routes**: Secure dashboard areas accessible only to authenticated users
- **TypeScript Support**: Full TypeScript support for better development experience and type safety
- **Modern Next.js**: Built with Next.js 15 App Router for optimal performance and developer experience

## 🚀 Getting Started

Follow these steps to set up and run The Orange Mate locally on your machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **pnpm** (recommended package manager)

### 1. Clone the Repository

```bash
git clone <YOUR_PROJECT_REPOSITORY_URL>
cd the-orange-mate
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Supabase Setup

#### Create a Supabase Project:

1. Go to [Supabase](https://supabase.com) and sign up or log in
2. Create a new project
3. Once your project is created, navigate to **Project Settings > API**

#### Environment Variables:

1. Create a `.env.local` file in the root of your project
2. Copy the following variables and paste your Supabase project's values:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Where:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., `https://abcdefghijk.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your project's "public anon key"

#### Database Schema & Policies:

For the app to function correctly, you will need to set up your Supabase database schema and Row Level Security (RLS) policies.

**Recommended Tables** (for future development):

- `profiles`: `id` (UUID, primary key, references auth.users), `username`, `avatar_url`, `bio`, `age`, `country`, `interests` (JSONB or array of text)
- `travel_plans`: `id` (UUID, primary key), `user_id` (UUID, references profiles.id), `title`, `type`, `destination`, `dates`, `status`, `description`, `share_accommodation`, `share_transport`, `share_tours`
- `plan_notes`: `id`, `plan_id`, `user_id`, `content`, `is_private`
- `comments`: `id`, `plan_id`, `user_id`, `content`
- `chats`: `id`, `user1_id`, `user2_id`
- `messages`: `id`, `chat_id`, `sender_id`, `content`, `created_at`

**RLS**: Ensure you have appropriate RLS policies enabled for each table to secure user data (e.g., users can only view/edit their own profile, but can view public plans).

### 4. Run the Application

```bash
pnpm dev
```

This will start the application in development mode. Open [http://localhost:3000](http://localhost:3000) in your browser to see The Orange Mate in action.

## 📁 Project Structure

```
.
├── app/                    # Next.js App Router (routes, layouts, pages)
│   ├── auth/              # Authentication pages (login, sign-up, etc.)
│   │   ├── login/         # Login page
│   │   ├── sign-up/       # Registration page
│   │   ├── confirm/       # Email confirmation
│   │   └── ...           # Other auth-related pages
│   ├── protected/         # Protected dashboard pages
│   ├── globals.css        # Global styles and design system variables
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Button, Input, etc.)
│   ├── auth-button.tsx   # Authentication button component
│   ├── login-form.tsx    # Login form component
│   ├── sign-up-form.tsx  # Registration form component
│   └── ...               # Other reusable components
├── lib/                  # Utility functions and configurations
│   ├── supabase/         # Supabase client configurations
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client
│   │   └── middleware.ts # Middleware client
│   └── utils.ts          # Utility functions
├── .env.local            # Local environment variables (DO NOT COMMIT)
├── components.json       # shadcn/ui configuration
├── middleware.ts         # Next.js middleware for auth
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration (auto-generated)
└── tsconfig.json         # TypeScript configuration
```

## 💡 Usage & Key Concepts

### Supabase Integration

The Supabase client is configured with multiple instances for different environments:

#### Server Components/API Routes:

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      {user ? `Welcome, ${user.email}!` : 'Please log in'}
    </div>
  );
}
```

#### Client Components:

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

function MyComponent() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  return <div>{user ? user.email : 'Loading...'}</div>;
}
```

### Tailwind CSS Styling

The project uses Tailwind CSS 4 with a custom design system. The color palette is optimized for travel applications:

```jsx
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-[--radius] transition-colors">
  Create New Plan
</button>
```

Custom design system colors available:
- **Primary**: `primary-light`, `primary`, `primary-dark` (Orange tones)
- **Secondary**: `secondary-light`, `secondary`, `secondary-dark` (Blue tones)
- **Accent**: `accent-light`, `accent`, `accent-dark` (Brown tones)
- **Neutral**: `neutral-white`, `neutral-light`, `neutral-gray`, `neutral-black`
- **Status**: `error`, `success`

### Authentication Flow

The application includes a complete authentication system with:

- **Login/Registration** forms with validation
- **Email confirmation** workflow
- **Password reset** functionality
- **Protected routes** with automatic redirects
- **Session management** across the entire app

### Theme System

Dark mode is implemented using `next-themes`:

```jsx
import { ThemeSwitcher } from '@/components/theme-switcher';

// Use the theme switcher component
<ThemeSwitcher />
```

## 🧪 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint for code quality

## 🤝 Contributing

Contributions are highly encouraged! If you find a bug, have a feature request, or want to improve the codebase, please open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes and commit them (`git commit -m 'feat: adds new feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for more details.

## 🔗 Built With

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [Supabase](https://supabase.com) - Backend as a Service with authentication
- [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- [Radix UI](https://radix-ui.com) - Accessible component primitives
- [TypeScript](https://typescriptlang.org) - Type-safe JavaScript
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

---

**Happy Coding with The Orange Mate!** 🍊

(README created by Claude)
