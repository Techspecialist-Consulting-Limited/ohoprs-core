import { Suspense } from "react";

import { HouseholdsModule } from "@/features/households/components/households-module";

export default function HouseholdsPage() {
  return (
    <Suspense fallback={null}>
      <HouseholdsModule />
    </Suspense>
  );
}
