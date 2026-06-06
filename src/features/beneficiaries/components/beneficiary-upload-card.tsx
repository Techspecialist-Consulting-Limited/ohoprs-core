"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileUp } from "lucide-react";

import { beneficiaryUploadPreviewRows } from "@/mock/beneficiaries.mock";

export function BeneficiaryUploadCard() {
  const [showSuccess, setShowSuccess] = useState(false);

  function downloadTemplate() {
    const header = "firstName,lastName,middleName,nin,bvn,phone,email,gender,dateOfBirth,state,lga,address,organizationId,programIds";
    const rows = beneficiaryUploadPreviewRows.map((row) =>
      [
        row.firstName,
        row.lastName,
        row.middleName,
        row.nin,
        row.bvn,
        row.phone,
        row.email,
        row.gender,
        row.dateOfBirth,
        row.state,
        row.lga,
        row.address,
        row.organizationId,
        row.programIds,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "beneficiary-upload-template.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully.");
  }

  return (
    <div className="rounded-[32px] border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Upload beneficiaries</p>
          <p className="mt-1 text-sm text-muted">Prepare bulk imports for the central beneficiary pool using the standard CSV template. Parsing and processing will be implemented in a later phase.</p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-foreground"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      <div className="mt-6 rounded-[28px] border border-dashed border-border-strong bg-surface-muted p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <FileUp size={24} />
        </div>
        <p className="mt-4 text-lg font-semibold text-foreground">Drag and drop CSV or Excel file</p>
        <p className="mt-2 text-sm text-muted">No real file parsing in this phase. Use the button below to simulate upload review.</p>
        <button
          type="button"
          onClick={() => {
            setShowSuccess(true);
            toast.success("Mock upload completed. Review the import preview below.");
          }}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground"
        >
          Simulate Upload
        </button>
      </div>

      <div className="mt-6 rounded-[28px] border border-border bg-surface-muted p-5">
        <p className="text-sm font-semibold text-foreground">Import rules</p>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>NIN must be exactly 11 digits.</li>
          <li>BVN must be 11 digits when provided.</li>
          <li>Uploaded rows in this phase are preview-only and will not mutate the main beneficiary list.</li>
        </ul>
      </div>

      {showSuccess ? (
        <div className="mt-6 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-foreground">
          Mock upload successful. Review the 5 imported rows below.
        </div>
      ) : null}
    </div>
  );
}
