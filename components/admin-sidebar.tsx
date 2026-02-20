"use client"

import {
  LayoutDashboard,
  Globe,
  UserCog,
  Users,
  FolderOpen,
  BarChart3,
  CreditCard,
  ChevronDown,
  Settings,
  LogOut,
  HelpCircle,
  Zap,
  ArrowLeft,
  Crown,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte data uit Supabase
//
// Supabase tabellen:
//   - users (admin profiel via auth.users + users tabel)
//
// Admin profiel: alleen gebruikers met rol "admin" krijgen toegang tot dit dashboard
// Toegangscontrole: Supabase RLS policies + middleware check op rol
// ============================================================================

const adminNavItems = [
  { title: "Overzicht", icon: LayoutDashboard, id: "overview" },
  { title: "Website Analytics", icon: Globe, id: "analytics" },
  { title: "Gebruikers", icon: UserCog, id: "gebruikers" },
  { title: "Clients", icon: Users, id: "clients" },
]

const beheerNavItems = [
  { title: "Contentbibliotheek", icon: FolderOpen, id: "content" },
  { title: "Statistieken", icon: BarChart3, id: "statistieken" },
  { title: "Facturatie", icon: CreditCard, id: "facturatie" },
]

/** Admin profiel — Vervang met ingelogde admin data */
const adminProfile = {
  naam: "Zorin Wijnands",
  initialen: "ZW",
  rol: "Admin",
  avatarUrl: "",
}

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-3 hover:bg-sidebar-accent/50">
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Zap className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">CoachHub</span>
                <span className="text-xs text-sidebar-foreground/60">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    tooltip={item.title}
                    className="gap-3"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">
            Beheer
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {beheerNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    tooltip={item.title}
                    className="gap-3"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Link terug naar Coach Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Coach Dashboard"
                  className="gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                >
                  <a href="/">
                    <ArrowLeft className="size-4" />
                    <span>Coach Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="gap-3 hover:bg-sidebar-accent/50">
                  <Avatar className="size-8 border-2 border-chart-5/30">
                    <AvatarImage src={adminProfile.avatarUrl} alt="Admin avatar" />
                    <AvatarFallback className="bg-chart-5/10 text-chart-5 text-xs font-semibold">
                      {adminProfile.initialen}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium text-sm">{adminProfile.naam}</span>
                    <span className="text-xs text-sidebar-foreground/50 flex items-center gap-1">
                      <Crown className="size-2.5" />
                      {adminProfile.rol}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-sidebar-foreground/40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 size-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
