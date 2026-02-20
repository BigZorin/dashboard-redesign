"use client"

import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  MessageCircle,
  CalendarDays,
  BarChart3,
  FolderOpen,
  Settings,
  CreditCard,
  Bell,
  ChevronDown,
  Search,
  LogOut,
  HelpCircle,
  Zap,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
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
// PLACEHOLDER DATA — Vervang met echte data uit je database/API
// Elke sectie heeft een duidelijk commentaar zodat Claude dit makkelijk kan invullen.
// ============================================================================

/** Navigatie-items voor de hoofdsecties (Coaching) */
const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Cliënten", icon: Users, badge: "48" /* <-- Aantal actieve cliënten */, id: "clients" },
  { title: "Programma's", icon: Dumbbell, id: "programs" },
  { title: "Voeding", icon: Apple, id: "nutrition" },
  { title: "Berichten", icon: MessageCircle, badge: "5" /* <-- Ongelezen berichten */, id: "messages" },
  { title: "Agenda", icon: CalendarDays, id: "schedule" },
]

/** Navigatie-items voor beheersecties */
const manageNavItems = [
  { title: "Contentbibliotheek", icon: FolderOpen, id: "content" },
  { title: "Statistieken", icon: BarChart3, id: "analytics" },
  { title: "Facturatie", icon: CreditCard, id: "billing" },
]

/** Coach profiel — Vervang met ingelogde coach data */
const coachProfile = {
  naam: "Mark Jensen",          // <-- Volledige naam coach
  initialen: "MJ",              // <-- Initialen voor avatar fallback
  rol: "Online Coach",          // <-- Rol/titel
  avatarUrl: "",                // <-- URL naar profielfoto (leeg = fallback)
  planNaam: "Pro Plan",         // <-- Huidig abonnement
}

interface CoachingSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function CoachingSidebar({ activeSection, onSectionChange }: CoachingSidebarProps) {
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
                <span className="text-xs text-sidebar-foreground/60">{coachProfile.planNaam}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">
            Coaching
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
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
                  {item.badge && (
                    <SidebarMenuBadge className="bg-sidebar-primary/20 text-sidebar-primary text-[10px] font-semibold rounded-full px-1.5 min-w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
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
              {manageNavItems.map((item) => (
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
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="gap-3 hover:bg-sidebar-accent/50">
                  <Avatar className="size-8 border-2 border-sidebar-primary/30">
                    <AvatarImage src={coachProfile.avatarUrl} alt="Coach avatar" />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                      {coachProfile.initialen}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium text-sm">{coachProfile.naam}</span>
                    <span className="text-xs text-sidebar-foreground/50">{coachProfile.rol}</span>
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
                  <Bell className="mr-2 size-4" />
                  Meldingen
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
