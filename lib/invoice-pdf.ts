import { jsPDF } from 'jspdf';

const BRAND_NAME = 'HRMS Portal';
const BRAND_TAGLINE = 'Organization & HR Management Platform';
const COMPANY_NAME = 'HRMS Portal';
const COMPANY_EMAIL = 'jobin@gmail.com';
const COMPANY_PHONE = '+91 120 456 7890';
const COMPANY_WEBSITE = 'www.hrmsportal.com';
const COMPANY_ADDRESS = 'HRMS Portal, India';

export interface PrintableInvoice {
  id: string;
  invoiceNumber?: string;
  organizationName?: string;
  mobileNumber?: string;
  address?: string;
  gstNumber?: string | null;
  amount?: number;
  discount?: number;
  gst?: number;
  sgst?: number;
  taxableAmount?: number;
  finalAmount?: number;
  createdAt?: string;
}

type InvoiceTotals = {
  amount: number;
  discountRate: number;
  cgstRate: number;
  sgstRate: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
};

function formatDate(value?: string, daysToAdd = 0) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '-';
  date.setDate(date.getDate() + daysToAdd);

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function numberToWords(value: number) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function belowHundred(num: number) {
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
  }

  function belowThousand(num: number) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return `${hundred ? `${ones[hundred]} Hundred` : ''} ${rest ? belowHundred(rest) : ''}`.trim();
  }

  const rounded = Math.round(value);
  if (!rounded) return 'Zero Rupees Only';

  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const rest = rounded % 1000;
  const parts = [
    crore ? `${belowThousand(crore)} Crore` : '',
    lakh ? `${belowThousand(lakh)} Lakh` : '',
    thousand ? `${belowThousand(thousand)} Thousand` : '',
    rest ? belowThousand(rest) : '',
  ].filter(Boolean);

  return `${parts.join(' ')} Rupees Only`;
}

function calculateTotals(invoice: PrintableInvoice): InvoiceTotals {
  const amount = Number(invoice.amount ?? 0);
  const discountRate = Number(invoice.discount ?? 0);
  const cgstRate = Number(invoice.gst ?? 0);
  const sgstRate = Number(invoice.sgst ?? 0);
  const discountAmount = (amount * discountRate) / 100;
  const taxableAmount = Number(invoice.taxableAmount ?? amount - discountAmount);
  const cgstAmount = (taxableAmount * cgstRate) / 100;
  const sgstAmount = (taxableAmount * sgstRate) / 100;
  const totalAmount = Number(invoice.finalAmount ?? taxableAmount + cgstAmount + sgstAmount);

  return {
    amount,
    discountRate,
    cgstRate,
    sgstRate,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    totalAmount,
  };
}

function setColor(doc: jsPDF, color: string) {
  const value = color.replace('#', '');
  doc.setTextColor(parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16));
}

function fill(doc: jsPDF, color: string) {
  const value = color.replace('#', '');
  doc.setFillColor(parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16));
}

function stroke(doc: jsPDF, color: string) {
  const value = color.replace('#', '');
  doc.setDrawColor(parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16));
}

function labelValue(doc: jsPDF, label: string, value: string, x: number, y: number, labelWidth = 26, maxWidth = 78) {
  doc.setFont('helvetica', 'bold');
  setColor(doc, '#07112f');
  doc.text(label, x, y);
  doc.text(':', x + labelWidth, y);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(value || '-', maxWidth) as string[];
  doc.text(lines, x + labelWidth + 5, y);
  return y + Math.max(5, lines.length * 5);
}

function panelHeader(doc: jsPDF, title: string, x: number, y: number, width: number, dark = false) {
  fill(doc, dark ? '#082b78' : '#eef4ff');
  stroke(doc, '#cfd9ea');
  doc.rect(x, y, width, 8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(doc, dark ? '#ffffff' : '#0b2b72');
  doc.text(title.toUpperCase(), x + 4, y + 5.5);
}

function drawBrand(doc: jsPDF, x: number, y: number, small = false) {
  fill(doc, '#0d6bff');
  doc.roundedRect(x, y, small ? 8 : 10, small ? 8 : 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(small ? 12 : 16);
  setColor(doc, '#ffffff');
  doc.text('H', x + (small ? 2.8 : 3.6), y + (small ? 5.8 : 7.2));

  doc.setFontSize(small ? 15 : 23);
  setColor(doc, '#1266f1');
  doc.text('HRMS', x + (small ? 12 : 14), y + (small ? 5.5 : 7));
  setColor(doc, '#07112f');
  doc.text('Portal', x + (small ? 30 : 42), y + (small ? 5.5 : 7));
  doc.setFontSize(small ? 5 : 7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, '#3d4863');
  doc.text(BRAND_TAGLINE, x + (small ? 12 : 14), y + (small ? 10 : 13));
}

function drawBadge(doc: jsPDF, x: number, y: number, text: string) {
  fill(doc, '#082b78');
  doc.roundedRect(x, y, 36, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setColor(doc, '#ffffff');
  doc.text(text, x + 5, y + 6.8);
}

function drawSummary(doc: jsPDF, x: number, y: number, width: number, totals: InvoiceTotals) {
  panelHeader(doc, 'Invoice Summary', x, y, width, true);
  const rows = [
    ['Subtotal (Before Discount)', formatCurrency(totals.amount)],
    ['Discount', `(-) ${formatCurrency(totals.discountAmount)}`],
    ['Taxable Amount', formatCurrency(totals.taxableAmount)],
    [`CGST (${totals.cgstRate}%)`, formatCurrency(totals.cgstAmount)],
    [`SGST (${totals.sgstRate}%)`, formatCurrency(totals.sgstAmount)],
    ['IGST (0%)', formatCurrency(0)],
  ];

  doc.setFontSize(8);
  rows.forEach((row, index) => {
    const rowY = y + 8 + index * 7;
    stroke(doc, '#dbe3f0');
    doc.line(x, rowY, x + width, rowY);
    setColor(doc, '#07112f');
    doc.setFont('helvetica', 'normal');
    doc.text(row[0], x + 4, rowY + 4.8);
    doc.setFont('helvetica', 'bold');
    doc.text(row[1], x + width - 4, rowY + 4.8, { align: 'right' });
  });

  const totalY = y + 8 + rows.length * 7;
  fill(doc, '#edf4ff');
  stroke(doc, '#dbe3f0');
  doc.rect(x, totalY, width, 8, 'FD');
  setColor(doc, '#082b78');
  doc.setFont('helvetica', 'bold');
  doc.text('Total Invoice Amount', x + 4, totalY + 5.3);
  doc.text(formatCurrency(totals.totalAmount), x + width - 4, totalY + 5.3, { align: 'right' });
}

function drawPageOne(doc: jsPDF, invoice: PrintableInvoice, totals: InvoiceTotals) {
  const invoiceNumber = invoice.invoiceNumber || invoice.id;
  const invoiceDate = formatDate(invoice.createdAt);
  const dueDate = formatDate(invoice.createdAt, 14);
  const nextYearDate = formatDate(invoice.createdAt, 365);

  drawBrand(doc, 12, 10);
  drawBadge(doc, 162, 10, 'TAX INVOICE');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, '#07112f');
  doc.text(COMPANY_NAME, 12, 30);
  doc.setFontSize(8);
  let y = 38;
  y = labelValue(doc, 'Portal', BRAND_NAME, 12, y);
  y = labelValue(doc, 'GSTIN', 'Not Applicable', 12, y);
  y = labelValue(doc, 'Address', COMPANY_ADDRESS, 12, y, 26, 82);
  y += 2;
  y = labelValue(doc, 'Email', COMPANY_EMAIL, 12, y);
  labelValue(doc, 'Phone', COMPANY_PHONE, 12, y);

  let metaY = 36;
  metaY = labelValue(doc, 'Invoice No.', invoiceNumber, 132, metaY, 25, 40);
  metaY = labelValue(doc, 'Invoice Date', invoiceDate, 132, metaY, 25, 40);
  metaY = labelValue(doc, 'Due Date', dueDate, 132, metaY, 25, 40);
  metaY = labelValue(doc, 'Billing Period', `${invoiceDate} to ${nextYearDate}`, 132, metaY, 25, 45);
  metaY = labelValue(doc, 'Place of Supply', 'Uttar Pradesh (09)', 132, metaY, 25, 45);
  labelValue(doc, 'Reverse Charge', 'No', 132, metaY, 25, 45);

  const billX = 12;
  const billY = 82;
  const billW = 104;
  const billH = 76;
  stroke(doc, '#cfd9ea');
  doc.roundedRect(billX, billY, billW, billH, 1, 1);
  panelHeader(doc, 'Bill To', billX, billY, billW);
  doc.setFontSize(8);
  let billTextY = billY + 16;
  billTextY = labelValue(doc, 'Organization Name', invoice.organizationName || '-', billX + 4, billTextY, 34, 58);
  billTextY = labelValue(doc, 'GSTIN', invoice.gstNumber || '-', billX + 4, billTextY, 34, 58);
  billTextY = labelValue(doc, 'Address', invoice.address || '-', billX + 4, billTextY, 34, 58);
  billTextY = labelValue(doc, 'Contact Person', 'Super Admin', billX + 4, billTextY, 34, 58);
  billTextY = labelValue(doc, 'Email', COMPANY_EMAIL, billX + 4, billTextY, 34, 58);
  labelValue(doc, 'Mobile No.', invoice.mobileNumber || '-', billX + 4, billTextY, 34, 58);

  drawSummary(doc, 122, 82, 76, totals);
  fill(doc, '#effbf4');
  stroke(doc, '#bddfcc');
  doc.roundedRect(122, 144, 76, 14, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, '#13733d');
  doc.text('Payment Due By', 127, 150);
  doc.setFontSize(10);
  doc.text(dueDate, 127, 155);

  const tableY = 162;
  stroke(doc, '#cfd9ea');
  doc.roundedRect(12, tableY, 186, 86, 1, 1);
  panelHeader(doc, 'Invoice Details', 12, tableY, 186);
  fill(doc, '#f8fbff');
  doc.rect(12, tableY + 8, 186, 8, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  setColor(doc, '#0b2b72');
  doc.text('#', 16, tableY + 13);
  doc.text('Description', 24, tableY + 13);
  doc.text('HSN/SAC', 84, tableY + 13);
  doc.text('Quantity', 110, tableY + 13);
  doc.text('Unit Price', 146, tableY + 13, { align: 'right' });
  doc.text('Amount', 190, tableY + 13, { align: 'right' });

  stroke(doc, '#dbe3f0');
  doc.line(12, tableY + 16, 198, tableY + 16);
  doc.setFont('helvetica', 'normal');
  setColor(doc, '#07112f');
  doc.text('1', 16, tableY + 23);
  doc.text([
    `${BRAND_NAME} Invoice - ${invoice.organizationName || 'Organization'}`,
    `Billing period: ${invoiceDate} to ${nextYearDate}`,
    `GST: ${totals.cgstRate}% | SGST: ${totals.sgstRate}% | Discount: ${totals.discountRate}%`,
  ], 24, tableY + 22);
  doc.text('998313', 84, tableY + 23);
  doc.text('1', 114, tableY + 23);
  doc.text(formatCurrency(totals.amount), 146, tableY + 23, { align: 'right' });
  doc.text(formatCurrency(totals.amount), 190, tableY + 23, { align: 'right' });
  doc.line(12, tableY + 32, 198, tableY + 32);

  doc.setFont('helvetica', 'bold');
  let totalY = tableY + 42;
  doc.text('Total Amount (Before Discount)', 16, totalY);
  doc.text(formatCurrency(totals.amount), 84, totalY, { align: 'right' });
  totalY += 10;
  doc.text(`Discount (${totals.discountRate}%)`, 16, totalY);
  doc.text(`(-) ${formatCurrency(totals.discountAmount)}`, 84, totalY, { align: 'right' });
  totalY += 10;
  doc.text('Taxable Amount', 16, totalY);
  doc.text(formatCurrency(totals.taxableAmount), 84, totalY, { align: 'right' });

  doc.line(112, tableY + 32, 112, tableY + 86);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount In Words', 116, tableY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(numberToWords(totals.totalAmount), 74), 116, tableY + 46);
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${COMPANY_NAME}`, 155, tableY + 58, { align: 'center' });
  stroke(doc, '#2f63dc');
  doc.circle(155, tableY + 69, 8);
  doc.setFontSize(6);
  setColor(doc, '#2f63dc');
  doc.text('HRMS Portal', 155, tableY + 70, { align: 'center' });
  stroke(doc, '#7d879b');
  doc.line(132, tableY + 79, 178, tableY + 79);
  doc.setFontSize(7);
  setColor(doc, '#07112f');
  doc.text('Authorized Signatory', 155, tableY + 83, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Thank you for choosing ${BRAND_NAME}!`, 105, 286, { align: 'center' });
  doc.text('Page 1 of 2', 190, 286, { align: 'right' });
}

function drawPageTwo(doc: jsPDF, invoice: PrintableInvoice, totals: InvoiceTotals) {
  const invoiceNumber = invoice.invoiceNumber || invoice.id;
  drawBrand(doc, 12, 11, true);
  drawBadge(doc, 162, 10, 'TAX INVOICE');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  setColor(doc, '#07112f');
  doc.text(`Invoice No. : ${invoiceNumber}`, 162, 25);

  const taxX = 12;
  const taxY = 38;
  const taxW = 88;
  stroke(doc, '#cfd9ea');
  doc.roundedRect(taxX, taxY, taxW, 44, 1, 1);
  panelHeader(doc, 'Tax Breakup', taxX, taxY, taxW);
  const taxRows = [
    ['CGST', `${totals.cgstRate}%`, formatCurrency(totals.taxableAmount), formatCurrency(totals.cgstAmount)],
    ['SGST', `${totals.sgstRate}%`, formatCurrency(totals.taxableAmount), formatCurrency(totals.sgstAmount)],
    ['IGST', '0%', '-', '-'],
    ['Total Tax Amount', '', '', formatCurrency(totals.cgstAmount + totals.sgstAmount)],
  ];
  doc.setFontSize(7);
  taxRows.forEach((row, index) => {
    const y = taxY + 17 + index * 7;
    doc.setFont('helvetica', index === 3 ? 'bold' : 'normal');
    doc.text(row[0], taxX + 4, y);
    doc.text(row[1], taxX + 34, y, { align: 'center' });
    doc.text(row[2], taxX + 64, y, { align: 'right' });
    doc.text(row[3], taxX + 84, y, { align: 'right' });
  });

  const bankX = 106;
  const bankY = 38;
  stroke(doc, '#cfd9ea');
  doc.roundedRect(bankX, bankY, 66, 44, 1, 1);
  panelHeader(doc, 'Bank Details', bankX, bankY, 66);
  doc.setFontSize(7);
  let bankTextY = bankY + 17;
  bankTextY = labelValue(doc, 'Bank Name', 'HDFC Bank Ltd.', bankX + 4, bankTextY, 24, 34);
  bankTextY = labelValue(doc, 'Account Name', COMPANY_NAME, bankX + 4, bankTextY, 24, 34);
  bankTextY = labelValue(doc, 'Account No.', '50200012345678', bankX + 4, bankTextY, 24, 34);
  bankTextY = labelValue(doc, 'IFSC Code', 'HDFC0001234', bankX + 4, bankTextY, 24, 34);
  labelValue(doc, 'Branch', 'Sector 62, Noida', bankX + 4, bankTextY, 24, 34);

  stroke(doc, '#d5deeb');
  doc.roundedRect(178, 38, 20, 44, 1, 1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Scan & Pay', 188, 46, { align: 'center' });
  stroke(doc, '#111111');
  for (let i = 0; i < 7; i += 1) {
    for (let j = 0; j < 7; j += 1) {
      if ((i + j) % 2 === 0 || i === 0 || j === 0 || i === 6 || j === 6) {
        fill(doc, '#111111');
        doc.rect(182 + i * 2, 51 + j * 2, 1.4, 1.4, 'F');
      }
    }
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text(['Scan this QR code', 'to make payment'], 188, 72, { align: 'center' });

  stroke(doc, '#cfd9ea');
  doc.roundedRect(12, 92, 90, 56, 1, 1);
  panelHeader(doc, 'Terms & Conditions', 12, 92, 90);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text([
    '1. All payments are non-refundable.',
    '2. Subscription is valid for the billing period mentioned on Page 1.',
    '3. Access to the platform will be active upon receipt of payment.',
    '4. Prices are exclusive of applicable taxes.',
    '5. Contact us within 7 days for invoice discrepancies.',
  ], 16, 108);

  doc.roundedRect(108, 92, 90, 56, 1, 1);
  panelHeader(doc, 'Notes', 108, 92, 90);
  doc.text([
    '- This is a computer generated invoice.',
    '- Please make payment by the due date to avoid interruption of services.',
    `- For billing queries, contact ${COMPANY_EMAIL}.`,
    '- Thank you for your business.',
  ], 112, 108);

  fill(doc, '#f4f7fb');
  doc.roundedRect(12, 268, 186, 8, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, '#0b1b3d');
  doc.text(COMPANY_WEBSITE, 24, 273);
  doc.text(COMPANY_EMAIL, 84, 273);
  doc.text(COMPANY_PHONE, 142, 273);
  doc.setFont('helvetica', 'bold');
  doc.text('Page 2 of 2', 190, 286, { align: 'right' });
}

export function openInvoicePdfWindow(invoice: PrintableInvoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const totals = calculateTotals(invoice);

  drawPageOne(doc, invoice, totals);
  doc.addPage();
  drawPageTwo(doc, invoice, totals);

  doc.save(`${invoice.invoiceNumber || invoice.id}.pdf`);
}
