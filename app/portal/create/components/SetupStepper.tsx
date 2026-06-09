import type { OrganizationCreateStep } from "./types";
import { setupSteps } from "./constants";

export default function SetupStepper({
  activeStep,
  completedSteps,
  onStepChange,
}: {
  activeStep: OrganizationCreateStep;
  completedSteps: number[];
  onStepChange: (step: OrganizationCreateStep) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
      <div className="flex min-w-max">
        {setupSteps.map((step) => {
          const active = step.id === activeStep;
          const completed = completedSteps.includes(step.id);
          const palette =
            step.id === 1
              ? "bg-sky-600"
              : step.id === 2
                ? "bg-emerald-600"
                : step.id === 3
                  ? "bg-violet-600"
                  : step.id === 4
                    ? "bg-amber-600"
                    : "bg-rose-600";

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`flex min-w-[220px] items-center gap-3 border-r border-slate-200 px-4 py-3 text-left transition last:border-r-0 ${
                active
                  ? `${palette} text-white`
                  : completed
                    ? "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                    : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${
                  active
                    ? "bg-white text-slate-900"
                    : completed
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {completed ? "✓" : step.id}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.04em]">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
