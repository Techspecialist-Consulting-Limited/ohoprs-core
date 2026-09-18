import { FieldOutcomeFormModule } from "@/features/field/components/field-outcome-form-module";

export default async function FieldOutcomeFeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <FieldOutcomeFormModule id={id} />;
}
