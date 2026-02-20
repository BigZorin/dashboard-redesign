"use client"

import { TrendingUp, Users, DollarSign, Star, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const revenueMonthly = [
  { month: "Aug", revenue: 2800, clients: 38 },
  { month: "Sep", revenue: 3200, clients: 40 },
  { month: "Oct", revenue: 3800, clients: 42 },
  { month: "Nov", revenue: 4100, clients: 44 },
  { month: "Dec", revenue: 3900, clients: 43 },
  { month: "Jan", revenue: 4600, clients: 46 },
  { month: "Feb", revenue: 5240, clients: 48 },
]

const retentionData = [
  { month: "Aug", rate: 88 },
  { month: "Sep", rate: 90 },
  { month: "Oct", rate: 87 },
  { month: "Nov", rate: 92 },
  { month: "Dec", rate: 89 },
  { month: "Jan", rate: 93 },
  { month: "Feb", rate: 94 },
]

const programDistribution = [
  { name: "Strength", value: 28, color: "oklch(0.55 0.15 160)" },
  { name: "Fat Loss", value: 32, color: "oklch(0.55 0.2 30)" },
  { name: "Endurance", value: 15, color: "oklch(0.6 0.12 200)" },
  { name: "Wellness", value: 14, color: "oklch(0.7 0.15 80)" },
  { name: "Other", value: 11, color: "oklch(0.65 0.1 260)" },
]

const clientEngagement = [
  { day: "Mon", checkins: 32, messages: 45 },
  { day: "Tue", checkins: 38, messages: 52 },
  { day: "Wed", checkins: 28, messages: 48 },
  { day: "Thu", checkins: 35, messages: 40 },
  { day: "Fri", checkins: 42, messages: 55 },
  { day: "Sat", checkins: 20, messages: 25 },
  { day: "Sun", checkins: 12, messages: 18 },
]

const kpiCards = [
  {
    title: "Monthly Revenue",
    value: "$5,240",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Client Retention",
    value: "94%",
    change: "+1.1%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Avg. Client Value",
    value: "$109",
    change: "+$4",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "Client Satisfaction",
    value: "4.8/5",
    change: "+0.2",
    trend: "up" as const,
    icon: Star,
  },
]

export function AnalyticsSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Track your business performance and client engagement</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="size-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-success">
                  <ArrowUpRight className="size-3" />
                  {kpi.change}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Revenue Trend</CardTitle>
                <p className="text-xs text-muted-foreground">Monthly revenue over time</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueMonthly}>
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.005 240)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.15 160)" strokeWidth={2} fill="url(#analyticsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Client Retention Rate</CardTitle>
                <p className="text-xs text-muted-foreground">Monthly retention percentage</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={retentionData}>
                    <defs>
                      <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.005 240)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Retention"]}
                    />
                    <Area type="monotone" dataKey="rate" stroke="oklch(0.6 0.12 200)" strokeWidth={2} fill="url(#retentionGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Weekly Client Engagement</CardTitle>
              <p className="text-xs text-muted-foreground">Check-ins and messages per day</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clientEngagement} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.91 0.005 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="checkins" name="Check-ins" fill="oklch(0.55 0.15 160)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="messages" name="Messages" fill="oklch(0.6 0.12 200)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Program Distribution</CardTitle>
                <p className="text-xs text-muted-foreground">Client distribution across program types</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={programDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {programDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.005 240)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Share"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-foreground ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Program Performance</CardTitle>
                <p className="text-xs text-muted-foreground">Completion and satisfaction metrics</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {[
                    { name: "Strength Phase 2", completion: 85, satisfaction: 4.9, clients: 12 },
                    { name: "Fat Loss 12-Week", completion: 72, satisfaction: 4.7, clients: 18 },
                    { name: "Contest Prep", completion: 94, satisfaction: 5.0, clients: 3 },
                    { name: "Marathon Prep", completion: 78, satisfaction: 4.6, clients: 8 },
                    { name: "Wellness & Mobility", completion: 68, satisfaction: 4.8, clients: 6 },
                  ].map((program) => (
                    <div key={program.name} className="flex items-center gap-4 rounded-lg border border-border p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{program.name}</p>
                        <p className="text-xs text-muted-foreground">{program.clients} clients</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Completion</p>
                          <p className="text-sm font-semibold text-foreground">{program.completion}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="size-3 text-chart-4 fill-chart-4" />
                            <span className="text-sm font-semibold text-foreground">{program.satisfaction}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
