// src/components/QuotationPDFDocument.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { format } from 'date-fns';

// ──────────────────────────────────────────────────────────────────────
// Shared Types - Import from your single source of truth
// ──────────────────────────────────────────────────────────────────────
import type { Client, Project } from '@/lib/types';

export interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

export interface QuotationData {
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  items: QuotationItem[];
  notes: string;
  client: Client;
  project: Project;
}

const VAT_RATE = 15;

// ──────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#4b5563',
  },
  quoteHeader: {
    textAlign: 'right',
  },
  quoteTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  quoteMeta: {
    fontSize: 10,
    lineHeight: 1.6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  metaLabel: {
    width: 80,
    color: '#6b7280',
  },
  metaValue: {
    width: 120,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  billToProject: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  section: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.5,
  },
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    color: 'white',
    fontWeight: 'bold',
    paddingVertical: 10,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
    alignItems: 'center',
  },
  colDesc: { width: '50%', paddingLeft: 8 },
  colQty: { width: '15%', textAlign: 'right', paddingRight: 8 },
  colPrice: { width: '15%', textAlign: 'right', paddingRight: 8 },
  colAmount: { width: '20%', textAlign: 'right', paddingRight: 8 },
  totals: {
    marginLeft: 'auto',
    width: '45%',
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 11,
  },
  totalLabel: { color: '#4b5563' },
  totalValue: { fontWeight: 'bold' },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingTop: 12,
    borderTopWidth: 3,
    borderTopColor: '#1e40af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#4b5563',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
});

// ──────────────────────────────────────────────────────────────────────
// Main Document Component
// ──────────────────────────────────────────────────────────────────────
const QuotationPDFDocument: React.FC<QuotationData> = ({
  quotationNumber,
  quotationDate,
  validUntil,
  items,
  notes,
  client,
  project,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const vat = subtotal * (VAT_RATE / 100);
  const total = subtotal + vat;

  const formatCurrency = (amount: number) =>
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd MMMM yyyy');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>BuildPro Construction</Text>
            <Text style={styles.companyDetails}>
              123 Construction Avenue{'\n'}
              Sandton, Johannesburg{'\n'}
              South Africa{'\n'}
              VAT: 4123456789{'\n'}
              Tel: 011 234 5678 | quotes@buildpro.co.za
            </Text>
          </View>
          <View style={styles.quoteHeader}>
            <Text style={styles.quoteTitle}>QUOTATION</Text>
            <View style={styles.quoteMeta}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Quote #:</Text>
                <Text style={styles.metaValue}>{quotationNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaValue}>{formatDate(quotationDate)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Valid Until:</Text>
                <Text style={styles.metaValue}>{formatDate(validUntil)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bill To & Project */}
        <View style={styles.billToProject}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.clientName}>{client.ClientName}</Text>
            <Text style={styles.clientDetail}>
              {client.Address || 'Address not provided'}
              {'\n'}
              Email: {client.Email || 'N/A'}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project</Text>
            <Text style={styles.clientName}>{project.ProjectName}</Text>
            <Text style={styles.clientDetail}>
              Project ID: {project.ProjectID}
            </Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>DESCRIPTION</Text>
            <Text style={styles.colQty}>QTY</Text>
            <Text style={styles.colPrice}>RATE</Text>
            <Text style={styles.colAmount}>AMOUNT</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.colAmount}>{formatCurrency(item.quantity * item.price)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT (15%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(vat)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text>TOTAL AMOUNT DUE</Text>
            <Text>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Terms & Conditions</Text>
          <Text style={styles.notesText}>{notes || 'No additional terms specified.'}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Thank you for your business! • BuildPro Construction (Pty) Ltd • Reg: 2020/123456/07
        </Text>
      </Page>
    </Document>
  );
};

export default QuotationPDFDocument;