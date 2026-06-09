import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildSystemDomain, extractSystemDomainLabel, SYSTEM_DOMAIN_SUFFIX } from "@/lib/organization";
import {
  getAttributeUnits,
  findAttributeById,
  normalizeOrganizationAttributeSetup,
  type AttributeCategory,
  type OrganizationAttribute,
  type OrganizationAttributeSetup,
} from "@/lib/organization-attributes";
import {
  normalizeOrganizationPacketSetup,
  type PacketAssignment,
  type OrganizationPacketSetup,
} from "@/lib/organization-packets";
import { normalizeOrganizationRoleAccessSetup } from "@/lib/organization-role-access";
import {
  defaultOrganizationGroupDefinitionSetup,
  normalizeOrganizationGroupDefinitionSetup,
  type GroupDefinitionRule,
  type OrganizationGroupDefinitionSetup,
} from "@/lib/organization-group-definition";
import {
  buildOrganizationAddressFromSetupProfile,
  defaultOrganizationSetupProfile,
  resolveOrganizationSetupProfile,
  type BranchOffice,
  type OrganizationSetupProfile,
} from "@/lib/organization-setup";
import {
  formatDate,
  getTodayDateInputValue,
  toDateInputValue,
} from "./date-utils";
import {
  appendBranchOffice,
  appendCustomAttribute,
  buildLegacySuperAdminSubjectKey,
  buildInitialModulePermissions,
  buildInitialOpenModuleGroups,
  buildModuleAccessPayload,
  buildResetModulePermissions,
  buildRoleAccessPayload,
  deletePacketAssignmentFromForm,
  deleteGroupDefinitionRuleFromForm,
  deleteAttributeUnitFromSetup,
  ensureAttributeSelected,
  getGroupDefinitionRulesForModule,
  getPacketAssignmentsForItem,
  getRoleAccessValue,
  PRIMARY_SUPER_ADMIN_SUBJECT_KEY,
  removeBranchOfficeFromProfile,
  removeSelectedAttributeFromSetup,
  reorderSelectedAttributeInSetup,
  saveGroupDefinitionRuleInForm,
  savePacketAssignmentInForm,
  saveAttributeUnitInSetup,
  setRoleAccessValue,
  toggleModulePermissionGroup,
  toggleModulePermissionItem,
  toggleOpenModuleGroupState,
} from "./form-state";
import type {
  DomainType,
  FormMode,
  InitialOrganizationFormData,
  OrganizationCreateStep,
  ToastState,
} from "./types";

export function useCreateOrganizationForm({
  mode,
  initialOrganization,
  initialStep = 1,
}: {
  mode: FormMode;
  initialOrganization?: InitialOrganizationFormData;
  initialStep?: OrganizationCreateStep;
}) {
  const router = useRouter();
  const todayDate = getTodayDateInputValue();
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const initialSetupProfile = useMemo(
    () =>
      resolveOrganizationSetupProfile(
        initialOrganization?.setupProfile,
        initialOrganization?.address,
      ),
    [initialOrganization],
  );

  const [organizationId, setOrganizationId] = useState(initialOrganization?.id ?? "");
  const [activeStep, setActiveStepState] = useState<OrganizationCreateStep>(initialStep);
  const [organizationName, setOrganizationName] = useState(initialOrganization?.organizationName ?? "");
  const [organizationEmail, setOrganizationEmail] = useState(initialOrganization?.organizationEmail ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initialOrganization?.phoneNumber ?? "");
  const [industry, setIndustry] = useState(initialOrganization?.industry ?? "");
  const [setupProfile, setSetupProfile] = useState<OrganizationSetupProfile>(initialSetupProfile);
  const [attributeSetup, setAttributeSetup] = useState<OrganizationAttributeSetup>(
    normalizeOrganizationAttributeSetup(initialOrganization?.attributeSetup),
  );
  const [groupDefinitionSetup, setGroupDefinitionSetup] =
    useState<OrganizationGroupDefinitionSetup>(
      normalizeOrganizationGroupDefinitionSetup(initialOrganization?.groupDefinitionSetup),
    );
  const [packetSetup, setPacketSetup] = useState<OrganizationPacketSetup>(
    normalizeOrganizationPacketSetup(initialOrganization?.packetSetup),
  );
  const [roleAccessSetup, setRoleAccessSetup] = useState(() =>
    normalizeOrganizationRoleAccessSetup(initialOrganization?.roleAccessSetup),
  );
  const [domainType, setDomainType] = useState<DomainType>(
    initialOrganization?.customDomain ? "custom" : "system",
  );
  const [systemDomainName, setSystemDomainName] = useState(
    extractSystemDomainLabel(initialOrganization?.systemDomain ?? ""),
  );
  const [customDomain, setCustomDomain] = useState(initialOrganization?.customDomain ?? "");
  const [autoDeactivateDate, setAutoDeactivateDate] = useState(
    toDateInputValue(initialOrganization?.autoDeactivateDate),
  );
  const [superAdminName, setSuperAdminName] = useState(initialOrganization?.superAdminName ?? "");
  const [superAdminEmail, setSuperAdminEmail] = useState(initialOrganization?.superAdminEmail ?? "");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState(initialOrganization?.adminPhone ?? "");
  const [designation, setDesignation] = useState(initialOrganization?.designation ?? "");
  const [modulePermissions, setModulePermissions] = useState<Record<string, boolean>>(() =>
    buildInitialModulePermissions(initialOrganization?.moduleAccess),
  );
  const [openModuleGroups, setOpenModuleGroups] = useState<Record<string, boolean>>(() =>
    buildInitialOpenModuleGroups(),
  );
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    initialOrganization?.setupCompletedSteps ?? [],
  );

  const startDateLabel = initialOrganization?.startDate
    ? formatDate(initialOrganization.startDate)
    : "Today";
  const selectedAttributes = attributeSetup.selectedIds
    .map((attributeId) => findAttributeById(attributeSetup, attributeId))
    .filter((attribute): attribute is OrganizationAttribute => Boolean(attribute));

  function updateSetupProfile(field: keyof OrganizationSetupProfile, value: string) {
    setSetupProfile((current) => ({ ...current, [field]: value }));
  }

  function addBranchOffice(
    branch: Pick<BranchOffice, "name" | "location" | "subLocation">,
  ) {
    setSetupProfile((current) => appendBranchOffice(current, branch));
  }

  function addAvailableAttribute(category: AttributeCategory, label: string) {
    setAttributeSetup((current) => appendCustomAttribute(current, category, label));
  }

  function ensureSelectedAttribute(attributeId: string) {
    setAttributeSetup((current) => ensureAttributeSelected(current, attributeId));
  }

  function removeSelectedAttribute(attributeId: string) {
    setAttributeSetup((current) =>
      removeSelectedAttributeFromSetup(current, attributeId),
    );
  }

  function reorderSelectedAttribute(draggedId: string, targetId: string) {
    setAttributeSetup((current) =>
      reorderSelectedAttributeInSetup(current, draggedId, targetId),
    );
  }

  function saveAttributeUnit(
    attributeId: string,
    unit: { id?: string; code: string; description: string },
  ) {
    setAttributeSetup((current) =>
      saveAttributeUnitInSetup(current, attributeId, unit),
    );
  }

  function deleteAttributeUnit(attributeId: string, unitId: string) {
    setAttributeSetup((current) =>
      deleteAttributeUnitFromSetup(current, attributeId, unitId),
    );
  }

  function savePacketAssignment(
    itemId: string,
    assignment: Omit<PacketAssignment, "id"> & { id?: string },
  ) {
    setPacketSetup((current) => savePacketAssignmentInForm(current, itemId, assignment));
  }

  function saveGroupDefinitionRule(
    moduleId: string,
    rule: Omit<GroupDefinitionRule, "id"> & { id?: string },
  ) {
    setGroupDefinitionSetup((current) =>
      saveGroupDefinitionRuleInForm(current, moduleId, rule),
    );
  }

  function deletePacketAssignment(itemId: string, assignmentId: string) {
    setPacketSetup((current) =>
      deletePacketAssignmentFromForm(current, itemId, assignmentId),
    );
  }

  function deleteGroupDefinitionRule(moduleId: string, ruleId: string) {
    setGroupDefinitionSetup((current) =>
      deleteGroupDefinitionRuleFromForm(current, moduleId, ruleId),
    );
  }

  function removeBranchOffice(branchId: string) {
    setSetupProfile((current) => removeBranchOfficeFromProfile(current, branchId));
  }

  function toggleModuleGroup(groupName: string, childModules: readonly string[]) {
    setModulePermissions((current) =>
      toggleModulePermissionGroup(current, groupName, childModules),
    );

    if (childModules.length > 0) {
      setOpenModuleGroups((current) => ({ ...current, [groupName]: true }));
    }
  }

  function toggleSubModule(
    groupName: string,
    childModules: readonly string[],
    moduleName: string,
  ) {
    setModulePermissions((current) =>
      toggleModulePermissionItem(current, groupName, childModules, moduleName),
    );
  }

  function toggleModuleGroupOpen(groupName: string) {
    setOpenModuleGroups((current) => toggleOpenModuleGroupState(current, groupName));
  }

  function getSubjectModuleAccess(subjectKey: string, moduleName: string) {
    const fallbackSubjectKey =
      subjectKey === PRIMARY_SUPER_ADMIN_SUBJECT_KEY
        ? buildLegacySuperAdminSubjectKey(superAdminEmail)
        : null;

    return getRoleAccessValue(
      roleAccessSetup,
      subjectKey,
      moduleName,
      fallbackSubjectKey,
    );
  }

  function setSubjectModuleAccess(
    subjectKey: string,
    moduleName: string,
    enabled: boolean,
  ) {
    setRoleAccessSetup((current) =>
      setRoleAccessValue(current, subjectKey, moduleName, enabled),
    );
  }

  function showToast(nextToast: Exclude<ToastState, null>) {
    setToast(nextToast);
    window.setTimeout(() => {
      setToast((current) => (current === nextToast ? null : current));
    }, 3500);
  }

  function updateDomainType(nextDomainType: DomainType) {
    setDomainType(nextDomainType);
    if (nextDomainType === "system") {
      setCustomDomain("");
      return;
    }
    setSystemDomainName("");
  }

  function syncSetupUrl(nextOrganizationId: string, nextStep: OrganizationCreateStep) {
    if (typeof window === "undefined" || !nextOrganizationId) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set("id", nextOrganizationId);
    params.set("mode", isEditMode ? "edit" : "create");
    params.set("step", String(nextStep));
    window.history.replaceState(null, "", `/portal/create?${params.toString()}`);
  }

  function setActiveStep(step: OrganizationCreateStep) {
    setActiveStepState(step);
    if (organizationId) {
      syncSetupUrl(organizationId, step);
    }
  }

  async function saveSetupStep(step: OrganizationCreateStep, finalize = false) {
    if (isViewMode) {
      return { success: true };
    }
    if (autoDeactivateDate && autoDeactivateDate < todayDate) {
      showToast({ type: "error", message: "Subscription end date cannot be before today." });
      return { success: false };
    }

    setCreating(true);
    setToast(null);

    try {
      const systemDomain =
        domainType === "system" ? buildSystemDomain(systemDomainName) : "";
      const trimmedCustomDomain =
        domainType === "custom" ? customDomain.trim() : "";

      if (domainType === "system" && !systemDomain) {
        throw new Error(
          `System domain is required and must end with ${SYSTEM_DOMAIN_SUFFIX}`,
        );
      }
      if (domainType === "custom" && !trimmedCustomDomain) {
        throw new Error("Custom domain is required when custom domain is selected.");
      }

      const address = buildOrganizationAddressFromSetupProfile(setupProfile);
      const moduleAccess = buildModuleAccessPayload(modulePermissions);
      const nextRoleAccessSetup = buildRoleAccessPayload(roleAccessSetup, superAdminEmail);

      const response = await fetch("/api/portal/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organizationId || undefined,
          step,
          finalize,
          organizationName,
          organizationEmail,
          phoneNumber,
          industry,
          address,
          setupProfile,
          attributeSetup,
          groupDefinitionSetup,
          packetSetup,
          roleAccessSetup: nextRoleAccessSetup,
          systemDomain: domainType === "system" ? systemDomain : "",
          customDomain: domainType === "custom" ? trimmedCustomDomain : "",
          adminPhone,
          designation,
          superAdminName,
          superAdminEmail,
          superAdminPassword,
          autoDeactivateDate,
          moduleAccess,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || payload.details || "Failed to save organization setup");
      }

      const nextOrganizationId =
        typeof payload.organizationId === "string" ? payload.organizationId : organizationId;
      if (nextOrganizationId) {
        setOrganizationId(nextOrganizationId);
      }
      if (Array.isArray(payload.setupCompletedSteps)) {
        setCompletedSteps(payload.setupCompletedSteps);
      }
      if (nextOrganizationId) {
        syncSetupUrl(nextOrganizationId, finalize ? 5 : step);
      }

      showToast({
        type: "success",
        message: finalize
          ? isEditMode
            ? "Organization updated successfully."
            : "Organization created successfully."
          : `Step ${step} saved successfully.`,
      });

      return {
        success: true,
        organizationId: nextOrganizationId,
      };
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return { success: false };
    } finally {
      setCreating(false);
    }
  }

  async function handleNextStep() {
    const result = await saveSetupStep(activeStep, false);
    if (!result.success || activeStep === 5) {
      return;
    }

    setActiveStep((activeStep + 1) as OrganizationCreateStep);
  }

  async function handleFinalSubmit() {
    const result = await saveSetupStep(activeStep, true);
    if (!result.success) {
      return;
    }

    if (isEditMode) {
      router.refresh();
      return;
    }

    if (result.organizationId) {
      router.push(`/portal/create?id=${result.organizationId}&mode=view&step=5`);
      return;
    }

    setOrganizationId("");
    setOrganizationName("");
    setOrganizationEmail("");
    setPhoneNumber("");
    setIndustry("");
    setSetupProfile({ ...defaultOrganizationSetupProfile });
    setAttributeSetup(normalizeOrganizationAttributeSetup(undefined));
    setGroupDefinitionSetup({ ...defaultOrganizationGroupDefinitionSetup });
    setPacketSetup(normalizeOrganizationPacketSetup(undefined));
    setRoleAccessSetup(normalizeOrganizationRoleAccessSetup(undefined));
    setDomainType("system");
    setSystemDomainName("");
    setCustomDomain("");
    setAutoDeactivateDate("");
    setSuperAdminName("");
    setSuperAdminEmail("");
    setSuperAdminPassword("");
    setAdminPhone("");
    setDesignation("");
    setModulePermissions(buildResetModulePermissions());
    setOpenModuleGroups(buildInitialOpenModuleGroups());
    setCompletedSteps([]);
    setActiveStep(1);
  }

  return {
    activeStep,
    addAvailableAttribute,
    adminPhone,
    attributeSetup,
    autoDeactivateDate,
    completedSteps,
    creating,
    domainType,
    customDomain,
    deleteGroupDefinitionRule,
    designation,
    handleFinalSubmit,
    handleNextStep,
    industry,
    isCreateMode,
    isEditMode,
    isViewMode,
    modulePermissions,
    openModuleGroups,
    organizationId,
    organizationEmail,
    organizationName,
    getAttributeUnits: (attributeId: string) => getAttributeUnits(attributeSetup, attributeId),
    getGroupDefinitionRules: (moduleId: string) =>
      getGroupDefinitionRulesForModule(groupDefinitionSetup, moduleId),
    getPacketAssignments: (itemId: string) => getPacketAssignmentsForItem(packetSetup, itemId),
    getSubjectModuleAccess,
    groupDefinitionSetup,
    phoneNumber,
    packetSetup,
    ensureSelectedAttribute,
    saveGroupDefinitionRule,
    savePacketAssignment,
    deletePacketAssignment,
    removeSelectedAttribute,
    roleAccessSetup,
    reorderSelectedAttribute,
    saveAttributeUnit,
    setActiveStep,
    setAdminPhone,
    setAutoDeactivateDate,
    setCustomDomain,
    setDomainType: updateDomainType,
    setDesignation,
    setIndustry,
    setOrganizationEmail,
    setOrganizationName,
    setPhoneNumber,
    setSubjectModuleAccess,
    setSuperAdminEmail,
    setSuperAdminName,
    setSuperAdminPassword,
    setSystemDomainName,
    setupProfile,
    startDateLabel,
    selectedAttributes,
    deleteAttributeUnit,
    superAdminEmail,
    superAdminName,
    superAdminPassword,
    systemDomainName,
    toast,
    toggleModuleGroup,
    toggleModuleGroupOpen,
    toggleSubModule,
    updateSetupProfile,
    addBranchOffice,
    removeBranchOffice,
    setToast,
  };
}
