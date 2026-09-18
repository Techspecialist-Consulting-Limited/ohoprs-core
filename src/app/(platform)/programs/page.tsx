import { Suspense } from "react";

import { ProgramsModule } from "@/features/programs/components/programs-module";

export default function ProgramsPage() {
  return (
    <Suspense fallback={null}>
      <ProgramsModule />
    </Suspense>
  );
}
