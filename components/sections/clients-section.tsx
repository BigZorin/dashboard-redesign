"use client"

import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const clients = [
  {
    name: "Sarah van Dijk",
    initials: "SD",
    email: "sarah@email.com",
    status: "active",
    program: "Strength Phase 2",
    progress: 85,
    nextSession: "Today, 10:00",
    trend: "up" as const,
    lastCheckin: "2 hrs ago",
    tags: ["Premium", "Online"],
  },
  {
    name: "Tom Bakker",
    initials: "TB",
    email: "tom@email.com",
    status: "active",
    program: "Fat Loss 12-Week",
    progress: 62,
    nextSession: "Today, 11:30",
    trend: "up" as const,
    lastCheckin: "5 hrs ago",
    tags: ["Online"],
  },
  {
    name: "Lisa de Vries",
    initials: "LV",
    email: "lisa@email.com",
    status: "active",
    program: "Contest Prep",
    progress: 94,
    nextSession: "Tomorrow, 16:00",
    trend: "up" as const,
    lastCheckin: "1 day ago",
    tags: ["Premium", "Competition"],
  },
  {
    name: "James Peters",
    initials: "JP",
    email: "james@email.com",
    status: "at-risk",
    program: "Muscle Gain Basics",
    progress: 41,
    nextSession: "Mar 3, 09:00",
    trend: "down" as const,
    lastCheckin: "4 days ago",
    tags: ["Online"],
  },
  {
    name: "Emma Jansen",
    initials: "EJ",
    email: "emma@email.com",
    status: "active",
    program: "Wellness & Mobility",
    progress: 72,
    nextSession: "Mar 2, 14:00",
    trend: "neutral" as const,
    lastCheckin: "1 day ago",
    tags: ["Hybrid"],
  },
  {
    name: "David Smit",
    initials: "DS",
    email: "david@email.com",
    status: "paused",
    program: "Strength Basics",
    progress: 30,
    nextSession: "Paused",
    trend: "neutral" as const,
    lastCheckin: "2 weeks ago",
    tags: ["Online"],
  },
  {
    name: "Anna Groot",
    initials: "AG",
    email: "anna@email.com",
    status: "active",
    program: "Post-natal Recovery",
    progress: 55,
    nextSession: "Mar 2, 11:00",
    trend: "up" as const,
    lastCheckin: "6 hrs ago",
    tags: ["Premium", "Hybrid"],
  },
  {
    name: "Marco Visser",
    initials: "MV",
    email: "marco@email.com",
    status: "active",
    program: "Marathon Prep",
    progress: 78,
    nextSession: "Mar 3, 07:00",
    trend: "up" as const,
    lastCheckin: "12 hrs ago",
    tags: ["Online"],
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20 text-[11px]">Active</Badge>
    case "at-risk":
      return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[11px]">At Risk</Badge>
    case "paused":
      return <Badge variant="secondary" className="text-[11px]">Paused</Badge>
    default:
      return null
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return <TrendingUp className="size-3.5 text-success" />
    case "down":
      return <TrendingDown className="size-3.5 text-destructive" />
    default:
      return <Minus className="size-3.5 text-muted-foreground" />
  }
}

export function ClientsSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Clients</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track your coaching clients</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Add Client
        </Button>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">All ({clients.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({clients.filter(c => c.status === "active").length})</TabsTrigger>
            <TabsTrigger value="at-risk">At Risk ({clients.filter(c => c.status === "at-risk").length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({clients.filter(c => c.status === "paused").length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search clients..." className="pl-9 h-9 w-64 bg-card border-border" />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border">
              <Filter className="size-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <ClientCard key={client.name} client={client} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clients.filter(c => c.status === "active").map((client) => (
              <ClientCard key={client.name} client={client} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="at-risk" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clients.filter(c => c.status === "at-risk").map((client) => (
              <ClientCard key={client.name} client={client} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="paused" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clients.filter(c => c.status === "paused").map((client) => (
              <ClientCard key={client.name} client={client} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ClientCard({ client }: { client: typeof clients[number] }) {
  return (
    <Card className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {client.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Mail className="mr-2 size-4" />Send Message</DropdownMenuItem>
              <DropdownMenuItem><Phone className="mr-2 size-4" />Schedule Call</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {getStatusBadge(client.status)}
            <div className="flex items-center gap-1.5">
              {getTrendIcon(client.trend)}
              <span className="text-xs text-muted-foreground">Last check-in: {client.lastCheckin}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{client.program}</span>
              <span className="font-semibold text-foreground">{client.progress}%</span>
            </div>
            <Progress value={client.progress} className="h-1.5" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">Next: {client.nextSession}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
