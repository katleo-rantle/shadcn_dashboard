// app/projects/[id]/quote/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';

import QuotationPDFDocument from '@/components/QuotationPDF';

import { Project, Client } from '@/lib/types';
import { tasks, projects, clients } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type Task = (typeof tasks)[number];

const VAT_RATE = 15;

const QuotationTemplatePage = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();

  const projectId = Number(id);
  const taskIdsString = searchParams.get('taskIds') || '';
  const selectedTaskIDs = taskIdsString
    .split(',')
    .map(Number)
    .filter(n => !isNaN(n));

  // Find real project & client
  const project = projects.find(p => p.ProjectID === projectId);
  const client = project ? clients.find(c => c.ClientID === project.ClientID) : null;

  if (!project || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Project or Client Not Found</h1>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    );
  }

  const initialItems = useMemo(() => {
    return tasks
      .filter(t => selectedTaskIDs.includes(t.TaskID))
      .map(t => ({
        id: t.TaskID,
        description: t.TaskName,
        quantity: 1,
        price: t.TaskBudget || 0,
      }));
  }, [selectedTaskIDs]);

  const [quotationNumber] = useState(
    `QUO-${format(new Date(), 'yyyy')}-${String(Math.floor(1000 + Math.random() * 9000))}`
  );
  const [quotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil] = useState(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );

  const [items, setItems] = useState(initialItems);
  const [notes, setNotes] = useState(
    'Payment terms: 50% deposit required to commence work.\nBalance due on completion.\nValid for 30 days.'
  );

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const vat = subtotal * (VAT_RATE / 100);
  const total = subtotal + vat;

  const updateItem = (
    id: number,
    field: 'description' | 'quantity' | 'price',
    value: string | number
  ) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'description' ? value : Number(value) || 0,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), description: 'New item', quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const pdfData = {
    quotationNumber,
    quotationDate,
    validUntil,
    items,
    notes,
    client,
    project,
  };

  if (selectedTaskIDs.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">No Tasks Selected</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-4">
            <Button onClick={addItem} variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>

            <PDFDownloadLink
              document={<QuotationPDFDocument {...pdfData} />}
              fileName={`${quotationNumber}.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? 'Preparing...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* A4 Preview */}
        <div
          className="overflow-hidden rounded-lg bg-white shadow-2xl"
          style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}
        >
          <div className="p-12 font-sans">
            {/* Header */}
            <div className="mb-12 flex justify-between border-b-4 border-blue-600 pb-8">
              <div>
                <h1 className="mb-4 text-3xl font-bold text-blue-900">
                  BuildPro Construction
                </h1>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>123 Construction Avenue, Sandton</p>
                  <p>Johannesburg, Gauteng, 2196</p>
                  <p>VAT Reg: 4123456789</p>
                  <p>Tel: 011 234 5678</p>
                  <p>quotes@buildpro.co.za</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="mb-8 text-5xl font-bold text-blue-600">QUOTATION</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-end gap-4">
                    <span className="font-medium">Quote #:</span>
                    <span className="font-bold">{quotationNumber}</span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <span className="font-medium">Date:</span>
                    <span>{format(new Date(quotationDate), 'dd MMMM yyyy')}</span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <span className="font-medium">Valid Until:</span>
                    <span>{format(new Date(validUntil), 'dd MMMM yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To & Project */}
            <div className="mb-12 grid grid-cols-2 gap-12">
              <div>
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-700">
                  Bill To
                </h3>
                <p className="text-xl font-bold">{client.ClientName}</p>
                <p className="text-sm text-gray-600">
                  {(client as any).Address || 'Address not provided'}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {(client as any).Email || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Contact: {client.ContactPerson || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-700">
                  Project
                </h3>
                <p className="text-xl font-bold">{project.ProjectName}</p>
                <Badge variant="secondary" className="mt-2">
                  ID: {project.ProjectID}
                </Badge>
              </div>
            </div>

            {/* Items Table */}
            <table className="mb-12 w-full table-auto border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="pb-4 text-left font-bold">Description</th>
                  <th className="pb-4 text-center font-bold">Qty</th>
                  <th className="pb-4 text-right font-bold">Rate</th>
                  <th className="pb-4 text-right font-bold">Amount</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-4">
                      <Textarea
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        className="min-h-10 resize-none border-0 p-0 text-sm focus:ring-0"
                      />
                    </td>
                    <td className="py-4 text-center">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                        className="w-20 text-center"
                      />
                    </td>
                    <td className="py-4 text-right">
                      <Input
                        type="number"
                        value={item.price.toFixed(2)}
                        onChange={e => updateItem(item.id, 'price', e.target.value)}
                        step="0.01"
                        className="w-28 text-right"
                      />
                    </td>
                    <td className="py-4 text-right font-medium">
                      R {(item.quantity * item.price).toFixed(2)}
                    </td>
                    <td className="py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-96 space-y-4 border-t-4 border-double border-gray-800 pt-6">
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span>R {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>VAT (15%)</span>
                  <span>R {vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-4 border-blue-600 pt-4 text-2xl font-bold">
                  <span>TOTAL</span>
                  <span className="text-blue-600">R {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-16 border-t-2 border-gray-300 pt-8">
              <h3 className="mb-4 text-lg font-bold">Terms & Conditions</h3>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="min-h-32 text-sm"
              />
            </div>

            <div className="mt-16 text-center text-sm text-gray-600">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplatePage;