export function PaymentFailureCard({ reason }: { reason?: string }) {
  if (!reason) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-danger/20 bg-danger/5 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger">Failure details</p>
      <p className="mt-3 text-sm leading-6 text-foreground">{reason}</p>
    </section>
  );
}
