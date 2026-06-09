export type GroupDefinitionFieldType = "text" | "number" | "select";

export type GroupDefinitionFieldOption = {
  label: string;
  value: string;
};

export type GroupDefinitionField = {
  key: string;
  label: string;
  type: GroupDefinitionFieldType;
  placeholder?: string;
  min?: number;
  options?: GroupDefinitionFieldOption[];
};

export type GroupDefinitionModule = {
  id: string;
  label: string;
  description: string;
  fields: GroupDefinitionField[];
};

export type GroupDefinitionRule = {
  id: string;
  attributeIds: string[];
  values: Record<string, string>;
};

export type OrganizationGroupDefinitionSetup = {
  rulesByModuleId: Record<string, GroupDefinitionRule[]>;
};

export const groupDefinitionModules: GroupDefinitionModule[] = [
  {
    id: "attendance",
    label: "Attendance",
    description: "Define attendance grace rules and half-day thresholds by attribute.",
    fields: [
      {
        key: "graceInMinutes",
        label: "Grace In Minutes",
        type: "number",
        placeholder: "Enter grace in minutes",
        min: 0,
      },
      {
        key: "halfDayThresholdMinutes",
        label: "Half Day Threshold",
        type: "number",
        placeholder: "Enter threshold in minutes",
        min: 0,
      },
    ],
  },
  {
    id: "bank-lcc-mapping",
    label: "Bank LCC Mapping",
    description: "Map bank and LCC details for the selected attributes.",
    fields: [
      {
        key: "bankName",
        label: "Bank Name",
        type: "text",
        placeholder: "Enter bank name",
      },
      {
        key: "lccCode",
        label: "LCC Code",
        type: "text",
        placeholder: "Enter LCC code",
      },
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Set calendar code and working-day count for each attribute combination.",
    fields: [
      {
        key: "calendarCode",
        label: "Calendar Code",
        type: "text",
        placeholder: "Enter calendar code",
      },
      {
        key: "workingDays",
        label: "Working Days",
        type: "number",
        placeholder: "Enter working days",
        min: 0,
      },
    ],
  },
  {
    id: "claim",
    label: "Claim",
    description: "Configure claim ceilings and approval windows.",
    fields: [
      {
        key: "claimLimit",
        label: "Claim Limit",
        type: "number",
        placeholder: "Enter claim limit",
        min: 0,
      },
      {
        key: "approvalWindowDays",
        label: "Approval Window Days",
        type: "number",
        placeholder: "Enter approval days",
        min: 0,
      },
    ],
  },
  {
    id: "esi-applicability",
    label: "ESI Applicability",
    description: "Set ESI salary threshold and employee contribution values.",
    fields: [
      {
        key: "salaryThreshold",
        label: "Salary Threshold",
        type: "number",
        placeholder: "Enter salary threshold",
        min: 0,
      },
      {
        key: "employeeContribution",
        label: "Employee Contribution %",
        type: "number",
        placeholder: "Enter percentage",
        min: 0,
      },
    ],
  },
  {
    id: "leave",
    label: "Leave",
    description: "Manage annual leave balance and carry-forward rules.",
    fields: [
      {
        key: "annualLeaveDays",
        label: "Annual Leave Days",
        type: "number",
        placeholder: "Enter leave days",
        min: 0,
      },
      {
        key: "carryForwardLimit",
        label: "Carry Forward Limit",
        type: "number",
        placeholder: "Enter carry forward days",
        min: 0,
      },
    ],
  },
  {
    id: "lwf-applicability",
    label: "LWF Applicability",
    description: "Define labour welfare fund employee and employer contributions.",
    fields: [
      {
        key: "employeeContribution",
        label: "Employee Contribution",
        type: "number",
        placeholder: "Enter employee contribution",
        min: 0,
      },
      {
        key: "employerContribution",
        label: "Employer Contribution",
        type: "number",
        placeholder: "Enter employer contribution",
        min: 0,
      },
    ],
  },
  {
    id: "notice-period",
    label: "Notice Period",
    description: "Capture notice period and post-confirmation notice days by attribute.",
    fields: [
      {
        key: "days",
        label: "Days",
        type: "number",
        placeholder: "Enter notice period days",
        min: 0,
      },
      {
        key: "postConfirmationDays",
        label: "Post Confirmation Days",
        type: "number",
        placeholder: "Enter post confirmation days",
        min: 0,
      },
    ],
  },
  {
    id: "packets",
    label: "Packets",
    description: "Assign packet codes and visibility levels for the chosen attributes.",
    fields: [
      {
        key: "packetCode",
        label: "Packet Code",
        type: "text",
        placeholder: "Enter packet code",
      },
      {
        key: "visibilityLevel",
        label: "Visibility Level",
        type: "select",
        options: [
          { label: "Employee", value: "employee" },
          { label: "Manager", value: "manager" },
          { label: "Admin", value: "admin" },
        ],
      },
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    description: "Define payroll cycle and cut-off day for the selected attributes.",
    fields: [
      {
        key: "payrollCycle",
        label: "Payroll Cycle",
        type: "select",
        options: [
          { label: "Monthly", value: "monthly" },
          { label: "Bi-Weekly", value: "bi-weekly" },
          { label: "Weekly", value: "weekly" },
        ],
      },
      {
        key: "cutoffDay",
        label: "Cut Off Day",
        type: "number",
        placeholder: "Enter cut off day",
        min: 0,
      },
    ],
  },
  {
    id: "pt-applicability",
    label: "PT Applicability",
    description: "Set professional tax state and deduction amount.",
    fields: [
      {
        key: "stateName",
        label: "State",
        type: "text",
        placeholder: "Enter state name",
      },
      {
        key: "deductionAmount",
        label: "Deduction Amount",
        type: "number",
        placeholder: "Enter deduction amount",
        min: 0,
      },
    ],
  },
  {
    id: "recruitment",
    label: "Recruitment",
    description: "Control requisition limits and offer approval timelines.",
    fields: [
      {
        key: "requisitionLimit",
        label: "Requisition Limit",
        type: "number",
        placeholder: "Enter requisition limit",
        min: 0,
      },
      {
        key: "offerApprovalDays",
        label: "Offer Approval Days",
        type: "number",
        placeholder: "Enter approval days",
        min: 0,
      },
    ],
  },
];

export const defaultOrganizationGroupDefinitionSetup: OrganizationGroupDefinitionSetup = {
  rulesByModuleId: {},
};

export function getGroupDefinitionModule(moduleId: string) {
  return groupDefinitionModules.find((groupModule) => groupModule.id === moduleId) ?? null;
}

export function normalizeOrganizationGroupDefinitionSetup(
  value: unknown,
): OrganizationGroupDefinitionSetup {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return structuredClone(defaultOrganizationGroupDefinitionSetup);
  }

  const setup = value as Partial<OrganizationGroupDefinitionSetup>;
  const moduleIds = new Set(groupDefinitionModules.map((groupModule) => groupModule.id));
  const rulesByModuleId =
    setup.rulesByModuleId && typeof setup.rulesByModuleId === "object"
      ? Object.entries(setup.rulesByModuleId).reduce<Record<string, GroupDefinitionRule[]>>(
          (result, [moduleId, rules]) => {
            if (!moduleIds.has(moduleId) || !Array.isArray(rules)) {
              return result;
            }

            const moduleConfig = getGroupDefinitionModule(moduleId);
            if (!moduleConfig) {
              return result;
            }

            result[moduleId] = rules.reduce<GroupDefinitionRule[]>((items, rule, index) => {
              if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
                return items;
              }

              const record = rule as Partial<GroupDefinitionRule>;
              const values =
                record.values && typeof record.values === "object"
                  ? moduleConfig.fields.reduce<Record<string, string>>((fieldValues, field) => {
                      const rawValue = (record.values as Record<string, unknown>)[field.key];
                      if (typeof rawValue === "string") {
                        fieldValues[field.key] = rawValue;
                      }
                      return fieldValues;
                    }, {})
                  : {};

              items.push({
                id:
                  typeof record.id === "string" && record.id.trim()
                    ? record.id
                    : `${moduleId}-rule-${index + 1}`,
                attributeIds: Array.isArray(record.attributeIds)
                  ? record.attributeIds.filter(
                      (attributeId): attributeId is string =>
                        typeof attributeId === "string" && attributeId.trim().length > 0,
                    )
                  : [],
                values,
              });

              return items;
            }, []);

            return result;
          },
          {},
        )
      : {};

  return { rulesByModuleId };
}

export function getGroupDefinitionRules(
  setup: OrganizationGroupDefinitionSetup,
  moduleId: string,
) {
  return setup.rulesByModuleId[moduleId] ?? [];
}

export function saveGroupDefinitionRule(
  setup: OrganizationGroupDefinitionSetup,
  moduleId: string,
  rule: Omit<GroupDefinitionRule, "id"> & { id?: string },
): OrganizationGroupDefinitionSetup {
  const currentRules = getGroupDefinitionRules(setup, moduleId);
  const nextRule: GroupDefinitionRule = {
    id: rule.id ?? `${moduleId}-rule-${Date.now().toString(36)}`,
    attributeIds: rule.attributeIds,
    values: rule.values,
  };

  return {
    ...setup,
    rulesByModuleId: {
      ...setup.rulesByModuleId,
      [moduleId]: rule.id
        ? currentRules.map((item) => (item.id === rule.id ? nextRule : item))
        : [...currentRules, nextRule],
    },
  };
}

export function deleteGroupDefinitionRule(
  setup: OrganizationGroupDefinitionSetup,
  moduleId: string,
  ruleId: string,
): OrganizationGroupDefinitionSetup {
  return {
    ...setup,
    rulesByModuleId: {
      ...setup.rulesByModuleId,
      [moduleId]: getGroupDefinitionRules(setup, moduleId).filter(
        (rule) => rule.id !== ruleId,
      ),
    },
  };
}
