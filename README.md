# LimitFree

LimitFree is a full‑stack web application that helps users discover their strengths and plan concrete actions for personal growth. It provides career assessments, passion exploration tools, and an AI assistant that guides the user through a customized quest system.

## Features

- **User authentication** with Supabase
- **RIASEC** career aptitude assessment
- **OCEAN** personality analysis
- **Passion Shuttle** suggestions based on assessment results
- **Quest planning** and progress tracking
- **AI chat** for advice and reflection
- Dark mode support

## Tech Stack

- **Next.js 14** with the App Router
- **React 18** and Tailwind CSS
- **Supabase** for authentication and PostgreSQL storage
- **Anthropic Claude** API for AI features
- Deployed to **Vercel**

## Repository Overview

```
app/                 Next.js pages and API routes
components/          Reusable React components
lib/                 Supabase helpers and utility functions
providers/           Context providers (auth, theme)
supabase/            Database migrations
```

### Key Pages

- `app/riasec` – RIASEC assessment and results
- `app/ocean` – OCEAN assessment and results
- `app/passion-shuttle` – Generate and save passion shuttles
- `app/quest-setup` – Configure quest directions and quests
- `app/quests` – Manage quests after setup
- `app/ai-chat` – Chat interface with Claude

### API Routes

- `app/api/passion-shuttle/suggest` – Suggest passion shuttles
- `app/api/passion-shuttle/refine` – Refine suggestions with feedback
- `app/api/passion-shuttle/save` – Persist the selected shuttle
- `app/api/quest/suggest-directions` – Generate quest directions
- `app/api/quest/refine-directions` – Refine quest directions
- `app/api/quest/generate-quests` – Create quest lists
- `app/api/quest/filter-quests` – Filter quests
- `app/api/quest/save-direction` – Save a quest direction
- `app/api/quest/save-quests` – Save generated quests
- `app/api/chat` – AI chat endpoint

## Local Development

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.local.example` to `.env.local` and fill in the values for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
3. Start the development server
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Deployment

The project is designed for Vercel. After configuring environment variables in the Vercel dashboard, run:

```bash