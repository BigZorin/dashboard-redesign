"use client"

import { User, Bell, Shield, Palette, Globe, CreditCard, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsSection() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <LinkIcon className="size-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">MJ</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="border-border">Change Photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">First Name</Label>
                  <Input defaultValue="Mark" className="bg-card border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">Last Name</Label>
                  <Input defaultValue="Jensen" className="bg-card border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">Email</Label>
                  <Input defaultValue="mark@coachhub.com" className="bg-card border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">Phone</Label>
                  <Input defaultValue="+31 6 12345678" className="bg-card border-border" />
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-col gap-2">
                <Label className="text-sm text-foreground">Bio</Label>
                <textarea
                  className="min-h-24 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="Certified fitness coach specializing in strength training and body composition. 8+ years of experience helping clients achieve their fitness goals."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" className="border-border">Cancel</Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {[
                { title: "New Check-in Received", description: "Get notified when a client submits a check-in", enabled: true },
                { title: "New Message", description: "Get notified for new client messages", enabled: true },
                { title: "Session Reminder", description: "Reminder 15 minutes before scheduled sessions", enabled: true },
                { title: "Payment Received", description: "Notification when a client payment is processed", enabled: true },
                { title: "Client Milestone", description: "When a client reaches a program milestone", enabled: false },
                { title: "Weekly Report", description: "Receive a weekly business summary email", enabled: true },
                { title: "Marketing Updates", description: "Platform news and feature announcements", enabled: false },
              ].map((notification) => (
                <div key={notification.title} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                  </div>
                  <Switch defaultChecked={notification.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Connected Services</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { name: "Google Calendar", description: "Sync your coaching sessions", connected: true, icon: "GC" },
                { name: "Stripe", description: "Process client payments", connected: true, icon: "ST" },
                { name: "Zoom", description: "Video call integration for sessions", connected: true, icon: "ZM" },
                { name: "MyFitnessPal", description: "Import client nutrition data", connected: false, icon: "MF" },
                { name: "Apple Health", description: "Sync client health metrics", connected: false, icon: "AH" },
                { name: "Zapier", description: "Connect to 5000+ apps", connected: false, icon: "ZP" },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                      {integration.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  {integration.connected ? (
                    <Button variant="outline" size="sm" className="border-border text-muted-foreground">
                      Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Connect
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
