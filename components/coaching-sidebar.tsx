"use client"

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
  { title: "Content", icon: FolderOpen, id: "content" },
]

// Beheer secties (Content, Statistieken, Facturatie) zijn verplaatst naar /admin

/** Coach profiel — Vervang met ingelogde coach data uit Supabase
 *  Supabase: users tabel (voornaam, achternaam, avatar_url, rol)
 *  avatar_url: Supabase Storage publieke URL uit bucket "avatars"
 *    pad: avatars/{user_id}/profile.{ext}
 *  De avatar wordt gewijzigd in Instellingen -> Profiel tab
 *  Na upload wordt avatar_url automatisch bijgewerkt in de hele app
 */
const coachProfile = {
  naam: "Mark Jensen",          // <-- users.voornaam + " " + users.achternaam
  initialen: "MJ",              // <-- Berekend: voornaam[0] + achternaam[0]
  rol: "Online Coach",          // <-- users.rol
  avatarUrl: "",                // <-- users.avatar_url (Supabase Storage)
  planNaam: "Pro Plan",         // <-- Uit subscription_plans via active subscription
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

        {/* ----------------------------------------------------------------
          Admin Dashboard link — ALLEEN TONEN ALS INGELOGDE USER ROL "admin" HEEFT
          
          Implementatie:
            1. Haal de ingelogde user op via Supabase Auth (useUser() of server-side)
            2. Check user.rol === "admin" (uit users tabel, niet auth.users)
            3. Render dit blok CONDITIONEEL: {isAdmin && ( ... )}
            4. De users tabel heeft kolom "rol" met waarden: "admin" | "coach" | "client"
            5. Coaches zien dit NIET — alleen admins
          
          Voorbeeld:
            const { user } = useUser()
            const isAdmin = user?.rol === "admin"
            {isAdmin && ( <SidebarGroup>...</SidebarGroup> )}
        ---------------------------------------------------------------- */}
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
      </SidebarContent>

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
