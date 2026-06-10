"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import type { ToastState } from "./types";

export default function CreateOrganizationToast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  if (!toast) return null;

  const success = toast.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div className="fixed right-6 top-6 z-50 w-[min(360px,calc(100vw-32px))]">
      <div
        className={`flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg ${
          success ? "border-emerald-200" : "border-rose-200"
        }`}
      >
        <span
          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
            success ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {success ? "Success" : "Unable to save organization"}
          </p>
          <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
