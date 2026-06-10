import {
  getAttributeUnits,
  type AttributeCategory,
  type AttributeUnit,
  type OrganizationAttribute,
  type OrganizationAttributeSetup,
} from "@/lib/organization-attributes";
import {
  deleteGroupDefinitionRule,
  getGroupDefinitionRules,
  saveGroupDefinitionRule,
  type GroupDefinitionRule,
  type OrganizationGroupDefinitionSetup,
} from "@/lib/organization-group-definition";
import {
  deletePacketAssignment,
  getPacketAssignments,
  savePacketAssignment,
  type OrganizationPacketSetup,
  type PacketAssignment,
} from "@/lib/organization-packets";
import type { BranchOffice, OrganizationSetupProfile } from "@/lib/organization-setup";
import type { OrganizationRoleAccessSetup } from "@/lib/organization-role-access";
import { moduleGroups, moduleOptions } from "./constants";

export const PRIMARY_SUPER_ADMIN_SUBJECT_KEY = "super-admin:primary";

export function buildLegacySuperAdminSubjectKey(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail ? `super-admin:${normalizedEmail}` : null;
}

export function buildInitialModulePermissions(initialModules: string[] = []) {
  const enabledModules = new Set(initialModules);
  return Object.fromEntries(
    moduleOptions.map((moduleName) => [moduleName, enabledModules.has(moduleName)]),
  );
}

export function buildResetModulePermissions() {
  return Object.fromEntries(moduleOptions.map((moduleName) => [moduleName, false]));
}

export function buildInitialOpenModuleGroups() {
  return Object.fromEntries(
    moduleGroups.map((group) => [group.name, group.name === "Dashboard"]),
  );
}

export function appendBranchOffice(
  current: OrganizationSetupProfile,
  branch: Pick<BranchOffice, "name" | "location" | "subLocation">,
): OrganizationSetupProfile {
  return {
    ...current,
    branchOffices: [
      ...current.branchOffices,
      { id: `branch-${Date.now()}`, ...branch },
    ],
  };
}

export function removeBranchOfficeFromProfile(
  current: OrganizationSetupProfile,
  branchId: string,
): OrganizationSetupProfile {
  return {
    ...current,
    branchOffices: current.branchOffices.filter((branch) => branch.id !== branchId),
  };
}

export function appendCustomAttribute(
  current: OrganizationAttributeSetup,
  category: AttributeCategory,
  label: string,
): OrganizationAttributeSetup {
  const nextAttribute: OrganizationAttribute = {
    id: `${category}-${Date.now().toString(36)}`,
    label,
    category,
    isCustom: true,
  };

  return {
    ...current,
    [category]: [...current[category], nextAttribute],
    selectedIds: current.selectedIds.includes(nextAttribute.id)
      ? current.selectedIds
      : [...current.selectedIds, nextAttribute.id],
  };
}

export function ensureAttributeSelected(
  current: OrganizationAttributeSetup,
  attributeId: string,
): OrganizationAttributeSetup {
  return {
    ...current,
    selectedIds: current.selectedIds.includes(attributeId)
      ? current.selectedIds
      : [...current.selectedIds, attributeId],
  };
}

export function removeSelectedAttributeFromSetup(
  current: OrganizationAttributeSetup,
  attributeId: string,
): OrganizationAttributeSetup {
  return {
    ...current,
    selectedIds: current.selectedIds.filter((id) => id !== attributeId),
  };
}

export function reorderSelectedAttributeInSetup(
  current: OrganizationAttributeSetup,
  draggedId: string,
  targetId: string,
): OrganizationAttributeSetup {
  const nextIds = [...current.selectedIds];
  const draggedIndex = nextIds.indexOf(draggedId);
  const targetIndex = nextIds.indexOf(targetId);

  if (draggedIndex < 0 || targetIndex < 0) {
    return current;
  }

  nextIds.splice(draggedIndex, 1);
  nextIds.splice(targetIndex, 0, draggedId);

  return {
    ...current,
    selectedIds: nextIds,
  };
}

export function saveAttributeUnitInSetup(
  current: OrganizationAttributeSetup,
  attributeId: string,
  unit: { id?: string; code: string; description: string },
): OrganizationAttributeSetup {
  const currentUnits = getAttributeUnits(current, attributeId);
  const nextUnit: AttributeUnit = {
    id: unit.id ?? `${attributeId}-unit-${Date.now().toString(36)}`,
    code: unit.code,
    description: unit.description,
  };
  const nextUnits = unit.id
    ? currentUnits.map((item) => (item.id === unit.id ? nextUnit : item))
    : [...currentUnits, nextUnit];

  return {
    ...current,
    unitsByAttributeId: {
      ...current.unitsByAttributeId,
      [attributeId]: nextUnits,
    },
  };
}

export function deleteAttributeUnitFromSetup(
  current: OrganizationAttributeSetup,
  attributeId: string,
  unitId: string,
): OrganizationAttributeSetup {
  return {
    ...current,
    unitsByAttributeId: {
      ...current.unitsByAttributeId,
      [attributeId]: getAttributeUnits(current, attributeId).filter(
        (unit) => unit.id !== unitId,
      ),
    },
  };
}

export function toggleModulePermissionGroup(
  current: Record<string, boolean>,
  groupName: string,
  childModules: readonly string[],
) {
  const groupSelected =
    current[groupName] && childModules.every((moduleName) => current[moduleName]);
  const nextSelected = !groupSelected;

  return {
    ...current,
    [groupName]: nextSelected,
    ...Object.fromEntries(childModules.map((moduleName) => [moduleName, nextSelected])),
  };
}

export function toggleModulePermissionItem(
  current: Record<string, boolean>,
  groupName: string,
  childModules: readonly string[],
  moduleName: string,
) {
  const next = { ...current, [moduleName]: !current[moduleName] };
  next[groupName] = childModules.some((childModule) => next[childModule]);
  return next;
}

export function toggleOpenModuleGroupState(
  current: Record<string, boolean>,
  groupName: string,
) {
  return {
    ...current,
    [groupName]: !current[groupName],
  };
}

export function buildModuleAccessPayload(modulePermissions: Record<string, boolean>) {
  return {
    groups: moduleGroups.map((group) => ({
      name: group.name,
      enabled: modulePermissions[group.name] === true,
      modules: group.modules.map((moduleName) => ({
        name: moduleName,
        enabled: modulePermissions[moduleName] === true,
      })),
    })),
  };
}

export function getRoleAccessValue(
  current: OrganizationRoleAccessSetup,
  subjectKey: string,
  moduleName: string,
  fallbackSubjectKey?: string | null,
) {
  return (
    current.accessBySubjectKey[subjectKey]?.[moduleName] === true ||
    (fallbackSubjectKey
      ? current.accessBySubjectKey[fallbackSubjectKey]?.[moduleName] === true
      : false)
  );
}

export function setRoleAccessValue(
  current: OrganizationRoleAccessSetup,
  subjectKey: string,
  moduleName: string,
  enabled: boolean,
): OrganizationRoleAccessSetup {
  return {
    ...current,
    accessBySubjectKey: {
      ...current.accessBySubjectKey,
      [subjectKey]: {
        ...(current.accessBySubjectKey[subjectKey] ?? {}),
        [moduleName]: enabled,
      },
    },
  };
}

export function buildRoleAccessPayload(
  current: OrganizationRoleAccessSetup,
  superAdminEmail: string,
): OrganizationRoleAccessSetup {
  const legacySuperAdminKey = buildLegacySuperAdminSubjectKey(superAdminEmail);
  if (!legacySuperAdminKey || !current.accessBySubjectKey[legacySuperAdminKey]) {
    return current;
  }

  const primaryAccess = current.accessBySubjectKey[PRIMARY_SUPER_ADMIN_SUBJECT_KEY] ?? {};
  const legacyAccess = current.accessBySubjectKey[legacySuperAdminKey] ?? {};
  const nextAccessBySubjectKey = { ...current.accessBySubjectKey };

  delete nextAccessBySubjectKey[legacySuperAdminKey];

  return {
    ...current,
    accessBySubjectKey: {
      ...nextAccessBySubjectKey,
      [PRIMARY_SUPER_ADMIN_SUBJECT_KEY]: {
        ...legacyAccess,
        ...primaryAccess,
      },
    },
  };
}

export function getPacketAssignmentsForItem(
  current: OrganizationPacketSetup,
  itemId: string,
) {
  return getPacketAssignments(current, itemId);
}

export function getGroupDefinitionRulesForModule(
  current: OrganizationGroupDefinitionSetup,
  moduleId: string,
) {
  return getGroupDefinitionRules(current, moduleId);
}

export function saveGroupDefinitionRuleInForm(
  current: OrganizationGroupDefinitionSetup,
  moduleId: string,
  rule: Omit<GroupDefinitionRule, "id"> & { id?: string },
) {
  return saveGroupDefinitionRule(current, moduleId, rule);
}

export function deleteGroupDefinitionRuleFromForm(
  current: OrganizationGroupDefinitionSetup,
  moduleId: string,
  ruleId: string,
) {
  return deleteGroupDefinitionRule(current, moduleId, ruleId);
}

export function savePacketAssignmentInForm(
  current: OrganizationPacketSetup,
  itemId: string,
  assignment: Omit<PacketAssignment, "id"> & { id?: string },
) {
  return savePacketAssignment(current, itemId, assignment);
}

export function deletePacketAssignmentFromForm(
  current: OrganizationPacketSetup,
  itemId: string,
  assignmentId: string,
) {
  return deletePacketAssignment(current, itemId, assignmentId);
}
