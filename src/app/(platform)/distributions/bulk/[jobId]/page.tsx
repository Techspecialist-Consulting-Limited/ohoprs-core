import { BulkJobDetailsModule } from "@/features/bulk-distributions/components/bulk-job-details-module";

export default async function BulkJobDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return <BulkJobDetailsModule jobId={jobId} />;
}
