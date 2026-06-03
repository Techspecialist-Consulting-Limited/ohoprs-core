"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { mockUsers } from "@/mock/auth.mock";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";

type LoginFormValues = z.infer<typeof loginSchema>;

const defaultRole: UserRole = "SUPER_ADMIN";
const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN: "Org Admin",
  PROGRAM_OFFICER: "Program Admin",
  AUDITOR: "Auditor",
};

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const setCurrentTenant = useAuthStore((state) => state.setCurrentTenant);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: mockUsers.find((user) => user.role === defaultRole)?.email ?? "",
      password: "",
      role: defaultRole,
    },
  });

  const selectedRole = useWatch({
    control: form.control,
    name: "role",
  });

  useEffect(() => {
    const mockUser = mockUsers.find((user) => user.role === selectedRole);

    if (mockUser) {
      form.setValue("email", mockUser.email, { shouldValidate: true });
    }
  }, [form, selectedRole]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      login(response.data);
      setCurrentTenant(authService.getTenantForRole(response.data.user.role));
      toast.success(response.message);
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Unable to sign in. Please try again.");
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-[-24px] rounded-[40px] bg-white/18 blur-3xl"
        />
        <div className="rounded-[32px] bg-white/92 p-6 shadow-[0_24px_70px_rgba(27,52,39,0.14)] backdrop-blur-xl sm:p-8">
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
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#162117]">Welcome back</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#6b746c]">
              Sign in to continue to the operations dashboard.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#162117]" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(event) => form.setValue("role", event.target.value as UserRole, { shouldValidate: true })}
                className="focus-ring h-13 w-full rounded-2xl bg-[#f7f8f5] px-4 text-sm text-[#162117] outline-none"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {form.formState.errors.role ? (
                <p className="mt-2 text-sm text-danger">{form.formState.errors.role.message}</p>
              ) : null}
            </div>

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

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="block text-sm font-medium text-[#162117]" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-[#2d6e43] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                {...form.register("password")}
                className="focus-ring h-13 w-full rounded-2xl bg-[#f7f8f5] px-4 text-sm text-[#162117] placeholder:text-[#94a097]"
                placeholder="Enter your password"
              />
              {form.formState.errors.password ? (
                <p className="mt-2 text-sm text-danger">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#2d6e43] px-4 text-sm font-semibold text-white transition hover:bg-[#245636] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
