import { Suspense } from "react";

import { AuditLogsModule } from "@/features/audit/components/audit-modules";

export default function AuditLogsPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogsModule />
    </Suspense>
  );
}
