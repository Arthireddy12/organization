// app/api/invoice/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const invoice =
      await prisma.invoice.findUnique({
        where: {
          id,
        },
      });

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: invoice,
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


export async function PUT(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

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
    } = body;

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

    const updatedInvoice =
      await prisma.invoice.update({
        where: {
          id,
        },
        data: {
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
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice updated successfully",
        data: updatedInvoice,
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

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const invoice =
      await prisma.invoice.findUnique({
        where: {
          id,
        },
      });

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice not found",
        },
        { status: 404 }
      );
    }

    await prisma.invoice.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice deleted successfully",
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
