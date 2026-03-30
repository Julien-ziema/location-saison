# CDC — LocaFlow : Gestion de Locations Saisonnières

## Objectif

SaaS de suivi des paiements pour locations saisonnières. Un propriétaire entre ses locations, le système automatise tout le parcours de paiement : acompte (Stripe) → empreinte caution (Swikly) → solde automatique (CRON). Multi-utilisateurs avec parrainage et commission via Stripe Connect.

## Stack imposée (cf. CLAUDE.md)

- **Next.js 15** App Router, full Node.js, déployé sur **Vercel**
- **NextAuth v5** (Auth.js) — Google + Email Magic Link
- **Neon PostgreSQL** + **Drizzle ORM**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** + **React Query**
- **Stripe SDK** (paiements + Connect) + **Swikly API** (caution empreinte)
- **Vercel CRON** (via `vercel.json` cron jobs)

---

## Modèle de données

> Owner : `db-engineer`
> Fichiers : `src/lib/db/schema.ts`

### Tables

**users**
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid PK | |
| email | varchar unique | |
| name | varchar | |
| role | enum('owner','admin') | owner = propriétaire standard |
| stripeAccountId | varchar nullable | Stripe Connect account ID |
| referredBy | uuid FK → users.id nullable | Parrain |
| commissionRate | decimal default 0.05 | 5% par défaut |
| onboardingComplete | boolean default false | Stripe Connect onboarding terminé |
| createdAt | timestamp | |
| deletedAt | timestamp nullable | Soft delete |

**properties** (biens)
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid PK | |
| userId | uuid FK → users.id | Propriétaire du bien |
| name | varchar | "Villa Bleue", "Appart Biarritz" |
| address | text | |
| description | text nullable | |
| createdAt | timestamp | |
| deletedAt | timestamp nullable | |

**bookings** (réservations / locations)
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid PK | |
| propertyId | uuid FK → properties.id | |
| userId | uuid FK → users.id | Propriétaire (dénormalisation pour query rapide) |
| guestName | varchar | Nom du locataire |
| guestEmail | varchar | Email du locataire |
| guestPhone | varchar nullable | |
| checkIn | date | Date d'arrivée |
| checkOut | date | Date de départ |
| totalAmount | integer | Montant total en centimes |
| depositAmount | integer | Acompte en centimes |
| depositPercent | integer default 30 | % de l'acompte |
| cautionAmount | integer | Caution en centimes |
| balanceDueDate | date | Date d'envoi auto du solde (checkIn - X jours) |
| balanceLeadDays | integer default 21 | Nombre de jours avant checkIn pour le solde |
| status | enum (voir ci-dessous) | Statut global de la réservation |
| notes | text nullable | Notes libres du propriétaire |
| createdAt | timestamp | |
| updatedAt | timestamp | |
| deletedAt | timestamp nullable | |

**Enum `bookingStatus`** :
```
draft            → Réservation créée, rien envoyé
deposit_pending  → Demande d'acompte envoyée (Stripe)
deposit_paid     → Acompte reçu
caution_pending  → Demande d'empreinte caution envoyée (Swikly)
caution_held     → Empreinte caution validée
balance_pending  → Demande de solde envoyée (Stripe)
balance_paid     → Solde reçu → LOCATION CONFIRMÉE
cancelled        → Annulé (abandon en cours de route)
completed        → Location terminée, caution libérée
```

**payments** (log de chaque transaction)
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid PK | |
| bookingId | uuid FK → bookings.id | |
| type | enum('deposit','balance','caution_hold','caution_release','refund') | |
| amount | integer | En centimes |
| provider | enum('stripe','swikly') | |
| providerPaymentId | varchar | ID Stripe/Swikly |
| status | enum('pending','succeeded','failed','refunded') | |
| metadata | jsonb nullable | Données brutes du provider |
| createdAt | timestamp | |

**Index requis :**
- `bookings.userId` + `bookings.status` (filtre principal cockpit)
- `bookings.checkIn` (tri planning)
- `bookings.balanceDueDate` (CRON query)
- `payments.bookingId` (historique par réservation)

---

## Pages & Routing

> Owner : `page-architect`
> Fichiers : `src/app/**` (sauf `src/app/api/`)

```
src/app/
├── layout.tsx                    # Root layout + Providers (NextAuth, QueryClient, Zustand)
├── page.tsx                      # Landing page publique (simple, login CTA)
├── auth/
│   ├── signin/page.tsx           # Page connexion NextAuth
│   └── error/page.tsx            # Page erreur auth
├── (auth)/                       # Layout protégé (session check)
│   ├── layout.tsx                # Sidebar + Header + session guard
│   ├── dashboard/
│   │   └── page.tsx              # Cockpit principal — vue planning/table
│   ├── bookings/
│   │   ├── page.tsx              # Liste des réservations (table complète)
│   │   ├── new/page.tsx          # Formulaire création réservation
│   │   └── [id]/page.tsx         # Détail réservation + timeline paiements
│   ├── properties/
│   │   ├── page.tsx              # Liste des biens
│   │   └── new/page.tsx          # Formulaire ajout bien
│   ├── settings/
│   │   ├── page.tsx              # Paramètres profil
│   │   ├── stripe/page.tsx       # Onboarding Stripe Connect
│   │   └── referral/page.tsx     # Lien de parrainage + filleuls
│   └── planning/
│       └── page.tsx              # Vue planning Kanban par bien
```

### Description des pages clés

**Dashboard (cockpit)** :
- Vue par défaut au login
- 3 modes de vue : Table | Planning (timeline) | Kanban (colonnes par statut)
- Filtres : par bien, par statut, par mois
- Indicateurs en haut : locations ce mois, CA encaissé, acomptes en attente, soldes à venir
- Clic sur une réservation → page détail

**Formulaire nouvelle réservation** (`bookings/new`) :
- Select du bien (dropdown)
- Infos locataire : nom, email, téléphone
- Dates : checkIn, checkOut
- Montants : total, % acompte (pré-rempli 30%), caution
- Délai solde : nombre de jours avant checkIn (pré-rempli 21)
- Notes
- Bouton "Créer et envoyer l'acompte" → crée la résa + déclenche Stripe Checkout immédiatement
- Bouton "Créer en brouillon" → crée sans envoyer

**Détail réservation** (`bookings/[id]`) :
- Infos complètes de la résa
- Timeline verticale des événements (créée → acompte envoyé → payé → caution → solde → terminé)
- Boutons d'action selon le statut :
  - `draft` → "Envoyer l'acompte"
  - `deposit_paid` → "Envoyer la caution"
  - `caution_held` → "Envoyer le solde" (ou attendre le CRON)
  - `balance_paid` → "Marquer comme terminé" + "Libérer la caution"
  - Tout statut → "Annuler la réservation"
- Historique des paiements (table payments)

**Planning Kanban** (`planning`) :
- Colonnes = statuts du booking (draft → deposit_pending → ... → completed)
- Cartes = réservations, avec nom locataire, bien, dates, montant
- Drag & drop interdit (les transitions sont pilotées par les paiements, pas manuelles)
- Vue alternative : timeline horizontale par bien (style Gantt simplifié)
- En un coup d'œil : où en est chaque location

---

## Composants UI

> Owner : `ui-builder`
> Fichiers : `src/components/**`

### Composants à créer

**Réservations :**
- `BookingForm` — formulaire création/édition réservation (React Hook Form + Zod)
- `BookingCard` — carte résumé (nom, dates, montant, statut badge)
- `BookingTimeline` — timeline verticale des événements de paiement
- `BookingStatusBadge` — badge coloré par statut (shadcn Badge)
- `BookingTable` — table shadcn DataTable avec tri, filtre, pagination
- `BookingActions` — boutons d'action contextuels selon le statut

**Planning :**
- `KanbanBoard` — colonnes par statut, cartes BookingCard
- `KanbanColumn` — une colonne du kanban avec compteur
- `PlanningTimeline` — vue timeline horizontale par bien (style Gantt)
- `PlanningFilters` — filtres par bien, mois, statut

**Biens :**
- `PropertyForm` — formulaire ajout/édition bien
- `PropertyCard` — carte résumé bien
- `PropertySelect` — dropdown sélection bien (shadcn Select)

**Dashboard :**
- `StatCard` — carte KPI (nombre, label, tendance)
- `DashboardStats` — row de 4 StatCards
- `ViewToggle` — switch Table / Planning / Kanban (shadcn Tabs)

**Paiements :**
- `PaymentHistoryTable` — historique des paiements par réservation
- `PaymentStatusBadge` — badge Stripe/Swikly + statut

**Layout :**
- `AppSidebar` — sidebar navigation (shadcn Sidebar)
- `AppHeader` — header avec user menu + notifications
- `PageHeader` — titre de page + breadcrumb + bouton action

**Tous les composants utilisent shadcn/ui comme base. Pas de composant UI from scratch.**

---

## State Management

> Owner : `state-engineer`
> Fichiers : `src/lib/stores/`, `src/lib/hooks/`, `src/lib/types/`

### Zustand Stores

**booking-store.ts** :
- `viewMode: 'table' | 'planning' | 'kanban'`
- `filters: { propertyId, status, month }`
- `selectedBookingId: string | null`
- Actions : `setViewMode`, `setFilters`, `selectBooking`

**ui-store.ts** :
- `sidebarOpen: boolean`
- `modals: Record<string, boolean>`
- Actions : `toggleSidebar`, `openModal`, `closeModal`

### React Query Hooks

**use-bookings.ts** :
- `useBookings(filters)` → GET `/api/bookings`
- `useBooking(id)` → GET `/api/bookings/[id]`
- `useCreateBooking()` → POST `/api/bookings`
- `useUpdateBooking()` → PATCH `/api/bookings/[id]`
- `useCancelBooking()` → POST `/api/bookings/[id]/cancel`

**use-properties.ts** :
- `useProperties()` → GET `/api/properties`
- `useCreateProperty()` → POST `/api/properties`

**use-payments.ts** :
- `usePayments(bookingId)` → GET `/api/bookings/[id]/payments`
- `useSendDeposit(bookingId)` → POST `/api/bookings/[id]/send-deposit`
- `useSendCaution(bookingId)` → POST `/api/bookings/[id]/send-caution`
- `useSendBalance(bookingId)` → POST `/api/bookings/[id]/send-balance`

### Types partagés

**`src/lib/types/booking.ts`** — BookingStatus, Booking, CreateBookingInput, BookingWithPayments
**`src/lib/types/payment.ts`** — PaymentType, PaymentStatus, Payment
**`src/lib/types/property.ts`** — Property, CreatePropertyInput
**`src/lib/types/user.ts`** — User, UserRole

---

## API Routes

> Owner : `api-architect`
> Fichiers : `src/app/api/**`, `src/lib/api/`

### Endpoints

**Bookings :**
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/bookings` | Liste réservations (filtrable par status, propertyId, mois) |
| POST | `/api/bookings` | Créer une réservation |
| GET | `/api/bookings/[id]` | Détail réservation + payments |
| PATCH | `/api/bookings/[id]` | Modifier une réservation |
| POST | `/api/bookings/[id]/cancel` | Annuler (passe en `cancelled`) |
| POST | `/api/bookings/[id]/send-deposit` | Créer Stripe Checkout pour acompte |
| POST | `/api/bookings/[id]/send-caution` | Créer Swikly demande de caution |
| POST | `/api/bookings/[id]/send-balance` | Créer Stripe Payment Intent pour solde |
| POST | `/api/bookings/[id]/complete` | Marquer terminée + libérer caution |

**Properties :**
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/properties` | Liste des biens de l'utilisateur |
| POST | `/api/properties` | Créer un bien |
| PATCH | `/api/properties/[id]` | Modifier un bien |
| DELETE | `/api/properties/[id]` | Soft delete un bien |

**Webhooks :**
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/webhooks/stripe` | Webhook Stripe (payment_intent.succeeded, checkout.session.completed, etc.) |
| POST | `/api/webhooks/swikly` | Webhook Swikly (caution validée, expirée, etc.) |

**CRON :**
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/cron/send-balances` | CRON Vercel — envoie les soldes dont balanceDueDate ≤ today |

**Users / Settings :**
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/users/me` | Profil utilisateur courant |
| POST | `/api/stripe/onboarding` | Créer Stripe Connect account + onboarding link |
| GET | `/api/stripe/onboarding/callback` | Callback après onboarding Stripe Connect |
| GET | `/api/referral/link` | Générer lien de parrainage |
| GET | `/api/referral/stats` | Stats filleuls + commissions |

### Règles API

- Chaque handler commence par : `const session = await auth()` + check
- Isolation des données : `WHERE userId = session.user.id` sur TOUTES les queries
- Validation Zod sur tous les inputs
- Les webhooks Stripe vérifient la signature (`stripe.webhooks.constructEvent`)
- Le CRON est protégé par un header secret `CRON_SECRET` (Vercel cron auth)

---

## Services (logique métier)

> Owner : `agent-builder`
> Fichiers : `src/lib/services/`

### Services à créer

**stripe-service.ts** :
- `createCheckoutSession(booking, type: 'deposit' | 'balance')` → Stripe Checkout URL
- `createConnectAccount(user)` → Stripe Connect onboarding URL
- `handleWebhook(event)` → traite les events Stripe et met à jour booking/payment
- `createPaymentIntent(booking, amount)` → pour le solde automatique
- Les paiements passent par le Stripe Connect account du propriétaire (application_fee_amount = commission parrain)

**swikly-service.ts** :
- `createCautionRequest(booking)` → URL / lien empreinte bancaire
- `handleWebhook(event)` → traite les events Swikly
- `releaseCaution(bookingId)` → libérer la caution après la location

**booking-service.ts** :
- `createBooking(input, userId)` → crée booking + optionnellement envoie acompte
- `transitionStatus(bookingId, newStatus)` → machine à états (vérifie les transitions valides)
- `cancelBooking(bookingId)` → annule + refund si nécessaire
- `getUpcomingBalances()` → query des bookings dont balanceDueDate ≤ today et status = `caution_held`

**commission-service.ts** :
- `calculateCommission(amount, referrerId)` → montant commission
- `applyCommission(paymentIntent, referrerId)` → Stripe application_fee_amount

### Machine à états des transitions valides

```
draft → deposit_pending (envoi acompte)
deposit_pending → deposit_paid (webhook Stripe)
deposit_pending → cancelled (abandon)
deposit_paid → caution_pending (envoi caution)
caution_pending → caution_held (webhook Swikly)
caution_pending → cancelled (abandon)
caution_held → balance_pending (envoi solde — CRON ou manuel)
balance_pending → balance_paid (webhook Stripe)
balance_pending → cancelled (abandon)
balance_paid → completed (libération caution)
```

---

## CRON Vercel

> Config dans `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/send-balances",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Logique du CRON** :
1. Query : `SELECT * FROM bookings WHERE status = 'caution_held' AND balanceDueDate <= TODAY`
2. Pour chaque booking trouvé :
   - Créer un Stripe Payment Intent pour le montant du solde (totalAmount - depositAmount)
   - Envoyer le lien de paiement par email au locataire (via Stripe email ou Resend)
   - Passer le status à `balance_pending`
   - Créer une entrée dans `payments`
3. Log les résultats

---

## Multi-utilisateurs & Parrainage

- **Inscription** : NextAuth (Google + Magic Link)
- **Onboarding Stripe Connect** : chaque propriétaire doit connecter son compte Stripe pour recevoir les paiements
- **Parrainage** : un user peut inviter via un lien unique (`/auth/signin?ref=USER_ID`)
- **Commission** : quand un filleul reçoit un paiement, X% va au parrain via `application_fee_amount` Stripe Connect
- **Isolation** : un user ne voit QUE ses biens et réservations, jamais celles des autres

---

## Priorités de développement (Waves Agent Teams)

### Wave 1 — Fondations (parallèle)
| Agent | Tâche |
|-------|-------|
| `db-engineer` | Schema Drizzle complet (users, properties, bookings, payments) + migrations |
| `ui-builder` | Composants : BookingForm, BookingCard, BookingStatusBadge, BookingTable, PropertyForm, PropertySelect, StatCard, AppSidebar, AppHeader, PageHeader, ViewToggle |
| `state-engineer` | Types partagés (booking, payment, property, user) + Zustand stores (booking-store, ui-store) + React Query hooks (use-bookings, use-properties, use-payments) |

### Wave 2 — Core business (parallèle, attend Wave 1)
| Agent | Tâche |
|-------|-------|
| `api-architect` | Tous les endpoints CRUD (bookings, properties, users/me) + validation Zod + auth guards |
| `agent-builder` | Services : stripe-service, swikly-service, booking-service (machine à états), commission-service |
| `page-architect` | Pages : layout protégé, dashboard, bookings/new, bookings/[id], bookings list, properties, settings |

### Wave 3 — Intégrations (séquentiel, attend Wave 2)
| Agent | Tâche |
|-------|-------|
| `api-architect` | Webhooks Stripe + Swikly + CRON send-balances + Stripe Connect onboarding |
| `page-architect` | Planning Kanban + Timeline + page referral + page Stripe Connect settings |
| `ui-builder` | KanbanBoard, KanbanColumn, PlanningTimeline, BookingTimeline, BookingActions, PaymentHistoryTable |

### Wave 4 — Tests & Review (attend Wave 3)
| Agent | Tâche |
|-------|-------|
| `test-automator` | Tests unit services + tests intégration API + tests e2e parcours complet |
| `security-reviewer` | Audit isolation données, webhooks signatures, auth, env vars |
| `perf-reviewer` | Bundle size, queries N+1, lazy loading pages |

---

## Contraintes rappel

- ❌ Pas de Python, pas de Railway, pas de Docker
- ❌ Pas de voice/STT/TTS
- ❌ Pas de Clerk — NextAuth v5 uniquement
- ❌ Pas de drag & drop sur le Kanban (transitions pilotées par paiements)
- ✅ Tout Node.js, tout Vercel
- ✅ Stripe pour acompte + solde, Swikly pour caution
- ✅ CRON via Vercel cron jobs
- ✅ Multi-tenant par userId, isolation stricte
