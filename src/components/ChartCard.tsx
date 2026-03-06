import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="bg-card border-border/50 transition-all duration-200 hover:border-border/80 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
