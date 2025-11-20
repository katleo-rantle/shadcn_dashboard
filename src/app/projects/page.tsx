// app/projects/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { columns } from './columns';
import { DataTable } from './data-table';
import { projects, jobs, tasks, taskActuals } from '@/lib/data';
import { TrendingUp, FolderOpen, CheckCircle2, DollarSign } from 'lucide-react';

export default function ProjectsPage() {
  
  // Helper: Get all task IDs belonging to a project
  const getProjectTaskIds = (projectId: number) => {
    const jobIds = jobs
      .filter(j => j.ProjectID === projectId)
      .map(j => j.JobID);

    return tasks
      .filter(t => jobIds.includes(t.JobID))
      .map(t => t.TaskID);
  };

  // Helper: Calculate completion % for a project
  const getProjectCompletion = (projectId: number) => {
    const taskIds = getProjectTaskIds(projectId);
    const projectTasks = tasks.filter(t => taskIds.includes(t.TaskID));

    if (projectTasks.length === 0) return 0;

    const totalProgress = projectTasks.reduce((sum, t) => sum + (t.TaskProgress || 0), 0);
    return Math.round(totalProgress / projectTasks.length);
  };

  // === Summary Stats ===
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => 
    p.Status === 'Active' || p.Status === 'In Progress'
  ).length;
  const completedProjects = projects.filter(p => p.Status === 'Completed').length;

  const totalQuoted = projects.reduce((sum, p) => sum + (p.QuotedCost || 0), 0);

  // Total actual cost across all projects
  const totalActual = projects.reduce((sum, project) => {
    const taskIds = getProjectTaskIds(project.ProjectID);
    const actualCost = taskActuals
      .filter(ta => taskIds.includes(ta.TaskID))
      .reduce((acc, ta) => acc + ta.Cost, 0);
    return sum + actualCost;
  }, 0);

  const totalVariance = totalActual - totalQuoted;

  // Average completion across all projects
  const averageCompletion = projects.length > 0
    ? Math.round(
        projects.reduce((sum, p) => sum + getProjectCompletion(p.ProjectID), 0) / projects.length
      )
    : 0;

  const statusCount = {
    'Active': projects.filter(p => p.Status === 'Active').length,
    'In Progress': projects.filter(p => p.Status === 'In Progress').length,
    'Completed': projects.filter(p => p.Status === 'Completed').length,
    'Not Started': projects.filter(p => p.Status === 'Not Started').length,
  };

  const topProjects = [...projects]
    .sort((a, b) => (b.QuotedCost || 0) - (a.QuotedCost || 0))
    .slice(0, 5);

  const formatCurrency = (amount: number) =>
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">All Projects</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all construction projects in one place
        </p>
      </div>
      
      <Separator />

      {/* Full Table */}
      <Card id="all-projects-table">
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Detailed list of every project</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={projects} />
        </CardContent>
      </Card>
    </div>
  );
}