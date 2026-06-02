"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { resetPasswordSchema } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/services/auth.service";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: ({ password }: ResetPasswordValues) => authService.resetPassword(password, token),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push("/login");
    },
  });

  return (
    <div className="mx-auto w-full max-w-xl rounded-[32px] border border-border bg-surface p-8 shadow-sm sm:p-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Reset password</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Update your password to continue using the prototype environment.
      </p>

      {!token ? (
        <div className="mt-5 rounded-2xl border border-warning/20 bg-warning/10 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 text-warning" />
            <p className="text-sm text-foreground">
              Prototype mode: reset token validation is mocked.
            </p>
          </div>
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            {...form.register("password")}
            className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            placeholder="Enter a new password"
          />
          {form.formState.errors.password ? (
            <p className="mt-2 text-sm text-danger">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...form.register("confirmPassword")}
            className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground"
            placeholder="Repeat the new password"
          />
          {form.formState.errors.confirmPassword ? (
            <p className="mt-2 text-sm text-danger">{form.formState.errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Updating..." : "Reset password"}
        </button>
      </form>

      <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-accent hover:underline">
        Return to login
      </Link>
    </div>
  );
}
