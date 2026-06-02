import { DistributionDetailsModule } from "@/features/distributions/components/distribution-details-module";

export default async function DistributionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DistributionDetailsModule id={id} />;
}
