"use client"

import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  MessageCircle,
  CalendarDays,
  FolderOpen,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  HelpCircle,
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
import { logout } from "@/app/actions/auth"
import type { CoachProfile } from "@/app/actions/profile"

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Cliënten", icon: Users, id: "clients" },
  { title: "Programma's", icon: Dumbbell, id: "programs" },
  { title: "Voeding", icon: Apple, id: "nutrition" },
  { title: "Berichten", icon: MessageCircle, id: "messages" },
  { title: "Agenda", icon: CalendarDays, id: "schedule" },
  { title: "Content", icon: FolderOpen, id: "content" },
]

interface CoachingSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  profile: CoachProfile
}

export function CoachingSidebar({ activeSection, onSectionChange, profile }: CoachingSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-3 hover:bg-sidebar-accent/50">
              <Image
                src="/images/evotion-favicon-wit.png"
                alt="Evotion"
                width={28}
                height={28}
                className="object-contain shrink-0"
              />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">Evotion</span>
                <span className="text-xs text-sidebar-foreground/60">Coaching Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Dashboard link — alleen zichtbaar voor admins */}
        {profile.isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Admin Dashboard"
                    className="gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  >
                    <a href="/admin">
                      <BarChart3 className="size-4" />
                      <span>Admin Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="gap-3 hover:bg-sidebar-accent/50">
                  <Avatar className="size-8 border-2 border-sidebar-primary/30">
                    <AvatarImage src={profile.avatarUrl} alt="Coach avatar" />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                      {profile.initialen}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium text-sm">{profile.naam}</span>
                    <span className="text-xs text-sidebar-foreground/50">{profile.rol}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-sidebar-foreground/40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => onSectionChange("settings")}>
                  <Settings className="mr-2 size-4" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSectionChange("settings")}>
                  <Bell className="mr-2 size-4" />
                  Meldingen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 size-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => logout()}
                >
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
