import { formatCurrency, formatDateTime, formatNumber } from "@/lib/formatters";

export function PaymentSummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "border-success/20 bg-success/5"
      : tone === "warning"
        ? "border-warning/20 bg-warning/5"
        : "border-border bg-surface";

  return (
    <div className={`rounded-[28px] border p-5 shadow-sm ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export function paymentSummaryValue(kind: "currency" | "number" | "datetime", value: number | string) {
  if (kind === "currency") return formatCurrency(Number(value));
  if (kind === "number") return formatNumber(Number(value));
  return formatDateTime(String(value));
}
