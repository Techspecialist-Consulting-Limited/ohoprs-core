import { DistributionPaymentsModule } from "@/features/payments/components/distribution-payments-module";

export default async function DistributionPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DistributionPaymentsModule id={id} />;
}
