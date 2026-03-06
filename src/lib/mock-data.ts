export const kpiData = [
  { title: "Tasks", value: "1,234", change: "+12%", trend: "up" as const },
  { title: "Updates", value: "89", change: "+5%", trend: "up" as const },
  { title: "Errors", value: "23", change: "-8%", trend: "down" as const },
  { title: "Latency", value: "45ms", change: "-3%", trend: "down" as const },
  { title: "Cost", value: "$2,340", change: "+15%", trend: "up" as const },
  { title: "Uptime", value: "99.9%", change: "+0.1%", trend: "up" as const },
];

export const activityData = [
  { day: "Mon", value: 120 },
  { day: "Tue", value: 180 },
  { day: "Wed", value: 150 },
  { day: "Thu", value: 220 },
  { day: "Fri", value: 280 },
  { day: "Sat", value: 160 },
  { day: "Sun", value: 140 },
];

export const sourcesData = [
  { source: "Direct", value: 450 },
  { source: "Social", value: 320 },
  { source: "Organic", value: 280 },
  { source: "Referral", value: 180 },
  { source: "Email", value: 120 },
];

// Static timestamps to avoid hydration mismatch
const staticTimestamps = [
  "2026-03-03T14:00:00Z",
  "2026-03-03T13:00:00Z",
  "2026-03-03T12:00:00Z",
  "2026-03-03T11:00:00Z",
  "2026-03-03T10:00:00Z",
  "2026-03-03T09:00:00Z",
  "2026-03-03T08:00:00Z",
  "2026-03-03T07:00:00Z",
  "2026-03-03T06:00:00Z",
  "2026-03-03T05:00:00Z",
];

export const updatesData = staticTimestamps.map((timestamp, i) => ({
  id: i + 1,
  timestamp,
  type: ["deploy", "alert", "backup", "sync"][i % 4],
  title: [
    "Deployment completed",
    "High CPU usage detected",
    "Backup successful",
    "Data sync finished",
    "New user registered",
    "API rate limit warning",
    "SSL certificate renewed",
    "Database optimized",
    "Cache cleared",
    "Service restarted",
  ][i],
  status: ["success", "warning", "error", "pending"][i % 4],
}));

export const sidebarItems = [
  { label: "Overview", icon: "LayoutDashboard", href: "/dashboard" },
  { label: "Analytics", icon: "BarChart3", href: "/dashboard/analytics" },
  { label: "Settings", icon: "Settings", href: "/dashboard/settings" },
];
