import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export function PlaceholderModulePage({
  badge,
  description,
  title,
}: {
  badge: string;
  description: string;
  title: string;
}) {
  return (
    <PageContainer>
      <PageHeader
        eyebrow={badge}
        title={title}
        description="Placeholder route wired into the shared application shell."
      />
      <EmptyState
        title={`${title} module is reserved for a later phase`}
        description={description}
      />
    </PageContainer>
  );
}
