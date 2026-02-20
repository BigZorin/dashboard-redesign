"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CoachingSidebar } from "@/components/coaching-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardOverview } from "@/components/sections/dashboard-overview"
import { ClientsSection } from "@/components/sections/clients-section"
import { ProgramsSection } from "@/components/sections/programs-section"
import { NutritionSection } from "@/components/sections/nutrition-section"
import { MessagesSection } from "@/components/sections/messages-section"
import { ScheduleSection } from "@/components/sections/schedule-section"
import { ContentSection } from "@/components/sections/content-section"
import { AnalyticsSection } from "@/components/sections/analytics-section"
import { BillingSection } from "@/components/sections/billing-section"
import { SettingsSection } from "@/components/sections/settings-section"

// ============================================================================
// SECTIE CONFIGURATIE — Titels en subtitels per navigatie-sectie
// Vervang "Mark" met de naam van de ingelogde coach
// ============================================================================
const sectieConfig: Record<string, { titel: string; subtitel?: string }> = {
  dashboard: { titel: "Dashboard", subtitel: "Welkom terug, Mark" },
  clients: { titel: "Cliënten", subtitel: "Beheer je coaching cliënten" },
  programs: { titel: "Programma's", subtitel: "Trainingsprogramma's & workouts" },
  nutrition: { titel: "Voeding", subtitel: "Voedingsplannen & tracking" },
  messages: { titel: "Berichten", subtitel: "Cliëntcommunicatie" },
  schedule: { titel: "Agenda", subtitel: "Sessies & beschikbaarheid" },
  content: { titel: "Contentbibliotheek", subtitel: "Educatieve bronnen" },
  analytics: { titel: "Statistieken", subtitel: "Bedrijfsprestaties" },
  billing: { titel: "Facturatie", subtitel: "Betalingen & abonnementen" },
  settings: { titel: "Instellingen", subtitel: "Accountvoorkeuren" },
}

export default function CoachingDashboard() {
  const [activeSectie, setActiveSectie] = useState("dashboard")
  const config = sectieConfig[activeSectie] || sectieConfig.dashboard

  return (
    <SidebarProvider>
      <CoachingSidebar activeSection={activeSectie} onSectionChange={setActiveSectie} />
      <SidebarInset>
        {activeSectie !== "messages" && (
          <DashboardHeader title={config.titel} subtitle={config.subtitel} />
        )}
        <div className="flex-1 overflow-auto">
          {activeSectie === "dashboard" && <DashboardOverview />}
          {activeSectie === "clients" && <ClientsSection />}
          {activeSectie === "programs" && <ProgramsSection />}
          {activeSectie === "nutrition" && <NutritionSection />}
          {activeSectie === "messages" && <MessagesSection />}
          {activeSectie === "schedule" && <ScheduleSection />}
          {activeSectie === "content" && <ContentSection />}
          {activeSectie === "analytics" && <AnalyticsSection />}
          {activeSectie === "billing" && <BillingSection />}
          {activeSectie === "settings" && <SettingsSection />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
