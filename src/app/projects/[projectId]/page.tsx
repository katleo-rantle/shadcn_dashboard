"use client";
import { useState } from 'react';
import { BarChart3, LayoutGrid } from 'lucide-react';

import AppCard from '@/components/AppCard';
import GanttChart from '@/components/GanttChart';
import Overview from '@/components/Overview';
import Taskboard from '@/components/Taskboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, MessageCircle } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { clients } from '@/lib/data';
import EmployeeTimeSheet from '@/components/EmployeeTimeSheet';
import GanttChartT from '@/components/GanttChartT';


const SingleProject = () => {
  const completion = 66;
  const [viewMode, setViewMode] = useState<'gantt' | 'board'>('gantt');
  const { jobsForSelectedProject, selectedProject } = useProject();
  const client = clients.find(
    (c) => c.ClientID === selectedProject?.ClientID
  );

  return (
    <main className='overflow-y-auto p-4 md:p-6 md:max-w-9/10 2xl:max-w-7xl mx-auto'>
      <section className='flex flex-col md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-50'>
            {selectedProject?.ProjectName}
          </h1>
          <p className='text-gray-600 dark:text-gray-100'>
            {selectedProject?.ProjectType}
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex items-center'>
          <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
            {selectedProject?.Status}
          </Badge>
          <Button className='hover:cursor-pointer ml-4'>edit project</Button>
        </div>
      </section>

      <section className='mt-4 flex flex-col gap-8'>
        <AppCard
          title={client?.Address || 'No address available'}
          description={
            <p>
              completion: <span className='font-bold'>{completion}%</span>
            </p>
          }
        >
          <div>
            <Progress value={completion} />
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
              <div className='text-center'>
                <p className='text-sm text-gray-500'>Start date</p>
                <p className='text-sm font-medium'>
                  {selectedProject?.StartDate}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-500'>End date</p>
                <p className='text-sm font-medium'>
                  {selectedProject?.EndDate}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-500'>Budget</p>
                <p className='text-sm font-medium'>
                  R {selectedProject?.QuotedCost}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-500'>Client</p>
                <p className='text-sm font-medium'>{client?.ClientName}</p>
              </div>
            </div>
          </div>
        </AppCard>

        {/* Tabs */}
        <Tabs defaultValue='overview'>
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='tasks'>
              <CheckCheck className='w-4 h-4 mr-1' /> Tasks
            </TabsTrigger>
            <TabsTrigger value='timesheet'>timesheet</TabsTrigger>
            <TabsTrigger value='financials'>Financials</TabsTrigger>
            <TabsTrigger value='documents'>Documents</TabsTrigger>
            <TabsTrigger value='chat'>
              <MessageCircle className='w-4 h-4 mr-1' /> Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <Overview projectDesc={selectedProject?.Description || ''} />
          </TabsContent>

          <TabsContent value='tasks' className='mt-4'>
            {/* Toggle Button Group */}
            <div className='flex justify-end mb-4'>
              <div className='inline-flex rounded-md shadow-sm' role='group'>
                <Button
                  variant={viewMode === 'gantt' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setViewMode('gantt')}
                  className='rounded-l-md rounded-r-none border-r-0 flex items-center gap-1'
                >
                  <BarChart3 className='w-4 h-4' />
                  Gantt
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setViewMode('board')}
                  className='rounded-r-md rounded-l-none flex items-center gap-1'
                >
                  <LayoutGrid className='w-4 h-4' />
                  Board
                </Button>
              </div>
            </div>

            {/* Conditional Rendering */}
            <div className='mt-2'>
              {viewMode === 'gantt' ? <GanttChartT /> : <Taskboard />}
            </div>
          </TabsContent>

          {/* Other tabs */}
          <TabsContent value='timesheet'>
            <p className='text-muted-foreground'>
              <EmployeeTimeSheet />
            </p>
          </TabsContent>
          <TabsContent value='financials'>
            <p className='text-muted-foreground'>
              Financial details coming soon...
            </p>
          </TabsContent>
          <TabsContent value='documents'>
            <p className='text-muted-foreground'>Documents section...</p>
          </TabsContent>
          <TabsContent value='chat'>
            <p className='text-muted-foreground'>Chat feature...</p>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default SingleProject;