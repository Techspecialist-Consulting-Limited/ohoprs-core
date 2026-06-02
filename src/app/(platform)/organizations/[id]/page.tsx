import { OrganizationDetailsModule } from "@/features/organizations/components/organization-details-module";

export default async function OrganizationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrganizationDetailsModule id={id} />;
}
