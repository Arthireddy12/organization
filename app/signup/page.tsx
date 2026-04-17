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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SUPER_ADMIN");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            HRMS
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Register to manage organizations in the super admin portal.
          </p>
        </div>

        <section className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white/90 p-8 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/50 backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-900/80 dark:shadow-none dark:ring-slate-800">
          {error ? <div className={`mb-6 ${errorBoxClass}`}>{error}</div> : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className={formLabelClass}>
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                className={formInputClass}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="email" className={formLabelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className={formInputClass}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className={formLabelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Min. 8 characters"
                className={formInputClass}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="role" className={formLabelClass}>
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className={formInputClass}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className={primaryButtonClass}>
              {submitting ? "Creating…" : "Sign up"}
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
