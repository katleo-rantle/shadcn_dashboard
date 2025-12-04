// components/DocumentPDF.tsx
'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';

import type { Client, Project } from '@/lib/types';

export interface LineItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

export interface DocumentData {
  type: 'quotation' | 'invoice';
  documentNumber: string;
  documentDate: string;
  validUntil?: string;
  referenceQuotation?: string;
  groupedItems: Record<string, LineItem[]>;
  notes: string;
  client: Client;
  project: Project;
  subtotal: number;
  vat: number;
  total: number;
  amountInvoiced?: number;
  remainingBalance?: number;
}

Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@react-pdf/renderer@3.1.14/fonts/Helvetica-Bold.ttf',
});

// --- STYLES (No structural changes to column widths) ---
const styles = StyleSheet.create({
  page: {
    paddingTop: 80,
    paddingBottom: 100,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1d4ed8', // blue-700
    paddingBottom: 12,
  },
  companyInfo: {
    width: '60%',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8', // blue-700
    marginBottom: 6,
  },
  companyDetails: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#4b5563',
  },
  bankInfo: {
    fontSize: 9,
    lineHeight: 1.5,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#eff6ff', // blue-50
    borderRadius: 2,
  },
  docInfo: {
    textAlign: 'right',
  },
  docTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8', // blue-700
    marginBottom: 8,
  },
  docMeta: {
    fontSize: 9,
    lineHeight: 1.7,
  },
  metaLabel: { color: '#6b7280', width: 90, textAlign: 'left' },
  metaValue: { fontFamily: 'Helvetica-Bold' },

  billToProject: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb', // gray-50
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  section: { width: '48%' },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  clientName: { fontSize: 13, fontFamily: 'Helvetica-Bold' },

  categoryRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9', // slate-100
    paddingVertical: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#1d4ed8', // blue-700
    marginTop: 10,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    paddingLeft: 12,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1d4ed8', // blue-700
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 8,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // gray-200
    paddingVertical: 8,
  },
  colNo: { width: '8%', paddingLeft: 8 },
  colDesc: { width: '52%', paddingLeft: 8 },
  colQty: { width: '12%', textAlign: 'right' },
  colPrice: { width: '14%', textAlign: 'right' },
  colAmount: { width: '14%', textAlign: 'right', paddingRight: 8, fontFamily: 'Helvetica-Bold' },

  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  totalsBox: {
    marginLeft: 'auto',
    width: '45%',
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderRadius: 6,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1d4ed8',
    color: 'white',
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  notes: {
    marginTop: 30,
    fontSize: 9,
    lineHeight: 1.6,
    color: '#4b5563',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
  },
});

const Header = ({ data }: { data: DocumentData }) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString?.trim()) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'dd MMMM yyyy');
  };

  return (
    <View style={styles.header} fixed>
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>BuildPro Construction (Pty) Ltd</Text>
        <Text style={styles.companyDetails}>
          123 Construction Avenue, Sandton{'\n'}
          Johannesburg, 2196, South Africa{'\n'}
          VAT: 4123456789 | Reg: 2020/123456/07{'\n'}
          Tel: 011 234 5678 | quotes@buildpro.co.za
        </Text>
        <View style={styles.bankInfo}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Payment Details</Text>
          <Text>Bank: Standard Bank | Acc: BuildPro Construction</Text>
          <Text>Acc No: 123 456 789 | Branch: 051001</Text>
          <Text>Reference: {data.documentNumber}</Text>
        </View>
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docTitle}>{data.type === 'quotation' ? 'QUOTATION' : 'INVOICE'}</Text>
        <View style={styles.docMeta}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={styles.metaLabel}>{data.type === 'quotation' ? 'Quote #' : 'Invoice #'}:</Text>
            <Text style={styles.metaValue}> {data.documentNumber}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={styles.metaLabel}>Date:</Text>
            <Text style={styles.metaValue}> {formatDate(data.documentDate)}</Text>
          </View>
          {data.validUntil && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={styles.metaLabel}>Valid Until:</Text>
              <Text style={styles.metaValue}> {formatDate(data.validUntil)}</Text>
            </View>
          )}
          {data.referenceQuotation && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={styles.metaLabel}>Reference:</Text>
              <Text style={styles.metaValue}> {data.referenceQuotation}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const Footer = ({ data, pageNumber, totalPages }: { data: DocumentData; pageNumber: number; totalPages: number }) => {
  const formatCurrency = (n: number) =>
    `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  return (
    <View style={styles.footer} fixed>
      {pageNumber === totalPages && (
        <View style={styles.notes}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 6, fontSize: 11 }}>Terms & Conditions</Text>
          <Text>{data.notes}</Text>
        </View>
      )}

      {pageNumber === totalPages && (
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT (15%)</Text>
            <Text>{formatCurrency(data.vat)}</Text>
          </View>
          {data.type === 'invoice' && data.amountInvoiced !== undefined && (
            <>
              <View style={styles.totalRow}>
                <Text>Total from Quotation</Text>
                <Text>{formatCurrency(data.total)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Amount Invoiced</Text>
                <Text>{formatCurrency(data.amountInvoiced)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Remaining Balance</Text>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>{formatCurrency(data.remainingBalance || 0)}</Text>
              </View>
            </>
          )}
          <View style={styles.grandTotalRow}>
            <Text>{data.type === 'quotation' ? 'TOTAL DUE' : 'AMOUNT DUE NOW'}</Text>
            <Text>{formatCurrency(data.type === 'invoice' ? (data.amountInvoiced || data.total) : data.total)}</Text>
          </View>
        </View>
      )}
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
    </View>
  );
};

const DocumentPDF: React.FC<{ data: DocumentData }> = ({ data }) => {
  const formatCurrency = (amount: number) =>
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  const allDocumentEntries = Object.entries(data.groupedItems).flatMap(([category, items]) => {
    const header = { type: 'category' as const, category };
    
    const categoryItems = items.map((item, idx) => ({ 
        ...item, 
        type: 'item' as const, 
        itemNumber: idx + 1 
    }));
    
    return [header, ...categoryItems];
  });
  
  const totalPages = 1;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Header data={data} />

        {/* Bill To & Project/Pay To Section */}
        <View>
          <View style={styles.billToProject}>
            {/* Bill To Section (Client) - Always rendered */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <Text style={styles.clientName}>{data.client.ClientName}</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>
                {data.client.Address || 'Address not provided'}{'\n'}
                {data.client.Email}
              </Text>
            </View>
            
            {/* Conditional Section (Project vs. Pay To) */}
            {data.type === 'quotation' ? (
              // --- QUOTATION: Show Project Details ---
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Project</Text>
                <Text style={styles.clientName}>{data.project.ProjectName}</Text>
                <Text style={{ fontSize: 10, color: '#4b5563' }}>
                  Project ID: {data.project.ProjectID}
                </Text>
              </View>
            ) : (
              // --- INVOICE: Show Pay To (Bank) Details ---
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PAY TO</Text>
                <Text style={styles.clientName}>Borcele Bank</Text>
                <Text style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.6 }}>
                  Account Name: **Adeline Palmerston**
                </Text>
                <Text style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.6 }}>
                  Account No.: **0123 4567 8901**
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Table Container */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>#</Text>
            <Text style={styles.colDesc}>DESCRIPTION</Text>
            <Text style={styles.colQty}>QTY</Text>
            <Text style={styles.colPrice}>RATE</Text>
            <Text style={styles.colAmount}>AMOUNT</Text>
          </View>

          {/* Item rendering loop */}
          {allDocumentEntries.map((entry, index) => {
            if (entry.type === 'category') {
              // Category Header Row
              return (
                <View key={`cat-${entry.category}-${index}`} style={styles.categoryRow} wrap={false}>
                  <Text style={styles.categoryText}>{entry.category}</Text>
                </View>
              );
            }

            // Item Row
            const item = entry;
            // Check if quantity is 1
            const isSingleItem = item.quantity === 1;

            return (
              <View key={item.id} style={styles.tableRow} wrap={false}>
                <Text style={styles.colNo}>{item.itemNumber}</Text>
                <Text style={styles.colDesc}>{item.description}</Text>
                
                {/* Conditional Quantity Display */}
                <Text style={styles.colQty}>
                  {isSingleItem ? '' : item.quantity}
                </Text>

                {/* Conditional Rate Display */}
                <Text style={styles.colPrice}>
                  {isSingleItem ? '' : formatCurrency(item.price)}
                </Text>
                
                {/* Final Amount (always shown) */}
                <Text style={styles.colAmount}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            );
          })}
        </View>

        <Footer data={data} pageNumber={1} totalPages={totalPages} />
      </Page>
    </Document>
  );
};

export default DocumentPDF;