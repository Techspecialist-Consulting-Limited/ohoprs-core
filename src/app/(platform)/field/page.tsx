import { Suspense } from "react";

import { FieldHouseholdsModule } from "@/features/field/components/field-households-module";

export default function FieldPage() {
  return (
    <Suspense fallback={null}>
      <FieldHouseholdsModule />
    </Suspense>
  );
}
