"use client"

import { Plus, MoreHorizontal, Apple, Beef, Egg, Salad, Coffee, Utensils, Copy, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mealPlans = [
  {
    name: "High Protein Lean",
    description: "High protein, moderate carb plan for muscle gain with lean sources",
    calories: 2400,
    protein: 200,
    carbs: 250,
    fat: 70,
    clients: 8,
    status: "active",
  },
  {
    name: "Fat Loss Deficit",
    description: "Caloric deficit plan with focus on satiety and micronutrients",
    calories: 1800,
    protein: 160,
    carbs: 150,
    fat: 60,
    clients: 14,
    status: "active",
  },
  {
    name: "Contest Prep Peak",
    description: "Competition prep diet with carb cycling and water manipulation",
    calories: 2000,
    protein: 220,
    carbs: 180,
    fat: 45,
    clients: 3,
    status: "active",
  },
  {
    name: "Endurance Fuel",
    description: "High carb plan optimized for endurance training and recovery",
    calories: 2800,
    protein: 140,
    carbs: 380,
    fat: 75,
    clients: 6,
    status: "active",
  },
  {
    name: "Maintenance Balance",
    description: "Balanced maintenance plan for general health and wellbeing",
    calories: 2200,
    protein: 150,
    carbs: 260,
    fat: 72,
    clients: 10,
    status: "draft",
  },
]

const clientNutritionTracking = [
  { name: "Sarah van Dijk", initials: "SD", plan: "High Protein Lean", adherence: 92, caloriesAvg: 2380, trend: "on-track" },
  { name: "Tom Bakker", initials: "TB", plan: "Fat Loss Deficit", adherence: 75, caloriesAvg: 2050, trend: "over" },
  { name: "Lisa de Vries", initials: "LV", plan: "Contest Prep Peak", adherence: 98, caloriesAvg: 1990, trend: "on-track" },
  { name: "James Peters", initials: "JP", plan: "High Protein Lean", adherence: 58, caloriesAvg: 2800, trend: "over" },
  { name: "Emma Jansen", initials: "EJ", plan: "Maintenance Balance", adherence: 84, caloriesAvg: 2250, trend: "on-track" },
  { name: "Marco Visser", initials: "MV", plan: "Endurance Fuel", adherence: 88, caloriesAvg: 2760, trend: "on-track" },
]

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}g</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function NutritionSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Nutrition</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage meal plans and track client nutrition</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Create Meal Plan
        </Button>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Meal Plans</TabsTrigger>
          <TabsTrigger value="tracking">Client Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mealPlans.map((plan) => (
              <Card key={plan.name} className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
                        <Utensils className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{plan.name}</p>
                        {plan.status === "draft" ? (
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
                        <DropdownMenuItem>Edit Plan</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="mr-2 size-4" />Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Assign to Client</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{plan.description}</p>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{plan.calories} kcal</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="size-3.5" />
                      {plan.clients} clients
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <MacroBar label="Protein" value={plan.protein} max={250} color="bg-chart-1" />
                    <MacroBar label="Carbs" value={plan.carbs} max={400} color="bg-chart-4" />
                    <MacroBar label="Fat" value={plan.fat} max={100} color="bg-chart-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Client Nutrition Adherence</CardTitle>
              <p className="text-xs text-muted-foreground">Weekly averages and tracking compliance</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {clientNutritionTracking.map((client) => (
                  <div
                    key={client.name}
                    className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {client.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.plan}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Avg. Calories</p>
                        <p className="text-sm font-medium text-foreground">{client.caloriesAvg} kcal</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-28">
                        <div className="flex justify-between w-full text-xs">
                          <span className="text-muted-foreground">Adherence</span>
                          <span className={`font-semibold ${client.adherence >= 80 ? "text-success" : client.adherence >= 60 ? "text-warning-foreground" : "text-destructive"}`}>
                            {client.adherence}%
                          </span>
                        </div>
                        <Progress value={client.adherence} className="h-1.5" />
                      </div>
                    </div>
                    {client.trend === "over" ? (
                      <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[11px] hidden lg:flex">Over Target</Badge>
                    ) : (
                      <Badge className="bg-success/10 text-success border-success/20 text-[11px] hidden lg:flex">On Track</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
