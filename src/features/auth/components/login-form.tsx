"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { RoleSelector } from "@/features/auth/components/role-selector";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { mockUsers } from "@/mock/auth.mock";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";

type LoginFormValues = z.infer<typeof loginSchema>;

const defaultRole: UserRole = "SUPER_ADMIN";

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
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm sm:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-accent-foreground">
            NB
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">National Benefits</p>
            <p className="text-xs text-muted">Administration Platform</p>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Sign in to continue</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Demo-ready authentication foundation for the government benefits operations platform.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Demo role</label>
            <RoleSelector
              value={selectedRole}
              onChange={(role) => form.setValue("role", role, { shouldValidate: true })}
            />
            {form.formState.errors.role ? (
              <p className="text-sm text-danger">{form.formState.errors.role.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...form.register("email")}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-soft"
              placeholder="Enter your work email"
            />
            {form.formState.errors.email ? (
              <p className="mt-2 text-sm text-danger">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="block text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              {...form.register("password")}
              className="focus-ring h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-soft"
              placeholder="Any non-empty password works for demo mode"
            />
            {form.formState.errors.password ? (
              <p className="mt-2 text-sm text-danger">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-accent" size={20} />
            <p className="text-sm font-semibold text-foreground">Demo credentials</p>
          </div>
          <div className="mt-5 space-y-3">
            {mockUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-border bg-surface-muted p-4">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="mt-1 text-sm text-muted">{user.email}</p>
                <p className="mt-2 text-xs font-medium text-accent">{user.role.replaceAll("_", " ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-border bg-[#161616] p-8 text-white shadow-sm">
          <p className="text-sm font-semibold">Prototype notes</p>
          <ul className="mt-4 space-y-3 text-sm text-white/72">
            <li>Role selector drives the login persona for fast demos.</li>
            <li>Session persists in local storage until logout.</li>
            <li>Permissions update instantly across header and sidebar.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
