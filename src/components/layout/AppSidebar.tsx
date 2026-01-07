import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  DollarSign,
  Receipt,
  ChevronDown
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

const personalItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Income', url: '/personal/income', icon: TrendingUp },
  { title: 'Expense', url: '/personal/expense', icon: TrendingDown },
];

const agencyItems = [
  { title: 'Dashboard', url: '/agency', icon: Building2 },
  { title: 'Agency Income', url: '/agency/income', icon: DollarSign },
  { title: 'Agency Expenses', url: '/agency/expense', icon: Receipt },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [personalOpen, setPersonalOpen] = useState(true);
  const [agencyOpen, setAgencyOpen] = useState(true);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg">FinTrack</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Personal Finance Section */}
        <SidebarGroup>
          <Collapsible open={personalOpen} onOpenChange={setPersonalOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal Finance
                </span>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${personalOpen ? '' : '-rotate-90'}`} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {personalItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.url === '/'} 
                          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Agency Finance Section */}
        <SidebarGroup className="mt-4">
          <Collapsible open={agencyOpen} onOpenChange={setAgencyOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Agency Finance
                </span>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${agencyOpen ? '' : '-rotate-90'}`} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {agencyItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.url === '/agency'}
                          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
