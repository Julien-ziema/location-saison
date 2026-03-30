# CLAUDE.md — LocaFlow

## Quick Context
- **Projet** : LocaFlow — SaaS gestion paiements locations saisonnières
- **Stack** : Next.js 15 (App Router) — full-stack Node.js, tout sur Vercel
- **Auth** : NextAuth.js v5 (Auth.js) — credentials provider (local dev) / Google + Magic Link (prod)
- **DB** : Neon PostgreSQL + Drizzle ORM
- **Styling** : Tailwind CSS v4 + shadcn/ui
- **State** : Zustand (client), React Query (server)
- **Paiements** : Stripe SDK (acompte + solde + caution par authorize/capture)
- **Email** : Resend
- **CRON** : Vercel cron jobs (vercel.json)
- **Deploy** : Vercel uniquement — frontend, API Routes, serverless functions
- **Package manager** : npm
- **Node** : v20 LTS
- **Tests** : `npm test` (Vitest) · `npm run test:e2e` (Playwright)
- **Lint** : `npm run lint` (ESLint + Prettier)
- **Build** : `npm run build` — doit passer sans erreur avant tout commit

## Auth en développement local
- Provider : `credentials` (email + password, pas de vrai email envoyé)
- User de test : `test@locaflow.dev` / `password`
- Seed : `npm run db:seed`
- **Pas de** AUTH_GOOGLE_ID/SECRET requis en local
- AUTH_SECRET : générer avec `openssl rand -base64 32`

## Caution (Stripe authorize/capture — PAS Swikly)
- La caution N'utilise PAS Swikly (service retiré du scope)
- Caution = Stripe PaymentIntent avec `capture_method: 'manual'`
- Empreinte bancaire → montant bloqué sur la carte du locataire
- Libération = `stripe.paymentIntents.cancel(id)` (aucune capture = pas débité)
- Capture partielle possible si dommages : `stripe.paymentIntents.capture(id, { amount_to_capture })`

## Stripe Connect
- **Retiré du scope v1** — un seul compte Stripe par propriétaire
- Pas de commission, pas de parrainage, pas de `stripeAccountId` dans la DB
- Les colonnes `referredBy`, `commissionRate`, `onboardingComplete` sont à ignorer en v1

## Architecture des fichiers

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + Providers
│   ├── page.tsx                  # Landing page publique
│   ├── auth/                     # Pages NextAuth
│   │   ├── signin/page.tsx
│   │   └── error/page.tsx
│   ├── (auth)/                   # Routes protégées (layout avec session check)
│   │   ├── layout.tsx            # Sidebar + Header + session guard
│   │   ├── dashboard/page.tsx    # Cockpit principal
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── properties/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── settings/page.tsx
│   │   └── planning/page.tsx
│   └── api/                      # Route Handlers (API serverless Vercel)
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── bookings/             # CRUD + actions paiements
│       ├── properties/           # CRUD biens
│       ├── webhooks/stripe/      # Webhook Stripe
│       ├── cron/send-balances/   # CRON Vercel
│       └── users/me/             # Profil utilisateur
├── components/
│   ├── ui/                       # shadcn/ui (ne JAMAIS modifier directement)
│   ├── bookings/                 # BookingForm, BookingCard, BookingTable, etc.
│   ├── properties/               # PropertyForm, PropertyCard, PropertySelect
│   ├── dashboard/                # StatCard, DashboardStats, ViewToggle
│   ├── planning/                 # KanbanBoard, KanbanColumn, PlanningTimeline
│   └── shared/                   # AppSidebar, AppHeader, PageHeader
├── lib/
│   ├── auth.ts                   # Config NextAuth v5
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema (source de vérité)
│   │   ├── index.ts              # Client Drizzle + connection pool Neon
│   │   ├── seed.ts               # Seed user de test local
│   │   └── migrations/           # Fichiers migration SQL générés par drizzle-kit
│   ├── api/                      # Fonctions serveur, helpers API
│   ├── stores/
│   │   ├── booking-store.ts      # viewMode, filters, selectedBookingId
│   │   └── ui-store.ts           # sidebarOpen, modals
│   ├── hooks/
│   │   ├── use-bookings.ts       # React Query hooks réservations
│   │   ├── use-properties.ts     # React Query hooks biens
│   │   └── use-payments.ts       # React Query hooks paiements
│   ├── services/
│   │   ├── stripe-service.ts     # Checkout, PaymentIntent, authorize/capture caution
│   │   ├── booking-service.ts    # Machine à états, createBooking, cancelBooking
│   │   └── resend-service.ts     # Envoi emails (lien solde, confirmations)
│   ├── utils/                    # Helpers purs (formatters, constants, validators)
│   └── types/
│       ├── booking.ts            # BookingStatus, Booking, CreateBookingInput
│       ├── payment.ts            # PaymentType, PaymentStatus, Payment
│       ├── property.ts           # Property, CreatePropertyInput
│       └── user.ts               # User, UserRole
├── styles/
│   └── globals.css               # Tailwind directives + variables CSS custom (shadcn)
middleware.ts                     # Auth guard routes (auth)/*
tests/
├── unit/
├── integration/
├── e2e/
└── fixtures/
docs/
└── adr/
```

## Modules indépendants (pour Agent Teams)

| Module | Répertoire | Owner agent |
|--------|-----------|-------------|
| Pages & Routing | `src/app/` | `page-architect` |
| Composants UI | `src/components/` | `ui-builder` |
| State & Hooks | `src/lib/stores/`, `src/lib/hooks/` | `state-engineer` |
| API Routes | `src/app/api/` | `api-architect` |
| DB & Schema | `src/lib/db/` | `db-engineer` |
| Services | `src/lib/services/` | `agent-builder` |
| Types | `src/lib/types/` | `state-engineer` |
| Tests | `tests/` | `test-automator` |

**Fichiers partagés (COORDONNER avant de modifier) :**
- `package.json`, `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `src/lib/types/` (types globaux)
- `.env.local`, `.env.example`
- `drizzle.config.ts`

## Conventions obligatoires

### TypeScript
- `strict: true` — jamais de `any`, jamais de `@ts-ignore`
- Imports via alias `@/` uniquement — jamais de `../../..`
- Types partagés entre modules → `src/lib/types/`
- Pas de barrel exports (`index.ts` qui réexporte) sauf dans `src/components/ui/`

### React / Next.js
- Server Components par défaut — `'use client'` uniquement quand nécessaire
- Pas de `useEffect` pour du data fetching — React Query ou Server Components
- Composants < 200 lignes — découper sinon
- Nommage : PascalCase fichiers composants, camelCase pour le reste

### API Routes (Vercel serverless)
- Toujours valider les inputs avec Zod
- Toujours vérifier la session NextAuth avec `auth()` en première ligne
- Retourner `NextResponse.json()` avec status codes HTTP corrects
- Isolation stricte : `WHERE userId = session.user.id` sur TOUTES les queries
- Webhooks Stripe : vérifier signature avec `stripe.webhooks.constructEvent`
- CRON : vérifier header `Authorization: Bearer CRON_SECRET`

### Base de données (Drizzle + Neon)
- Schema-first : modifier `src/lib/db/schema.ts` → `npm run db:generate` → `npm run db:push`
- Index sur toute colonne utilisée dans un WHERE ou JOIN
- Soft delete (colonne `deletedAt`) sur les entités utilisateur
- Transactions pour les opérations multi-tables

### Auth (NextAuth v5)
- Config dans `src/lib/auth.ts` — un seul fichier
- Middleware `middleware.ts` à la racine pour protéger les routes `/(auth)/*`
- Session strategy : `jwt`
- En local : credentials provider avec user seedé
- Jamais accéder à `session.user` sans null check

### Styling
- Tailwind uniquement — pas de CSS modules, styled-components, ou inline styles
- shadcn/ui pour tous les composants de base
- Dark mode : `class` strategy via `next-themes`

### Git
- Conventional Commits : `feat(scope):`, `fix(scope):`, `refactor:`, `docs:`, `test:`
- Scope = module ou nom d'agent (ex: `feat(bookings): add kanban view`)

## Commandes de vérification

```bash
npm run lint          # ESLint
npm run build         # TypeScript check + Next.js build
npm test              # Vitest (unit + integration)
npm run test:e2e      # Playwright (e2e)
npm run db:generate   # Générer migrations Drizzle
npm run db:push       # Appliquer migrations sur Neon
npm run db:seed       # Seeder user de test local
```

## Variables d'environnement requises

```env
# Auth
AUTH_SECRET=                        # openssl rand -base64 32

# Database
DATABASE_URL=                       # Neon pooled connection string

# Stripe
STRIPE_SECRET_KEY=                  # sk_test_... (clé test Stripe)
STRIPE_PUBLISHABLE_KEY=             # pk_test_...
STRIPE_WEBHOOK_SECRET=              # whsec_... (Stripe CLI ou dashboard)

# Email
RESEND_API_KEY=                     # re_...

# CRON
CRON_SECRET=                        # secret aléatoire pour protéger /api/cron/*

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Machine à états bookings

```
draft → deposit_pending (envoi acompte Stripe Checkout)
deposit_pending → deposit_paid (webhook Stripe checkout.session.completed)
deposit_pending → cancelled
deposit_paid → caution_pending (envoi caution Stripe authorize)
caution_pending → caution_held (webhook Stripe payment_intent.created + authorized)
caution_pending → cancelled
caution_held → balance_pending (CRON ou action manuelle)
balance_pending → balance_paid (webhook Stripe payment_intent.succeeded)
balance_pending → cancelled
balance_paid → completed (libération caution = cancel PaymentIntent)
```

## Agent Teams — Configuration

### Wave 1 (parallèle)
| Agent | Tâche |
|-------|-------|
| `db-engineer` | Schema Drizzle (users, properties, bookings, payments) + migrations + seed |
| `ui-builder` | BookingForm, BookingCard, BookingStatusBadge, BookingTable, PropertyForm, PropertySelect, StatCard, AppSidebar, AppHeader, PageHeader, ViewToggle |
| `state-engineer` | Types (booking, payment, property, user) + Zustand stores (booking-store, ui-store) + React Query hooks |

### Wave 2 (parallèle, attend Wave 1)
| Agent | Tâche |
|-------|-------|
| `api-architect` | Endpoints CRUD bookings + properties + users/me + Zod validation |
| `agent-builder` | stripe-service (Checkout + authorize/capture) + booking-service (machine états) + resend-service |
| `page-architect` | Layout protégé, dashboard, bookings/new, bookings/[id], bookings list, properties |

### Wave 3 (séquentiel, attend Wave 2)
| Agent | Tâche |
|-------|-------|
| `api-architect` | Webhook Stripe + CRON send-balances |
| `page-architect` | Planning Kanban + Timeline |
| `ui-builder` | KanbanBoard, KanbanColumn, PlanningTimeline, BookingTimeline, BookingActions, PaymentHistoryTable |

### Wave 4 (attend Wave 3)
| Agent | Tâche |
|-------|-------|
| `test-automator` | Tests unit services + intégration API + e2e parcours |
| `security-reviewer` | Audit isolation données, webhook signatures, env vars |
| `perf-reviewer` | Bundle size, N+1 queries, lazy loading |

## Anti-patterns — NE JAMAIS FAIRE

- ❌ `any` ou `@ts-ignore`
- ❌ `console.log` en prod
- ❌ CSS inline / CSS modules / styled-components
- ❌ `useEffect` pour fetch data
- ❌ Secrets en dur dans le code
- ❌ SQL brut dans les API routes
- ❌ Import relatif `../../..`
- ❌ Fichier > 300 lignes
- ❌ Code commenté
- ❌ `next/router` — utiliser `next/navigation`
- ❌ `getServerSideProps` / `getStaticProps`
- ❌ Swikly (retiré du scope)
- ❌ Stripe Connect (retiré du scope v1)
- ❌ Clerk (auth = NextAuth v5 uniquement)
- ❌ Modifier les fichiers dans `src/components/ui/`
- ❌ Drag & drop sur le Kanban (transitions pilotées par paiements)
