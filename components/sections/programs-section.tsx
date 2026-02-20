"use client"

import { Plus, Copy, MoreHorizontal, Clock, Users, Dumbbell, Flame, Target, Zap, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const programs = [
  {
    name: "Strength Phase 2",
    description: "Progressive overload program focused on compound lifts",
    category: "strength",
    duration: "8 weeks",
    clients: 12,
    icon: Dumbbell,
    color: "bg-chart-1/10 text-chart-1",
    sessions: 4,
    status: "active",
  },
  {
    name: "Fat Loss 12-Week",
    description: "HIIT and resistance training with caloric deficit protocols",
    category: "weight-loss",
    duration: "12 weeks",
    clients: 18,
    icon: Flame,
    color: "bg-chart-5/10 text-chart-5",
    sessions: 5,
    status: "active",
  },
  {
    name: "Contest Prep",
    description: "Advanced bodybuilding prep with periodization and peak week",
    category: "strength",
    duration: "16 weeks",
    clients: 3,
    icon: Target,
    color: "bg-chart-3/10 text-chart-3",
    sessions: 6,
    status: "active",
  },
  {
    name: "Marathon Prep",
    description: "Endurance building program with progressive mileage",
    category: "endurance",
    duration: "20 weeks",
    clients: 8,
    icon: Zap,
    color: "bg-chart-4/10 text-chart-4",
    sessions: 5,
    status: "active",
  },
  {
    name: "Wellness & Mobility",
    description: "Flexibility, mobility, and stress management routines",
    category: "wellness",
    duration: "Ongoing",
    clients: 6,
    icon: Heart,
    color: "bg-chart-2/10 text-chart-2",
    sessions: 3,
    status: "active",
  },
  {
    name: "Muscle Gain Basics",
    description: "Beginner hypertrophy program with progressive volume",
    category: "strength",
    duration: "10 weeks",
    clients: 14,
    icon: Dumbbell,
    color: "bg-chart-1/10 text-chart-1",
    sessions: 4,
    status: "active",
  },
  {
    name: "Post-natal Recovery",
    description: "Gentle recovery program for new mothers",
    category: "wellness",
    duration: "12 weeks",
    clients: 4,
    icon: Heart,
    color: "bg-chart-2/10 text-chart-2",
    sessions: 3,
    status: "draft",
  },
  {
    name: "HIIT Express",
    description: "Short, intense workouts for busy professionals",
    category: "weight-loss",
    duration: "6 weeks",
    clients: 0,
    icon: Flame,
    color: "bg-chart-5/10 text-chart-5",
    sessions: 4,
    status: "draft",
  },
]

export function ProgramsSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Programs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage training programs for your clients</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Create Program
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({programs.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({programs.filter(p => p.status === "active").length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({programs.filter(p => p.status === "draft").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.name} program={program} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.filter(p => p.status === "active").map((program) => (
              <ProgramCard key={program.name} program={program} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.filter(p => p.status === "draft").map((program) => (
              <ProgramCard key={program.name} program={program} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProgramCard({ program }: { program: typeof programs[number] }) {
  return (
    <Card className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-lg ${program.color}`}>
              <program.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{program.name}</p>
              {program.status === "draft" ? (
                <Badge variant="secondary" className="text-[10px] mt-0.5">Draft</Badge>
              ) : (
                <Badge className="bg-success/10 text-success border-success/20 text-[10px] mt-0.5">Active</Badge>
              )}
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
              <DropdownMenuItem>Edit Program</DropdownMenuItem>
              <DropdownMenuItem><Copy className="mr-2 size-4" />Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Assign to Client</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{program.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {program.duration}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {program.clients} clients
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="size-3.5" />
            {program.sessions}x/week
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
