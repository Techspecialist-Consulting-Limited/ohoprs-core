import { ProgramEditModule } from "@/features/programs/components/program-form-page";

export default async function ProgramEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProgramEditModule id={id} />;
}
