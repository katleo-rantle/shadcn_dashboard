// app/projects/page.tsx
import { columns } from './columns';
import { DataTable } from './data-table';
import { projects } from '@/lib/data';

export default function ProjectsPage() {
  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={projects} />
    </div>
  );
}
