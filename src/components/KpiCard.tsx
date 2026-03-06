import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export function KpiCard({ title, value, change, trend }: KpiCardProps) {
  return (
    <Card className="bg-card border-border/50 transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02] cursor-pointer">">
      <CardContent className="p-4 lg:p-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          <div className={`flex items-center text-xs lg:text-sm ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> : <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />}
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
