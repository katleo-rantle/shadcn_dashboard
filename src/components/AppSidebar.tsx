// @/components/ui/AppSidebar.tsx
'use client';

import {
  ChartCandlestick,
  ChevronDown,
  CircleDollarSign,
  ClipboardClock,
  File,
  FolderOpen,
  Home,
  Plus,
  Settings,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from './ui/sidebar';
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useProject } from '@/context/ProjectContext';

export default function AppSidebar() {
  const { projects, selectedProjectId, setSelectedProjectId, selectedProject } =
    useProject();

  return (
    <Sidebar collapsible='icon'>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href='/' className='flex items-center gap-2'>
                <div className='flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-gray-600 to-blue-600 text-white font-bold text-lg'>
                  RC
                </div>
                <span className='font-bold'>Rantle Construction</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Project Switcher */}
          <SidebarMenuItem>
            <select
              value={selectedProjectId ?? ''}
              onChange={(e) =>
                setSelectedProjectId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className='w-full rounded border bg-background px-2 py-1 text-xs'
            >
              
              {projects.map((p) => (
                <option key={p.ProjectID} value={p.ProjectID}>
                  {p.ProjectName}
                </option>
              ))}
            </select>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { title: 'Home', icon: Home, href: '/' },
                { title: 'Finance', icon: ChartCandlestick, href: '/projects' },
                { title: 'project details', icon: FolderOpen, href: '/projects/2' },
                { title: 'Settings', icon: Settings, href: '/settings' },
              ].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className='h-4 w-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        {/* <Collapsible defaultOpen className='group/collapsible'>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Projects
                <ChevronDown className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180' />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projects.map((p) => (
                    <SidebarMenuItem key={p.ProjectID}>
                      <SidebarMenuButton
                        asChild
                        className={
                          selectedProjectId === p.ProjectID ? 'bg-accent' : ''
                        }
                      >
                        <Link href={`/project/${p.ProjectID}`}>
                          <FolderOpen className='h-4 w-4' />
                          {p.ProjectName}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible> */}

        {/* Quotes */}
        <SidebarGroup>
          <SidebarGroupLabel>Quotes</SidebarGroupLabel>
          <SidebarGroupAction title='Create Quote'>
            <Plus className='h-4 w-4' />
          </SidebarGroupAction>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href='/quotes'>
                  <File className='h-4 w-4' />
                  All Quotes
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Invoices */}
        <Collapsible defaultOpen className='group/collapsible'>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Invoices
                <ChevronDown className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180' />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href='/invoices'>
                        <CircleDollarSign className='h-4 w-4' />
                        All Invoices
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* People */}
        <SidebarGroup>
          <SidebarGroupLabel>People</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href='/employees'>
                  <Users className='h-4 w-4' />
                  Employees
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuButton asChild>
                    <Link href='/employees/add'>Add Employee</Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuButton asChild>
                    <Link href='/timesheets'>
                      <ClipboardClock className='h-4 w-4' />
                      Timesheets
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 className='h-4 w-4' />
                  Username
                  <ChevronDown className='ml-auto h-4 w-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='top' className='w-48'>
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
