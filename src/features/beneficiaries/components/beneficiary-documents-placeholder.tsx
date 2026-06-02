import type { Beneficiary360Details } from "@/types/beneficiary";

export function BeneficiaryDocumentsPlaceholder({ documents }: { documents: Beneficiary360Details["documentSummary"] }) {
  const rows = [
    { label: "ID document", value: documents.idDocument },
    { label: "Bank verification", value: documents.bankVerification },
    { label: "Enrollment form", value: documents.enrollmentForm },
    { label: "Supporting documents", value: documents.supportingDocuments },
  ];

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-foreground">Documents</p>
        <p className="mt-1 text-sm text-muted">Structured placeholder for beneficiary documentation and verification artifacts.</p>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3">
            <span className="text-sm text-foreground">{row.label}</span>
            <span className="text-sm text-muted">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
