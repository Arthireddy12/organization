'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Download, Eye, Search, Edit, Trash, ChevronLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeaderCell, DataTableCell } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { openInvoicePdfWindow } from '@/lib/invoice-pdf';


interface Invoice {
  id: string;
  invoiceNumber?: string;
  organizationName?: string;
  createdAt?: string;
  finalAmount?: number;
  mobileNumber?: string;
  address?: string;
  gstNumber?: string | null;
  amount?: number;
  discount?: number;
  gst?: number;
  sgst?: number;
  taxableAmount?: number;
}

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const router = useRouter();

  async function fetchInvoices() {
    try {
      const res = await fetch('/api/invoice');
      const data = await res.json();
      if (res.ok && data?.data) {
        setInvoices(data.data);
      } else {
        toast.error(data?.message || 'Failed to fetch invoices');
        console.error(data?.message || 'Failed to fetch invoices');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch('/api/invoice')
      .then(async (res) => ({ res, data: await res.json() }))
      .then(({ res, data }) => {
        if (cancelled) return;
        if (res.ok && data?.data) {
          setInvoices(data.data);
        } else {
          toast.error(data?.message || 'Failed to fetch invoices');
          console.error(data?.message || 'Failed to fetch invoices');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        toast.error('Failed to fetch invoices');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this invoice?')) return;
    try {
      const res = await fetch(`/api/invoice/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data?.message || 'Deleted');
        fetchInvoices();
      } else {
        toast.error(data?.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Delete request failed');
    }
  }

  function handleDownload(invoice: Invoice) {
    try {
      setOpenActionId(null);
      openInvoicePdfWindow(invoice);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to generate invoice PDF');
    }
  }

  const filteredInvoices = invoices.filter((invoice) =>
    (invoice.invoiceNumber || invoice.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.organizationName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const pageCount = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIdx, startIdx + itemsPerPage);
  const visibleStart = filteredInvoices.length === 0 ? 0 : startIdx + 1;
  const visibleEnd = Math.min(startIdx + itemsPerPage, filteredInvoices.length);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
            >
              <ChevronLeft size={20} className="text-slate-700" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Billing & Subscription
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage invoices, GST details and billing history
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => router.push('/invoice')}
          >
            Create Invoice
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-visible shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Invoice List</h2>
              <Input
                placeholder="Search invoices..."
                icon={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64"
              />
            </div>
          </div>

          <DataTable>
            <DataTableHead>
              <DataTableRow>
                <DataTableHeaderCell>Invoice ID</DataTableHeaderCell>
                <DataTableHeaderCell>Organization</DataTableHeaderCell>
                <DataTableHeaderCell>Date</DataTableHeaderCell>
                <DataTableHeaderCell>Amount</DataTableHeaderCell>
                <DataTableHeaderCell className="text-center">Actions</DataTableHeaderCell>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableRow>
                  <DataTableCell colSpan={5} className="text-center text-sm text-slate-500">
                    Loading invoices...
                  </DataTableCell>
                </DataTableRow>
              ) : paginatedInvoices.length === 0 ? (
                <DataTableRow>
                  <DataTableCell colSpan={5} className="text-center text-sm text-slate-500">
                    No invoices found.
                  </DataTableCell>
                </DataTableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <DataTableRow key={invoice.id}>
                    <DataTableCell className="font-medium">{invoice.invoiceNumber || invoice.id}</DataTableCell>
                    <DataTableCell>{invoice.organizationName}</DataTableCell>
                    <DataTableCell>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}</DataTableCell>
                    <DataTableCell className="font-semibold">Rs. {invoice.finalAmount?.toFixed?.(2) ?? invoice.finalAmount ?? '-'}</DataTableCell>
                    <DataTableCell className="relative text-center">
                      <div className="flex justify-center">
                        <Button
                          size="icon"
                          variant="secondary"
                          icon={<MoreVertical size={16} />}
                          onClick={() => setOpenActionId(openActionId === invoice.id ? null : invoice.id)}
                        />
                        {openActionId === invoice.id && (
                          <div className="absolute right-8 top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-left shadow-xl">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              onClick={() => {
                                setOpenActionId(null);
                                router.push(`/invoice?id=${invoice.id}&mode=view`);
                              }}
                            >
                              <Eye size={15} /> View
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              onClick={() => {
                                setOpenActionId(null);
                                router.push(`/invoice?id=${invoice.id}`);
                              }}
                            >
                              <Edit size={15} /> Edit
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              onClick={() => handleDownload(invoice)}
                            >
                              <Download size={15} /> Download PDF
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                setOpenActionId(null);
                                handleDelete(invoice.id);
                              }}
                            >
                              <Trash size={15} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>

          <Pagination
            page={currentPage}
            pageCount={pageCount || 1}
            onPageChange={setCurrentPage}
            summary={`Showing ${visibleStart} to ${visibleEnd} of ${filteredInvoices.length} invoices`}
          />
        </div>
      </div>
    </div>
  );
}
