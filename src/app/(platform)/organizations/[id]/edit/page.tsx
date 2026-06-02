import { OrganizationEditModule } from "@/features/organizations/components/organization-form-page";

export default async function OrganizationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrganizationEditModule id={id} />;
}
