"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import { toast } from "sonner";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";

const ORGANIZATION_PLAN_PRICES: Record<string, number> = {
  Starter: 10000,
  Basic: 10000,
  Professional: 25000,
  Enterprise: 50000,
};

function getPlanPrice(planName?: string | null) {
  if (!planName) return null;
  return ORGANIZATION_PLAN_PRICES[planName] ?? null;
}

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams?.get("id");
  const mode = searchParams?.get("mode");
  const isView = mode === "view";
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `INV-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
  );

  const [form, setForm] = useState({
    organizationName: '',
    mobileNumber: '',
    address: '',
    gstNumber: '',
    amount: '',
    discount: '0',
    gst: '18',
    sgst: '0',
  });
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<{
    id: string;
    name: string;
    planName?: string | null;
  }[]>([]);
  const [selectedOrganizationIdState, setSelectedOrganizationIdState] = useState("");

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await fetch("/api/portal");
        const data = await res.json();
        if (res.ok) {
          setOrganizations(data);
          if (data.length === 1) {
            setSelectedOrganizationIdState(data[0].id);
            setForm((prev) => ({
              ...prev,
              organizationName: data[0].name,
              amount: String(getPlanPrice(data[0].planName) ?? prev.amount),
            }));
          }
        } else {
          toast.error(data?.error || "Unable to load organizations");
        }
      } catch (err) {
        console.error(err);
        toast.error("Unable to load organizations");
      }
    }

    fetchOrganizations();
  }, []);

  const selectedOrganizationId = useMemo(() => {
    if (organizations.length === 0) {
      return "";
    }

    if (selectedOrganizationIdState) {
      return selectedOrganizationIdState;
    }

    return organizations.find((org) => org.name === form.organizationName)?.id ?? "";
  }, [form.organizationName, organizations, selectedOrganizationIdState]);

  useEffect(() => {
    if (!invoiceId) return;

    async function fetchInvoice(id: string) {
      setLoading(true);
      try {
        const res = await fetch(`/api/invoice/${id}`);
        const data = await res.json();
        if (res.ok && data?.data) {
          const inv = data.data;
          setInvoiceNumber(inv.invoiceNumber || '');
          setForm({
            organizationName: inv.organizationName || '',
            mobileNumber: inv.mobileNumber || '',
            address: inv.address || '',
            gstNumber: inv.gstNumber || '',
            amount: String(inv.amount ?? ''),
            discount: String(inv.discount ?? '0'),
            gst: String(inv.gst ?? '18'),
            sgst: String(inv.sgst ?? '0'),
          });
        } else {
          toast.error(data?.message || 'Failed to fetch invoice');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch invoice');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice(invoiceId);
  }, [invoiceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isView) return;
    setLoading(true);
    const errors = validateForm();
    if (errors.length) {
      errors.forEach((m) => toast.error(m));
      setLoading(false);
      return;
    }
    try {
      const payload = {
        invoiceNumber,
        organizationName: form.organizationName,
        mobileNumber: form.mobileNumber,
        address: form.address,
        gstNumber: form.gstNumber,
        amount: Number(form.amount || 0),
        discount: Number(form.discount || 0),
        gst: Number(form.gst || 0),
        sgst: Number(form.sgst || 0),
      };

      const url = invoiceId ? `/api/invoice/${invoiceId}` : '/api/invoice';
      const method = invoiceId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data?.message || (invoiceId ? 'Updated' : 'Created'));
        router.push('/billing');
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!invoiceId) return;
    if (!confirm('Delete this invoice?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/invoice/${invoiceId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data?.message || 'Deleted');
        router.push('/billing');
      } else {
        toast.error(data?.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Delete request failed');
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const errors: string[] = [];
    if (!form.organizationName.trim()) errors.push('Organization Name is required');
    if (!form.mobileNumber.trim()) errors.push('Mobile Number is required');
    if (!form.address.trim()) errors.push('Address is required');
    if (!form.amount || Number(form.amount) <= 0) errors.push('Amount must be greater than 0');
    return errors;
  }

  const inputClassName = 'h-11 rounded-xl px-4 focus:border-slate-300 focus:ring-0';
  const labelClassName = 'block text-xs font-bold text-slate-700 mb-2 uppercase';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-12">
      {/* --- MAIN CONTENT AREA --- */}
      <main className="pt-10 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden">
          
          {/* Form Header */}
          <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{invoiceId ? 'Edit Invoice' : 'Create Invoice'}</h2>
              <p className="text-sm text-slate-500 mt-1">Fill organization billing details</p>
            </div>
            <Button size="icon" variant="ghost" icon={<X size={22} />} onClick={() => router.push('/billing')} />
          </div>

          {/* Form Body */}
          <form className="p-8" onSubmit={handleSubmit} autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  Invoice Number
                </label>
                <Input
                  type="text"
                  value={invoiceNumber}
                  readOnly
                  className={`${inputClassName} bg-slate-50 font-semibold text-slate-700`}
                  autoComplete="off"
                />
              </div>

              
              {/* 1. Organization Name */}
              <div>
                <label className={labelClassName}>
                  Select Organization <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  disabled={isView}
                  value={selectedOrganizationId}
                  className={`${inputClassName} bg-white`}
                  onChange={(e) => {
                    const orgId = e.target.value;
                    setSelectedOrganizationIdState(orgId);
                    const org = organizations.find((item) => item.id === orgId);
                    const planPrice = getPlanPrice(org?.planName);
                    setForm((prev) => ({
                      ...prev,
                      organizationName: org?.name ?? '',
                      amount: planPrice !== null ? String(planPrice) : prev.amount,
                    }));
                  }}
                >
                  <option value="">Select organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {selectedOrganizationId && (
                  <p className="mt-2 text-xs text-slate-500">
                    Organization amount: Rs{' '}
                    {getPlanPrice(
                      organizations.find((org) => org.id === selectedOrganizationId)?.planName,
                    ) ?? 'Not available'}
                  </p>
                )}
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className={labelClassName}>
                  Mobile Number <span className="text-red-500 font-bold">*</span>
                </label>
                <PhoneInput
                  international
                  defaultCountry="IN"
                  placeholder="Enter mobile number"
                  disabled={isView}
                  value={form.mobileNumber || undefined}
                  className="invoice-phone-input"
                  autoComplete="off"
                  onChange={(value) => setForm({ ...form, mobileNumber: value ?? '' })}
                />
              </div>

              {/* 3. Address */}
              <div className="md:col-span-2">
                <label className={labelClassName}>
                  Address <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea 
                  rows={4}
                  placeholder="Enter full address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  disabled={isView}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 transition-all placeholder:text-slate-400 resize-none bg-white"
                />
              </div>

              {/* 4. GST Number */}
              <div>
                <label className={labelClassName}>
                  GST Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter GST Number"
                  disabled={isView}
                  value={form.gstNumber}
                  className={inputClassName}
                  autoComplete="off"
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                />
              </div>

              {/* 5. GST % */}
              <div>
                <label className={labelClassName}>
                  GST (%) <span className="text-red-500 font-bold">*</span>
                </label>
                <Input 
                  type="number"
                  placeholder="18"
                  disabled={isView}
                  value={form.gst}
                  className={inputClassName}
                  autoComplete="off"
                  onChange={(e) => setForm({ ...form, gst: e.target.value })}
                />
              </div>

              {/* 6. SGST % */}
              <div>
                <label className={labelClassName}>
                  SGST (%) <span className="text-red-500 font-bold">*</span>
                </label>
                <Input 
                  type="number"
                  placeholder="0"
                  disabled={isView}
                  value={form.sgst}
                  className={inputClassName}
                  autoComplete="off"
                  onChange={(e) => setForm({ ...form, sgst: e.target.value })}
                />
              </div>

              {/* 7. Amount */}
              <div>
                <label className={labelClassName}>
                  Amount <span className="text-red-500 font-bold">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  disabled={isView}
                  value={form.amount}
                  className={inputClassName}
                  autoComplete="off"
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              {/* 8. Discount (%) */}
              <div>
                <label className={labelClassName}>
                  Discount (%)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  disabled={isView}
                  value={form.discount}
                  className={inputClassName}
                  autoComplete="off"
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                />
              </div>

            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex justify-end gap-4 mt-10">
              <Button
                variant="secondary"
                onClick={() => router.push('/billing')}
              >
                Close
              </Button>
              {!isView && invoiceId && (
                  <Button variant="danger" onClick={handleDelete} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              )}
              {!isView && (
                <Button 
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? (invoiceId ? 'Updating...' : 'Creating...') : (invoiceId ? 'Update Invoice' : 'Create Invoice')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <CreateInvoiceContent />
    </Suspense>
  );
}
