"use client"

import { Users, TrendingUp, MessageCircle, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const revenueData = [
  { month: "Sep", revenue: 3200 },
  { month: "Oct", revenue: 3800 },
  { month: "Nov", revenue: 4100 },
  { month: "Dec", revenue: 3900 },
  { month: "Jan", revenue: 4600 },
  { month: "Feb", revenue: 5200 },
]

const clientActivityData = [
  { day: "Mon", checkins: 18, workouts: 22 },
  { day: "Tue", checkins: 24, workouts: 19 },
  { day: "Wed", checkins: 12, workouts: 26 },
  { day: "Thu", checkins: 20, workouts: 21 },
  { day: "Fri", checkins: 28, workouts: 18 },
  { day: "Sat", checkins: 15, workouts: 30 },
  { day: "Sun", checkins: 8, workouts: 14 },
]

const statCards = [
  {
    title: "Active Clients",
    value: "48",
    change: "+4",
    trend: "up" as const,
    icon: Users,
    description: "vs. last month",
  },
  {
    title: "Monthly Revenue",
    value: "$5,240",
    change: "+12.5%",
    trend: "up" as const,
    icon: TrendingUp,
    description: "vs. last month",
  },
  {
    title: "Unread Messages",
    value: "5",
    change: "-3",
    trend: "down" as const,
    icon: MessageCircle,
    description: "vs. yesterday",
  },
  {
    title: "Sessions This Week",
    value: "12",
    change: "+2",
    trend: "up" as const,
    icon: CalendarDays,
    description: "vs. last week",
  },
]

const recentCheckins = [
  { name: "Sarah van Dijk", initials: "SD", time: "10 min ago", status: "completed", note: "Feeling strong, hit new PR" },
  { name: "Tom Bakker", initials: "TB", time: "32 min ago", status: "needs-review", note: "Struggling with shoulder mobility" },
  { name: "Lisa de Vries", initials: "LV", time: "1 hr ago", status: "completed", note: "Diet on track, weight dropping" },
  { name: "James Peters", initials: "JP", time: "2 hrs ago", status: "needs-review", note: "Missed 2 workouts this week" },
  { name: "Emma Jansen", initials: "EJ", time: "3 hrs ago", status: "completed", note: "Great progress on endurance" },
]

const upcomingSessions = [
  { name: "Sarah van Dijk", initials: "SD", time: "10:00", type: "Check-in Call" },
  { name: "Tom Bakker", initials: "TB", time: "11:30", type: "Program Review" },
  { name: "Group Session", initials: "GS", time: "14:00", type: "HIIT Class" },
  { name: "Lisa de Vries", initials: "LV", time: "16:00", type: "Nutrition Review" },
]

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="size-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-success" : "text-muted-foreground"
                }`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Revenue Overview</CardTitle>
            <p className="text-xs text-muted-foreground">Monthly revenue trend</p>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.15 160)" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Client Activity</CardTitle>
            <p className="text-xs text-muted-foreground">Check-ins & workouts this week</p>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={clientActivityData} barGap={4}>
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
                <Bar dataKey="workouts" name="Workouts" fill="oklch(0.6 0.12 200)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Recent Check-ins */}
        <Card className="border-border shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Recent Check-ins</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest client updates</p>
              </div>
              <Badge variant="secondary" className="text-xs font-medium bg-secondary text-secondary-foreground">
                {recentCheckins.filter(c => c.status === "needs-review").length} need review
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col gap-1">
              {recentCheckins.map((checkin) => (
                <div
                  key={checkin.name}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50 cursor-pointer"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {checkin.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{checkin.name}</p>
                      {checkin.status === "needs-review" ? (
                        <AlertCircle className="size-3.5 text-warning shrink-0" />
                      ) : (
                        <CheckCircle2 className="size-3.5 text-success shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{checkin.note}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="size-3" />
                    {checkin.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Today{"'"}s Schedule</CardTitle>
            <p className="text-xs text-muted-foreground">Upcoming sessions</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {upcomingSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-foreground">{session.time}</span>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {session.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.name}</p>
                    <p className="text-xs text-muted-foreground">{session.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Progress Snapshot */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Client Progress Snapshot</CardTitle>
          <p className="text-xs text-muted-foreground">Program completion this month</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Sarah van Dijk", initials: "SD", progress: 85, program: "Strength Phase 2" },
              { name: "Tom Bakker", initials: "TB", progress: 62, program: "Fat Loss 12-Week" },
              { name: "Lisa de Vries", initials: "LV", progress: 94, program: "Contest Prep" },
              { name: "James Peters", initials: "JP", progress: 41, program: "Muscle Gain Basics" },
            ].map((client) => (
              <div key={client.name} className="flex flex-col gap-3 rounded-lg border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {client.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.program}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">{client.progress}%</span>
                  </div>
                  <Progress value={client.progress} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
