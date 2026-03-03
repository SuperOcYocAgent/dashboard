import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Update {
  id: number;
  timestamp: string;
  type: string;
  title: string;
  status: string;
}

interface DataTableProps {
  data: Update[];
}

const statusColors: Record<string, string> = {
  success: "bg-emerald-500/20 text-emerald-400",
  warning: "bg-amber-500/20 text-amber-400",
  error: "bg-rose-500/20 text-rose-400",
  pending: "bg-blue-500/20 text-blue-400",
};

export function DataTable({ data }: DataTableProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-foreground">Latest Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell className="text-foreground capitalize">{item.type}</TableCell>
                <TableCell className="text-foreground">{item.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
