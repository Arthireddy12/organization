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
  { name: "Reimbursements", modules: [] },
  {
    name: "Settings",
    modules: [
      "Master Reports",
      "Role Management",
      "Settings",
      "Permissions",
      "Shifts",
    ],
  },
  {
    name: "Communications",
    modules: ["Announcements"],
  },
  {
    name: "Goal Management",
    modules: ["Project Creation", "Project Reviews"],
  },
  { name: "Support", modules: ["Helpdesk", "Faq"] },
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
      "Add Resignation",
      "Comp Off Requests",
      "Auto Escalation",
      "Backup Approver",
      "Delegation",
      "Holidays",
    ],
  },
  {
    name: "Core Hrms",
    modules: [
      "All Employees",
      "Onboarding",
      "Letters",
      "All Documents",
      "All Departments",
      "Org Chart",
      "Directory",
      "Resignation"
    ],
  },
] as const;

export const moduleOptions = moduleGroups.flatMap((group) => [
  group.name,
  ...group.modules,
]);
