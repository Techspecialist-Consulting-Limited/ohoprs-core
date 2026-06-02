import { DistributionApprovalModule } from "@/features/approvals/components/distribution-approval-module";

export default async function DistributionApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DistributionApprovalModule id={id} />;
}
