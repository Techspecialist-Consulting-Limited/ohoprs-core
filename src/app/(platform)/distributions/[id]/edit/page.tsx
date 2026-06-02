import { DistributionEditModule } from "@/features/distributions/components/distribution-form-page";

export default async function EditDistributionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DistributionEditModule id={id} />;
}
