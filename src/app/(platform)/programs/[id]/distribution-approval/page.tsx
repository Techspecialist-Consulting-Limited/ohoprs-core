import { ProgramDistributionApprovalModule } from "@/features/programs/components/program-distribution-approval-module";

export default async function ProgramDistributionApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProgramDistributionApprovalModule id={id} />;
}
