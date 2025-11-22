// app/projects/ProjectDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, UserPlus } from 'lucide-react';
import { clients as mockClients } from '@/lib/data';
import type { Project, Client } from '@/lib/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
};

const PROJECT_TYPES = ['Commercial', 'Industrial', 'Residential', 'Institutional', 'Luxury', 'Renovation'] as const;

export default function ProjectDialog({ open, onOpenChange, project }: Props) {
  const isEdit = !!project;
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    ClientName: '',
    ContactPerson: '',
    Email: '',
    Phone: '',
  });

  // Use mockClients directly (in real app: use state/context/store)
  const [clients, setClients] = useState(mockClients);

  const [formData, setFormData] = useState<Partial<Project>>({
    ProjectName: '',
    ClientID: undefined,
    ProjectType: undefined,
    QuotedCost: 0,
    StartDate: '',
    EndDate: '',
    Status: 'Not Started',
    Description: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        ProjectName: project.ProjectName ?? '',
        ClientID: project.ClientID,
        ProjectType: project.ProjectType ?? undefined,
        QuotedCost: project.QuotedCost ?? 0,
        StartDate: project.StartDate ?? '',
        EndDate: project.EndDate ?? '',
        Status: project.Status ?? 'Not Started',
        Description: project.Description ?? '',
      });
    } else {
      resetForm();
    }
  }, [project, open]);

  const resetForm = () => {
    setFormData({
      ProjectName: '',
      ClientID: undefined,
      ProjectType: undefined,
      QuotedCost: 0,
      StartDate: '',
      EndDate: '',
      Status: 'Not Started',
      Description: '',
    });
    setShowNewClientForm(false);
    setNewClient({ ClientName: '', ContactPerson: '', Email: '', Phone: '' });
  };

  const handleCreateClient = () => {
    if (!newClient.ClientName.trim()) return;

    const newId = Math.max(...clients.map(c => c.ClientID), 0) + 1;
    const createdClient: Client = {
      ClientID: newId,
      ClientName: newClient.ClientName.trim(),
      ContactPerson: newClient.ContactPerson.trim(),
      Email: newClient.Email.trim(),
      Phone: newClient.Phone.trim(),
    };

    setClients(prev => [...prev, createdClient]);
    setFormData(prev => ({ ...prev, ClientID: newId }));
    setShowNewClientForm(false);
  };

  const selectedClient = clients.find(c => c.ClientID === formData.ClientID);

  const handleSubmit = () => {
    console.log('Project saved:', formData);
    alert(isEdit ? 'Project updated!' : 'Project created!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Project Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Project Name</Label>
              <Input
                value={formData.ProjectName || ''}
                onChange={(e) => setFormData({ ...formData, ProjectName: e.target.value })}
                placeholder="Sandton Office Block"
              />
            </div>
            <div>
              <Label>Project Type</Label>
              <Select
                value={formData.ProjectType}
                onValueChange={(v) => setFormData({ ...formData, ProjectType: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Selector + Add New */}
          <div>
            <Label>Client</Label>
            <Select
              value={formData.ClientID?.toString()}
              onValueChange={(v) => {
                if (v === 'new') {
                  setShowNewClientForm(true);
                } else {
                  setFormData({ ...formData, ClientID: v ? Number(v) : undefined });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or add a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.ClientID} value={client.ClientID.toString()}>
                    <div>
                      <div className="font-medium">{client.ClientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.ContactPerson} • {client.Phone}
                      </div>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="new" className="border-t pt-2 mt-2">
                  <div className="flex items-center gap-2 text-primary">
                    <UserPlus className="h-4 w-4" />
                    Add New Client
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* New Client Form */}
          {showNewClientForm && (
            <div className="rounded-lg border border-dashed p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Client
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNewClientForm(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={newClient.ClientName}
                    onChange={(e) => setNewClient({ ...newClient, ClientName: e.target.value })}
                    placeholder="Acme Construction Ltd"
                  />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={newClient.ContactPerson}
                    onChange={(e) => setNewClient({ ...newClient, ContactPerson: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newClient.Email}
                    onChange={(e) => setNewClient({ ...newClient, Email: e.target.value })}
                    placeholder="john@acme.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newClient.Phone}
                    onChange={(e) => setNewClient({ ...newClient, Phone: e.target.value })}
                    placeholder="+27 82 123 4567"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateClient}
                disabled={!newClient.ClientName.trim()}
                className="w-full"
              >
                Create & Select Client
              </Button>
            </div>
          )}

          {/* Show selected client info */}
          {selectedClient && !showNewClientForm && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-2">Selected Client:</p>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Contact:</span> {selectedClient.ContactPerson}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedClient.Email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedClient.Phone}</div>
              </div>
            </div>
          )}

          {/* Rest of form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Quoted Cost (ZAR)</Label>
              <Input type="number" value={formData.QuotedCost || ''} onChange={(e) => setFormData({ ...formData, QuotedCost: Number(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={formData.StartDate || ''} onChange={(e) => setFormData({ ...formData, StartDate: e.target.value })} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={formData.EndDate || ''} onChange={(e) => setFormData({ ...formData, EndDate: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.Status} onValueChange={(v) => setFormData({ ...formData, Status: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Textarea value={formData.Description || ''} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} rows={3} />
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.ProjectName || !formData.ClientID}>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}