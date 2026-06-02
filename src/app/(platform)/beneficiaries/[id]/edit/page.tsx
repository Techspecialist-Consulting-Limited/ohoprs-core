import { BeneficiaryEditModule } from "@/features/beneficiaries/components/beneficiary-form-page";

export default async function BeneficiaryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BeneficiaryEditModule id={id} />;
}
