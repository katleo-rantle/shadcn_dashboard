import { CheckCheck, MessageCircle } from "lucide-react";
import AppCard from "./AppCard";

const Overview = () => {
  return (

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
        <AppCard title={'Project Description'} description={''}>
      <div>
        <p>
          A 12 story building Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Consectetur esse molestias rem doloremque officia a voluptas
          similique deserunt, ipsum qui architecto aspernatur quaerat veniam
          dignissimos adipisci, tenetur est ea temporibus minus aut aliquid?
          Quibusdam neque, aliquid, ex quaerat at, praesentium aliquam
          perspiciatis voluptates vel reiciendis et atque itaque tempora
          sapiente.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 md:flex-row">
        <div className="ml-0">
          <p className='text-sm font-medium'>project details</p>
          <p className='text-sm text-gray-500'>Start date</p>
          <p className='text-sm text-gray-500'>Start date</p>
        </div>
        <div className="ml-auto">
          <p className='text-sm font-medium'>client information</p>
          <p className='text-sm text-gray-500'>Start date</p>
          <p className='text-sm text-gray-500'>Start date</p>
        </div>
      </div>
    </AppCard>
  </div>
  <div className="lg:col-span-1">
    <AppCard title={'Recent Activity'} description={''}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-200 rounded-full">
            <CheckCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium">Task Completed</p>
            <p className="text-sm text-gray-500">John Doe completed the task "Design Homepage"</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-200 rounded-full">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">New Comment</p>
            <p className="text-sm text-gray-500">Jane Smith commented on the task "Update Logo"</p>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</div>
  );
}
export default Overview