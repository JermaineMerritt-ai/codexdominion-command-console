# Deployment

The Command Console is built to deploy to **Vercel** with **Supabase** as the
backend. It also runs fully in **demo/seed mode** with no backend at all.

## Option A — Demo deploy (zero backend)

1. Push the repo to GitHub.
2. Import into Vercel → framework auto-detected as **Next.js**.
3. Deploy. No environment variables required — the seed layer powers every screen.

This is the recommended setup for **pilot demonstrations**.

## Option B — Production deploy (Supabase backend)

### 1. Create a Supabase project
Grab the project URL, anon key, service-role key, and the pooled + direct
connection strings.

### 2. Provision the schema
Either run the SQL migration directly:

```bash
supabase db push   # applies supabase/migrations/0001_init.sql
```

…or use Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Configure environment variables (Vercel → Settings → Environment)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...            # pooled (pgbouncer)
DIRECT_URL=...             # direct (migrations)
NEXT_PUBLIC_REQUIRE_AUTH=true
```

### 4. Deploy
Vercel builds with `npm run build`. The middleware activates auth gating once
`NEXT_PUBLIC_REQUIRE_AUTH=true` and Supabase keys are present.

## Local production check

```bash
npm run build
npm run start    # serves the production build locally
```

## Notes

- **Node 18.18+** (Node 20/22/24 recommended).
- Procurement detail pages are statically generated; rebuild on data changes,
  or convert to dynamic rendering when backed by a live database.
- Set a custom domain in Vercel and enable HTTPS (default).
