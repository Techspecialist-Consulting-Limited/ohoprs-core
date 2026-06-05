import { ProgramApprovalModule } from "@/features/programs/components/program-approval-module";

export default async function ProgramApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProgramApprovalModule id={id} />;
}
