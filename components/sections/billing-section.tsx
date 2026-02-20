"use client"

import { CreditCard, DollarSign, Users, ArrowUpRight, Download, Receipt, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const billingStats = [
  { title: "Monthly Revenue", value: "$5,240", change: "+12.5%", icon: DollarSign },
  { title: "Active Subscriptions", value: "42", change: "+3", icon: Users },
  { title: "Avg. Client Value", value: "$109/mo", change: "+$4", icon: CreditCard },
  { title: "Outstanding", value: "$320", change: "2 invoices", icon: Receipt },
]

const recentPayments = [
  { name: "Sarah van Dijk", initials: "SD", amount: "$149", plan: "Premium Monthly", date: "Feb 20, 2026", status: "paid" },
  { name: "Tom Bakker", initials: "TB", amount: "$89", plan: "Standard Monthly", date: "Feb 20, 2026", status: "paid" },
  { name: "Lisa de Vries", initials: "LV", amount: "$199", plan: "Competition Prep", date: "Feb 19, 2026", status: "paid" },
  { name: "James Peters", initials: "JP", amount: "$89", plan: "Standard Monthly", date: "Feb 18, 2026", status: "overdue" },
  { name: "Emma Jansen", initials: "EJ", amount: "$119", plan: "Premium Monthly", date: "Feb 18, 2026", status: "paid" },
  { name: "Marco Visser", initials: "MV", amount: "$89", plan: "Standard Monthly", date: "Feb 17, 2026", status: "paid" },
  { name: "Anna Groot", initials: "AG", amount: "$149", plan: "Premium Monthly", date: "Feb 15, 2026", status: "paid" },
  { name: "David Smit", initials: "DS", amount: "$89", plan: "Standard Monthly", date: "Feb 10, 2026", status: "pending" },
]

const subscriptionPlans = [
  { name: "Standard Monthly", price: "$89/mo", clients: 22, features: ["Workout Programs", "Basic Nutrition", "Weekly Check-in", "Chat Support"] },
  { name: "Premium Monthly", price: "$149/mo", clients: 15, features: ["Custom Workouts", "Full Nutrition Plan", "2x Weekly Check-in", "Video Calls", "Priority Support"] },
  { name: "Competition Prep", price: "$199/mo", clients: 3, features: ["Daily Coaching", "Competition Diet", "Posing Guidance", "Daily Check-in", "24/7 Support"] },
]

function getPaymentStatus(status: string) {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-success/10 text-success border-success/20 text-[11px] gap-1">
          <CheckCircle2 className="size-3" />
          Paid
        </Badge>
      )
    case "overdue":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] gap-1">
          <AlertCircle className="size-3" />
          Overdue
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[11px] gap-1">
          <Clock className="size-3" />
          Pending
        </Badge>
      )
    default:
      return null
  }
}

export function BillingSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Billing</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage payments, subscriptions, and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border">
            <Download className="size-4" />
            Export
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Receipt className="size-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Billing Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {billingStats.map((stat) => (
          <Card key={stat.title} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="size-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-success">
                  <ArrowUpRight className="size-3" />
                  {stat.change}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Client</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Plan</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Amount</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                {payment.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">{payment.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{payment.plan}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-foreground">{payment.amount}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{payment.date}</td>
                        <td className="px-6 py-3">{getPaymentStatus(payment.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.name} className="border-border shadow-sm hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                      <p className="text-2xl font-bold text-primary mt-1">{plan.price}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.clients} active clients</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full border-border mt-2">
                      Edit Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
