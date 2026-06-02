"use client";

import { useMutation } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { reportService } from "@/services/report.service";
import type { ReportFiltersState } from "@/types/report";

export function ExportButtons({
  reportType,
  filters,
}: {
  reportType: "summary" | "organizations" | "programs" | "beneficiaries" | "distributions";
  filters: ReportFiltersState;
}) {
  const exportMutation = useMutation({
    mutationFn: () => reportService.exportCsv(reportType, filters),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      const blob = new Blob([response.data.content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.data.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("CSV export downloaded");
    },
  });

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => exportMutation.mutate()}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
      >
        <Download size={16} />
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => toast.info("PDF export will be available in production.")}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-foreground"
      >
        <FileText size={16} />
        Export PDF
      </button>
    </div>
  );
}
