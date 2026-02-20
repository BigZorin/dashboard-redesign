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
// ROLGEBASEERDE TOEGANGSCONTROLE (VERPLICHT):
//   1. Server-side: In deze page.tsx (of een layout.tsx wrapper), haal de
//      ingelogde user op via Supabase SSR (createServerClient).
//      Check of de user.rol === "admin" in de users tabel.
//      Als NIET admin -> redirect("/") of redirect("/login").
//   2. Middleware: In proxy.js (Next.js middleware), check of routes die
//      beginnen met /admin/* een geldige admin sessie hebben.
//      Zo niet -> redirect naar coach dashboard (/).
//   3. Supabase RLS: Alle admin-specifieke tabellen (bijv. website_analytics,
//      platform_settings) moeten RLS policies hebben die alleen rows
//      teruggeven als auth.uid() overeenkomt met een user met rol "admin".
//   4. De users tabel heeft kolom "rol" met mogelijke waarden:
//      "admin" | "coach" | "client"
//   5. Coaches en clienten mogen NOOIT op /admin terechtkomen.
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
