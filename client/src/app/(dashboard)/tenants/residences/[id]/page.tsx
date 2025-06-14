"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useGetAuthUserQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetPropertyQuery,
} from "@/state/api";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownToLineIcon,
  Check,
  CreditCard,
  Download,
  FileText,
  MapPin,
  User,
} from "lucide-react";
import { Lease, Payment, Property } from "@/types/prismaTypes";

// -----------------------------------------------------------------------------
// Helper to format dates consistently (e.g. "Jun 4, 2025")
// -----------------------------------------------------------------------------
function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// -----------------------------------------------------------------------------
// PAYMENT METHOD COMPONENT
// -----------------------------------------------------------------------------
const PaymentMethod: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<"wallet" | "bank">("wallet");
  const [selectedWallet, setSelectedWallet] = useState<"BTC" | "ETH" | "USDC">("BTC");

  // Hard-coded wallet addresses (replace with real ones or retrieve from your API/ENV)
  const WALLET_ADDRESSES: Record<"BTC" | "ETH" | "USDC", string> = {
    BTC: "bc1qp3qzl5uwrp8tcug5afdu6g7qwm72ejflft5f3r",
    ETH: "0x041E2712858d3c40f6013Ec4BBB3F10Dbf7d0CDD",
    USDC: "TApXSnFAcp91EYQJzQ2YWnrEEDfqcgum5h",
  };

  // Handler when user selects Bank Transfer
  const handleBankClick = () => {
    // Replace with your live-chat integration instead of alert if desired
    toast("Please reach out to our live chat for bank transfer details.");
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mt-10 md:mt-0 flex-1">
      <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
      <p className="mb-4">Choose how you want to pay for your plan.</p>

      {/* Radio toggle between Wallet and Bank Transfer */}
      <div className="flex gap-6 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="paymentMethod"
            value="wallet"
            checked={selectedMethod === "wallet"}
            onChange={() => setSelectedMethod("wallet")}
            className="form-radio h-5 w-5 text-primary-700"
          />
          <span className="text-lg font-medium">Wallet</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="paymentMethod"
            value="bank"
            checked={selectedMethod === "bank"}
            onChange={() => setSelectedMethod("bank")}
            className="form-radio h-5 w-5 text-primary-700"
          />
          <span className="text-lg font-medium">Bank Transfer</span>
        </label>
      </div>

      {/* If Wallet is selected, show currency tabs */}
      {selectedMethod === "wallet" && (
        <div className="border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold">Select Cryptocurrency</h3>
          <div className="flex gap-4">
            {(["BTC", "ETH", "USDC"] as const).map((token) => (
              <button
                key={token}
                onClick={() => setSelectedWallet(token)}
                className={`px-4 py-2 rounded-full font-medium border ${
                  selectedWallet === token
                    ? "bg-primary-700 text-white border-primary-700"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {token}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="text-sm text-gray-500 mb-1">Send to this address:</h4>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-100 px-3 py-2 rounded-md text-sm break-all">
                {WALLET_ADDRESSES[selectedWallet]}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(WALLET_ADDRESSES[selectedWallet]);
                  toast(`${selectedWallet} address copied to clipboard`);
                }}
                className="text-primary-700 hover:underline text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If Bank Transfer is selected, show a prompt */}
      {selectedMethod === "bank" && (
        <div className="border rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            To pay via bank transfer, please get our bank details from live chat.
          </p>
          <button
            onClick={handleBankClick}
            className="bg-primary-700 text-white py-2 px-4 rounded-md hover:bg-primary-800 transition"
          >
            Contact Live Chat
          </button>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// RESIDENCE CARD COMPONENT
// -----------------------------------------------------------------------------
interface ResidenceCardProps {
  property: Property;
  currentLease: Lease;
}

const ResidenceCard: React.FC<ResidenceCardProps> = ({ property, currentLease }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 flex-1 flex flex-col justify-between">
      {/* Header Section */}
      <div className="flex gap-5">
        <div className="w-64 h-32 bg-slate-300 rounded-xl" />
        <div className="flex flex-col justify-between">
          <div>
            <div className="bg-green-500 w-fit text-white px-4 py-1 rounded-full text-sm font-semibold">
              Active Lease
            </div>
            <h2 className="text-2xl font-bold my-2">{property.name}</h2>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-1" />
              <span>
                {property.location.city}, {property.location.country}
              </span>
            </div>
          </div>
          <div className="text-xl font-bold">
            ${currentLease.rent}{" "}
            <span className="text-gray-500 text-sm font-normal">/ annual</span>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div>
        <hr className="my-4 border-gray-200" />
        <div className="flex justify-between items-center">
          <div className="flex flex-col text-gray-700">
            <span className="text-gray-500 text-sm">Start Date:</span>
            <span className="font-semibold">{formatDate(currentLease.startDate)}</span>
          </div>
          <div className="border-l border-gray-300 h-8" />
          <div className="flex flex-col text-gray-700">
            <span className="text-gray-500 text-sm">End Date:</span>
            <span className="font-semibold">{formatDate(currentLease.endDate)}</span>
          </div>
          <div className="border-l border-gray-300 h-8" />
          <div className="flex flex-col text-gray-700">
            <span className="text-gray-500 text-sm">Next Payment:</span>
            <span className="font-semibold">{formatDate(currentLease.endDate)}</span>
          </div>
        </div>
        <hr className="my-4 border-gray-200" />
      </div>

      {/* Actions Section */}
      <div className="flex justify-end gap-2 w-full">
        <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-white transition">
          <User className="w-5 h-5 mr-2" />
          Manager
        </button>
        <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-white transition">
          <Download className="w-5 h-5 mr-2" />
          Invest
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// BILLING HISTORY COMPONENT
// -----------------------------------------------------------------------------
interface BillingHistoryProps {
  payments: Payment[];
}

const BillingHistory: React.FC<BillingHistoryProps> = ({ payments }) => {
  const hasPayments = Array.isArray(payments) && payments.length > 0;

  return (
    <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Billing / Transaction History</h2>
          <p className="text-sm text-gray-500">
            Download or review your past payments.
          </p>
        </div>
        {hasPayments && (
          <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-white transition">
            <Download className="w-5 h-5 mr-2" />
            <span>Download All</span>
          </button>
        )}
      </div>
      <hr className="mb-4 border-gray-200" />

      {hasPayments ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="h-16">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      #{payment.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                        payment.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                      }`}
                    >
                      {payment.paymentStatus === "Paid" ? (
                        <Check className="w-4 h-4 inline-block mr-1" />
                      ) : null}
                      {payment.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>${payment.amountPaid.toFixed(2)}</TableCell>
                  <TableCell>
                    <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center font-semibold hover:bg-primary-700 hover:text-white transition">
                      <ArrowDownToLineIcon className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No transactions found.
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN RESIDENCE PAGE COMPONENT
// -----------------------------------------------------------------------------
const Residence: React.FC = () => {
  const { id } = useParams(); 
  const propertyId = Number(id);

  // 1. Authenticated user
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();

  // 2. Property details
  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetPropertyQuery(propertyId, {
    skip: !propertyId,
  });

  // 3. Leases *for this property* only
  const {
    data: leases = [],
    isLoading: leasesLoading,
    error: leasesError,
  } = useGetPropertyLeasesQuery(propertyId, {
    skip: !propertyId,
  });

  // 4. Pick *this user’s* lease from that list
  const currentLease = leases.find(
    (lease) => lease.tenant.cognitoId === authUser?.cognitoInfo.userId
  );

  // 5. Fetch payments for that lease
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useGetPaymentsQuery(currentLease?.id ?? 0, {
    skip: !currentLease?.id,
  });

  // Show a spinner until all queries finish
  if (
    authLoading ||
    propertyLoading ||
    leasesLoading ||
    paymentsLoading
  ) {
    return <Loading />;
  }

  // Handle missing property or errors
  if (!property || propertyError) {
    return <div className="p-6 text-center text-red-500">
      Error loading property.
    </div>;
  }

  if (!currentLease) {
    return <div className="p-6 text-center text-gray-500">
      You have no active lease for this property.
    </div>;
  }

  if (leasesError || paymentsError) {
    toast.error("Error loading data. Please try again later.");
    return <div className="p-6 text-center text-red-500">
      Error loading data.
    </div>;
  }

  return (
    <>

      <div className="dashboard-container px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="md:flex gap-10">
            <ResidenceCard property={property} currentLease={currentLease} />
            <PaymentMethod />
          </div>
          <BillingHistory payments={payments || []} />
        </div>
      </div>
    </>
  );
};

export default Residence;
