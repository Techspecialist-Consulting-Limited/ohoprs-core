import { PaymentConsoleModule } from "@/features/payment-console/components/PaymentConsoleModule";

export default async function DistributionPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PaymentConsoleModule id={id} />;
}
