"use client";

import Link from "next/link";
import Image from "next/image";
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
    <div className="mx-auto w-full max-w-[460px]">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-[-24px] rounded-[40px] bg-white/18 blur-3xl"
        />
        <div className="relative rounded-[32px] bg-white/92 p-6 shadow-[0_24px_70px_rgba(27,52,39,0.14)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-[22px] bg-[#f4f6f2] p-3">
              <Image
                src="/images/OHO-Logo.png"
                alt="OHOPRS logo"
                width={78}
                height={78}
                className="h-16 w-16 object-contain"
                priority
              />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#2d6e43]">OHOPRS</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#162117]">Forgot password</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#6b746c]">
              Enter your email address and we will trigger the prototype reset flow.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#162117]" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...form.register("email")}
                className="focus-ring h-13 w-full rounded-2xl bg-[#f7f8f5] px-4 text-sm text-[#162117] placeholder:text-[#94a097]"
                placeholder="Enter your email address"
              />
              {form.formState.errors.email ? (
                <p className="mt-2 text-sm text-danger">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex h-13 w-full items-center justify-center rounded-2xl bg-[#2d6e43] px-4 text-sm font-semibold text-white transition hover:bg-[#245636] disabled:opacity-60"
            >
              {mutation.isPending ? "Sending..." : "Send reset instructions"}
            </button>
          </form>

          {submittedEmail ? (
            <div className="mt-6 rounded-2xl bg-[#eef7ef] p-4">
              <div className="flex items-center gap-3">
                <MailCheck size={18} className="text-success" />
                <div>
                  <p className="text-sm font-semibold text-[#162117]">Password reset instructions have been sent.</p>
                  <p className="mt-1 text-sm text-[#6b746c]">Prototype delivery completed for {submittedEmail}.</p>
                </div>
              </div>
            </div>
          ) : null}

          <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-[#2d6e43] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
