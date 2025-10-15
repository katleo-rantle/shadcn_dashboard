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
  children
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode
}) => {
  return (
    <Card>
      <div className='px-4 flex flex-col md:flex-row justify-between'>
        <CardTitle>{title}</CardTitle>
        {description && (
           <CardDescription>{description}</CardDescription>
        )}
       
      </div>
      <CardContent>
        {children}
      </CardContent>
      
    </Card>
  );
};
export default AppCard;
