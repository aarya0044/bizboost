# BizBoost

BizBoost is an AI-powered business intelligence and digital growth advisory platform designed for local businesses and SMBs. It helps entrepreneurs bridge the gap between offline physical decisions (where to open a store) and online visibility (how to attract customers digitally). 

Live Deployment Link: https://bizboost-gamma.vercel.app/

---

## The Problem and Our Solution

For most local business owners, selecting a brick-and-mortar storefront is based on guesswork, while building an online presence feels overly technical. BizBoost solves both challenges in a single, cohesive dashboard:

1. **Physical Intelligence**: Evaluates viability ratings, local footfall potential, competitor density, and identifies market gaps.
2. **Digital Advisory**: Analyzes web speed, recommends modern tech stacks, drafts local keyword lists, and provides actionable marketing plans.
3. **Strategic Advising**: A multi-step interactive business planner builds tailored SWOT analyses and projects startup budgets.

---

## Core Modules

- **Location Analyzer**: Input your business category and target market to receive custom viability scores, local competitor maps, demographic fits, and alternative site suggestions.
- **Digital & SEO Advisor**: Input your website URL to trigger a live SEO audit. The module evaluates page-speed characteristics, recommends tech stack optimization, and identifies localized keywords.
- **Interactive Business Consultant**: Guides you through a structured questionnaire to refine business concepts, estimate startup costs, calculate SWOT profiles, and draft launch marketing roadmaps.
- **Dedicated Chat Portal**: A domain-specific AI chat interface to ask questions about technology stacks, website hosting, digital vs. offline marketing budgets, and SSL setups.
- **User Dashboard**: Save scans and business plans securely. Access, expand, delete, or export previous data directly from your personal feed.

---

## Technology Stack

- **Framework**: Next.js (App Router, React, TypeScript)
- **Styling**: Tailwind CSS for responsive layouts, custom vanilla CSS styling variables for glassmorphism
- **Database & Backend**: Supabase (PostgreSQL, Row Level Security)
- **Authentication**: Supabase Auth (Sign-in, registration, and Google OAuth flow)
- **AI Integration**: Groq API (High-performance inference engine for contextual business advice)
- **Icons**: Lucide React

---

## Getting Started

Follow these steps to run BizBoost locally:

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configuration
Create a `.env.local` file in the root directory and add the following keys:
```env
# AI API configuration
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# Supabase Auth and Database configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Table Creation
Execute this script in the **SQL Editor** of your Supabase Dashboard to create the tables, enable Row Level Security (RLS), and configure user isolation policies:

```sql
-- Table for saving location analysis scans
create table public.saved_scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  biz_type text not null,
  location text not null,
  viability_score integer not null,
  verdict text not null,
  details jsonb not null
);

-- Table for saving startup roadmaps from the consultant
create table public.saved_roadmaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  biz_type text not null,
  locality text not null,
  budget text not null,
  roadmap jsonb not null
);

-- Enable Row Level Security (RLS)
alter table public.saved_scans enable row level security;
alter table public.saved_roadmaps enable row level security;

-- Create RLS policies
create policy "Users can insert their own scans" on public.saved_scans 
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own scans" on public.saved_scans 
  for select using (auth.uid() = user_id);

create policy "Users can delete their own scans" on public.saved_scans 
  for delete using (auth.uid() = user_id);

create policy "Users can insert their own roadmaps" on public.saved_roadmaps 
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own roadmaps" on public.saved_roadmaps 
  for select using (auth.uid() = user_id);

create policy "Users can delete their own roadmaps" on public.saved_roadmaps 
  for delete using (auth.uid() = user_id);
```

### 4. Running Locally
Start the local Next.js development server:
```bash
npm run dev
```
Open http://localhost:3000 in your browser to view the application.

---

## Future Scope

- **Interactive Heatmap Visualizations**: Integrate mapping libraries (such as Leaflet or Mapbox) to visually plot competitor locations, heatmaps of target demographic density, and high-footfall corridors.
- **Live Third-Party SEO Testing APIs**: Integrate Google PageSpeed Insights and Lighthouse APIs directly into the SEO Advisor to fetch actual real-time site audit performance scores.
- **Census and Demographic Datasets**: Incorporate regional census data APIs to offer localized insights into income levels, age distribution, and purchasing power per neighborhood.
- **Financial Projections & Budget Ledger**: Add a ledger system allowing users to input specific numbers, auto-calculate ROI break-evens, and download standardized CSV/PDF reports for bank loans.
- **Multi-Lingual Localization**: Provide localized UI translations and localized AI voice assistant responses in regional languages to support grassroots shop owners.

---

## Visual Design Philosophy

The application features a clean, warm-white design system centered on high readability. It utilizes soft pastel background gradients, light glassmorphic cards, responsive flex spacing, and subtle hover scale adjustments to deliver an engaging, premium, and professional user experience.

---

## License
MIT
