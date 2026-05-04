# BPESA Skills Intelligence Hub — Build Plan

**Stack:** Next.js 16 · Supabase · Tailwind CSS v4 · Resend · Paystack · Vercel

---

## Phase 1A — Foundation & Infrastructure ✅

> Weeks 1–2 · **Complete**

- [x] Supabase local instance configured
- [x] Database schema — `users`, `members`, `documents`, `downloads`, `transactions`, `events`
- [x] RLS policies — public read on published content, service-role write
- [x] Supabase Storage bucket — `documents` (private, signed URLs)
- [x] `lib/supabase/server.ts` + `lib/supabase/client.ts`
- [x] `proxy.ts` — auth guard protecting `/admin/*` (Next.js 16 convention)
- [x] App Router structure — `(public)/` and `admin/` route groups
- [x] BPESA design system — navy `#1C2143` primary, orange `#F0531E` accent
- [x] Fonts — League Spartan (headings), Open Sans (body), Lato (captions)
- [x] Shared components — `Navbar`, `Footer`, `Button`, `Card`, `Input`, `AdminNav`
- [x] Admin login page — email/password via Supabase Auth server action
- [x] Public landing page — hero, feature cards, CTA banner

**Key files:**
- `app/layout.tsx` · `app/globals.css`
- `supabase/migrations/20260504000000_initial_schema.sql`
- `lib/supabase/server.ts` · `lib/supabase/client.ts`
- `proxy.ts`
- `components/ui/` (10 components)

---

## Phase 1B — Document System ✅

> Weeks 3–4 · **Complete**

- [x] Document listing page — server-rendered, client-side search + category/access filter
- [x] Document card component — title, category, free/paid badge
- [x] Document detail page — metadata, published date, access gate
- [x] Access gate logic — Free → email form | Paid → member check → payment placeholder
- [x] `DownloadForm` client component — name + email capture, loading/success/error states
- [x] `POST /api/download` — upsert user, record download, generate 24hr signed URL, send Resend email
- [x] `lib/resend.ts` — branded HTML email with download button
- [x] Admin document management — PDF upload to Supabase Storage, metadata form
- [x] Admin publish/unpublish toggle and delete
- [x] `POST /api/admin/documents` — saves document metadata (auth-gated)
- [x] Footer admin link — subtle `/admin/login` entry point

**Key files:**
- `app/(public)/documents/page.tsx`
- `app/(public)/documents/[id]/page.tsx`
- `app/admin/(portal)/documents/page.tsx`
- `app/api/download/route.ts`
- `app/api/admin/documents/route.ts`
- `lib/resend.ts` · `lib/types.ts`
- `components/ui/DocumentCard.tsx` · `DocumentFilters.tsx` · `DownloadForm.tsx` · `DocumentUploadForm.tsx`

**Env vars needed:** `RESEND_API_KEY` ✅

---

## Phase 1C — Payments & Member Logic ✅

> Weeks 5–6 · **Complete**

- [x] `lib/paystack.ts` — initializeTransaction, verifyTransaction, verifyWebhookSignature (HMAC SHA512)
- [x] `POST /api/paystack/initialize` — creates Paystack transaction, returns authorization_url
- [x] `DownloadForm` updated — on 402, calls initialize and redirects to Paystack checkout
- [x] `app/(public)/payment/callback/page.tsx` — verifies payment, records transaction + download, sends email
- [x] `POST /api/webhook/paystack` — verifies HMAC signature, idempotent processing, sends email
- [x] Member CSV upload page (`app/admin/(portal)/members/page.tsx`)
- [x] `MemberUploadForm` client component — parses CSV, posts to API, shows import count
- [x] `POST /api/admin/members` — upserts members from CSV (auth-gated)
- [x] Admin events management — create/publish/unpublish/delete (`app/admin/(portal)/events/page.tsx`)
- [x] Public events listing — upcoming/past split, date block cards (`app/(public)/events/page.tsx`)
- [x] Admin dashboard — 6 stat cards + recent downloads table

**Key files:**
- `lib/paystack.ts`
- `app/api/paystack/initialize/route.ts`
- `app/api/webhook/paystack/route.ts`
- `app/(public)/payment/callback/page.tsx`
- `app/admin/(portal)/members/page.tsx` · `components/ui/MemberUploadForm.tsx`
- `app/admin/(portal)/events/page.tsx` · `app/(public)/events/page.tsx`
- `app/admin/(portal)/dashboard/page.tsx`

**Env vars:**
- `PAYSTACK_SECRET_KEY` ✅
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` ✅
- `PAYSTACK_WEBHOOK_SECRET` ⚠️ — set this before going live (webhook falls back to secret key if empty)

---

## Phase 1D — Polish & Launch ✅

> Weeks 7–8 · **Complete (code) · Production steps in DEPLOY.md**

- [x] Security headers — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (`next.config.ts`)
- [x] Rate limiting — 10 req / 10 min per IP on `/api/download` via `proxy.ts`
- [x] POPIA consent checkbox on download form — required, links to `/privacy`
- [x] Privacy policy page (`app/(public)/privacy/page.tsx`) — POPIA-aligned, 8 sections
- [x] Data deletion route (`POST /api/user/delete`) + self-service form on privacy page
- [x] ISR — `revalidate = 60` on documents and events listing pages
- [x] `.env.example` — all production env vars documented
- [x] `DEPLOY.md` — step-by-step: Supabase prod, Vercel, Paystack webhook, admin setup, smoke tests
- [ ] **YOU:** Create production Supabase project + run `npx supabase db push`
- [ ] **YOU:** Deploy to Vercel + set all env vars
- [ ] **YOU:** Set Paystack webhook URL in dashboard + switch to live keys
- [ ] **YOU:** Smoke test all 5 journeys on production

**Key files:**
- `next.config.ts` (security headers)
- `proxy.ts` (rate limiting)
- `components/ui/DownloadForm.tsx` (POPIA checkbox)
- `app/(public)/privacy/page.tsx` · `components/ui/DataDeletionForm.tsx`
- `app/api/user/delete/route.ts`
- `.env.example` · `DEPLOY.md`

**Smoke tests:**
1. Public: browse → free download → receive email → download file
2. Public: browse → paid download → Paystack checkout → receive email → download
3. Member: enter member email → bypass payment → receive email → download
4. Admin: login → upload doc → publish → confirm appears publicly
5. Admin: upload member CSV → verify member gets free access to paid doc

---

## Phase 2 — Full SIH Platform ⬜

> Post-MVP · Plan when Phase 1 is live

- [ ] Skills dashboards & salary benchmarks
- [ ] AI: summarisation, trend detection, Q&A assistant
- [ ] Employer data ingestion & job scraping pipeline
- [ ] Tiered member subscriptions
- [ ] Personalised member dashboards
- [ ] API marketplace

---

## Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#1C2143` | Primary — navbars, headings, dominant surfaces |
| Orange | `#F0531E` | Accent only — CTAs, active states, highlights |
| Teal | `#003A50` | Secondary dark — CTA banners |
| Slate | `#445665` | Body text, secondary elements |
| Mint | `#25CAD3` | Icons, highlights, success states |
| Grey | `#D9D9D9` | Borders, subtle backgrounds |

**Fonts:** League Spartan (headings) · Open Sans (body) · Lato (captions)

---

## Local Dev

```bash
pnpm dev          # start dev server (Turbopack)
pnpm build        # production build
pnpm lint         # lint (separate from build in Next.js 16)

# Supabase
npx supabase start          # start local instance
npx supabase migration up --local   # apply migrations
# Studio: http://localhost:54323
```
