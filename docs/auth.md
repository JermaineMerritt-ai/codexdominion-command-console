# Authentication

Authentication is an **opt-in layer**. The console runs open in demo mode; auth
activates only when configured, so the public demo never requires credentials.

## Modes

| `NEXT_PUBLIC_REQUIRE_AUTH` | Supabase configured | Behavior |
| --- | --- | --- |
| `false` (default) | — | Open. Actor = seeded administrator. `/login` is reachable but optional. |
| `true` | yes | Routes gated; unauthenticated users redirected to `/login`. |
| `true` | no | Middleware no-ops (fails open) — set the keys to actually enforce. |

## Components

| Piece | File |
| --- | --- |
| Browser Supabase client | `lib/supabase/client.ts` |
| Server Supabase client (cookie-bound) | `lib/supabase/server.ts` |
| Route protection | `middleware.ts` |
| Login page | `app/login/page.tsx` |
| Sign-out action | `lib/actions/auth.ts` |
| Current user / actor resolution | `lib/auth/actor.ts` |

## Flow (auth mode)

1. Unauthenticated request → `middleware.ts` redirects to `/login`.
2. `/login` calls `supabase.auth.signInWithPassword`.
3. On success the session cookie is set; middleware refreshes it on each request.
4. `getCurrentUser()` resolves the Supabase user and maps it to an application
   `User` (by email) to obtain the **role**.
5. `getCurrentActor()` provides `{ id, name, organizationId, role }` to server
   actions, which enforce RBAC (see [rbac.md](rbac.md)).
6. The user menu (header) exposes **Sign out**.

## Layout separation

Console pages live under the `app/(console)/` route group, which renders the
sidebar/topbar shell and performs the auth gate. `/login` lives outside that
group, so it renders as a clean standalone screen with no shell.

## Provisioning users (auth mode)

Application users (with roles) come from the data layer:
- **Demo:** the seed users in `lib/data/seed.ts`.
- **Database:** the `users` table (seeded via `npm run db:seed`).

Create matching Supabase Auth accounts whose **email** equals an application
user's email; that mapping assigns the role. Unmatched accounts default to
`viewer`.

## Not yet (roadmap)
- SSO (SAML / OIDC) and SCIM provisioning.
- Self-service password reset UI.
- Per-organization tenant selection from the session.
