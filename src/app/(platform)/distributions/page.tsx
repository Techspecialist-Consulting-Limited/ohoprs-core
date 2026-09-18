import { Suspense } from "react";

import { DistributionsModule } from "@/features/distributions/components/distributions-module";

export default function DistributionsPage() {
  return (
    <Suspense fallback={null}>
      <DistributionsModule />
    </Suspense>
  );
}
