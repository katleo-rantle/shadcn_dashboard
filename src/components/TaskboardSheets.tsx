import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Updated forms: accept optional initial values and an onUpdate callback

export function NewColumnForm({
  onCreate,
  onCancel,
  initial,
}: {
  onCreate: (label: string) => void;
  onCancel: () => void;
  initial?: { label?: string };
}) {
  const [label, setLabel] = React.useState(initial?.label ?? '');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCreate(label);
      }}
    >
      <div className='space-y-3 p-4'>
        <Label>Column name</Label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='e.g. Site Preparation'
        />
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' onClick={onCancel} type='button'>
            Cancel
          </Button>
          <Button type='submit'>Save</Button>
        </div>
      </div>
    </form>
  );
}

export function NewJobForm({
  columns = [],
  onCreate,
  onCancel,
  initial,
}: {
  columns: string[];
  onCreate: (
    job: { JobID: number; JobName: string; Tasks?: any[] },
    colId: string
  ) => void;
  onCancel: () => void;
  initial?: {
    JobID?: number;
    JobName?: string;
    columnId?: string;
    Tasks?: any[];
  };
}) {
  const [name, setName] = React.useState(initial?.JobName ?? '');
  const [id, setId] = React.useState(() => initial?.JobID ?? Date.now());
  const [column, setColumn] = React.useState(
    initial?.columnId ?? columns[0] ?? ''
  );
  React.useEffect(() => {
    if (columns.length && !column) setColumn(columns[0]);
  }, [columns]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCreate(
          { JobID: Number(id), JobName: name, Tasks: initial?.Tasks ?? [] },
          column
        );
      }}
    >
      <div className='space-y-3 p-4'>
        <Label>Job name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Job name'
        />
        <Label>Job ID</Label>
        <Input
          value={String(id)}
          onChange={(e) => setId(Number(e.target.value) || Date.now())}
        />
        <Label>Column</Label>
        <Select value={column} onValueChange={(v: string) => setColumn(v)}>
          <SelectTrigger>{column || 'Select column'}</SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' onClick={onCancel} type='button'>
            Cancel
          </Button>
          <Button type='submit'>Save</Button>
        </div>
      </div>
    </form>
  );
}

export function NewTaskForm({
  jobs = [],
  onCreate,
  onCancel,
  initial,
}: {
  jobs: any[];
  onCreate: (task: any, jobId: string | number) => void;
  onCancel: () => void;
  initial?: {
    TaskID?: number;
    TaskName?: string;
    TaskBudget?: number;
    jobId?: string | number;
    DueDate?: string;
  };
}) {
  const [name, setName] = React.useState(initial?.TaskName ?? '');
  const [id, setId] = React.useState(() => initial?.TaskID ?? Date.now());
  const [budget, setBudget] = React.useState<number | ''>(
    initial?.TaskBudget ?? ''
  );
  const [jobId, setJobId] = React.useState<string>(() =>
    initial?.jobId
      ? String(initial.jobId)
      : jobs[0]?.JobID
      ? String(jobs[0].JobID)
      : ''
  );
  React.useEffect(() => {
    if (jobs.length && !jobId) setJobId(String(jobs[0].JobID));
  }, [jobs]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCreate(
          {
            TaskID: Number(id),
            TaskName: name,
            TaskBudget: Number(budget) || 0,
            DueDate: initial?.DueDate,
          },
          jobId
        );
      }}
    >
      <div className='space-y-3 p-4'>
        <Label>Task name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Task name'
        />
        <Label>Task ID</Label>
        <Input
          value={String(id)}
          onChange={(e) => setId(Number(e.target.value) || Date.now())}
        />
        <Label>Budget</Label>
        <Input
          value={String(budget)}
          onChange={(e) =>
            setBudget(e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder='e.g. 5000'
        />
        <Label>Job</Label>
        <Select
          value={String(jobId)}
          onValueChange={(v: string) => setJobId(v)}
        >
          <SelectTrigger>
            {jobs.find((j) => String(j.JobID) === String(jobId))?.JobName ??
              'Select job'}
          </SelectTrigger>
          <SelectContent>
            {jobs.map((j) => (
              <SelectItem key={j.JobID} value={String(j.JobID)}>
                {j.JobName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' onClick={onCancel} type='button'>
            Cancel
          </Button>
          <Button type='submit'>Save</Button>
        </div>
      </div>
    </form>
  );
}
