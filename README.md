# 🖥️ DayOS — Your Personal Daily Operating System

A sleek, AI-powered productivity dashboard you open every morning like a command center.
Built with **Next.js 14 · TypeScript · Tailwind CSS · Prisma · Google Gemini AI**.

> 📱 **PWA ready** — install it on your phone like a native app!

---

## ✨ Features

| Module | Description |
|---|---|
| 🌅 **Daily Brief** | AI-generated morning summary with insight, quote, focus word & daily intention |
| ⏱️ **Focus Timer** | Pomodoro timer (25/5/15 min modes) with persistent task queue |
| 📝 **Quick Capture** | Instant note-taking with AI auto-tagging, search & filter |
| 🔥 **Habit Tracker** | Daily habit tracking with streak counters + completion dashboard |
| ⚙️ **Settings** | Personalize your name, accent color, timer presets & more |

---

## 🚀 Local Setup (5 minutes)

### Prerequisites
- **Node.js 18+** — [Download](https://nodejs.org)
- **Google Gemini API Key** — [Free at aistudio.google.com](https://aistudio.google.com)
  - Sign in → Get API Key → Create API Key
  - 1,500 free requests/day · No credit card required

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# → Open .env and fill in GEMINI_API_KEY and USER_NAME

# 3. Initialize the local database (SQLite — no install needed)
npm run db:push

# 4. Start!
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 📱 Install as a Phone App (PWA)

DayOS is a Progressive Web App — install it like a native app:

**iPhone/iPad (Safari):**
1. Open http://your-deployed-url in Safari
2. Tap the **Share** button → **"Add to Home Screen"**
3. Tap **Add** — it appears on your home screen!

**Android (Chrome):**
1. Open the site in Chrome
2. Tap the **three-dot menu** → **"Add to Home screen"**
3. Tap **Add**

**Desktop (Chrome/Edge):**
1. Look for the **install icon** (➕) in the address bar
2. Click it → **Install**

---

## 🐙 Push to GitHub

```bash
# Inside the dayos folder:
git init
git add .
git commit -m "🚀 Initial DayOS commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/dayos.git
git branch -M main
git push -u origin main
```

---

## 🌐 Deploy to Vercel (Free)

Vercel is the easiest way to deploy Next.js. Free tier is more than enough for personal use.

### Step 1 — Set up a free database (Neon PostgreSQL)

SQLite doesn't persist on Vercel's serverless infrastructure, so we use **Neon** — free PostgreSQL.

1. Go to **[neon.tech](https://neon.tech)** and create a free account
2. Create a new project → copy the **Connection string** (starts with `postgresql://`)

### Step 2 — Update Prisma for PostgreSQL

In `prisma/schema.prisma`, the `DB_PROVIDER` env var handles this automatically.

### Step 3 — Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** → **"Add New Project"**
2. Import your GitHub repo
3. In **Environment Variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `DB_PROVIDER` | `postgresql` |
| `GEMINI_API_KEY` | Your Gemini API key |
| `USER_NAME` | Your name |

4. Click **Deploy** 🚀

### Step 4 — Run migrations on Neon

After first deploy, run:
```bash
DATABASE_URL="your-neon-url" DB_PROVIDER=postgresql npx prisma db push
```

Or use the Vercel CLI:
```bash
npx vercel env pull .env.production.local
npx prisma db push
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | SQLite (dev) / PostgreSQL via Neon (prod) |
| **ORM** | Prisma |
| **AI** | Google Gemini 1.5 Flash (free tier) |
| **PWA** | Web App Manifest + Apple meta tags |
| **Deploy** | Vercel (free) |

---

## 📁 Project Structure

```
dayos/
├── app/
│   ├── page.tsx              # Dashboard with tab nav + URL routing
│   ├── layout.tsx            # Root layout with PWA meta tags
│   ├── globals.css           # Design system tokens + animations
│   └── api/
│       ├── brief/route.ts    # Gemini AI morning brief
│       ├── notes/route.ts    # Notes CRUD + AI tagging
│       ├── habits/route.ts   # Habits + streak calculation
│       └── tasks/route.ts    # Focus task queue
├── components/
│   ├── DailyBrief.tsx        # 🌅 AI morning summary
│   ├── FocusTimer.tsx        # ⏱️  Pomodoro + task queue
│   ├── QuickCapture.tsx      # 📝 Notes with AI tags
│   ├── HabitTracker.tsx      # 🔥 Habits & streaks
│   └── Settings.tsx          # ⚙️  User preferences
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/                # App icons (SVG)
├── lib/prisma.ts             # Prisma client singleton
├── prisma/schema.prisma      # DB schema
└── .env.example              # Environment template
```

---

## 🛠️ Dev Commands

```bash
npm run dev          # Start dev server → http://localhost:3000
npm run build        # Production build
npm run db:push      # Sync Prisma schema to DB
npm run db:studio    # Visual database editor
```

---

## 🎨 Customization

**Accent color** → Settings tab → pick from presets or any hex color

**Pomodoro durations** → Settings tab → choose Classic / Flow / Sprint / Custom

**Timer sound** → Settings tab → toggle on/off

**AI brief tone** → Edit the prompt in `app/api/brief/route.ts`

---

## 📄 License

MIT — use it, fork it, make it yours.

---

Built with ♥ using [Next.js](https://nextjs.org) + [Google Gemini](https://aistudio.google.com)
