// File: server/src/controllers/paymentControllers.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

/**
 * POST /payments
 * Creates a new payment record tied to a given lease.
 * Expects JSON body with:
 *   • leaseId: number
 *   • amountDue: number
 *   • amountPaid: number
 *   • dueDate: string (ISO date)
 *   • paymentDate: string (ISO date)
 *
 * Only tenants may call this endpoint.
 */
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaseId, amountDue, amountPaid, dueDate, paymentDate } = req.body;

    const lease = await prisma.lease.findUnique({ where: { id: Number(leaseId) } });
    if (!lease) {
      res.status(400).json({ message: "Invalid leaseId." });
      return;
    }

    // Determine paymentStatus based on amountPaid vs amountDue
    let paymentStatus: "Paid" | "PartiallyPaid" | "Pending" | "Overdue" = "Pending";
    if (amountPaid >= amountDue) {
      paymentStatus = "Paid";
    } else if (amountPaid > 0 && amountPaid < amountDue) {
      paymentStatus = "PartiallyPaid";
    }

    const newPayment = await prisma.payment.create({
      data: {
        leaseId: lease.id,
        amountDue: parseFloat(amountDue),
        amountPaid: parseFloat(amountPaid),
        dueDate: new Date(dueDate),
        paymentDate: new Date(paymentDate),
        paymentStatus,
      },
    });

    res.status(201).json(newPayment);
  } catch (error: any) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal server error creating payment." });
  }
};

/**
 * GET /payments/tenant/:tenantCognitoId
 * Returns all payments (with lease info) for a given tenantCognitoId.
 * Both manager & tenant can access this.
 */
export const getPaymentsByTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tenantCognitoId } = req.params;
    // Find all payments where the lease’s tenantCognitoId matches
    const payments = await prisma.payment.findMany({
      where: {
        lease: { tenantCognitoId },
      },
      include: {
        lease: {
          include: {
            property: true,
          },
        },
      },
    });
    res.status(200).json(payments);
  } catch (error: any) {
    console.error("Error retrieving tenant payments:", error);
    res
      .status(500)
      .json({ message: "Internal server error retrieving tenant payments." });
  }
};

export const downloadReceipt = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paymentId = Number(req.params.id);
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { receiptPath: true },
  });

  if (!payment?.receiptPath || !fs.existsSync(payment.receiptPath)) {
    res.status(404).json({ error: "Receipt not found" });
    return;  
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt_${paymentId}.pdf`
  );

  fs.createReadStream(payment.receiptPath).pipe(res);
};