"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { WebsiteAnalytics } from "@/components/admin/website-analytics"
import { GebruikersSection } from "@/components/admin/gebruikers-section"
import { ClientsBeheerSection } from "@/components/admin/clients-beheer-section"
import { ContentSection } from "@/components/sections/content-section"
import { AnalyticsSection } from "@/components/sections/analytics-section"
import { BillingSection } from "@/components/sections/billing-section"

// ============================================================================
// ADMIN DASHBOARD — Alleen toegankelijk voor gebruikers met rol "admin"
//
// Toegangscontrole:
//   - Supabase RLS policies op admin-specifieke tabellen
//   - Middleware check: als user.rol !== "admin" -> redirect naar /
//   - Server-side check in layout.tsx of page.tsx (met Supabase SSR)
//
// Secties:
//   - Overzicht: Admin KPI's (coaches, clienten, omzet, retentie)
//   - Website Analytics: Bezoekers, calculator stats, leads, contact
//   - Gebruikers: Rollenbeheer (Admin/Coach/Client)
//   - Clients: Goedkeuring, afwijzing, coach toewijzing
//   - Content: Contentbibliotheek (hergebruikt van coach dashboard)
//   - Statistieken: Business analytics (hergebruikt van coach dashboard)
//   - Facturatie: Betalingen & abonnementen (hergebruikt van coach dashboard)
// ============================================================================

const sectieConfig: Record<string, { titel: string; subtitel?: string }> = {
  overview: { titel: "Admin Dashboard", subtitel: "Platform overzicht" },
  analytics: { titel: "Website Analytics", subtitel: "Bezoekers & conversies" },
  gebruikers: { titel: "Gebruikers", subtitel: "Rollen & toegangsbeheer" },
  clients: { titel: "Clients", subtitel: "Goedkeuring & coach toewijzing" },
  content: { titel: "Contentbibliotheek", subtitel: "Educatieve bronnen" },
  statistieken: { titel: "Statistieken", subtitel: "Bedrijfsprestaties" },
  facturatie: { titel: "Facturatie", subtitel: "Betalingen & abonnementen" },
}

export default function AdminPage() {
  const [activeSectie, setActiveSectie] = useState("overview")
  const config = sectieConfig[activeSectie] || sectieConfig.overview

  return (
    <SidebarProvider>
      <AdminSidebar activeSection={activeSectie} onSectionChange={setActiveSectie} />
      <SidebarInset>
        <DashboardHeader title={config.titel} subtitle={config.subtitel} />
        <div className="flex-1 overflow-auto">
          {activeSectie === "overview" && <AdminDashboard />}
          {activeSectie === "analytics" && <WebsiteAnalytics />}
          {activeSectie === "gebruikers" && <GebruikersSection />}
          {activeSectie === "clients" && <ClientsBeheerSection />}
          {activeSectie === "content" && <ContentSection />}
          {activeSectie === "statistieken" && <AnalyticsSection />}
          {activeSectie === "facturatie" && <BillingSection />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
