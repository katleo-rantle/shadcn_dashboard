// app/projects/ProjectDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { clients } from '@/lib/data';
import type { Project } from '@/lib/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
};

const PROJECT_TYPES = [
  'Commercial',
  'Industrial',
  'Residential',
  'Institutional',
  'Luxury',
  'Renovation',
] as const;

export default function ProjectDialog({ open, onOpenChange, project }: Props) {
  const isEdit = !!project;

  const [formData, setFormData] = useState<Partial<Project>>({
    ProjectName: '',
    ClientID: undefined,
    ProjectType: undefined,     // ← undefined, not ''
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
        ProjectType: project.ProjectType ?? undefined,   // ← safe
        QuotedCost: project.QuotedCost ?? 0,
        StartDate: project.StartDate ?? '',
        EndDate: project.EndDate ?? '',
        Status: project.Status ?? 'Not Started',
        Description: project.Description ?? '',
      });
    } else {
      setFormData({
        ProjectName: '',
        ClientID: undefined,
        ProjectType: undefined,     // ← critical
        QuotedCost: 0,
        StartDate: '',
        EndDate: '',
        Status: 'Not Started',
        Description: '',
      });
    }
  }, [project, open]);

  const selectedClient = clients.find(c => c.ClientID === formData.ClientID);

  const handleSubmit = () => {
    console.log('Project saved:', formData);
    alert(isEdit ? 'Project updated!' : 'Project created!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
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
                onValueChange={(value) => setFormData({ ...formData, ProjectType: value as Project['ProjectType'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Selector */}
          <div>
            <Label>Client</Label>
            <Select
              value={formData.ClientID?.toString()}
              onValueChange={(v) => setFormData({ ...formData, ClientID: v ? Number(v) : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.ClientID} value={client.ClientID.toString()}>
                    <div>
                      <div className="font-medium">{client.ClientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.ContactPerson} • {client.Phone}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Client Details */}
          {selectedClient && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Contact:</span>{' '}
                  <span className="font-medium">{selectedClient.ContactPerson}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span>{selectedClient.Email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>{' '}
                  <span>{selectedClient.Phone}</span>
                </div>
                {selectedClient.Address && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>{' '}
                    <span>{selectedClient.Address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Quoted Cost (ZAR)</Label>
              <Input
                type="number"
                value={formData.QuotedCost || ''}
                onChange={(e) => setFormData({ ...formData, QuotedCost: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.StartDate || ''}
                onChange={(e) => setFormData({ ...formData, StartDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Expected End Date</Label>
              <Input
                type="date"
                value={formData.EndDate || ''}
                onChange={(e) => setFormData({ ...formData, EndDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={formData.Status}
              onValueChange={(v) => setFormData({ ...formData, Status: v as Project['Status'] })}
            >
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
            <Textarea
              value={formData.Description || ''}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}