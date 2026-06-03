"use client";

import { AlertTriangle } from "lucide-react";

export function PaymentRiskWarning({ reasons }: { reasons: string[] }) {
  if (!reasons.length) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-warning/20 bg-warning/10 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 text-warning" />
        <div>
          <p className="text-base font-semibold text-foreground">High-risk distribution</p>
          <p className="mt-1 text-sm text-muted">This payment batch triggers one or more governance risk thresholds and should receive elevated review attention.</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {reasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
