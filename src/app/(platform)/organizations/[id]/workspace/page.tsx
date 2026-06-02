import { OrganizationWorkspaceModule } from "@/features/workspace/components/workspace-module";

export default async function OrganizationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrganizationWorkspaceModule organizationId={id} />;
}
