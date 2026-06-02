"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { forgotPasswordSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/services/auth.service";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordValues) => authService.forgotPassword(email),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      setSubmittedEmail(response.data.email);
      toast.success(response.message);
    },
  });

  return (
    <div className="mx-auto w-full max-w-xl rounded-[32px] border border-border bg-surface p-8 shadow-sm sm:p-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Forgot password</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Enter your email to trigger the prototype reset flow.
      </p>

      <form className="mt-8 space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            {...form.register("email")}
            className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            placeholder="name@gov.ng"
          />
          {form.formState.errors.email ? (
            <p className="mt-2 text-sm text-danger">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Sending..." : "Send reset instructions"}
        </button>
      </form>

      {submittedEmail ? (
        <div className="mt-6 rounded-2xl border border-success/20 bg-success/10 p-4">
          <div className="flex items-center gap-3">
            <MailCheck size={18} className="text-success" />
            <div>
              <p className="text-sm font-semibold text-foreground">Password reset instructions have been sent.</p>
              <p className="mt-1 text-sm text-muted">Prototype delivery completed for {submittedEmail}.</p>
            </div>
          </div>
        </div>
      ) : null}

      <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-accent hover:underline">
        Back to login
      </Link>
    </div>
  );
}
