import { ProgramDistributionApprovalModule } from "@/features/programs/components/program-distribution-approval-module";

export default async function ProgramDistributionApprovalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return <ProgramDistributionApprovalModule id={id} from={resolvedSearchParams?.from ?? null} />;
}
