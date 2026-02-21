"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CoachingSidebar } from "@/components/coaching-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardOverviewWithData } from "@/components/data/dashboard-data"
import { ClientsSectionWithData } from "@/components/data/clients-data"
import { ProgramsSection } from "@/components/sections/programs-section"
import { NutritionSection } from "@/components/sections/nutrition-section"
import { MessagesSection } from "@/components/sections/messages-section"
import { ScheduleSection } from "@/components/sections/schedule-section"
import { ContentSection } from "@/components/sections/content-section"
import { SettingsSection } from "@/components/sections/settings-section"
import { ClientDetailSection } from "@/components/sections/client-detail-section"
import type { CoachProfile } from "@/app/actions/profile"

const sectieConfig: Record<string, { titel: string; subtitel?: string }> = {
  dashboard: { titel: "Dashboard" },
  clients: { titel: "Cliënten", subtitel: "Beheer je coaching cliënten" },
  programs: { titel: "Programma's", subtitel: "Trainingsprogramma's & workouts" },
  nutrition: { titel: "Voeding", subtitel: "Voedingsplannen & tracking" },
  messages: { titel: "Berichten", subtitel: "Cliëntcommunicatie" },
  schedule: { titel: "Agenda", subtitel: "Sessies & beschikbaarheid" },
  content: { titel: "Content", subtitel: "Bestanden & educatieve bronnen" },
  settings: { titel: "Instellingen", subtitel: "Accountvoorkeuren" },
}

interface CoachingDashboardClientProps {
  profile: CoachProfile
}

export function CoachingDashboardClient({ profile }: CoachingDashboardClientProps) {
  const [activeSectie, setActiveSectie] = useState("dashboard")
  const [geselecteerdeClientId, setGeselecteerdeClientId] = useState<string | null>(null)
  const config = sectieConfig[activeSectie] || sectieConfig.dashboard

  // Subtitel met naam voor dashboard
  const subtitel = activeSectie === "dashboard"
    ? `Welkom terug, ${profile.naam.split(' ')[0]}`
    : config.subtitel

  const handleSelectClient = (clientId: string) => {
    setGeselecteerdeClientId(clientId)
  }

  const handleTerugNaarClienten = () => {
    setGeselecteerdeClientId(null)
  }

  return (
    <SidebarProvider>
      <CoachingSidebar
        activeSection={activeSectie}
        onSectionChange={(section) => {
          setActiveSectie(section)
          setGeselecteerdeClientId(null)
        }}
        profile={profile}
      />
      <SidebarInset>
        {geselecteerdeClientId ? (
          <ClientDetailSection
            clientId={geselecteerdeClientId}
            onTerug={handleTerugNaarClienten}
          />
        ) : (
          <>
            {activeSectie !== "messages" && (
              <DashboardHeader title={config.titel} subtitle={subtitel} />
            )}
            <div className="flex-1 overflow-auto">
              {activeSectie === "dashboard" && <DashboardOverviewWithData />}
              {activeSectie === "clients" && <ClientsSectionWithData onSelectClient={handleSelectClient} />}
              {activeSectie === "programs" && <ProgramsSection />}
              {activeSectie === "nutrition" && <NutritionSection />}
              {activeSectie === "messages" && <MessagesSection />}
              {activeSectie === "schedule" && <ScheduleSection />}
              {activeSectie === "content" && <ContentSection />}
              {activeSectie === "settings" && <SettingsSection />}
            </div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
