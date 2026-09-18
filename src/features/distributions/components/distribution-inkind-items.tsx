"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { distributionService } from "@/services/distribution.service";
import { useAuthStore } from "@/store/auth.store";
import type { InKindItem, InKindItemDeliveryStatus } from "@/types/distribution";

const statusToneMap: Record<InKindItemDeliveryStatus, string> = {
  PENDING: "border-warning/20 bg-warning/10 text-warning",
  DELIVERED: "border-success/20 bg-success/10 text-success",
  FAILED: "border-danger/20 bg-danger/10 text-danger",
  RETURNED: "border-border bg-surface-muted text-muted",
};

export function DistributionInKindItems({
  distributionId,
  items,
  canUpdate,
}: {
  distributionId: string;
  items: InKindItem[];
  canUpdate: boolean;
}) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: InKindItemDeliveryStatus }) =>
      distributionService.updateInKindItemDeliveryStatus(
        distributionId,
        itemId,
        status,
        user?.id ?? "unknown_user",
        user?.name ?? "Unknown user",
      ),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["distribution", distributionId] });
      toast.success(response.message);
    },
    onError: () => toast.error("Unable to update item delivery status."),
  });

  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-soft">Traceability</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">In-Kind Item Tracking</h2>
      <p className="mt-1 text-sm text-muted">
        Every non-cash package in this batch, traced to the household it was delivered to, with a batch/serial and QR code for verification at the delivery point.
      </p>

      {items.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-border">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
                {["Item", "Batch / Serial Code", "QR Code", "Household", "Delivery Location", "Status", "Actions"].map((label) => (
                  <th key={label} className="px-4 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {item.quantity} {item.unit} — {item.itemType}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{item.batchOrSerialCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{item.qrCode}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/households/${item.recipientHouseholdId}`} className="font-medium text-accent hover:underline">
                      View Household
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{item.deliveryLocation}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", statusToneMap[item.deliveryStatus])}>
                      {item.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canUpdate && item.deliveryStatus !== "DELIVERED" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ itemId: item.id, status: "DELIVERED" })}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-surface-muted"
                        >
                          Mark Delivered
                        </button>
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ itemId: item.id, status: "FAILED" })}
                          className="rounded-lg border border-danger/30 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
                        >
                          Mark Failed
                        </button>
                      </div>
                    ) : canUpdate && item.deliveryStatus === "DELIVERED" ? (
                      <button
                        type="button"
                        onClick={() => statusMutation.mutate({ itemId: item.id, status: "RETURNED" })}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-surface-muted"
                      >
                        Mark Returned
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            title="No in-kind items recorded"
            description="This batch does not have traceable in-kind items, either because it is a cash distribution or none have been generated yet."
          />
        </div>
      )}
    </section>
  );
}
