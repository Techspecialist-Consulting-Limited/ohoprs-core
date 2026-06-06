"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { DistributionRecipientPreview } from "@/types/distribution";

export function DistributionBeneficiaryPreview({ recipients }: { recipients: DistributionRecipientPreview[] }) {
  const isCash = recipients.some((recipient) => recipient.bankName || recipient.accountNumber);

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Recipients</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Beneficiary preview</h2>
          <p className="mt-1 text-sm text-muted">Sample recipients from the selected distribution batch.</p>
        </div>
        <Link
          href="/beneficiaries"
          className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-medium text-foreground"
        >
          View All Beneficiaries
          <ArrowRight size={16} />
        </Link>
      </div>
      <div className="overflow-hidden rounded-3xl border border-border">
        <table className="min-w-full">
          <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            <tr>
              {[
                "Beneficiary",
                "NIN",
                "State",
                ...(isCash ? ["Bank Name", "Account Number"] : ["LGA", "Address"]),
                "Delivery Status",
              ].map((label) => (
                <th key={label} className="px-4 py-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recipients.map((recipient) => (
              <tr key={recipient.id} className="border-t border-border text-sm text-foreground">
                <td className="px-4 py-3">{recipient.fullName}</td>
                <td className="px-4 py-3 text-muted">{recipient.nin}</td>
                <td className="px-4 py-3 text-muted">{recipient.state}</td>
                {isCash ? (
                  <>
                    <td className="px-4 py-3 text-muted">{recipient.bankName ?? "-"}</td>
                    <td className="px-4 py-3 text-muted">{recipient.accountNumber ?? "-"}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-muted">{recipient.lga ?? "-"}</td>
                    <td className="px-4 py-3 text-muted">{recipient.address ?? "-"}</td>
                  </>
                )}
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                    {recipient.deliveryStatus.replaceAll("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
