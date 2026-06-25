# Deployment

> **Live production demo:** https://codexdominion-command-console.vercel.app
> (running in demo mode — public, credential-free pilot environment).

The Command Console deploys to **Vercel**. It runs in two data-source modes,
selected by `NEXT_PUBLIC_APP_MODE` (default `demo`). **Deploy in demo mode
first** — the public demo is the immediate sales asset; backend wiring can
follow without blocking it.

## Option A — Demo deploy (recommended first)

1. Push the repo to GitHub.
2. Import into Vercel → framework auto-detected as **Next.js**.
3. Set environment variables:
   ```
   NEXT_PUBLIC_APP_MODE=demo
   NEXT_PUBLIC_REQUIRE_AUTH=false
   ```
4. Deploy. No database or Supabase credentials required — the typed seed layer
   powers every screen, so the preview can never break for a buyer demo.

> The `postinstall` script runs `prisma generate`, which only needs the schema
> (no database connection), so demo builds succeed with no `DATABASE_URL`.

## Option B — Database mode (Supabase backend)

### 1. Create a Supabase project
Collect the project URL, anon key, service-role key, and the pooled + direct
connection strings.

### 2. Provision the schema + seed
```bash
# locally, with .env.local pointing at Supabase:
npm run db:push      # apply prisma/schema.prisma  (or: npm run db:migrate)
npm run db:seed      # load the same governance demo records
```
Alternatively apply `supabase/migrations/0001_init.sql` directly (it also adds
row-level security policies for tenant isolation).

### 3. Configure Vercel environment variables
```
NEXT_PUBLIC_APP_MODE=database
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...            # pooled (pgbouncer)
DIRECT_URL=...             # direct (migrations)
NEXT_PUBLIC_REQUIRE_AUTH=true
```

### 4. Deploy
Vercel builds with `npm run build`. With `NEXT_PUBLIC_APP_MODE=database`, pages
read live data through Prisma; the auth middleware activates once
`NEXT_PUBLIC_REQUIRE_AUTH=true` and Supabase keys are present.

### 5. Enable authentication (optional)
Set `NEXT_PUBLIC_REQUIRE_AUTH=true`, then create Supabase Auth users whose
**email** matches an application user (seed/`users` table) — that mapping assigns
the role. Unmatched accounts get least-privilege `viewer`. See
[auth.md](auth.md) and [rbac.md](rbac.md).

> Middleware **fails open** if `REQUIRE_AUTH=true` but Supabase keys are missing
> — always set the keys when enabling auth.

## Rollback / safety

Switching `NEXT_PUBLIC_APP_MODE` back to `demo` instantly restores the
credential-free seed experience — a safe fallback if the database is
unavailable during a live demo.

## Local production check

```bash
npm run build
npm run start    # serves the production build locally
```

## Notes

- **Node 18.18+** (Node 20/22/24 recommended).
- Procurement detail pages are statically generated in demo mode; in database
  mode they render dynamically from live data.
- Set a custom domain in Vercel and enable HTTPS (default).
