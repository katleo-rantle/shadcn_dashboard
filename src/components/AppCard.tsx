import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

const AppCard = ({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Card className='w-full'>
      <div className='px-4 flex flex-col md:flex-row justify-between items-start md:items-center'>
        <div className='flex items-center space-x-3 w-full'>
          <CardTitle className='truncate'>{title}</CardTitle>
          <div className='ml-auto' />
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <div className='mt-2 md:mt-0 ml-2'>{actions}</div>}
      </div>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
export default AppCard;
