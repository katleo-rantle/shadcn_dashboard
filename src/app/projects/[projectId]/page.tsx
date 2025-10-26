import AppCard from '@/components/AppCard';
import Overview from '@/components/Overview';
import Taskboard from '@/components/Taskboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, MessageCircle } from 'lucide-react';

const SingleProject = () => {
  const completion = 66;
  return (
    <main className='overflow-y-auto p-4 md:p-6 md:max-w-9/10 2xl:max-w-7xl mx-auto'>
      <section className='flex flex-col md:flex-row md:items-center md:justify-between'>
        <div className=''>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-50'>
            Island view
          </h1>
          <p className='text-gray-600 dark:text-gray-100'>
            commercial building
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex items-center'>
          <Badge className=' '>in progress</Badge>
          <Button className='hover:cursor-pointer ml-4 '>edit project</Button>
        </div>
      </section>
      <section className='mt-4 flex flex-col gap-8'>
        <AppCard
          title={'Island view'}
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
                <p className='text-sm font-medium'>September 20 2025</p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-500'>End date</p>
                <p className='text-sm font-medium'>September 20 2026</p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-500'>Budget</p>
                <p className='text-sm font-medium'>R 350,000</p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-500'>Client</p>
                <p className='text-sm font-medium'>Mrs Zondi</p>
              </div>
            </div>
          </div>
        </AppCard>
        {/* tabs */}
        <Tabs defaultValue='overview' >
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='tasks'><CheckCheck/> Tasks</TabsTrigger>
            <TabsTrigger value='financials'>Financials</TabsTrigger>
            <TabsTrigger value='documents'>Documents</TabsTrigger>
            <TabsTrigger value='chat'><MessageCircle/> Chat</TabsTrigger>
          </TabsList>
          <TabsContent value='overview'>
            <Overview/>
          </TabsContent>
          <TabsContent value='tasks'><Taskboard/></TabsContent>
        </Tabs>
       
      </section>
      <section></section>
      <section></section>
    </main>
  );
};
export default SingleProject;
