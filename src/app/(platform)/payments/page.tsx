import { Suspense } from "react";

import { PaymentsModule } from "@/features/payments/components/payments-module";

export default function PaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsModule />
    </Suspense>
  );
}
