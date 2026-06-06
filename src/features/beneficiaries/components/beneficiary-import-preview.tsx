import { beneficiaryUploadPreviewRows } from "@/mock/beneficiaries.mock";

export function BeneficiaryImportPreview() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-surface-muted px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Import preview</p>
        <p className="mt-1 text-sm text-muted">Sample rows from the mock upload experience.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
              {["First Name", "Last Name", "NIN", "Phone", "State", "Agency", "Intervention IDs"].map((label) => (
                <th key={label} className="px-5 py-4">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beneficiaryUploadPreviewRows.map((row) => (
              <tr key={`${row.nin}-${row.firstName}`} className="border-t border-border">
                <td className="px-5 py-4 text-sm text-foreground">{row.firstName}</td>
                <td className="px-5 py-4 text-sm text-foreground">{row.lastName}</td>
                <td className="px-5 py-4 text-sm text-foreground">{row.nin}</td>
                <td className="px-5 py-4 text-sm text-muted">{row.phone}</td>
                <td className="px-5 py-4 text-sm text-muted">{row.state}</td>
                <td className="px-5 py-4 text-sm text-muted">{row.organizationId}</td>
                <td className="px-5 py-4 text-sm text-muted">{row.programIds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
