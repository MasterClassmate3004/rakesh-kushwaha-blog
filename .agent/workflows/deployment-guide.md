# 🚀 Deployment Guide: Next.js Blog to Vercel

Follow these exact steps to take your premium blog live on a custom domain.

## Phase 1: High-Performance Database Setup
Vercel is serverless, so you need a Cloud Database. I recommend **Neon** (optimized for Vercel).

1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new project called `my-blog`.
3. Copy the **Connection String** (it starts with `postgresql://`).
4. **IMPORTANT**: Copy the "Pooled connection" string (look for the `?pgbouncer=true` or similar toggle) as it's better for serverless.

## Phase 2: Project Preparation (Local)
I have already updated your `prisma/schema.prisma` to support PostgreSQL. Now run these commands:

```bash
# Delete old SQLite migrations (they won't work on Postgres)
rm -rf prisma/migrations

# Note: You don't need to run migrate locally if you don't have Postgres installed. 
# Vercel will handle the migration during deployment.
```

## Phase 3: Push to GitHub
If you haven't yet, push your code to a private or public GitHub repo.

```bash
git init
git add .
git commit -m "Deploy: Ready for Vercel"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Phase 4: Vercel Deployment
1. Go to [Vercel](https://vercel.com) and click **"Add New" > "Project"**.
2. Import your GitHub repository.
3. **Environment Variables**: Add these 4 critical keys:
   - `DATABASE_URL`: (The string you copied from Neon)
   - `AUTH_SECRET`: (Run `openssl rand -base64 32` in your terminal to get a secret string)
   - `ADMIN_EMAIL`: (e.g., `your-email@example.com`)
   - `ADMIN_PASSWORD`: (Choose a strong password for your live dashboard)
4. **Build Command**: Vercel will auto-detect Next.js.
5. In the "Install Command" or "Build Settings", ensure Prisma generates:
   - Command: `npx prisma generate && next build`
6. Click **Deploy**.

## Phase 5: Initial Migration
Once deployed, the database tables need to be created in the cloud. You can do this by running a command in the Vercel "Deployment Console" or simply run this from your local machine once:
```bash
# This points your local Prisma to the cloud DB temporarily to build the tables
DATABASE_URL="YOUR_NEON_CONNECTION_STRING" npx prisma migrate deploy
```

## Phase 6: Custom Domain
1. In Vercel Project Settings, go to **Domains**.
2. Add your domain (e.g. `nityajain.com`).
3. Follow the DNS instructions (usually adding an `A` record and `CNAME` in your domain provider like GoDaddy or Namecheap).

---
**Done!** Your blog is now live with global edge performance.
