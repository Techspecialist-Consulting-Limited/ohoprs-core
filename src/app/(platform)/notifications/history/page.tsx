import { Suspense } from "react";

import { NotificationHistoryModule } from "@/features/notifications/components/notifications-modules";

export default function NotificationHistoryPage() {
  return (
    <Suspense fallback={null}>
      <NotificationHistoryModule />
    </Suspense>
  );
}
