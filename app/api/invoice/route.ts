import { createInvoice, listInvoices } from "@/app/repositories/invoice";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      organizationName,
      mobileNumber,
      address,
      gstNumber,
      amount,
      discount,
      gst,
      sgst,
      invoiceNumber: requestedInvoiceNumber,
    } = body;

    // Validation
    if (
      !organizationName ||
      !mobileNumber ||
      !address ||
      !amount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields missing",
        },
        { status: 400 }
      );
    }

    // Generate Invoice Number
    const invoiceNumber =
      typeof requestedInvoiceNumber === "string" && requestedInvoiceNumber.trim()
        ? requestedInvoiceNumber.trim()
        : `INV-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    // Calculations
    const discountAmount =
      (amount * discount) / 100;

    const taxableAmount =
      amount - discountAmount;

    const gstAmount =
      (taxableAmount * gst) / 100;

    const sgstAmount =
      (taxableAmount * sgst) / 100;

    const finalAmount =
      taxableAmount + gstAmount + sgstAmount;

    // Create Invoice
    const invoice = await createInvoice({
        invoiceNumber,
        organizationName,
        mobileNumber,
        address,
        gstNumber,
        amount,
        discount,
        gst,
        sgst,
        taxableAmount,
        finalAmount,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const invoices = await listInvoices();

    return NextResponse.json(
      {
        success: true,
        count: invoices.length,
        data: invoices,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
