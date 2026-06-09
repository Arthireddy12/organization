import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import type { OrganizationSetupProfile } from "@/lib/organization-setup";
import {
  SetupField,
  SetupSectionTitle,
  setupCardClassName,
} from "../../SetupField";

export default function AddressDetailsCard({
  disabled,
  setupProfile,
  onSetupProfileChange,
}: {
  disabled: boolean;
  setupProfile: OrganizationSetupProfile;
  onSetupProfileChange: (field: keyof OrganizationSetupProfile, value: string) => void;
}) {
  return (
    <section className={setupCardClassName}>
      <SetupSectionTitle title="Basic Information" />
      <div className="mt-4 space-y-4">
        <SetupField label="Street Address or P.O. Box" required>
          <Textarea
            value={setupProfile.streetAddress}
            onChange={(event) => onSetupProfileChange("streetAddress", event.target.value)}
            readOnly={disabled}
            placeholder="Enter street address or P.O. box"
            required
          />
        </SetupField>

        <div className="grid gap-4 sm:grid-cols-2">
          <SetupField label="Town/City">
            <Input
              value={setupProfile.city}
              onChange={(event) => onSetupProfileChange("city", event.target.value)}
              readOnly={disabled}
              placeholder="Enter town or city"
            />
          </SetupField>

          <SetupField label="State/Region">
            <Input
              value={setupProfile.stateRegion}
              onChange={(event) => onSetupProfileChange("stateRegion", event.target.value)}
              readOnly={disabled}
              placeholder="Enter state or region"
            />
          </SetupField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SetupField label="Postal Code">
            <Input
              value={setupProfile.postalCode}
              onChange={(event) => onSetupProfileChange("postalCode", event.target.value)}
              readOnly={disabled}
              placeholder="Enter postal code"
            />
          </SetupField>

          <SetupField label="Country">
            <Input
              value={setupProfile.registeredCountry}
              onChange={(event) =>
                onSetupProfileChange("registeredCountry", event.target.value)
              }
              readOnly={disabled}
              placeholder="Enter registered country"
            />
          </SetupField>
        </div>

        <SetupField label="Website">
          <Input
            value={setupProfile.website}
            onChange={(event) => onSetupProfileChange("website", event.target.value)}
            readOnly={disabled}
            placeholder="Enter website URL"
          />
        </SetupField>
      </div>
    </section>
  );
}
