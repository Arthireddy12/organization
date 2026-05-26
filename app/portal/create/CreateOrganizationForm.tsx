"use client";

import { FormEvent, useState } from "react";
import { 
  Building2, 
  User, 
  ChevronDown, 
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const moduleOptions = [
"Leave Policy Control",
"Payroll Policy Engine",
"Projects",
"HR Payroll Portal",
"Projects Review",
"Leave Intelligence",
"Employees",
"Candidates",
"Recruitment / Jobs",
"Onboarding",
"Letters",
"Documents",
"Attendance",
"Analytics",
"Shifts",
"Policies",
"Leaves",
"Comp Off Requests",
"Auto Escalation",
"Backup Approver",
"Delegation",
"Approval Routing",
"Holidays",
"Departments",
"Org Chart",
];

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function CreateOrganizationForm() {
  const [organizationName, setOrganizationName] = useState("");
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [autoDeactivateDate, setAutoDeactivateDate] = useState("");
  
  const [superAdminName, setSuperAdminName] = useState("");
  const [superAdminEmail, setSuperAdminEmail] = useState("");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [designation, setDesignation] = useState("");
  
  const [modulePermissions, setModulePermissions] = useState<Record<string, boolean>>(
    () => Object.fromEntries(moduleOptions.map((module) => [module, false])),
  );
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const selectedModules = Object.entries(modulePermissions)
    .filter(([, enabled]) => enabled)
    .map(([moduleName]) => moduleName);

  function toggleModule(moduleName: string) {
    setModulePermissions((current) => ({
      ...current,
      [moduleName]: !current[moduleName],
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
    setCreating(true);
    setToast(null);

    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          organizationEmail,
          phoneNumber,
          industry,
          address,
          adminPhone,
          designation,
          superAdminName,
          superAdminEmail,
          superAdminPassword,
          autoDeactivateDate,
          moduleAccess: selectedModules,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || payload.details || "Failed to create organization");
      }

      showToast({
        type: "success",
        message: "Organization created successfully.",
      });
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
          <h1 className="text-2xl font-bold text-slate-900">Add Organization</h1>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-slate-500">Organizations</span>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-500">Add Organization</span>
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
                <p className="text-sm text-slate-500">Enter the basic details of the organization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Organization Name" required>
                <input className={inputStyle} placeholder="Enter organization name" value={organizationName} onChange={e => setOrganizationName(e.target.value)} required />
              </Field>
              
              <Field label="Organization Email" required>
                <input className={inputStyle} type="email" placeholder="Enter organization email" value={organizationEmail} onChange={e => setOrganizationEmail(e.target.value)} required />
              </Field>

              <Field label="Phone Number" required>
                <div className="flex group">
                  <div className="flex items-center gap-2 border border-r-0 border-slate-200 rounded-l-lg px-3 bg-slate-50 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-lg">🇮🇳</span> <span className="font-medium text-slate-700">+91</span> <ChevronDown size={14} className="text-slate-400"/>
                  </div>
                  <input className={`${inputStyle} rounded-l-none`} placeholder="Enter phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                </div>
              </Field>

              <Field label="Industry" required>
                <div className="relative">
                  <select className={`${inputStyle} appearance-none pr-10`} value={industry} onChange={e => setIndustry(e.target.value)} required>
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
                    required
                  />
                </Field>
              </div>

              <Field label="Subscription Start Date">
                <input className={`${inputStyle} bg-slate-50 text-slate-500`} value="Today" disabled />
              </Field>

              <Field label="Subscription End Date" required>
                <input
                  className={inputStyle}
                  type="date"
                  value={autoDeactivateDate}
                  onChange={(e) => setAutoDeactivateDate(e.target.value)}
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
                <input className={inputStyle} placeholder="Enter admin full name" value={superAdminName} onChange={e => setSuperAdminName(e.target.value)} required />
              </Field>
              
              <Field label="Admin Email" required>
                <input className={inputStyle} type="email" placeholder="Enter admin email" value={superAdminEmail} onChange={e => setSuperAdminEmail(e.target.value)} required />
              </Field>

              <Field label="Admin Phone Number" required>
                <div className="flex">
                  <div className="flex items-center gap-2 border border-r-0 border-slate-200 rounded-l-lg px-3 bg-slate-50 text-sm cursor-pointer">
                    <span className="text-lg">🇮🇳</span> <span className="font-medium text-slate-700">+91</span> <ChevronDown size={14} className="text-slate-400"/>
                  </div>
                  <input className={`${inputStyle} rounded-l-none`} placeholder="Enter admin phone number" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} required />
                </div>
              </Field>

              <Field label="Designation" required>
                <input className={inputStyle} placeholder="Enter designation" value={designation} onChange={e => setDesignation(e.target.value)} required />
              </Field>

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
            </div>
          </div>

          {/* 3. Modules Section (Preserved & Styled) */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {moduleOptions.map((moduleName) => {
                const checked = modulePermissions[moduleName];
                return (
                  <label
                    key={moduleName}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-5 py-4 transition-all duration-200 ${
                      checked
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-semibold text-sm">{moduleName}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModule(moduleName)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-4 pt-6">
            <button 
              type="button" 
              className="px-10 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={creating}
              className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 text-sm disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create Organization"}
            </button>
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
