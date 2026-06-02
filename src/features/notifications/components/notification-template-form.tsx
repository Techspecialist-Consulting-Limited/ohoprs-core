"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { organizationsData } from "@/mock/organizations.mock";
import { templateVariables } from "@/mock/notifications.mock";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/auth.store";
import type { NotificationTemplateFormValues } from "@/types/notification";
import { TemplateVariablesPanel } from "@/features/notifications/components/template-variables-panel";

const notificationTemplateSchema = z
  .object({
    name: z.string().min(3, "Template name is required"),
    scope: z.enum(["GLOBAL", "ORGANIZATION"]),
    organizationId: z.string().optional(),
    channel: z.enum(["EMAIL", "SMS", "IN_APP", "WHATSAPP"]),
    type: z.enum([
      "BENEFICIARY_CREATED",
      "BENEFICIARY_VERIFIED",
      "DISTRIBUTION_CREATED",
      "DISTRIBUTION_COMPLETED",
      "BULK_JOB_COMPLETED",
      "BULK_JOB_FAILED",
      "SYSTEM_ALERT",
    ]),
    subject: z.string().optional(),
    content: z.string().min(12, "Content is required"),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "ORGANIZATION" && !value.organizationId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationId"],
        message: "Organization is required for organization templates.",
      });
    }

    if (value.channel === "EMAIL" && !value.subject?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: "Subject is required for email templates.",
      });
    }
  });

export function NotificationTemplateForm({
  canChooseScope,
  defaultOrganizationId,
}: {
  canChooseScope: boolean;
  defaultOrganizationId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const organizationId = useAuthStore((state) => state.organizationId);
  const organizationName = useAuthStore((state) => state.user?.organizationName);
  type FormInput = z.input<typeof notificationTemplateSchema>;
  type FormOutput = z.output<typeof notificationTemplateSchema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      name: "",
      scope: canChooseScope ? "GLOBAL" : "ORGANIZATION",
      organizationId: defaultOrganizationId ?? "",
      channel: "EMAIL",
      type: "DISTRIBUTION_COMPLETED",
      subject: "",
      content: "",
      isActive: true,
    },
  });

  const channel = useWatch({ control: form.control, name: "channel" });
  const scope = useWatch({ control: form.control, name: "scope" });

  const mutation = useMutation({
    mutationFn: (payload: NotificationTemplateFormValues) =>
      notificationService.createTemplate(payload, {
        role: role!,
        organizationId,
        organizationName: organizationName ?? null,
      }),
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        toast.error(response.message);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast.success("Notification template created");
      router.push(`/notifications/templates/${response.data.id}`);
    },
  });

  function onSubmit(values: FormOutput) {
    mutation.mutate(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <section className="grid gap-5 rounded-[28px] border border-border bg-surface p-6 shadow-sm lg:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className={inputClassName} placeholder="Distribution Completed SMS" />
        </Field>

        {canChooseScope ? (
          <Field label="Scope" error={form.formState.errors.scope?.message}>
            <select {...form.register("scope")} className={inputClassName}>
              <option value="GLOBAL">Global</option>
              <option value="ORGANIZATION">Organization</option>
            </select>
          </Field>
        ) : (
          <Field label="Scope">
            <input value="Organization" disabled className={`${inputClassName} bg-surface-muted`} />
          </Field>
        )}

        {scope === "ORGANIZATION" ? (
          <Field label="Organization" error={form.formState.errors.organizationId?.message}>
            <select
              {...form.register("organizationId")}
              disabled={!canChooseScope}
              className={inputClassName}
            >
              <option value="">Select organization</option>
              {organizationsData.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <Field label="Channel" error={form.formState.errors.channel?.message}>
          <select {...form.register("channel")} className={inputClassName}>
            {["EMAIL", "SMS", "IN_APP", "WHATSAPP"].map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Type" error={form.formState.errors.type?.message}>
          <select {...form.register("type")} className={inputClassName}>
            {["BENEFICIARY_CREATED", "BENEFICIARY_VERIFIED", "DISTRIBUTION_CREATED", "DISTRIBUTION_COMPLETED", "BULK_JOB_COMPLETED", "BULK_JOB_FAILED", "SYSTEM_ALERT"].map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>

        {channel === "EMAIL" ? (
          <Field label="Subject" error={form.formState.errors.subject?.message}>
            <input {...form.register("subject")} className={inputClassName} placeholder="Your distribution update" />
          </Field>
        ) : null}

        <Field label="Active Status">
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-surface px-4 text-sm text-foreground">
            <input type="checkbox" {...form.register("isActive")} />
            Active template
          </label>
        </Field>

        <div className="lg:col-span-2">
          <Field label="Content" error={form.formState.errors.content?.message}>
            <textarea
              {...form.register("content")}
              className={`${inputClassName} min-h-36 py-3`}
              placeholder="Hello {{beneficiaryName}}, your benefit under {{programName}} has been processed successfully."
            />
          </Field>
        </div>
      </section>

      <TemplateVariablesPanel variables={templateVariables} />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Creating..." : "Create Template"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent";
