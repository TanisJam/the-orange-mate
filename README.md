# The Orange Mate

**Conecta, Viaja, Comparte.** The Orange Mate (TOM) es una plataforma social para viajeros solitarios. Descubrí compañeros de viaje, compartí gastos de alojamiento y transporte, y viví experiencias increíbles junto a personas que comparten tu pasión por explorar el mundo.

Construida con Next.js 15, Tailwind CSS 4 y Supabase, con un design system brutalista en paleta naranja + teal.

## ✨ Features

- **Autenticación completa** — registro, login, confirmación de email, recuperación y cambio de contraseña con Supabase Auth
- **Dashboard personalizado** — resumen, perfil, planes propios y descubrimiento en tabs con stats en tiempo real
- **Planes de viaje** — creá, editá y compartí planes con tipo (alojamiento, actividad, viaje completo, transporte, salida local), fechas, presupuesto y participación abierta
- **Sistema de amigos** — enviá y recibí solicitudes de amistad, gestioná tu red de viajeros
- **Chat en tiempo real** — mensajería 1-a-1 integrada para coordinar con tus compañeros de viaje
- **Notificaciones** — campana con badge de no leídos, dropdown de notificaciones en tiempo real
- **Descubrimiento con filtros** — buscá planes públicos por tipo, destino, fechas, presupuesto y más
- **Perfiles públicos** — cada usuario tiene un perfil público con bio, intereses y reviews
- **Sistema de reviews** — calificá y comentá sobre tus experiencias con otros viajeros
- **Design system brutalista** — paleta naranja + teal, bordes marcados, sombras offset, temas claro y oscuro
- **Tipografía dual** — Bebas Neue para headings, Oxanium para cuerpo
- **Responsive** — optimizado para mobile, tablet y desktop con Tailwind CSS 4
- **TypeScript** — type safety de punta a punta
- **Tests E2E** — smoke tests con Playwright

## 🚀 Getting Started

### Prerrequisitos

- **Node.js** 18+
- **pnpm** (recomendado)
- Una cuenta en [Supabase](https://supabase.com)

### 1. Clonar el repo

```bash
git clone https://github.com/TanisJam/the-orange-mate.git
cd the-orange-mate
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar Supabase

Creá un proyecto en Supabase y ejecutá el schema:

```bash
# Copiá el contenido de database-schema.sql en el SQL Editor de Supabase
```

Configurá las variables de entorno:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 📁 Estructura del proyecto

```
.
├── app/                          # Next.js App Router
│   ├── (app)/                   # Rutas autenticadas (route group)
│   │   ├── dashboard/           # Dashboard con tabs
│   │   ├── discover/            # Página de descubrimiento con filtros
│   │   ├── friends/             # Sistema de amigos
│   │   ├── messages/            # Chat en tiempo real
│   │   ├── notifications/       # Centro de notificaciones
│   │   ├── plans/               # Planes (detalle, creación)
│   │   │   ├── [id]/            # Detalle de plan
│   │   │   └── new/             # Crear plan
│   │   ├── profile/             # Perfil público
│   │   └── layout.tsx           # Shell autenticado (nav + footer)
│   ├── auth/                    # Flujo de autenticación
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── sign-up-success/
│   │   ├── confirm/
│   │   ├── forgot-password/
│   │   ├── update-password/
│   │   └── error/
│   ├── demo/                    # Demo del design system
│   ├── api/                     # API routes
│   ├── globals.css              # Design system + tokens CSS
│   ├── layout.tsx               # Root layout (fuentes, theme provider)
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # Primitivas shadcn/ui (Button, Card, Badge, Tabs, etc.)
│   ├── auth-button.tsx          # Botón de auth universal
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   ├── dashboard-content.tsx    # Dashboard con tabs y stats
│   ├── plan-form.tsx            # Formulario de creación/edición de plan
│   ├── plan-detail.tsx          # Vista detallada de plan
│   ├── discover-filters.tsx     # Filtros de descubrimiento
│   ├── discover-results.tsx     # Resultados de búsqueda
│   ├── chat-list.tsx            # Lista de chats
│   ├── chat-window.tsx          # Ventana de chat
│   ├── message-bubble.tsx       # Burbuja de mensaje
│   ├── message-input.tsx        # Input de mensaje
│   ├── notification-bell.tsx    # Campana con badge
│   ├── notification-dropdown.tsx # Dropdown de notificaciones
│   ├── notification-item.tsx    # Item de notificación
│   ├── friend-card.tsx          # Tarjeta de amigo
│   ├── friend-request-button.tsx # Botón de solicitud de amistad
│   ├── friends-page-client.tsx  # Página de amigos (client)
│   ├── user-profile-form.tsx    # Formulario de perfil
│   ├── public-profile-display.tsx # Perfil público
│   ├── review-card.tsx          # Tarjeta de review
│   ├── review-form.tsx          # Formulario de review
│   ├── star-selector.tsx        # Selector de estrellas
│   ├── avatar-upload.tsx        # Upload de avatar
│   ├── theme-switcher.tsx       # Toggle claro/oscuro
│   ├── back-button.tsx          # Botón de navegación hacia atrás
│   ├── page-header.tsx          # Header de página reutilizable
│   ├── app-nav.tsx              # Navegación principal autenticada
│   └── app-shell-body.tsx       # Cuerpo del shell autenticado
├── lib/
│   ├── database.ts              # Queries server-side a Supabase
│   ├── database-client.ts       # Queries client-side
│   ├── chat-client.ts           # Cliente de chat
│   ├── notification-client.ts   # Cliente de notificaciones
│   ├── format-date.ts           # Formateo de fechas
│   ├── types.ts                 # Tipos compartidos (TravelPlan, UserProfile, etc.)
│   ├── utils.ts                 # Utilidades generales
│   └── supabase/               # Clientes de Supabase (client, server, middleware)
├── supabase/migrations/         # Migraciones de base de datos
├── tests/                       # Tests E2E con Playwright
├── database-schema.sql          # Schema completo de la base de datos
├── middleware.ts                # Middleware de autenticación
└── package.json
```

## 🎨 Design System

TOM usa un design system brutalista con identidad propia:

| Token | Color |
|-------|-------|
| Primary | `#FA8432` (naranja) |
| Primary Light | `#FFAE66` |
| Primary Dark | `#D25400` |
| Accent | `#0086A4` (teal) |
| Accent Light | `#14B8C9` |
| Accent Dark | `#006177` |
| Neutral White | `#FDFEFE` |
| Neutral Black | `#191919` |

- **Bordes marcados** con `border-ink` (negro en light, blanco en dark)
- **Sombras offset** tipo brutalist (`shadow-[2px_2px_0px_0px]`)
- **Tipografía**: Bebas Neue (headings) + Oxanium (cuerpo)
- **Radio**: 6px consistente en toda la UI
- **Temas**: claro y oscuro con `next-themes`

## 🧪 Tests

```bash
# E2E smoke tests con Playwright
npx playwright test
```

Configuración en `playwright.config.ts`.

## 🗄️ Base de datos

El schema completo está en `database-schema.sql`. Tablas principales:

- `profiles` — perfiles de usuario con bio, intereses, país
- `travel_plans` — planes de viaje con tipo, estado, fechas, sharing options
- `plan_participants` — participantes y pendientes en cada plan
- `reviews` — sistema de reviews entre viajeros
- `friendships` — solicitudes y relaciones de amistad
- `notifications` — sistema de notificaciones
- `messages` — mensajes del chat
- `plan_notes` — notas colaborativas en planes

Todas las tablas tienen Row Level Security (RLS) configurado.

## 🧰 Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con Turbopack |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | ESLint |

## 🏗️ Stack

- [Next.js 15](https://nextjs.org) — App Router, Server Components, Streaming
- [Supabase](https://supabase.com) — Auth, base de datos PostgreSQL, RLS
- [Tailwind CSS 4](https://tailwindcss.com) — Utility-first + CSS-first con `@theme`
- [Radix UI](https://radix-ui.com) — Primitivas accesibles (Checkbox, Select, Tabs, Dropdown, Label, Slot)
- [shadcn/ui](https://ui.shadcn.com) — Componentes construidos sobre Radix + Tailwind
- [TypeScript](https://typescriptlang.org) — Type safety
- [Lucide React](https://lucide.dev) — Iconos
- [next-themes](https://github.com/pacocoursey/next-themes) — Tema claro/oscuro
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — Formularios con validación
- [Sonner](https://sonner.emilkowal.ski) — Toasts
- [Playwright](https://playwright.dev) — Tests E2E

## 👤 Autor

**TanisJam** — [github.com/TanisJam](https://github.com/TanisJam)

## 📄 Licencia

MIT
