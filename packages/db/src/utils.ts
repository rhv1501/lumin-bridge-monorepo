import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Order, CustomOrder, CustomOrderProposal, User } from "@luminbridge/types";

export const generateInvoice = (order: Order, currentUser?: User) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [24, 24, 27];
  const secondaryColor: [number, number, number] = [113, 113, 122];
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('LuminaBridge', 14, 25);
  doc.setFontSize(12);
  doc.text('INVOICE / PURCHASE ORDER', 130, 25);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details', 130, 50);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`Invoice No: #INV-${order.id}`, 130, 57);
  doc.text(`Order ID: #ORD-${order.id}`, 130, 64);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 130, 71);
  doc.text(`Status: ${order.status.toUpperCase()}`, 130, 78);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(order.buyer_company || currentUser?.company_name || 'Valued Customer', 14, 57);
  doc.text(order.buyer_email || currentUser?.email || 'N/A', 14, 64);

  autoTable(doc, {
    startY: 90,
    head: [['Item Description', 'Quantity', 'Unit Price', 'Total']],
    body: [
      [
        order.product_name || `Product #${order.product_id}`,
        order.quantity.toString(),
        '-',
        '-'
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
  });

  doc.save(`LuminaBridge_Invoice_ORD-${order.id}.pdf`);
};

export const exportOrdersToExcel = (orders: Order[], filename: string = 'LuminaBridge_Orders') => {
  const worksheetData = orders.map(o => ({
    'Order ID': o.id,
    'Date': new Date(o.created_at).toLocaleDateString(),
    'Product Name': o.product_name,
    'Quantity': o.quantity,
    'Status': o.status,
    'Buyer Email': o.buyer_email || 'N/A',
    'Buyer Company': o.buyer_company || 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const generateCustomOrderInvoice = (customOrder: CustomOrder, proposal: CustomOrderProposal, currentUser?: User) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [24, 24, 27];
  const secondaryColor: [number, number, number] = [113, 113, 122];
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('LuminaBridge', 14, 25);
  doc.setFontSize(12);
  doc.text('CUSTOM PURCHASE ORDER', 125, 25);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details', 130, 50);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`PO No: #PO-${customOrder.id}-${proposal.id}`, 130, 57);
  doc.text(`Date: ${new Date(proposal.created_at).toLocaleDateString()}`, 130, 64);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(customOrder.buyer_company || currentUser?.company_name || 'Valued Customer', 14, 57);

  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Specs / Notes', 'Price (CNY)']],
    body: [[customOrder.requirements, proposal.notes || '-', `¥${proposal.price_cny}`]],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
  });

  doc.save(`LuminaBridge_PO_CUST-${customOrder.id}.pdf`);
};

export function userChannelName(userId: number) {
  return `private-user-${userId}`;
}
