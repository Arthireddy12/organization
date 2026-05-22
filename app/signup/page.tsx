"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  errorBoxClass,
  formInputClass,
  formLabelClass,
  pageShellClass,
  primaryButtonClass,
} from "@/lib/form-styles";
import { useAuth } from "@/components/AuthContext";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
  LoaderCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SUPER_ADMIN");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signup({ name, email, password, role });
      router.push("/portal");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={pageShellClass}>
      <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
        <section className="hidden border-r border-slate-200 bg-white px-12 py-10 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-100">
              H
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">HRMS Dashboard</p>
              <p className="text-xs text-slate-500">Organization Dashboard</p>
            </div>
          </div>
          <div className="my-auto max-w-xl">
            <p className="text-xs font-bold uppercase text-indigo-600">Create Access</p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
              Start with a clean super admin workspace.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-500">
              Create your account, then manage organizations, subscriptions, users, billing, and HRMS modules.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                H
              </div>
              <p className="text-sm font-bold text-slate-950">HRMS Dashboard</p>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold uppercase text-indigo-600">New account</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Create super admin account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Register once, then continue to your dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          {error ? (
            <div className={`mb-6 ${errorBoxClass}`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className={formLabelClass}>
                Full name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  className={`${formInputClass} pl-10`}
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={formLabelClass}>
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className={`${formInputClass} pl-10`}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={formLabelClass}>
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min. 8 characters"
                  className={`${formInputClass} pl-10 pr-10`}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="role" className={formLabelClass}>
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className={`${formInputClass} appearance-none`}
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="HR">HR</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${primaryButtonClass} relative overflow-hidden transition-all`}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle size={16} className="animate-spin" />
                  Creating…
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Login
            </Link>
          </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
