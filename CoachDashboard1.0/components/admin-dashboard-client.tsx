"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { WebsiteAnalytics } from "@/components/admin/website-analytics"
import { GebruikersSection } from "@/components/admin/gebruikers-section"
import { ClientsBeheerSection } from "@/components/admin/clients-beheer-section"
import { CoursesSection } from "@/components/admin/courses-section"
import { AnalyticsSection } from "@/components/sections/analytics-section"
import { BillingSection } from "@/components/sections/billing-section"
import type { CoachProfile } from "@/app/actions/profile"

const sectieConfig: Record<string, { titel: string; subtitel?: string }> = {
  overview: { titel: "Admin Dashboard", subtitel: "Platform overzicht" },
  analytics: { titel: "Website Analytics", subtitel: "Bezoekers & conversies" },
  gebruikers: { titel: "Gebruikers", subtitel: "Rollen & toegangsbeheer" },
  clients: { titel: "Clients", subtitel: "Goedkeuring & coach toewijzing" },
  courses: { titel: "Courses", subtitel: "E-learning cursussen" },
  statistieken: { titel: "Statistieken", subtitel: "Bedrijfsprestaties" },
  facturatie: { titel: "Facturatie", subtitel: "Betalingen & abonnementen" },
}

interface AdminDashboardClientProps {
  profile: CoachProfile
}

export function AdminDashboardClient({ profile }: AdminDashboardClientProps) {
  const [activeSectie, setActiveSectie] = useState("overview")
  const config = sectieConfig[activeSectie] || sectieConfig.overview

  return (
    <SidebarProvider>
      <AdminSidebar
        activeSection={activeSectie}
        onSectionChange={setActiveSectie}
        profile={profile}
      />
      <SidebarInset>
        <DashboardHeader title={config.titel} subtitle={config.subtitel} />
        <div className="flex-1 overflow-auto">
          {activeSectie === "overview" && <AdminDashboard />}
          {activeSectie === "analytics" && <WebsiteAnalytics />}
          {activeSectie === "gebruikers" && <GebruikersSection />}
          {activeSectie === "clients" && <ClientsBeheerSection />}
          {activeSectie === "courses" && <CoursesSection />}
          {activeSectie === "statistieken" && <AnalyticsSection />}
          {activeSectie === "facturatie" && <BillingSection />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
