'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Lock, AlertTriangle, FolderPlus } from 'lucide-react';
import { format } from 'date-fns';

// Import the Component itself (do not render it here)
import QuotationPDF from '@/components/QuotationPDF';
import PDFButton from "@/components/PDFButton";

import { Project, Client } from '@/lib/types';
import { tasks as rawTasks, projects, clients, jobs as rawJobs } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define Types
type Task = (typeof rawTasks)[number] & { QuotationRef?: string | null };
const tasks: Task[] = rawTasks as Task[];
const jobs = rawJobs; // use rawJobs to read JobName when grouping

const VAT_RATE = 15;

interface QuoteItem {
  id: number;
  taskId?: number;
  description: string;
  quantity: number;
  price: number;
  category?: string;
  displayNumber?: number; // Added optional for mapping later
}

const QuotationTemplatePage = () => {
  const router = useRouter();
  const { projectId: id } = useParams() as { projectId: string };
  const searchParams = useSearchParams();

  const projectId = Number(id);
  const taskIdsParam = searchParams.get('taskIds') || '';
  const requestedTaskIDs = taskIdsParam.split(',').map(Number).filter(n => !isNaN(n) && n > 0);

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

  const [quotationNumber] = useState(() =>
    `QUO-${format(new Date(), 'yyyy')}-${String(1000 + Math.floor(Math.random() * 9000))}`
  );
  const quotationDate = new Date().toISOString().split('T')[0];
  const validUntil = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  const { availableTasks, alreadyQuotedTasks } = useMemo(() => {
    const available: Task[] = [];
    const quoted: Task[] = [];

    requestedTaskIDs.forEach(taskId => {
      const task = tasks.find(t => t.TaskID === taskId);
      if (task) {
        task.QuotationRef ? quoted.push(task) : available.push(task);
      }
    });

    return { availableTasks: available, alreadyQuotedTasks: quoted };
  }, [requestedTaskIDs]);

  const [items, setItems] = useState<QuoteItem[]>(() =>
    availableTasks.map(t => {
      const job = jobs.find(j => j.JobID === t.JobID);
      return {
        id: t.TaskID,
        taskId: t.TaskID,
        description: t.TaskName,
        quantity: 1,
        price: t.TaskBudget || 0,
        category: job?.JobName || 'General Works',
      };
    })
  );

  const [notes, setNotes] = useState(
    'Payment terms: 50% deposit required to commence work.\nBalance due on completion.\nValid for 30 days.'
  );

  const [categories, setCategories] = useState<string[]>([
    'General Works',
    'Finishes',
    'Electrical',
    'Plumbing',
    // include job names so user can select/group by job
    ...jobs.map(j => j.JobName),
  ]);
  const [newCategory, setNewCategory] = useState('');

  const lockTasksToQuote = () => {
    items.forEach(item => {
      if (item.taskId) {
        const task = tasks.find(t => t.TaskID === item.taskId);
        if (task && !task.QuotationRef) task.QuotationRef = quotationNumber;
      }
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const vat = subtotal * (VAT_RATE / 100);
  const total = subtotal + vat;

  const updateItem = (id: number, field: keyof QuoteItem, value: string | number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        description: 'New item',
        quantity: 1,
        price: 0,
        category: categories[0],
      },
    ]);
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(item => item.id !== id));

  const addNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, QuoteItem[]> = {};
    items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      groups[cat] = groups[cat] || [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);

  const numberedItems = Object.entries(groupedItems).flatMap(([category, catItems]) => {
    const header = { type: 'category' as const, name: category };
    const numbered = catItems.map((item, idx) => ({
      ...item,
      displayNumber: idx + 1,
    }));
    return [header, ...numbered];
  });

  // --- FIXED: Mapped property names to match DocumentData interface ---
  const pdfData = {
    type: 'quotation' as const,                // Added required field
    documentNumber: quotationNumber,   // Mapped from quotationNumber
    documentDate: quotationDate,       // Mapped from quotationDate
    validUntil,
    groupedItems,
    notes,
    client,
    items,
    project,
    subtotal,
    vat,
    total,
  };

  if (requestedTaskIDs.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">No Tasks Selected</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
        </Button>
      </div>
    );
  }

  // NOTE: pdfDocument useMemo has been REMOVED to prevent the Eo crash.
  // The logic is moved inside PDFButton props.

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4">

        {/* Alerts */}
        {alreadyQuotedTasks.length > 0 && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Tasks Already Quoted</AlertTitle>
            <AlertDescription>
              The following tasks are already included in another quotation:
              <ul className="mt-2 list-disc pl-5 text-sm">
                {alreadyQuotedTasks.map(t => (
                  <li key={t.TaskID}>
                    <strong>{t.TaskName}</strong> → {t.QuotationRef}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {availableTasks.length > 0 && (
          <Alert className="mb-6 border-green-400 bg-green-50">
            <Lock className="h-4 w-4" />
            <AlertTitle>Tasks Will Be Locked</AlertTitle>
            <AlertDescription>
              {availableTasks.length} tasks will be locked to <span className="font-bold">{quotationNumber}</span> upon download.
            </AlertDescription>
          </Alert>
        )}

        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="New category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNewCategory()}
                className="w-48"
              />
              <Button size="icon" onClick={addNewCategory} disabled={!newCategory.trim()}>
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={addItem} variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>

            {/* --- FIXED: Updated PDF Button Usage --- */}
            <PDFButton
              // Pass the Component Reference (Import), NOT <QuotationPDF />
              documentComponent={QuotationPDF}
              // Pass the data object prop
              documentProps={{ data: pdfData }}
              fileName={`${quotationNumber}.pdf`}
              onBeforeDownload={lockTasksToQuote}
            />
          </div>
        </div>

        {/* HTML Preview (Matches PDF Visuals) */}
        <div className="overflow-hidden rounded-lg bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
          <div className="p-12 font-sans">

            {/* Header */}
            <div className="mb-12 flex justify-between border-b-4 border-blue-600 pb-8">
              <div>
                <h1 className="mb-4 text-3xl font-bold text-blue-900">BuildPro Construction</h1>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>123 Construction Avenue, Sandton</p>
                  <p>Johannesburg, Gauteng, 2196</p>
                  <p>VAT Reg: 4123456789</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="mb-8 text-5xl font-bold text-blue-600">QUOTATION</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-end gap-4"><span className="font-medium">Quote #:</span> <span className="font-bold">{quotationNumber}</span></div>
                  <div className="flex justify-end gap-4"><span className="font-medium">Date:</span> <span>{format(new Date(quotationDate), 'dd MMMM yyyy')}</span></div>
                </div>
              </div>
            </div>

            {/* Bill To & Project */}
            <div className="mb-12 grid grid-cols-2 gap-12">
              <div>
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-700">Bill To</h3>
                <p className="text-xl font-bold">{client.ClientName}</p>
                <p className="text-sm text-gray-600">{(client as any).Address || 'Address not provided'}</p>
              </div>
              <div className="text-right">
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-gray-700">Project</h3>
                <p className="text-xl font-bold">{project.ProjectName}</p>
                <Badge variant="secondary" className="mt-2">ID: {project.ProjectID}</Badge>
              </div>
            </div>

            {/* Items Table */}
            <table className="mb-12 w-full table-auto border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="w-10 pb-4 text-left font-bold">#</th>
                  <th className="pb-4 text-left font-bold">Description</th>
                  <th className="pb-4 text-center font-bold">Qty</th>
                  <th className="pb-4 text-right font-bold">Rate</th>
                  <th className="pb-4 text-right font-bold">Amount</th>
                  <th className="w-32 pb-4 text-center font-bold">Category</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {numberedItems.map((entry) => {
                  if ('type' in entry) {
                    return (
                      <tr key={`cat-${entry.name}`} className="border-b bg-gray-50">
                        <td colSpan={7} className="py-2 pl-4 text-sm font-medium text-gray-600 italic">
                          {entry.name}
                        </td>
                      </tr>
                    );
                  }

                  const item = entry;
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 pl-4 text-sm font-medium text-gray-700">
                        {item.displayNumber}.
                      </td>
                      <td className="py-3">
                        <Textarea
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                          className="min-h-10 resize-none border-0 p-0 text-sm focus:ring-0"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-20 text-center"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <Input
                          type="number"
                          value={Number(item.price).toFixed(2)}
                          onChange={e => updateItem(item.id, 'price', e.target.value)}
                          step="0.01"
                          className="w-28 text-right"
                        />
                      </td>
                      <td className="py-3 text-right font-medium">
                        R {(item.quantity * item.price).toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <Select
                          value={item.category}
                          onValueChange={(val) => updateItem(item.id, 'category', val)}
                        >
                          <SelectTrigger className="w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 text-center">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="min-h-32 text-sm" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplatePage;