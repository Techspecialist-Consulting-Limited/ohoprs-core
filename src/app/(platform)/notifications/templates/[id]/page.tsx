import { NotificationTemplateDetailsModule } from "@/features/notifications/components/notifications-modules";

export default async function NotificationTemplateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <NotificationTemplateDetailsModule id={id} />;
}
