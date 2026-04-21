import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { WATER_RATE, ELECTRICITY_RATE } from "@/lib/constants";

export const generateInvoicePDF = (invoice: any) => {
  const doc = new jsPDF();
  const elecUsage = invoice.electricityUsage || (invoice.electricityCost / ELECTRICITY_RATE);
  const waterUsage = invoice.waterUsage || (invoice.waterCost / WATER_RATE);
  const tenantName = invoice.lease?.tenant ? `${invoice.lease.tenant.firstName} ${invoice.lease.tenant.lastName}` : "Unknown";

  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNumber || invoice.id?.slice(-8)}`, 14, 35);
  doc.text(`Name: ${tenantName}`, 14, 67);
  doc.text(`Room: ${invoice.lease?.room?.number || "N/A"}`, 14, 72);

  autoTable(doc, {
    startY: 80,
    head: [["Description", "Details", "Amount"]],
    body: [
      ["Base Rent", "-", `THB ${invoice.baseRent.toLocaleString()}`],
      ["Electricity", `${elecUsage.toFixed(2)} kWh`, `THB ${invoice.electricityCost.toLocaleString()}`],
      ["Water", `${waterUsage.toFixed(2)} units`, `THB ${invoice.waterCost.toLocaleString()}`],
    ],
    headStyles: { fillColor: [37, 99, 235] }
  });

  doc.save(`Invoice-${invoice.lease?.room?.number}-${invoice.month}.pdf`);
};