"use client";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { VpsMetrics } from "@/components/VpsMetrics";
import { kpiData, activityData, sourcesData, updatesData } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
        <TabsList className="bg-card border border-border/50 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap transition-all duration-200">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap transition-all duration-200">Activity</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap transition-all duration-200">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300"><VpsMetrics /></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
            {kpiData.map((kpi, i) => (
              <div key={kpi.title} className={`animate-in fade-in slide-in-from-bottom-2 duration-300`} style={{ animationDelay: `${i * 50}ms` }}>
                <KpiCard title={kpi.title} value={kpi.value} change={kpi.change} trend={kpi.trend} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "150ms" }}>
              <ChartCard title="Activity (7 days)">
                <div className="h-[200px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "200ms" }}>
              <ChartCard title="Sources">
                <div className="h-[200px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourcesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="source" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                      <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "250ms" }}>
            <DataTable data={updatesData} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-2 duration-300"><div className="text-muted-foreground py-8 text-center">Activity details coming soon...</div></TabsContent>
        <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-2 duration-300"><div className="text-muted-foreground py-8 text-center">System logs coming soon...</div></TabsContent>
      </Tabs>
    </div>
  );
}
