"use client";

import Link from "next/link";
import { Button } from "@/components/common/button";
import CreateOrganizationToast from "./components/CreateOrganizationToast";
import PortalProvisionPanel from "./components/PortalProvisionPanel";
import SetupStepper from "./components/SetupStepper";
import GroupDefinitionStep from "./components/steps/GroupDefinitionStep";
import CompanyDetailsStep from "./components/steps/CompanyDetailsStep";
import OrgLevelsAndAttributesStep from "./components/steps/OrgLevelsAndAttributesStep";
import PacketsDefinitionStep from "./components/steps/PacketsDefinitionStep";
import RolesDefinitionStep from "./components/steps/RolesDefinitionStep";
import type { FormMode, InitialOrganizationFormData } from "./components/types";
import { useCreateOrganizationForm } from "./components/useCreateOrganizationForm";

type CreateOrganizationFormProps = {
  mode: FormMode;
  initialOrganization?: InitialOrganizationFormData;
  initialStep?: 1 | 2 | 3 | 4 | 5;
};

function getCurrentStepErrorMessage(
  step: 1 | 2 | 3 | 4 | 5,
  errors: Record<string, string>,
) {
  if (errors.form) {
    return errors.form;
  }

  if (step === 2) {
    return errors.selectedIds;
  }

  if (step === 4) {
    return Object.entries(errors).find(([key]) => key.startsWith("packet:"))?.[1];
  }

  if (step === 5) {
    return Object.entries(errors).find(([key]) => key.startsWith("group:"))?.[1];
  }

  return null;
}

export default function CreateOrganizationForm({
  mode,
  initialOrganization,
  initialStep,
}: CreateOrganizationFormProps) {
  const form = useCreateOrganizationForm({ mode, initialOrganization, initialStep });
  const isFirstStep = form.activeStep === 1;
  const isLastStep = form.activeStep === 5;
  const currentStepErrorMessage = getCurrentStepErrorMessage(
    form.activeStep,
    form.fieldErrors,
  );

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-8 sm:px-6">
      <CreateOrganizationToast toast={form.toast} onClose={() => form.setToast(null)} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-slate-700">One Time Setup</h1>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleFinalSubmit();
          }}
          className="space-y-4"
        >
          <SetupStepper
            activeStep={form.activeStep}
            completedSteps={form.completedSteps}
            onStepChange={form.setActiveStep}
          />

          {currentStepErrorMessage ? (
            <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {currentStepErrorMessage}
            </div>
          ) : null}

          {form.activeStep === 1 ? (
            <>
              <CompanyDetailsStep
                mode={mode}
                organizationName={form.organizationName}
                industry={form.industry}
                setupProfile={form.setupProfile}
                errors={form.fieldErrors}
                onOrganizationNameChange={form.setOrganizationName}
                onIndustryChange={form.setIndustry}
                onSetupProfileChange={form.updateSetupProfile}
                onAddBranchOffice={form.addBranchOffice}
                onRemoveBranchOffice={form.removeBranchOffice}
              />

              <PortalProvisionPanel
                mode={mode}
                domainType={form.domainType}
                organizationEmail={form.organizationEmail}
                phoneNumber={form.phoneNumber}
                systemDomainName={form.systemDomainName}
                customDomain={form.customDomain}
                startDateLabel={form.startDateLabel}
                autoDeactivateDate={form.autoDeactivateDate}
                superAdminName={form.superAdminName}
                superAdminEmail={form.superAdminEmail}
                superAdminPassword={form.superAdminPassword}
                adminPhone={form.adminPhone}
                designation={form.designation}
                onDomainTypeChange={form.setDomainType}
                onOrganizationEmailChange={form.setOrganizationEmail}
                onPhoneNumberChange={form.setPhoneNumber}
                onSystemDomainNameChange={form.setSystemDomainName}
                onCustomDomainChange={form.setCustomDomain}
                onAutoDeactivateDateChange={form.setAutoDeactivateDate}
                onSuperAdminNameChange={form.setSuperAdminName}
                onSuperAdminEmailChange={form.setSuperAdminEmail}
                onSuperAdminPasswordChange={form.setSuperAdminPassword}
                onAdminPhoneChange={form.setAdminPhone}
                onDesignationChange={form.setDesignation}
                errors={form.fieldErrors}
              />
            </>
          ) : form.activeStep === 2 ? (
            <OrgLevelsAndAttributesStep
              mode={mode}
              attributeSetup={form.attributeSetup}
              selectedAttributes={form.selectedAttributes}
              onAddAvailableAttribute={form.addAvailableAttribute}
              onEnsureSelectedAttribute={form.ensureSelectedAttribute}
              onGetAttributeUnits={form.getAttributeUnits}
              onSaveAttributeUnit={form.saveAttributeUnit}
              onDeleteAttributeUnit={form.deleteAttributeUnit}
              onRemoveSelectedAttribute={form.removeSelectedAttribute}
              onReorderSelectedAttribute={form.reorderSelectedAttribute}
            />
          ) : form.activeStep === 3 ? (
            <RolesDefinitionStep
              mode={mode}
              organizationId={form.organizationId}
              modulePermissions={form.modulePermissions}
              openModuleGroups={form.openModuleGroups}
              superAdminName={form.superAdminName}
              superAdminEmail={form.superAdminEmail}
              onToggleModuleGroup={form.toggleModuleGroup}
              onToggleSubModule={form.toggleSubModule}
              onToggleModuleGroupOpen={form.toggleModuleGroupOpen}
              getSubjectModuleAccess={form.getSubjectModuleAccess}
              onSubjectModuleAccessChange={form.setSubjectModuleAccess}
            />
          ) : form.activeStep === 4 ? (
            <PacketsDefinitionStep
              mode={mode}
              selectedAttributes={form.selectedAttributes}
              onGetPacketAssignments={form.getPacketAssignments}
              onSavePacketAssignment={form.savePacketAssignment}
              onDeletePacketAssignment={form.deletePacketAssignment}
            />
          ) : (
            <GroupDefinitionStep
              mode={mode}
              selectedAttributes={form.selectedAttributes}
              onGetGroupDefinitionRules={form.getGroupDefinitionRules}
              onSaveGroupDefinitionRule={form.saveGroupDefinitionRule}
              onDeleteGroupDefinitionRule={form.deleteGroupDefinitionRule}
            />
          )}

          {form.isViewMode ? (
            <div className="flex flex-col-reverse gap-3 rounded-sm border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:justify-end">
              <Link
                href="/portal/organizations"
                className="inline-flex items-center justify-center rounded-sm border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </Link>

              {initialOrganization ? (
                <Link
                  href={`/portal/create?id=${initialOrganization.id}&mode=edit`}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Edit Organization
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-3 rounded-sm border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:justify-between">
              <Link
                href="/portal/organizations"
                className="inline-flex items-center justify-center rounded-sm border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {!isFirstStep ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-sm px-6"
                    onClick={() =>
                      form.setActiveStep((form.activeStep - 1) as 1 | 2 | 3 | 4 | 5)
                    }
                  >
                    Previous
                  </Button>
                ) : null}

                {!isLastStep ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="rounded-sm px-6"
                    onClick={() => void form.handleNextStep()}
                    disabled={form.creating}
                  >
                    {form.creating ? "Saving..." : "Next"}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    className="rounded-sm px-6"
                    disabled={form.creating}
                  >
                    {form.creating
                      ? form.isEditMode
                        ? "Saving..."
                        : "Creating..."
                      : form.isEditMode
                        ? "Save Changes"
                        : "Create Organization"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
