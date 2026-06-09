import type { OrganizationCreateStep } from "./types";
import { setupSteps } from "./constants";

export default function SetupStepper({
  activeStep,
  onStepChange,
}: {
  activeStep: OrganizationCreateStep;
  onStepChange: (step: OrganizationCreateStep) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-w-max">
        {setupSteps.map((step) => {
          const active = step.id === activeStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`flex min-w-[220px] items-center gap-3 border-r border-slate-200 px-4 py-3 text-left transition last:border-r-0 ${
                active ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${
                  active
                    ? "bg-white text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {step.id}
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
