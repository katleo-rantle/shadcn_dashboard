"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  TrendingUp,
  DollarSign,
  FileText,
  Loader2,
  User,
} from "lucide-react";

import { projects, jobs, tasks, employees, resourceAssignments, taskActuals, changeOrders, clients } from "@/lib/data";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ———————————————————————————————————
// Individual Section Components
// ———————————————————————————————————

function ProjectOverview({ project }: { project: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Description</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none text-gray-700 leading-relaxed">
          <p>{project.Description || "No description provided."}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks & Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-24 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
          <p className="text-xl font-medium">Tasks Dashboard Coming Soon</p>
          <p className="text-sm mt-2">Kanban, Gantt, and task management</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectTimesheet() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Timesheet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-24 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
          Timesheet & Labor Tracking – Coming Soon
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectFinancials() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-24 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
          Invoicing, Expenses, Profitability – Coming Soon
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectDocuments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-24 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
          Contracts, Permits, Drawings – Coming Soon
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectChat() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center p-24 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
          Team & Client Communication – Coming Soon
        </div>
      </CardContent>
    </Card>
  );
}

// ———————————————————————————————————
// Main Dashboard Page (defaults to Overview)
// ———————————————————————————————————

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId ? Number(params.projectId) : null;

  const selectedProject = useMemo(
    () => projects.find((p) => p.ProjectID === projectId) || null,
    [projectId]
  );

  const projectJobs = useMemo(() => jobs.filter((j) => j.ProjectID === projectId), [projectId]);
  const projectTasks = useMemo(
    () => tasks.filter((t) => projectJobs.some((j) => j.JobID === t.JobID)),
    [projectJobs]
  );
  const projectClient = useMemo(
    () => clients.find((c) => c.ClientID === selectedProject?.ClientID),
    [selectedProject]
  );
  const projectChangeOrders = useMemo(
    () => changeOrders.filter((co) => co.ProjectID === projectId),
    [projectId]
  );

  const completion = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    const total = projectTasks.reduce((sum, t) => sum + (t.TaskProgress || 0), 0);
    return Math.round(total / projectTasks.length);
  }, [projectTasks]);

  const actualLaborCost = useMemo(() => {
    const assignments = resourceAssignments.filter((a) =>
      projectTasks.some((t) => t.TaskID === a.TaskID)
    );
    return assignments.reduce((total, a) => {
      const emp = employees.find((e) => e.EmployeeID === a.EmployeeID);
      return total + (emp ? (emp?.DailyRate || 0) * a.Hours : 0);
    }, 0);
  }, [projectTasks]);

  const recordedActualCost = useMemo(() => {
    return taskActuals
      .filter((ta) => projectTasks.some((t) => t.TaskID === ta.TaskID))
      .reduce((sum, ta) => sum + ta.Cost, 0);
  }, [projectTasks]);

  const totalActualCost = actualLaborCost + recordedActualCost;
  const quotedCost = selectedProject?.QuotedCost || 0;
  const variance = totalActualCost - quotedCost;

  const formatCurrency = (amount: number) =>
    `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusConfig: Record<string, { color: string; badge: string }> = {
    "In Progress": { color: "bg-blue-600", badge: "bg-blue-100 text-blue-800" },
    Active: { color: "bg-indigo-600", badge: "bg-indigo-100 text-indigo-800" },
    Completed: { color: "bg-green-600", badge: "bg-green-100 text-green-800" },
    "Not Started": { color: "bg-gray-600", badge: "bg-gray-100 text-gray-800" },
  };

  const { color = "bg-gray-600", badge = "bg-gray-100 text-gray-800" } =
    selectedProject ? statusConfig[selectedProject.Status] || {} : {};

  if (!projectId || !selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">
            {projectId ? `Project #${projectId} not found` : "Loading project..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="overflow-y-auto p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Hero Header */}
      <section className={`p-8 rounded-2xl shadow-2xl mb-8 ${color} text-white`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-extrabold tracking-tight">
                {selectedProject.ProjectName}
              </h1>
              <Badge className={`${badge} text-sm font-bold px-4 py-1`}>
                {selectedProject.Status}
              </Badge>
            </div>
            <p className="text-xl opacity-90">{selectedProject.ProjectType} Project</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="bg-white/20 backdrop-blur hover:bg-white/30 border border-white/30">
              Edit Project
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              Contact {projectClient?.ContactPerson?.split(" ")[0] || "Client"}
            </Button>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" /> Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{projectClient?.ClientName || "—"}</p>
            <p className="text-sm text-gray-600">{projectClient?.ContactPerson || "—"}</p>
            <p className="text-sm text-gray-500">{projectClient?.Email || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completion}%</div>
            <Progress value={completion} className="mt-2 h-3" />
            <p className="text-sm text-gray-600 mt-2">
              {projectTasks.filter((t) => t.Status === "Completed").length} of {projectTasks.length} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quoted</span>
                <span className="font-semibold">{formatCurrency(quotedCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actual</span>
                <span className="font-semibold text-red-600">{formatCurrency(totalActualCost)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Variance</span>
                <span className={variance > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(Math.abs(variance))} {variance > 0 ? "over" : "under"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Orders */}
      {projectChangeOrders.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Change Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectChangeOrders.map((co) => (
                  <TableRow key={co.ChangeOrderID}>
                    <TableCell>{co.Description}</TableCell>
                    <TableCell className="font-medium text-red-600">
                      +{formatCurrency(co.CostImpact)}
                    </TableCell>
                    <TableCell>{co.DateIssued}</TableCell>
                    <TableCell>
                      <Badge variant={co.Status === "Approved" ? "default" : "secondary"}>
                        {co.Status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Main Content: Always show Overview by default */}
      <section className="mt-10">
        <ProjectOverview project={selectedProject} />
      </section>
    </main>
  );
}