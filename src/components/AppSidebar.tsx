// components/AppSidebar.tsx (or wherever you keep it)
'use client';

import {
  Home,
  FolderOpen,
  CheckSquare,
  Clock,
  FileText,
  MessageCircle,
  DollarSign,
  Settings,
  LogOut,
  User2,
  ChevronDown,
  Plus,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';
import { useEffect, useState } from 'react';


export default function AppSidebar() {

  
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { selectedProjectId, projects, setSelectedProjectId } = useProject();

  const handleProjectSwitch = (projectId: number) => {
    setSelectedProjectId(projectId);
    router.push(`/projects/${projectId}`);
    setDropdownOpen(false);
  };

  const handleNewProject = () => {
    router.push('/projects#all-projects-table');
    setDropdownOpen(false);
  };

  // Show "Select Project" if none selected
  const displayProjectName =
    selectedProjectId && projects.find(p => p.ProjectID === selectedProjectId)
      ? projects.find(p => p.ProjectID === selectedProjectId)!.ProjectName
      : 'Select Project';

  const isProjectDetail = selectedProjectId && pathname.startsWith(`/projects/${selectedProjectId}`);

  const projectNavItems = selectedProjectId
    ? [
        { title: 'Overview', icon: Home, href: `/projects/${selectedProjectId}` },
        { title: 'Tasks', icon: CheckSquare, href: `/projects/${selectedProjectId}/tasks` },
        { title: 'Timesheet', icon: Clock, href: `/projects/${selectedProjectId}/timesheet` },
        { title: 'Financials', icon: DollarSign, href: `/projects/${selectedProjectId}/financials` },
        { title: 'Documents', icon: FileText, href: `/projects/${selectedProjectId}/documents` },
        { title: 'Chat', icon: MessageCircle, href: `/projects/${selectedProjectId}/chat` },
      ]
    : [];

  const isActive = (href: string) => {
    if (!selectedProjectId) return false;
    if (href === `/projects/${selectedProjectId}`) {
      return pathname === href || pathname === `/projects/${selectedProjectId}`;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-100 pb-4">
        <SidebarMenu>
          {/* Logo */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-transparent p-0">
              <Link href="/" className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white font-black text-xl shadow-xl">
                  RC
                </div>
                {open && (
                  <div className="ml-3">
                    <p className="font-black text-xl text-gray-900 leading-none">Rantle</p>
                    <p className="text-xs font-medium text-gray-500">Construction</p>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Project Switcher */}
          {open ? (
            <SidebarMenuItem className="mt-4">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FolderOpen className="h-5 w-5 text-blue-700 flex-shrink-0" />
                      <span className="truncate">{displayProjectName}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-64 p-2">
                  <p className="px-3 py-2 text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Active Projects
                  </p>
                  {projects.length > 0 ? (
                    projects.map((p) => (
                      <DropdownMenuItem
                        key={p.ProjectID}
                        onSelect={() => handleProjectSwitch(p.ProjectID)}
                        className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                          selectedProjectId === p.ProjectID
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        {p.ProjectName}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="text-gray-400">
                      No projects available
                    </DropdownMenuItem>
                  )}
                  <div className="mt-2 border-t pt-2">
                    <DropdownMenuItem
                      className="text-green-600 font-medium cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleNewProject();
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            /* Collapsed Version */
            <SidebarMenuItem className="mt-4">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 shadow-sm transition-all">
                    <FolderOpen className="h-5 w-5 text-blue-700" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="center" className="w-64 p-2">
                  <p className="px-3 py-2 text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Active Projects
                  </p>
                  {projects.map((p) => (
                    <DropdownMenuItem
                      key={p.ProjectID}
                      onSelect={() => handleProjectSwitch(p.ProjectID)}
                      className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                        selectedProjectId === p.ProjectID
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      {p.ProjectName}
                    </DropdownMenuItem>
                  ))}
                  <div className="mt-2 border-t pt-2">
                    <DropdownMenuItem
                      className="text-green-600 font-medium"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleNewProject();
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="pt-6">
        {/* Project Navigation - Only when a project is selected */}
        {isProjectDetail && projectNavItems.length > 0 && (
          <SidebarGroup>
            {open && (
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Project Navigation
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {projectNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-200 rounded-lg ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4.5 w-4.5" />
                      {open && <span className="font-medium ml-3">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Main Menu */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={pathname === '/' ? 'bg-gray-100 text-blue-600' : ''}>
                <Link href="/">
                  <Home className="h-4.5 w-4.5" />
                  {open && <span className="font-medium ml-3">Dashboard</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={pathname === '/projects' ? 'bg-gray-100 text-blue-600' : ''}>
                <Link href="/projects">
                  <FolderOpen className="h-4.5 w-4.5" />
                  {open && <span className="font-medium ml-3">All Projects</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto pt-4">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={pathname === '/settings' ? 'bg-gray-100 text-blue-600' : ''}>
                  <Link href="/settings">
                    <Settings className="h-4.5 w-4.5" />
                    {open && <span className="font-medium ml-3">Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-gray-200 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-start hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                      JD
                    </div>
                    {open && (
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">John Doe</p>
                        <p className="text-xs text-gray-500">Site Manager</p>
                      </div>
                    )}
                  </div>
                  {open && <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem>
                  <User2 className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 font-medium">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}