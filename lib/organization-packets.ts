export type PacketKind = "report" | "screen";

export type PacketCatalogItem = {
  id: string;
  label: string;
  category: string;
  kind: PacketKind;
};

export type PacketAssignment = {
  id: string;
  positionCode: string;
  positionLabel: string;
  superAccess: boolean;
  attributeIds: string[];
};

export type OrganizationPacketSetup = {
  assignmentsByItemId: Record<string, PacketAssignment[]>;
};

export const defaultOrganizationPacketSetup: OrganizationPacketSetup = {
  assignmentsByItemId: {},
};

export const packetPositionOptions = [
  "Admin",
  "Employee",
  "HR",
  "Manager",
  "Recruiter",
  "Finance",
  "Grade Owner",
  "Position Owner",
] as const;

export const packetCatalog: PacketCatalogItem[] = [
  {
    id: "report-master-data",
    label: "Master Data Report",
    category: "Additional Reports",
    kind: "report",
  },
  {
    id: "report-system-usage",
    label: "System Usage Report",
    category: "Additional Reports",
    kind: "report",
  },
  {
    id: "report-loan",
    label: "Loan Report",
    category: "Additional Reports",
    kind: "report",
  },
  {
    id: "report-email-audit",
    label: "Email SMS Notification Audit",
    category: "Audit Reports",
    kind: "report",
  },
  {
    id: "report-attendance-audit",
    label: "Attendance Audit Report",
    category: "Audit Reports",
    kind: "report",
  },
  {
    id: "report-position-summary",
    label: "Position Summary Report",
    category: "HRMS Reports",
    kind: "report",
  },
  {
    id: "report-grade-summary",
    label: "Grade Summary Report",
    category: "HRMS Reports",
    kind: "report",
  },
  {
    id: "screen-employee-profile",
    label: "Employee Profile Screen",
    category: "People Screens",
    kind: "screen",
  },
  {
    id: "screen-directory",
    label: "Directory Screen",
    category: "People Screens",
    kind: "screen",
  },
  {
    id: "screen-attendance-board",
    label: "Attendance Board",
    category: "Operations Screens",
    kind: "screen",
  },
  {
    id: "screen-leave-board",
    label: "Leave Board",
    category: "Operations Screens",
    kind: "screen",
  },
  {
    id: "screen-payroll-dashboard",
    label: "Payroll Dashboard",
    category: "Admin Screens",
    kind: "screen",
  },
  {
    id: "screen-recruitment-pipeline",
    label: "Recruitment Pipeline",
    category: "Admin Screens",
    kind: "screen",
  },
] as const;

export function normalizeOrganizationPacketSetup(
  value: unknown,
): OrganizationPacketSetup {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaultOrganizationPacketSetup };
  }

  const setup = value as Partial<OrganizationPacketSetup>;
  const assignmentsByItemId =
    setup.assignmentsByItemId && typeof setup.assignmentsByItemId === "object"
      ? Object.entries(setup.assignmentsByItemId).reduce<
          Record<string, PacketAssignment[]>
        >((result, [itemId, assignments]) => {
          if (!Array.isArray(assignments)) {
            return result;
          }

          result[itemId] = assignments
            .filter(
              (assignment) =>
                assignment &&
                typeof assignment === "object" &&
                typeof assignment.id === "string",
            )
            .map((assignment) => {
              const current = assignment as PacketAssignment;
              return {
                id: current.id,
                positionCode: current.positionCode ?? "",
                positionLabel: current.positionLabel ?? current.positionCode ?? "",
                superAccess: current.superAccess === true,
                attributeIds: Array.isArray(current.attributeIds)
                  ? current.attributeIds.filter(
                      (attributeId): attributeId is string =>
                        typeof attributeId === "string",
                    )
                  : [],
              };
            });

          return result;
        }, {})
      : {};

  return {
    assignmentsByItemId,
  };
}

export function getPacketAssignments(
  setup: OrganizationPacketSetup,
  itemId: string,
) {
  return setup.assignmentsByItemId[itemId] ?? [];
}

export function savePacketAssignment(
  setup: OrganizationPacketSetup,
  itemId: string,
  assignment: Omit<PacketAssignment, "id"> & { id?: string },
): OrganizationPacketSetup {
  const currentAssignments = getPacketAssignments(setup, itemId);
  const nextAssignment: PacketAssignment = {
    id: assignment.id ?? `${itemId}-assignment-${Date.now().toString(36)}`,
    positionCode: assignment.positionCode,
    positionLabel: assignment.positionLabel,
    superAccess: assignment.superAccess,
    attributeIds: assignment.attributeIds,
  };
  const nextAssignments = assignment.id
    ? currentAssignments.map((item) =>
        item.id === assignment.id ? nextAssignment : item,
      )
    : [...currentAssignments, nextAssignment];

  return {
    ...setup,
    assignmentsByItemId: {
      ...setup.assignmentsByItemId,
      [itemId]: nextAssignments,
    },
  };
}

export function deletePacketAssignment(
  setup: OrganizationPacketSetup,
  itemId: string,
  assignmentId: string,
): OrganizationPacketSetup {
  return {
    ...setup,
    assignmentsByItemId: {
      ...setup.assignmentsByItemId,
      [itemId]: getPacketAssignments(setup, itemId).filter(
        (assignment) => assignment.id !== assignmentId,
      ),
    },
  };
}
