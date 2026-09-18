import { Suspense } from "react";

import { BeneficiariesModule } from "@/features/beneficiaries/components/beneficiaries-module";

export default function BeneficiariesPage() {
  return (
    <Suspense fallback={null}>
      <BeneficiariesModule />
    </Suspense>
  );
}
