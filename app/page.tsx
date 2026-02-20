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

const sectionConfig: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back, Mark" },
  clients: { title: "Clients", subtitle: "Manage your coaching clients" },
  programs: { title: "Programs", subtitle: "Training programs & workouts" },
  nutrition: { title: "Nutrition", subtitle: "Meal plans & tracking" },
  messages: { title: "Messages", subtitle: "Client communication" },
  schedule: { title: "Schedule", subtitle: "Sessions & availability" },
  content: { title: "Content Library", subtitle: "Educational resources" },
  analytics: { title: "Analytics", subtitle: "Business performance" },
  billing: { title: "Billing", subtitle: "Payments & subscriptions" },
  settings: { title: "Settings", subtitle: "Account preferences" },
}

export default function CoachingDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const config = sectionConfig[activeSection] || sectionConfig.dashboard

  return (
    <SidebarProvider>
      <CoachingSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <SidebarInset>
        {activeSection !== "messages" && (
          <DashboardHeader title={config.title} subtitle={config.subtitle} />
        )}
        <div className="flex-1 overflow-auto">
          {activeSection === "dashboard" && <DashboardOverview />}
          {activeSection === "clients" && <ClientsSection />}
          {activeSection === "programs" && <ProgramsSection />}
          {activeSection === "nutrition" && <NutritionSection />}
          {activeSection === "messages" && <MessagesSection />}
          {activeSection === "schedule" && <ScheduleSection />}
          {activeSection === "content" && <ContentSection />}
          {activeSection === "analytics" && <AnalyticsSection />}
          {activeSection === "billing" && <BillingSection />}
          {activeSection === "settings" && <SettingsSection />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
