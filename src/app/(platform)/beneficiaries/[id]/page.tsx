import { BeneficiaryDetailsModule } from "@/features/beneficiaries/components/beneficiary-details-module";

export default async function BeneficiaryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BeneficiaryDetailsModule id={id} />;
}
