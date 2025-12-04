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
  Image,
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
    borderBottomColor: '#1e40af',
    paddingBottom: 12,
  },
  companyInfo: {
    width: '60%',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
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
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
  },
  docInfo: {
    textAlign: 'right',
  },
  docTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  docMeta: {
    fontSize: 9,
    lineHeight: 1.7,
  },
  metaLabel: { color: '#6b7280', width: 90 },
  metaValue: { fontFamily: 'Helvetica-Bold' },

  billToProject: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
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

  categoryHeader: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    marginVertical: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    textTransform: 'uppercase',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 10,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
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
    borderColor: '#1e40af',
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
    backgroundColor: '#1e40af',
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

  return (
    <Document>
      {Object.keys(data.groupedItems).length > 0 ? (
        Object.entries(data.groupedItems).map(([category, items], catIdx, arr) => (
          <Page key={category} size="A4" style={styles.page} wrap>
            <Header data={data} />

            {/* Show Bill To & Project only on first page */}
            {catIdx === 0 && (
              <View>
                <View style={styles.billToProject}>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill To</Text>
                    <Text style={styles.clientName}>{data.client.ClientName}</Text>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>
                      {data.client.Address || 'Address not provided'}{'\n'}
                      {data.client.Email}
                    </Text>
                  </View>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Project</Text>
                    <Text style={styles.clientName}>{data.project.ProjectName}</Text>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>
                      Project ID: {data.project.ProjectID}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Category Items */}
            <View wrap={false}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={styles.colNo}>#</Text>
                <Text style={styles.colDesc}>DESCRIPTION</Text>
                <Text style={styles.colQty}>QTY</Text>
                <Text style={styles.colPrice}>RATE</Text>
                <Text style={styles.colAmount}>AMOUNT</Text>
              </View>
              {items.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.colNo}>{idx + 1}</Text>
                  <Text style={styles.colDesc}>{item.description}</Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
                  <Text style={styles.colAmount}>{formatCurrency(item.price)}</Text>
                </View>
              ))}
            </View>

            {/* Notes only on last page */}
            {catIdx === arr.length - 1 && (
              <View style={styles.notes}>
                <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>Terms & Conditions</Text>
                <Text>{data.notes}</Text>
              </View>
            )}

            <Footer data={data} pageNumber={catIdx + 1} totalPages={arr.length} />
          </Page>
        ))
      ) : (
        <Page style={styles.page}>
          <Header data={data} />
          <Text style={{ marginTop: 100, textAlign: 'center', color: '#9ca3af' }}>
            No items to display
          </Text>
          <Footer data={data} pageNumber={1} totalPages={1} />
        </Page>
      )}
    </Document>
  );
};

export default DocumentPDF;