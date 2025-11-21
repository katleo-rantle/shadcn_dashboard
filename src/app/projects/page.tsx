// app/projects/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { projects } from '@/lib/data';
import ProjectDialog from './ProjectDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import type { Project } from '@/lib/types';

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">All Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all construction projects in one place
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          New Project
        </Button>
      </div>

      <Separator />

      <Card id="all-projects-table">
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Detailed list of every project</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={projects}
            // Pass callbacks via meta (TanStack Table pattern)
            meta={{
              onEdit: (project: Project) => {
                setEditingProject(project);
                setIsCreateOpen(true);
              },
              onDelete: (project: Project) => setDeletingProject(project),
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProjectDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
      />

      <DeleteConfirmDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        project={deletingProject}
        onConfirm={() => {
          alert(`Project "${deletingProject?.ProjectName}" deleted!`);
          setDeletingProject(null);
        }}
      />
    </div>
  );
}