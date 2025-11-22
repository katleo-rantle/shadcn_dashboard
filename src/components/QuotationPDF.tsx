// src/components/QuotationPDF.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

// Styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  header: { fontSize: 28, marginBottom: 20, textAlign: 'center', color: '#1e40af' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  table: { marginTop: 20, marginBottom: 20 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', paddingVertical: 8 },
  tableHeader: { fontWeight: 'bold', borderBottom: '2px solid #1e40af' },
  tableCell: { flex: 1 },
  total: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 40, left: 40, fontSize: 10 },
});

// Only the fields we actually use in the PDF
interface QuotationItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface QuotationData {
  quotationNumber: string;
  date: Date;
  client: any;
  project: any;
  items: QuotationItem[];
  subtotal: number;
  vat: number;
  total: number;
}

const QuotationDocument: React.FC<QuotationData> = ({
  quotationNumber,
  date,
  client,
  project,
  items,
  subtotal,
  vat,
  total,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>QUOTATION</Text>

      <View style={styles.row}>
        <Text>Quotation #: {quotationNumber}</Text>
        <Text>Date: {date.toLocaleDateString('en-ZA')}</Text>
      </View>

      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Bill To:</Text>
        <Text>{client?.ClientName || 'Client Name'}</Text>
        <Text>{client?.ContactPerson || ''}</Text>
        <Text>{client?.Phone || ''}</Text>
        <Text>{client?.Email || ''}</Text>
        {client?.Address && <Text>{client.Address}</Text>}
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>
          Project: {project?.ProjectName || 'Unnamed Project'}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>Qty</Text>
          <Text style={styles.tableCell}>Unit</Text>
          <Text style={styles.tableCell}>Rate</Text>
          <Text style={styles.tableCell}>Amount</Text>
        </View>

        {items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.description}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <Text style={styles.tableCell}>{item.unit}</Text>
            <Text style={styles.tableCell}>R {item.rate.toFixed(2)}</Text>
            <Text style={styles.tableCell}>R {item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.total}>Subtotal: R {subtotal.toFixed(2)}</Text>
        <Text style={styles.total}>VAT (15%): R {vat.toFixed(2)}</Text>
        <Text style={[styles.total, { fontSize: 18, color: '#1e40af' }]}>
          TOTAL: R {total.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.footer}>Thank you for your business!</Text>
    </Page>
  </Document>
);

const QuotationPDF = {
  generate: async (data: QuotationData): Promise<Blob> => {
    const blob = await pdf(<QuotationDocument {...data} />).toBlob();
    return blob;
  },
};

export default QuotationPDF;