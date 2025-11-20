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
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { selectedProject, selectedProjectId, projects, setSelectedProjectId } = useProject();

  const handleProjectSwitch = (projectId: number) => {
    setSelectedProjectId(projectId);
    router.push(`/projects/${projectId}`);
  };

  const currentProjectName = selectedProject?.ProjectName || 'Select a Project';
  const isProjectDetail = selectedProjectId && pathname.startsWith(`/projects/${selectedProjectId}`);

  // Active state based on full path (no hash needed)
  const isActive = (href: string) => {
    if (href === `/projects/${selectedProjectId}`) {
      return pathname === `/projects/${selectedProjectId}` || pathname === `/projects/${selectedProjectId}/`;
    }
    return pathname.startsWith(href);
  };

  const projectNavItems = [
    { title: 'Overview', icon: Home, href: `/projects/${selectedProjectId}` },
    { title: 'Tasks', icon: CheckSquare, href: `/projects/${selectedProjectId}/tasks` },
    { title: 'Timesheet', icon: Clock, href: `/projects/${selectedProjectId}/timesheet` },
    { title: 'Financials', icon: DollarSign, href: `/projects/${selectedProjectId}/financials` },
    { title: 'Documents', icon: FileText, href: `/projects/${selectedProjectId}/documents` },
    { title: 'Chat', icon: MessageCircle, href: `/projects/${selectedProjectId}/chat` },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-100 pb-4">
        <SidebarMenu>
          {/* Logo */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-transparent p-0">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white font-black text-xl shadow-xl">
                  RC
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl leading-none text-gray-900">Rantle</span>
                  <span className="text-xs font-medium text-gray-500">Construction</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Project Switcher */}
          <SidebarMenuItem className="mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between px-3 py-2.5 hover:bg-gray-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FolderOpen className="h-5 w-5 shrink-0 text-blue-700" />
                    <span className="truncate text-sm font-medium text-gray-800">
                      {currentProjectName}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-64 p-2">
                <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
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
                    No projects
                  </DropdownMenuItem>
                )}
                <div className="mt-2 border-t pt-2">
                  <DropdownMenuItem className="text-green-600 font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="pt-6">
        {/* Project Navigation */}
        {isProjectDetail && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Project Navigation
            </SidebarGroupLabel>
            <SidebarMenu>
              {projectNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4.5 w-4.5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Main Menu (when not in a project) */}
        {!isProjectDetail && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Main Menu
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={pathname === '/' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}>
                  <Link href="/">
                    <Home className="h-4.5 w-4.5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={pathname === '/projects' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}>
                  <Link href="/projects">
                    <FolderOpen className="h-4.5 w-4.5" />
                    <span className="font-medium">All Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Settings - always visible at bottom */}
        <div className="mt-auto pt-4">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={pathname === '/settings' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}>
                  <Link href="/settings">
                    <Settings className="h-4.5 w-4.5" />
                    <span className="font-medium">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-gray-200 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-start hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                      JD
                    </div>
                    <div className="overflow-hidden text-left">
                      <p className="truncate text-sm font-semibold text-gray-900">John Doe</p>
                      <p className="truncate text-xs text-gray-500">Site Manager</p>
                    </div>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem>
                  <User2 className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 font-medium">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}