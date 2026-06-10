import { Input } from "@/components/common/input";
import type { OrganizationSetupProfile } from "@/lib/organization-setup";
import {
  currencyOptions,
  financialYearDays,
  financialYearMonths,
} from "../../constants";
import {
  SetupField,
  SetupSectionTitle,
  setupCardClassName,
} from "../../SetupField";
import SetupSelect from "../../SetupSelect";

export default function FinancialDetailsCard({
  disabled,
  setupProfile,
  errors,
  onSetupProfileChange,
}: {
  disabled: boolean;
  setupProfile: OrganizationSetupProfile;
  errors?: Partial<Record<string, string>>;
  onSetupProfileChange: (field: keyof OrganizationSetupProfile, value: string) => void;
}) {
  return (
    <section className={setupCardClassName}>
      <SetupSectionTitle title="Financial Details" />
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Choose the currency that your organization files taxes and reports in.
        You can adjust these values later if needed.
      </p>

      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <SetupField label="Currency">
            <SetupSelect
              value={setupProfile.currency}
              options={currencyOptions}
              onChange={(value) => onSetupProfileChange("currency", value)}
              disabled={disabled}
              placeholder="Select reporting currency"
            />
          </SetupField>

          <SetupField label="Financial Year End">
            <SetupSelect
              value={setupProfile.financialYearEndDay}
              options={financialYearDays}
              onChange={(value) => onSetupProfileChange("financialYearEndDay", value)}
              disabled={disabled}
              placeholder="Select day"
            />
          </SetupField>

          <SetupField label="&nbsp;">
            <SetupSelect
              value={setupProfile.financialYearEndMonth}
              options={financialYearMonths}
              onChange={(value) => onSetupProfileChange("financialYearEndMonth", value)}
              disabled={disabled}
              placeholder="Select month"
            />
          </SetupField>
        </div>

        <SetupField label="PAN Number" error={errors?.panNumber}>
          <Input
            value={setupProfile.panNumber}
            onChange={(event) => onSetupProfileChange("panNumber", event.target.value.toUpperCase())}
            readOnly={disabled}
            placeholder="Enter PAN number"
          />
        </SetupField>

        <SetupField label="Aadhaar Number" error={errors?.aadhaarNumber} hint="Optional, 12 digits">
          <Input
            value={setupProfile.aadhaarNumber}
            onChange={(event) =>
              onSetupProfileChange("aadhaarNumber", event.target.value.replace(/\s+/g, ""))
            }
            readOnly={disabled}
            placeholder="Enter Aadhaar number"
          />
        </SetupField>

        <SetupField label="TAN Number" error={errors?.tanNumber}>
          <Input
            value={setupProfile.tanNumber}
            onChange={(event) => onSetupProfileChange("tanNumber", event.target.value.toUpperCase())}
              readOnly={disabled}
              placeholder="Enter TAN number"
            />
          </SetupField>

        <SetupField label="PF Account Number" error={errors?.pfAccountNumber}>
            <Input
              value={setupProfile.pfAccountNumber}
              onChange={(event) => onSetupProfileChange("pfAccountNumber", event.target.value)}
              readOnly={disabled}
              placeholder="Enter PF account number"
            />
          </SetupField>
      </div>
    </section>
  );
}
