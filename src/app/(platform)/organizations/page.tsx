import { Suspense } from "react";

import { OrganizationsModule } from "@/features/organizations/components/organizations-module";

export default function OrganizationsPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationsModule />
    </Suspense>
  );
}
