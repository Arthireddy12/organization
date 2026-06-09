import type { OrganizationCreateStep } from "./types";

export const setupSteps: Array<{
  id: OrganizationCreateStep;
  label: string;
}> = [
  { id: 1, label: "COMPANY DETAILS" },
  { id: 2, label: "ORG LEVELS & ATTRIBUTES" },
  { id: 3, label: "ROLES DEFINITION" },
  { id: 4, label: "PACKETS DEFINITION" },
  { id: 5, label: "GROUP DEFINITION" },
];

export const industryOptions = [
  "Please Select",
  "Information Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Education",
];

export const employeeRangeOptions = [
  "Please Select",
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

export const encryptionOptions = ["Not Applicable", "AES-256", "Standard"];

export const currencyOptions = ["Rupee", "Dollar", "Euro"];

export const financialYearDays = ["31", "30", "29", "28"];

export const financialYearMonths = [
  "March",
  "April",
  "December",
  "June",
  "September",
];

export const moduleGroups = [
  { name: "Dashboard", modules: [] },
  {
    name: "Payroll Module",
    modules: ["Payroll Policy Engine", "Payroll Generation"],
  },
  { name: "Settings", modules: [] },
  { name: "Support", modules: ["Helpdesk", "Performance & Goals"] },
  {
    name: "Recruitment Module",
    modules: ["Candidates", "Recruitment / Jobs"],
  },
  {
    name: "Attendance Module",
    modules: ["Attendance", "Analytics"],
  },
  {
    name: "Leave Module",
    modules: [
      "Leave Policy Control",
      "Policies",
      "Leaves",
      "Comp Off Requests",
      "Auto Escalation",
      "Backup Approver",
      "Delegation",
      "Holidays",
    ],
  },
  {
    name: "People Module",
    modules: [
      "All Employees",
      "Onboarding",
      "Letters",
      "Documents",
      "Shifts",
      "All Departments",
      "Org Chart",
      "Directory",
    ],
  },
] as const;

export const moduleOptions = moduleGroups.flatMap((group) => [
  group.name,
  ...group.modules,
]);
