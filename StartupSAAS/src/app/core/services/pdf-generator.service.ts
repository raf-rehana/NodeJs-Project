import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  constructor() {}

  async generateInvoicePdf(invoice: any): Promise<void> {
    const doc = new jsPDF();
    const ashColor: [number, number, number] = [235, 237, 240]; // Simple light ash color
    const textColor: [number, number, number] = [60, 64, 70]; // Normal dark grey text
    const lightLineColor: [number, number, number] = [210, 215, 220]; // Light ash divider line

    // Calculate dynamic amount
    const amount = (invoice.amount !== undefined && invoice.amount !== null)
      ? Number(invoice.amount)
      : (invoice.items ? invoice.items.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * (Number(item.qty) || 1)), 0) : 0);

    // =========================
    // HEADER & LOGO (Simple & Clean, No dark bars)
    // =========================
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    doc.setFontSize(22);
    doc.text('StartupSAAS', 15, 20);
    
    doc.setFontSize(9);
    doc.text('Next Gen Service Hub', 15, 26);

    doc.setFontSize(14);
    doc.text('INVOICE', 145, 20);
    
    doc.setFontSize(9);
    doc.text(`Invoice ID: #${invoice.id || 'N/A'}`, 145, 27);
    doc.text(`Order ID: #${invoice.orderId || 'N/A'}`, 145, 33);
    doc.text(`Date: ${invoice.date || new Date().toLocaleDateString()}`, 145, 39);

    // Simple light ash divider line under header
    doc.setDrawColor(lightLineColor[0], lightLineColor[1], lightLineColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    // =========================
    // COMPANY & CLIENT INFO (All Normal Font)
    // =========================
    // From Details (Left)
    doc.setFontSize(9);
    doc.text('From:', 15, 58);
    doc.text('StartupSAAS Solutions Ltd.', 15, 64);
    doc.text('42 Tech Plaza, Banani', 15, 70);
    doc.text('Dhaka, Bangladesh', 15, 76);
    doc.text('support@startupsaas.com', 15, 82);

    // Bill To Details (Right)
    doc.text('Bill To:', 120, 58);
    doc.text(invoice.clientName || 'Valued Client', 120, 64);
    doc.text(invoice.clientEmail || 'client@startupsaas.com', 120, 70);
    doc.text('Status: PAID', 120, 76);

    // =========================
    // TABLE (Clean and Simple Ash Color)
    // =========================
    const items = invoice.items || [
      {
        description: invoice.service || 'Service Plan',
        qty: 1,
        price: amount,
      },
    ];

    const tableData = items.map((item: any) => [
      item.description,
      item.qty,
      `BDT ${item.price.toLocaleString()}`,
      `BDT ${(item.qty * item.price).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Qty', 'Unit Price', 'Total Amount']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: ashColor,
        textColor: textColor,
        fontSize: 9,
        fontStyle: 'normal',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        textColor: textColor
      }
    });

    // =========================
    // SUMMARY SECTION (Simple and Clean)
    // =========================
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(9);
    doc.text('Subtotal:', 140, finalY);
    doc.text(`BDT ${amount.toLocaleString()}`, 180, finalY, { align: 'right' });

    doc.text('VAT (0%):', 140, finalY + 7);
    doc.text('BDT 0.00', 180, finalY + 7, { align: 'right' });

    // Simple divider line for totals
    doc.line(140, finalY + 11, 195, finalY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Total Amount:', 140, finalY + 18);
    doc.text(`BDT ${amount.toLocaleString()}`, 180, finalY + 18, { align: 'right' });

    // =========================
    // SIGNATURE & FOOTER (Removed seals, cursive fonts, terms, etc.)
    // =========================
    let sigY = finalY + 40;
    
    // Simple line for signature
    doc.line(15, sigY, 70, sigY);
    
    doc.setFontSize(9);
    doc.text('StartupSAAS Authorized', 15, sigY - 4);
    doc.text('Digitally Verified Payment', 15, sigY + 6);

    doc.setFontSize(10);
    doc.text('Thank you for choosing StartupSAAS!', 105, 270, { align: 'center' });

    doc.save(`StartupSAAS_Invoice_${invoice.id}.pdf`);
  }
}
