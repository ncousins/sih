# Deployment Guide — BPESA Skills Intelligence Hub

## Step 1 — Production Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project (region: `af-south-1` Cape Town if available, else `eu-west-2`)
2. Once the project is ready, copy from **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`
3. Copy the database connection string from **Settings → Database → Connection string (URI)** → `DATABASE_URL`
4. Link and push migrations:
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```
5. In the Supabase dashboard, go to **Storage** and verify the `documents` bucket was created (it's created by the migration). Set it to private.
6. Under **Authentication → Settings**, set **Site URL** to your production domain (e.g. `https://sih.bpesa.org.za`)

---

## Step 2 — Vercel Deployment

1. Push your code to GitHub (if not already done):
   ```bash
   git add .
   git commit -m "Phase 1 MVP"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables from `.env.example` with production values:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase dashboard |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard |
   | `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard |
   | `DATABASE_URL` | From Supabase dashboard |
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel domain, e.g. `https://sih.bpesa.org.za` |
   | `RESEND_API_KEY` | From resend.com |
   | `PAYSTACK_SECRET_KEY` | Live key from Paystack |
   | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Live key from Paystack |
   | `PAYSTACK_WEBHOOK_SECRET` | From Paystack webhook settings |

5. Click **Deploy**

---

## Step 3 — Paystack Webhook

1. Log in to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to **Settings → API Keys & Webhooks**
3. Under **Webhook URL**, enter:
   ```
   https://your-vercel-domain.vercel.app/api/webhook/paystack
   ```
4. Copy the **Webhook Secret** and add it as `PAYSTACK_WEBHOOK_SECRET` in Vercel env vars
5. Switch from test to live keys — update `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in Vercel

---

## Step 4 — Resend Domain

1. In [resend.com](https://resend.com) → **Domains**, add and verify `bpesa.org.za`
2. Update `lib/resend.ts` — change the `from` address from `noreply@bpesa.org.za` to your verified sender
3. Redeploy

---

## Step 5 — Create Admin User

In the Supabase dashboard for your production project:

1. Go to **Authentication → Users → Add user**
2. Enter the admin email and a strong password
3. Navigate to `https://your-domain/admin/login` and sign in

---

## Step 6 — Smoke Tests

Run through all 5 journeys after deployment:

1. **Free download** → browse documents → submit name + email → receive email → download PDF
2. **Paid download (non-member)** → submit details → Paystack checkout → pay → receive email → download
3. **Member access** → submit member email on paid doc → receive email without paying
4. **Admin upload** → login → upload PDF → publish → confirm appears on public site
5. **Member CSV** → upload CSV → verify member gets free access to paid doc

---

## Custom Domain (optional)

In Vercel → your project → **Settings → Domains**, add `sih.bpesa.org.za` and follow the DNS instructions.
