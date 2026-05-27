"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { 
  Building2, 
  User, 
  ChevronDown, 
  ChevronRight,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const moduleGroups = [
  { name: "Dashboard", modules: [] },
  {
    name: "Payroll Module",
    modules: ["Payroll Policy Engine", "Payroll Generation"],
  },
  { name: "Settings", modules: [] },
  { name: "Support", modules: ["Performance and Goals"] },
  {
    name: "Recruitment Module",
    modules: ["Candidates", "Recruitment / Jobs"],
  },
  {
    name: "Attendance Module",
    modules: ["Attendance", "Analytics"],
  },
  { name: "Goals Management", modules: ["Goals"] },
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

const moduleOptions = moduleGroups.flatMap((group) => [group.name, ...group.modules]);

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type FormMode = "create" | "view" | "edit";

export type InitialOrganizationFormData = {
  id: string;
  organizationName: string;
  organizationEmail: string;
  phoneNumber: string;
  industry: string;
  address: string;
  superAdminName: string;
  superAdminEmail: string;
  adminPhone: string;
  designation: string;
  startDate: string | null;
  autoDeactivateDate: string | null;
  isActive: boolean;
  userLimit: number;
  moduleAccess: string[];
};

type CreateOrganizationFormProps = {
  mode: FormMode;
  initialOrganization?: InitialOrganizationFormData;
};

export default function CreateOrganizationForm({
  mode,
  initialOrganization,
}: CreateOrganizationFormProps) {
  const router = useRouter();
  const todayDate = getTodayDateInputValue();
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const [organizationName, setOrganizationName] = useState(initialOrganization?.organizationName ?? "");
  const [organizationEmail, setOrganizationEmail] = useState(initialOrganization?.organizationEmail ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initialOrganization?.phoneNumber ?? "");
  const [industry, setIndustry] = useState(initialOrganization?.industry ?? "");
  const [address, setAddress] = useState(initialOrganization?.address ?? "");
  const [autoDeactivateDate, setAutoDeactivateDate] = useState(toDateInputValue(initialOrganization?.autoDeactivateDate));
  
  const [superAdminName, setSuperAdminName] = useState(initialOrganization?.superAdminName ?? "");
  const [superAdminEmail, setSuperAdminEmail] = useState(initialOrganization?.superAdminEmail ?? "");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState(initialOrganization?.adminPhone ?? "");
  const [designation, setDesignation] = useState(initialOrganization?.designation ?? "");
  
  const [modulePermissions, setModulePermissions] = useState<Record<string, boolean>>(
    () => {
      const initialModules = new Set(initialOrganization?.moduleAccess ?? []);
      return Object.fromEntries(moduleOptions.map((module) => [module, initialModules.has(module)]));
    },
  );
  const [openModuleGroups, setOpenModuleGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(moduleGroups.map((group) => [group.name, group.name === "Dashboard"])),
  );
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const pageTitle =
    mode === "view" ? "Organization Details" : mode === "edit" ? "Edit Organization" : "Add Organization";
  const cardDescription =
    mode === "view"
      ? "Review the saved organization details"
      : mode === "edit"
        ? "Update the saved organization details"
        : "Enter the basic details of the organization";

  const groupedModuleAccess = {
    groups: moduleGroups.map((group) => ({
      name: group.name,
      enabled: modulePermissions[group.name] === true,
      modules: group.modules.map((moduleName) => ({
        name: moduleName,
        enabled: modulePermissions[moduleName] === true,
      })),
    })),
  };

  function toggleModuleGroup(groupName: string, childModules: readonly string[]) {
    setModulePermissions((current) => {
      const groupSelected =
        current[groupName] && childModules.every((moduleName) => current[moduleName]);
      const nextSelected = !groupSelected;

      return {
        ...current,
        [groupName]: nextSelected,
        ...Object.fromEntries(childModules.map((moduleName) => [moduleName, nextSelected])),
      };
    });

    if (childModules.length > 0) {
      setOpenModuleGroups((current) => ({
        ...current,
        [groupName]: true,
      }));
    }
  }

  function toggleSubModule(groupName: string, childModules: readonly string[], moduleName: string) {
    setModulePermissions((current) => {
      const next = {
        ...current,
        [moduleName]: !current[moduleName],
      };
      next[groupName] = childModules.some((childModule) => next[childModule]);
      return next;
    });
  }

  function toggleModuleGroupOpen(groupName: string) {
    setOpenModuleGroups((current) => ({
      ...current,
      [groupName]: !current[groupName],
    }));
  }

  function showToast(nextToast: Exclude<ToastState, null>) {
    setToast(nextToast);
    window.setTimeout(() => {
      setToast((current) => (current === nextToast ? null : current));
    }, 3500);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isViewMode) return;
    if (autoDeactivateDate && autoDeactivateDate < todayDate) {
      showToast({
        type: "error",
        message: "Subscription end date cannot be before today.",
      });
      return;
    }

    setCreating(true);
    setToast(null);

    try {
      const response = await fetch(isEditMode ? `/api/portal/${initialOrganization?.id}` : "/api/portal", {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          organizationEmail,
          phoneNumber,
          industry,
          address,
          adminPhone,
          designation,
          ...(isEditMode
            ? { adminName: superAdminName, adminEmail: superAdminEmail }
            : { superAdminName, superAdminEmail }),
          ...(!isEditMode ? { superAdminPassword } : {}),
          autoDeactivateDate,
          moduleAccess: groupedModuleAccess,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || payload.details || "Failed to create organization");
      }

      showToast({
        type: "success",
        message: isEditMode ? "Organization updated successfully." : "Organization created successfully.",
      });
      if (isEditMode) {
        router.refresh();
        return;
      }
      setOrganizationName("");
      setOrganizationEmail("");
      setPhoneNumber("");
      setIndustry("");
      setAddress("");
      setAutoDeactivateDate("");
      setSuperAdminName("");
      setSuperAdminEmail("");
      setSuperAdminPassword("");
      setAdminPhone("");
      setDesignation("");
      setModulePermissions(Object.fromEntries(moduleOptions.map((module) => [module, false])));
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen py-10 px-6 font-sans">
      <CustomToast toast={toast} onClose={() => setToast(null)} />
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumbs & Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-slate-500">Organizations</span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500">{pageTitle}</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* 1. Organization Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Building2 className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Organization Details</h3>
                <p className="text-sm text-slate-500">{cardDescription}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Organization Name" required>
                <input className={inputStyle} placeholder="Enter organization name" value={organizationName} onChange={e => setOrganizationName(e.target.value)} readOnly={isViewMode} required />
              </Field>
              
              <Field label="Organization Email" required>
                <input className={inputStyle} type="email" placeholder="Enter organization email" value={organizationEmail} onChange={e => setOrganizationEmail(e.target.value)} readOnly={isViewMode} required />
              </Field>

              <Field label="Phone Number" required>
                <div className="flex group">
                  <div className="flex items-center gap-2 border border-r-0 border-slate-200 rounded-l-lg px-3 bg-slate-50 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-lg">🇮🇳</span> <span className="font-medium text-slate-700">+91</span> <ChevronDown size={14} className="text-slate-400"/>
                  </div>
                  <input className={`${inputStyle} rounded-l-none`} placeholder="Enter phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} readOnly={isViewMode} required />
                </div>
              </Field>

              <Field label="Industry" required>
                <div className="relative">
                  <select className={`${inputStyle} appearance-none pr-10`} value={industry} onChange={e => setIndustry(e.target.value)} disabled={isViewMode} required>
                    <option value="">Select industry</option>
                    <option value="it">Information Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18}/>
                </div>
              </Field>

              <div className="md:col-span-2">
                <Field label="Address" required>
                  <textarea 
                    className={`${inputStyle} min-h-[100px] py-3 resize-none`} 
                    placeholder="Enter complete address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    readOnly={isViewMode}
                    required
                  />
                </Field>
              </div>

              <Field label="Subscription Start Date">
                <input className={`${inputStyle} bg-slate-50 text-slate-500`} value={initialOrganization?.startDate ? formatDate(initialOrganization.startDate) : "Today"} disabled />
              </Field>

              <Field label="Subscription End Date" required>
                <input
                  className={inputStyle}
                  type="date"
                  min={todayDate}
                  value={autoDeactivateDate}
                  onChange={(e) => setAutoDeactivateDate(e.target.value)}
                  readOnly={isViewMode}
                  required
                />
              </Field>
            </div>
          </div>

          {/* 2. Admin Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-blue-50 p-3 rounded-xl">
                <User className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Admin Details</h3>
                <p className="text-sm text-slate-500">Enter the primary administrator details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Admin Name" required>
                <input className={inputStyle} placeholder="Enter admin full name" value={superAdminName} onChange={e => setSuperAdminName(e.target.value)} readOnly={isViewMode} required />
              </Field>
              
              <Field label="Admin Email" required>
                <input className={inputStyle} type="email" placeholder="Enter admin email" value={superAdminEmail} onChange={e => setSuperAdminEmail(e.target.value)} readOnly={isViewMode} required />
              </Field>

              <Field label="Admin Phone Number" required>
                <div className="flex">
                  <div className="flex items-center gap-2 border border-r-0 border-slate-200 rounded-l-lg px-3 bg-slate-50 text-sm cursor-pointer">
                    <span className="text-lg">🇮🇳</span> <span className="font-medium text-slate-700">+91</span> <ChevronDown size={14} className="text-slate-400"/>
                  </div>
                  <input className={`${inputStyle} rounded-l-none`} placeholder="Enter admin phone number" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} readOnly={isViewMode} required />
                </div>
              </Field>

              <Field label="Designation" required>
                <input className={inputStyle} placeholder="Enter designation" value={designation} onChange={e => setDesignation(e.target.value)} readOnly={isViewMode} required />
              </Field>

              {!isEditMode && !isViewMode ? (
                <Field label="Admin Password" required>
                  <input
                    className={inputStyle}
                    type="password"
                    placeholder="Enter admin password"
                    value={superAdminPassword}
                    onChange={(e) => setSuperAdminPassword(e.target.value)}
                    required
                  />
                </Field>
              ) : null}
            </div>
          </div>

          {/* 3. Modules Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-blue-50 p-3 rounded-xl">
                <LayoutGrid className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Module Access</h3>
                <p className="text-sm text-slate-500">Select the modules accessible to this organization</p>
              </div>
            </div>

            <div className="space-y-3">
              {moduleGroups.map((group, index) => {
                const checked =
                  modulePermissions[group.name] &&
                  group.modules.every((moduleName) => modulePermissions[moduleName]);
                const partiallyChecked =
                  group.modules.length > 0 &&
                  group.modules.some((moduleName) => modulePermissions[moduleName]) &&
                  !checked;
                const expanded = openModuleGroups[group.name];

                return (
                  <div key={group.name} className="rounded-xl border border-slate-200 bg-white">
                    <div className="flex min-h-14 items-center gap-3 px-4 py-3">
                      <span className="w-6 text-sm font-bold text-slate-400">{index + 1}.</span>
                      <button
                        type="button"
                        onClick={() => toggleModuleGroupOpen(group.name)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-default disabled:hover:bg-transparent"
                        disabled={group.modules.length === 0}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${group.name}`}
                      >
                        {group.modules.length > 0 ? (
                          expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                        )}
                      </button>
                      <label className="flex flex-1 cursor-pointer items-center justify-between gap-4">
                        <span>
                          <span className="block text-sm font-bold text-slate-800">{group.name}</span>
                          {group.modules.length > 0 ? (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {group.modules.length} submodules
                            </span>
                          ) : null}
                        </span>
                        <span className="flex items-center gap-3">
                          {partiallyChecked ? (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                              Partial
                            </span>
                          ) : null}
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleModuleGroup(group.name, group.modules)}
                            disabled={isViewMode}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all"
                          />
                        </span>
                      </label>
                    </div>

                    {expanded && group.modules.length > 0 ? (
                      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {group.modules.map((moduleName, childIndex) => {
                            const childChecked = modulePermissions[moduleName];
                            return (
                              <label
                                key={moduleName}
                                className={`flex min-h-11 cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 transition-all duration-200 ${
                                  childChecked
                                    ? "border-blue-500 bg-white text-blue-700 ring-1 ring-blue-500"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                <span className="flex items-center gap-2 text-sm font-semibold">
                                  <span className="text-xs font-bold text-slate-400">
                                    {String.fromCharCode(65 + childIndex)}.
                                  </span>
                                  {moduleName}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={childChecked}
                                  onChange={() => toggleSubModule(group.name, group.modules, moduleName)}
                                  disabled={isViewMode}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all"
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-4 pt-6">
            <Link
              href="/portal/organizations"
              className="px-10 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
            >
              {isViewMode ? "Back" : "Cancel"}
            </Link>
            {isViewMode && initialOrganization ? (
              <Link
                href={`/portal/create?id=${initialOrganization.id}&mode=edit`}
                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 text-sm"
              >
                Edit Organization
              </Link>
            ) : (
              <button 
                type="submit" 
                disabled={creating}
                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 text-sm disabled:opacity-70"
              >
                {creating ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save Changes" : "Create Organization"}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}

function CustomToast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  if (!toast) return null;

  const success = toast.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div className="fixed right-6 top-6 z-50 w-[min(360px,calc(100vw-48px))]">
      <div
        className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl shadow-slate-200/70 ${
          success ? "border-emerald-200" : "border-rose-200"
        }`}
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            success ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">
            {success ? "Success" : "Unable to create organization"}
          </p>
          <p className="mt-0.5 text-sm leading-5 text-slate-600">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/** Helper Component for Input Fields **/
function Field({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-bold text-slate-700 tracking-tight">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Base styles for inputs **/
const inputStyle = `
  w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 
  placeholder:text-slate-400 outline-none transition-all duration-200
  focus:ring-0 focus:border-slate-200
`;

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
