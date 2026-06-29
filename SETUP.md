# Ferrion B2B Customer Portal — Setup Guide

## Prerequisites
- Node.js 18+
- A Supabase project in the **Frankfurt (eu-central-1)** region
- A Vercel account

---

## 1. Supabase setup

### 1a. Create the project
Go to https://supabase.com → New Project → select **Frankfurt (eu-central-1)**.

### 1b. Create the Storage bucket
In the Supabase dashboard → Storage → New bucket:
- Name: `documents`
- Public: **No** (private bucket, access via signed URLs)

### 1c. Get connection strings
Settings → Database → Connection string:
- **Pooler (Transaction mode)** → use as `DATABASE_URL` (add `?pgbouncer=true&connection_limit=1`)
- **Direct connection** → use as `DIRECT_URL`

---

## 2. Local development

```bash
# Install dependencies
npm install

# Copy and fill in env vars
cp .env.example .env.local

# Generate Prisma client & push schema to Supabase
npm run db:generate
npm run db:push

# Seed with admin + demo customer
npm run db:seed

# Start dev server
npm run dev
```

**Default seed accounts:**
| Role     | Email                    | Password       |
|----------|--------------------------|----------------|
| Admin    | admin@ferrion.com        | admin1234      |
| Customer | customer@example.com     | customer1234   |

---

## 3. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set the following environment variables in the Vercel dashboard
(or via `vercel env add`):

| Variable                      | Description                            |
|-------------------------------|----------------------------------------|
| `DATABASE_URL`                | Supabase pooler connection string      |
| `DIRECT_URL`                  | Supabase direct connection string      |
| `NEXTAUTH_SECRET`             | `openssl rand -base64 32`              |
| `NEXTAUTH_URL`                | Your Vercel deployment URL             |
| `NEXT_PUBLIC_SUPABASE_URL`    | Supabase project URL                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                   |
| `SUPABASE_SERVICE_ROLE_KEY`   | Supabase service role key              |

After deploy, run migrations:

```bash
vercel env pull .env.production.local
npx prisma migrate deploy
```

---

## Architecture

```
/src/app
├── login/               # Public login page (NextAuth credentials)
├── dashboard/           # Customer area (role: CUSTOMER)
│   ├── orders/          # View orders
│   ├── quotes/          # View quotes
│   ├── documents/       # Download documents (Supabase Storage signed URLs)
│   └── tickets/         # Create & view support tickets
├── admin/               # Admin area (role: ADMIN)
│   ├── customers/       # Customer list
│   ├── orders/          # All orders
│   ├── quotes/          # All quotes
│   ├── documents/       # Upload documents per customer
│   └── tickets/         # View & respond to tickets, update status
└── api/
    ├── auth/[...nextauth]   # NextAuth handler
    ├── documents/           # Upload + signed-URL download
    └── tickets/             # CRUD + messages
```

**Auth flow:** NextAuth JWT strategy → role stored in JWT → middleware
enforces `/dashboard` (CUSTOMER) and `/admin` (ADMIN) separately.

**Document storage:** Files uploaded to Supabase Storage bucket `documents`
under `{customerId}/{timestamp}-{filename}`. Downloads use 60-second signed URLs
generated server-side (never exposing the service role key to the browser).
