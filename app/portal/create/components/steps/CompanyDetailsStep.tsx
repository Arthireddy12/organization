import type { OrganizationSetupProfile } from "@/lib/organization-setup";
import type { FormMode } from "../types";
import CompanyBasicsRow from "./company-details/CompanyBasicsRow";
import AddressDetailsCard from "./company-details/AddressDetailsCard";
import BranchOfficesCard from "./company-details/BranchOfficesCard";
import FinancialDetailsCard from "./company-details/FinancialDetailsCard";

type CompanyDetailsStepProps = {
  mode: FormMode;
  organizationName: string;
  industry: string;
  setupProfile: OrganizationSetupProfile;
  errors?: Partial<Record<string, string>>;
  onOrganizationNameChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onSetupProfileChange: (field: keyof OrganizationSetupProfile, value: string) => void;
  onAddBranchOffice: (branch: {
    name: string;
    location: string;
    subLocation: string;
  }) => void;
  onRemoveBranchOffice: (branchId: string) => void;
};

export default function CompanyDetailsStep(props: CompanyDetailsStepProps) {
  const disabled = props.mode === "view";

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-white bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
              Step 1 Guide
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">
              Add your core organization details first
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Fill in the company name, location, branch details, and financial information.
              Placeholder text inside each field shows the expected value format.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                What To Add
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Company, address, branches
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Why It Matters
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Used across portal setup and HR records
              </p>
            </div>
          </div>
        </div>
      </section>

      <CompanyBasicsRow
        disabled={disabled}
        organizationName={props.organizationName}
        industry={props.industry}
        setupProfile={props.setupProfile}
        errors={props.errors}
        onOrganizationNameChange={props.onOrganizationNameChange}
        onIndustryChange={props.onIndustryChange}
        onSetupProfileChange={props.onSetupProfileChange}
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_1fr_1fr]">
        <AddressDetailsCard
          disabled={disabled}
          setupProfile={props.setupProfile}
          errors={props.errors}
          onSetupProfileChange={props.onSetupProfileChange}
        />
        <BranchOfficesCard
          disabled={disabled}
          setupProfile={props.setupProfile}
          onAddBranchOffice={props.onAddBranchOffice}
          onRemoveBranchOffice={props.onRemoveBranchOffice}
        />
        <FinancialDetailsCard
          disabled={disabled}
          setupProfile={props.setupProfile}
          errors={props.errors}
          onSetupProfileChange={props.onSetupProfileChange}
        />
      </div>
    </div>
  );
}
