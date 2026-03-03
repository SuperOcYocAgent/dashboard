# Dashboard

A modern dark-mode dashboard built with Next.js, Tailwind CSS, shadcn/ui, and Recharts.

## Features

- Dark mode by default
- Responsive sidebar (collapsible)
- Topbar with search, refresh, and notifications
- KPI cards with trends
- Line and bar charts
- Data table with status badges
- Tabs for Overview / Activity / Logs

## Installation

```bash
npm install
```

## Running

```bash
npm run dev -- --hostname 0.0.0.0 --port 5000
```

Then access at: http://100.77.74.45:5000/dashboard

## Adding a new page/widget

1. Create a new component in `/src/components/`
2. Import and use it in `/src/app/dashboard/page.tsx`
3. For a new route, create a folder in `/src/app/dashboard/`

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- lucide-react
- Recharts
