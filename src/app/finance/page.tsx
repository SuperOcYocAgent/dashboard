import { FinancialMetrics } from "@/components/FinancialMetrics";
import { YonkiMetrics } from "@/components/YonkiMetrics";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <FinancialMetrics />
      <YonkiMetrics />
    </div>
  );
}
