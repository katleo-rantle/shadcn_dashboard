// app/projects/[projectId]/invoice/page.tsx
'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Receipt } from 'lucide-react';

import PDFButton from '@/components/PDFButton';
import DocumentPDF, { LineItem } from '@/components/QuotationPDF';
import { projects, clients } from '@/lib/data';
import { useProject } from '@/context/ProjectContext';
import type { Client, Project, Task, Job } from '@/lib/types';

const InvoicePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();

  const { tasksForSelectedJob: localTasks = [], jobsForSelectedProject: localJobs = [] } = useProject();

  const invoiceRef = searchParams.get('invoiceRef');
  const quotationRef = searchParams.get('quotationRef');
  const taskIdsParam = searchParams.get('tasks');

  if (!invoiceRef || !quotationRef || !taskIdsParam) {
    return (
      <div className="p-20 text-center text-red-600 text-3xl font-bold">
        Invalid invoice link — please create from project
      </div>
    );
  }

  const taskIds = taskIdsParam.split(',').map(Number);
  const invoicedTasks: Task[] = localTasks.filter(t => taskIds.includes(t.TaskID));

  const project = projects.find(p => p.ProjectID === Number(projectId));
  const client = project?.ClientID
    ? clients.find(c => c.ClientID === project.ClientID)
    : null;

  if (!project || !client || invoicedTasks.length === 0) {
    return (
      <div className="p-20 text-center text-red-600 text-3xl font-bold">
        Project, client, or tasks not found
      </div>
    );
  }

  const subtotal = invoicedTasks.reduce((sum, t) => sum + (t.TaskBudget || 0), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // GROUP BY JOB NAME — professional standard
  const groupedItems: Record<string, LineItem[]> = {};

  invoicedTasks.forEach(task => {
    const job = localJobs.find((j: Job) => j.JobID === task.JobID);
    const jobName = job?.JobName || 'Uncategorized';

    if (!groupedItems[jobName]) groupedItems[jobName] = [];
    groupedItems[jobName].push({
      id: task.TaskID,
      description: task.TaskName,
      quantity: 1,
      price: task.TaskBudget || 0,
    });
  });

  // Sort alphabetically
  const sortedGroupedItems = Object.fromEntries(
    Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b))
  );

  const pdfData = {
    // Note: Used lowercase 'invoice' here to match your DocumentData interface
    type: 'invoice' as const, 
    documentNumber: invoiceRef,
    documentDate: new Date().toISOString().split('T')[0],
    referenceQuotation: quotationRef,
    groupedItems: sortedGroupedItems,
    notes: 'Payment due within 7 days. Thank you for your business.',
    client,
    project,
    subtotal,
    vat,
    total,
    amountInvoiced: total,
    remainingBalance: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Project
          </button>

          {/* --- FIX 1: Updated PDFButton Props --- */}
          <PDFButton
            documentComponent={DocumentPDF} // Pass the component reference
            documentProps={{ data: pdfData }} // Pass the props object
            fileName={`${invoiceRef}.pdf`}
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </PDFButton>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-12 text-center">
            <Receipt className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-6xl font-bold">{invoiceRef}</h1>
            <p className="text-xl mt-3 opacity-90">
              Based on Quotation: {quotationRef}
            </p>
          </div>

          <div className="p-12">
            {/* Client Info */}
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Bill To
                </h3>
                <p className="text-2xl font-bold text-gray-900">{client.ClientName}</p>
                <p className="text-gray-600 mt-2">{client.Address}</p>
                <p className="text-gray-600">{client.Email}</p>
                <p className="text-gray-600">{client.Phone}</p>
              </div>

              <div className="text-right">
                <p className="text-5xl font-bold text-amber-600">
                  R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xl text-gray-600 mt-4">Total Amount Due</p>
              </div>
            </div>

            {/* Line Items — Grouped by Job */}
            <div className="space-y-10">
              {Object.entries(sortedGroupedItems).map(([jobName, items]) => (
                <div
                  key={jobName}
                  className="border border-gray-200 rounded-2xl p-8 bg-gradient-to-r from-gray-50 to-white shadow-sm"
                >
                  <h4 className="text-2xl font-bold text-gray-800 mb-6">
                    {jobName}
                    <span className="text-sm font-normal text-gray-500 ml-3">
                      ({items.length} items)
                    </span>
                  </h4>

                  <div className="space-y-4">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-4 border-b border-gray-200 last:border-0"
                      >
                        <span className="text-lg font-medium text-gray-800">
                          {item.description}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          R {item.price.toLocaleString('en-ZA')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-12 bg-gray-900 text-white rounded-2xl p-10">
              <div className="flex justify-between text-xl mb-4">
                <span>Subtotal</span>
                <span>R {subtotal.toLocaleString('en-ZA')}</span>
              </div>
              <div className="flex justify-between text-xl mb-6">
                <span>VAT (15%)</span>
                <span>R {vat.toLocaleString('en-ZA')}</span>
              </div>
              <div className="flex justify-between text-4xl font-bold pt-6 border-t-4 border-amber-500">
                <span>Total Due</span>
                <span>R {total.toLocaleString('en-ZA')}</span>
              </div>
            </div>

            {/* Final Download */}
            <div className="text-center mt-12">
              {/* --- FIX 2: Updated PDFButton Props --- */}
              <PDFButton
                documentComponent={DocumentPDF}
                documentProps={{ data: pdfData }}
                fileName={`${invoiceRef}.pdf`}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-xl transition-all"
              >
                <Download className="h-7 w-7 mr-3 inline" />
                Download Official Invoice PDF
              </PDFButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePage;