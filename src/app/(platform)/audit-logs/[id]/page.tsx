import { AuditLogDetailsModule } from "@/features/audit/components/audit-modules";

export default async function AuditLogDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AuditLogDetailsModule id={id} />;
}
