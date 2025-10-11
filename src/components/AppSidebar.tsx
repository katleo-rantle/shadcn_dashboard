import {
  ChartCandlestick,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ClipboardClock,
  File,
  FolderOpen,
  Home,
  Plus,
  Projector,
  Settings,
  User,
  User2,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
} from './ui/sidebar';
import Link from 'next/link';
import { DropdownMenu } from './ui/dropdown-menu';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { projectShutdown } from 'next/dist/build/swc/generated-native';

const items = [
  { title: 'Home', icon: Home, link: '/' },
  {
    title: 'Finance',
    icon: ChartCandlestick,
    link: '/Finance',
  },
  { title: 'Settings', icon: Settings, link: '/settings' },
];
const projects = ['Island view', 'Marine drive', 'Lake view', 'Waterfall'];

const AppSidebar = () => {
  const company = 'Rantle Construction';
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href='/'>
                <Home className='mr-2 h-4 w-4' />
                <span className='font-bold text-lg tracking-wide'>
                  {company}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {/* top group content */}
        <SidebarGroup>
          <SidebarGroupLabel>Project Management App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.link}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* end of top group content */}
        {/* COLLAPSIBLE projects*/}
        <Collapsible defaultOpen className='group/collapsible'>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                projects
                <ChevronDown className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180' />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent />
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {projects.map((project, index) => (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuButton asChild>
                          <Link href='/#'>
                            <FolderOpen />
                            {project}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        <SidebarGroup>
          <SidebarGroupLabel>Quotes</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus />
            <span className='sr-only'>create quote</span>
          </SidebarGroupAction>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href='/#'>
                  <File />
                  see all quotes
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href='/#'>
                  <Plus />
                  add quote
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* COLLAPSIBLE invoices*/}
        <Collapsible defaultOpen className='group/collapsible'>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Invoices
                <ChevronDown className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180' />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent />
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href='/#'>
                          <CircleDollarSign />
                          see all invoices
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href='/#'>
                          <Plus />
                          add invoice
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        {/* nested */}
        <SidebarGroup>
          <SidebarGroupLabel>People</SidebarGroupLabel>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href='/#'>
                  <Users />
                  see all employees
                </Link>
              </SidebarMenuButton>
              {/* submenu */}
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuButton asChild>
                    <Link href='/#'>
                      <Plus />
                      add employee
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuButton asChild>
                    <Link href='/#'>
                      <Plus />
                      add manager
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuButton asChild>
                    <Link href='/#'>
                      <ClipboardClock />
                      time sheets
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className='ml-auto' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='p-2  border rounded-lg'
              >
                <DropdownMenuItem className='hover:cursor-pointer hover:bg-gray-200 rounded-xs px-2 mt-2'>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='hover:cursor-pointer hover:bg-gray-200 rounded-xs px-2 mt-2'>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='hover:cursor-pointer hover:bg-gray-200 rounded-xs px-2 mt-2'>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
export default AppSidebar;
