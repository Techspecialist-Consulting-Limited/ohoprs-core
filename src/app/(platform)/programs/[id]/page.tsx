import { ProgramDetailsModule } from "@/features/programs/components/program-details-module";

export default async function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProgramDetailsModule id={id} />;
}
