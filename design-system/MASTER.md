# LocaFlow — Design System MASTER

> Généré par UI/UX Pro Max · Catégorie : Fintech / Invoice & Billing SaaS B2B
> Stack : Next.js 15 + shadcn/ui + Tailwind v4

---

## Pattern
- **Type :** Real-Time / Operations Dashboard
- **CTA Placement :** Nav principal + après les métriques clés
- **Color Strategy :** Light mode neutre. Status colors (vert payé, orange en attente, rouge annulé). Dense mais lisible.

---

## Style
- **Nom :** Minimal B2B SaaS
- **Mots-clés :** Clean, professionnel, data-dense, scannable, confiance
- **Best For :** SaaS B2B, dashboards opérationnels, outils de facturation
- **Performance :** Excellent | **Accessibilité :** WCAG AA

---

## Couleurs (Tailwind tokens)

| Rôle | Hex | Tailwind |
|------|-----|----------|
| Primary | `#2563EB` | `blue-600` |
| Primary hover | `#1D4ED8` | `blue-700` |
| Secondary | `#3B82F6` | `blue-500` |
| CTA / Accent | `#F97316` | `orange-500` |
| Background | `#F8FAFC` | `slate-50` |
| Surface (cards) | `#FFFFFF` | `white` |
| Border | `#E2E8F0` | `slate-200` |
| Text primary | `#1E293B` | `slate-800` |
| Text secondary | `#64748B` | `slate-500` |
| Text muted | `#94A3B8` | `slate-400` |

### Status Colors (BookingStatus)
| Statut | Background | Text | Tailwind |
|--------|-----------|------|---------|
| draft | `#F1F5F9` | `#475569` | `bg-slate-100 text-slate-600` |
| deposit_pending | `#FEF3C7` | `#92400E` | `bg-amber-100 text-amber-800` |
| deposit_paid | `#DBEAFE` | `#1E40AF` | `bg-blue-100 text-blue-800` |
| caution_pending | `#FED7AA` | `#9A3412` | `bg-orange-100 text-orange-800` |
| caution_held | `#EDE9FE` | `#5B21B6` | `bg-violet-100 text-violet-800` |
| balance_pending | `#E0E7FF` | `#3730A3` | `bg-indigo-100 text-indigo-800` |
| balance_paid | `#D1FAE5` | `#065F46` | `bg-emerald-100 text-emerald-800` |
| cancelled | `#FEE2E2` | `#991B1B` | `bg-red-100 text-red-800` |
| completed | `#DCFCE7` | `#14532D` | `bg-green-100 text-green-800` |

---

## Typographie

- **Headings :** `Calistoga` (Google Fonts) — bold, caractère, mémorable
- **Body / UI :** `Inter` — lisibilité maximale, standard SaaS
- **Mono (montants, IDs) :** `JetBrains Mono` — pour les valeurs numériques et codes Stripe

```css
@import url('https://fonts.googleapis.com/css2?family=Calistoga:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Échelle typographique
| Élément | Font | Weight | Size |
|---------|------|--------|------|
| Page title (H1) | Calistoga | 400 | `text-3xl` (30px) |
| Section title (H2) | Inter | 600 | `text-xl` (20px) |
| Card title (H3) | Inter | 600 | `text-base` (16px) |
| Body | Inter | 400 | `text-sm` (14px) |
| Label / Meta | Inter | 500 | `text-xs` (12px) |
| Montants | JetBrains Mono | 500 | `text-sm`→`text-lg` |

---

## Espacements
- Page padding : `px-4 md:px-6 lg:px-8`
- Section gap : `gap-6`
- Card padding : `p-4` ou `p-6`
- Sidebar width : `w-64` (256px)

---

## Composants — Règles shadcn/ui

### Cards
```
bg-white border border-slate-200 rounded-xl shadow-sm
```
KPI cards : header coloré très léger + valeur en `font-mono text-2xl font-semibold text-slate-800`

### Buttons
- Primary : `bg-blue-600 hover:bg-blue-700 text-white`
- CTA (action critique) : `bg-orange-500 hover:bg-orange-600 text-white`
- Outline : `border-slate-200 text-slate-700 hover:bg-slate-50`
- Destructive (annuler) : shadcn `variant="destructive"`

### Badges de statut
Utiliser `BOOKING_STATUS_COLORS` de `@/lib/types/booking` alignés sur les couleurs ci-dessus.

### Tables
- Header : `bg-slate-50 text-slate-600 text-xs font-medium uppercase`
- Rows : `hover:bg-slate-50/50 transition-colors`
- Border : `divide-y divide-slate-100`

### Sidebar
- Background : `bg-white border-r border-slate-200`
- Nav item actif : `bg-blue-50 text-blue-700 font-medium`
- Nav item hover : `hover:bg-slate-50 text-slate-600`
- Logo : Calistoga, `text-xl text-blue-600`

---

## Effets & Interactions
- Transitions : `transition-colors duration-150` sur tous les éléments interactifs
- Hover states obligatoires sur chaque bouton, lien, ligne de table
- `cursor-pointer` sur tous les éléments cliquables
- Focus ring : shadcn par défaut (blue ring)
- `prefers-reduced-motion` : respecté via Tailwind `motion-safe:`

---

## Anti-patterns à éviter
- ❌ Animations complexes ou lourdes (app opérationnelle, pas marketing)
- ❌ Dégradés purple/pink style "AI générique"
- ❌ Shadows lourdes (box-shadow multiples)
- ❌ Emojis comme icônes → utiliser Lucide React uniquement
- ❌ Dark mode (non prévu en v1)
- ❌ Fonts système (Arial, etc.) — charger Inter obligatoirement

---

## Checklist pré-livraison (chaque composant)
- [ ] Icônes : Lucide React uniquement, jamais d'emoji
- [ ] `cursor-pointer` sur tous les éléments cliquables
- [ ] Hover state avec transition 150ms
- [ ] Contraste texte ≥ 4.5:1 (WCAG AA)
- [ ] Focus visible (keyboard nav)
- [ ] Responsive : 375px, 768px, 1024px, 1440px
- [ ] Montants : `font-mono` + formatage `toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })`
- [ ] Dates : format `dd/MM/yyyy` (fr-FR)
