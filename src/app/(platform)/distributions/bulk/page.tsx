import { Suspense } from "react";

import { BulkDistributionsModule } from "@/features/bulk-distributions/components/bulk-distributions-module";

export default function BulkDistributionsPage() {
  return (
    <Suspense fallback={null}>
      <BulkDistributionsModule />
    </Suspense>
  );
}
