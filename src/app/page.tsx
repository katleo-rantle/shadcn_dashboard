// app/projects/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { projects, jobs, tasks, taskActuals } from '@/lib/data';
import { TrendingUp, FolderOpen, CheckCircle2, DollarSign } from 'lucide-react';
import AppBarChart from '@/components/AppBarChart';
import AppPieChart from '@/components/AppPieChart';

export default function Home() {
  // === Helpers ===
  const getProjectTaskIds = (projectId: number) => {
    const jobIds = jobs.filter(j => j.ProjectID === projectId).map(j => j.JobID);
    return tasks.filter(t => jobIds.includes(t.JobID)).map(t => t.TaskID);
  };

  const getProjectCompletion = (projectId: number) => {
    const taskIds = getProjectTaskIds(projectId);
    const projectTasks = tasks.filter(t => taskIds.includes(t.TaskID));
    if (projectTasks.length === 0) return 0;
    const total = projectTasks.reduce((sum, t) => sum + (t.TaskProgress || 0), 0);
    return Math.round(total / projectTasks.length);
  };

  // === Stats ===
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.Status === 'Active' || p.Status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.Status === 'Completed').length;

  const totalQuoted = projects.reduce((sum, p) => sum + (p.QuotedCost || 0), 0);
  const totalActual = projects.reduce((sum, p) => {
    const taskIds = getProjectTaskIds(p.ProjectID);
    return sum + taskActuals.filter(ta => taskIds.includes(ta.TaskID)).reduce((a, b) => a + b.Cost, 0);
  }, 0);
  const totalVariance = totalActual - totalQuoted;

  const averageCompletion = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + getProjectCompletion(p.ProjectID), 0) / projects.length)
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
    `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  return (
    <div className="container mx-auto py-6 space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage and track all construction projects</p>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">{activeProjects} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quoted Value</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalQuoted)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(totalVariance))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCompletion}%</div>
            <Progress value={averageCompletion} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spend</CardTitle>
            <CardDescription>Quoted vs Actual costs</CardDescription>
          </CardHeader>
          <CardContent>
            <AppBarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Current distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <AppPieChart statusCount={statusCount} totalProjects={totalProjects} />
          </CardContent>
        </Card>
      </div>

      {/* Status + Top Projects */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusCount).map(([status, count]) => {
              const percentage = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
              const color = {
                'Active': 'bg-indigo-600',
                'In Progress': 'bg-blue-600',
                'Completed': 'bg-green-600',
                'Not Started': 'bg-gray-500',
              }[status] || 'bg-gray-400';

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top 5 by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProjects.map((p, i) => (
                <div key={p.ProjectID} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.ProjectName}</p>
                      <p className="text-xs text-muted-foreground">{p.ProjectType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(p.QuotedCost || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}