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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Signup failed");
      }

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
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(at 80% 20%, rgb(20 184 166 / 0.15) 0px, transparent 50%), radial-gradient(at 20% 80%, rgb(99 102 241 / 0.12) 0px, transparent 45%)",
        }}
      />
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
        {/* Logo */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-xl font-bold text-white shadow-lg shadow-teal-500/20">
          H
        </div>

        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            HRMS
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Register to manage organizations in the super admin dashboard.
          </p>
        </div>

        <section className="w-full max-w-md animate-fade-in rounded-2xl border border-slate-200/90 bg-white/90 p-8 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/50 backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-900/80 dark:shadow-none dark:ring-slate-800">
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
              className="font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
