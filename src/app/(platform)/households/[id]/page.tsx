import { HouseholdDetailsModule } from "@/features/households/components/household-details-module";

export default async function HouseholdDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <HouseholdDetailsModule id={id} />;
}
