// app/projects/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/lib/types';

export const columns: ColumnDef<Project>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'ProjectID',
    header: 'ID',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('ProjectID')}</div>
    ),
  },
  {
    accessorKey: 'ProjectName',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Project Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const projectName:string = row.getValue('ProjectName');
      return <div className='font-medium'>{projectName}</div>;
    },
  },
  {
    accessorKey: 'Status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('Status') as string;
      return (
        <Badge
          variant={
            status === 'Active'
              ? 'default'
              : status === 'Completed'
              ? 'secondary'
              : 'outline'
          }
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'QuotedCost',
    header: () => <div className='text-right'>Budget</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('QuotedCost'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ZAR',
      }).format(amount);

      return <div className='text-right font-medium'>{formatted}</div>;
    },
  },
  {
    accessorKey: 'QuoteDate',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Quote Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('QuoteDate'));
      const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);

      return <div className='font-medium'>{formatted}</div>;
    },
  },
  // {
  //   accessorKey: 'numJobs',
  //   header: () => <div className='text-right'>Jobs</div>,
  //   cell: ({ row }) => {
  //     const numJobs: number = row.original.?.length ?? 0;
  //     return <div className='text-right font-medium'>{numJobs}</div>;
  //   },
  // },
  // {
  //   accessorKey: 'numChangeOrders',
  //   header: () => <div className='text-right'>Change Orders</div>,
  //   cell: ({ row }) => {
  //     const numChangeOrders: number = row.original.ChangeOrders?.length ?? 0;
  //     return <div className='text-right font-medium'>{numChangeOrders}</div>;
  //   },
  // },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(project.ProjectID.toString())
              }
            >
              Copy project ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View project</DropdownMenuItem>
            <DropdownMenuItem>Edit project</DropdownMenuItem>
            <DropdownMenuItem>Delete project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


