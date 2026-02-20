"use client"

import { Plus, ChevronLeft, ChevronRight, Clock, Video, MapPin, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const dates = [24, 25, 26, 27, 28, 1, 2]
const currentDay = 2 // Wednesday index

const timeSlots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

const sessions = [
  {
    id: "1",
    title: "Sarah van Dijk",
    initials: "SD",
    type: "Check-in Call",
    startTime: "10:00",
    endTime: "10:30",
    day: 2,
    slotStart: 3,
    duration: 1,
    color: "bg-primary/15 border-primary/30 text-primary",
    mode: "video",
  },
  {
    id: "2",
    title: "Tom Bakker",
    initials: "TB",
    type: "Program Review",
    startTime: "11:30",
    endTime: "12:00",
    day: 2,
    slotStart: 4,
    duration: 1,
    color: "bg-chart-2/15 border-chart-2/30 text-chart-2",
    mode: "video",
  },
  {
    id: "3",
    title: "Group HIIT Session",
    initials: "GS",
    type: "Group Class",
    startTime: "14:00",
    endTime: "15:00",
    day: 2,
    slotStart: 7,
    duration: 2,
    color: "bg-chart-5/15 border-chart-5/30 text-chart-5",
    mode: "in-person",
  },
  {
    id: "4",
    title: "Lisa de Vries",
    initials: "LV",
    type: "Nutrition Review",
    startTime: "16:00",
    endTime: "16:30",
    day: 2,
    slotStart: 9,
    duration: 1,
    color: "bg-chart-4/15 border-chart-4/30 text-chart-4",
    mode: "video",
  },
  {
    id: "5",
    title: "Emma Jansen",
    initials: "EJ",
    type: "Initial Consult",
    startTime: "09:00",
    endTime: "10:00",
    day: 3,
    slotStart: 2,
    duration: 2,
    color: "bg-chart-3/15 border-chart-3/30 text-chart-3",
    mode: "video",
  },
  {
    id: "6",
    title: "Marco Visser",
    initials: "MV",
    type: "Progress Check",
    startTime: "07:00",
    endTime: "07:30",
    day: 4,
    slotStart: 0,
    duration: 1,
    color: "bg-primary/15 border-primary/30 text-primary",
    mode: "video",
  },
  {
    id: "7",
    title: "Open Office Hours",
    initials: "OH",
    type: "Q&A Session",
    startTime: "15:00",
    endTime: "16:00",
    day: 4,
    slotStart: 8,
    duration: 2,
    color: "bg-chart-2/15 border-chart-2/30 text-chart-2",
    mode: "video",
  },
  {
    id: "8",
    title: "Anna Groot",
    initials: "AG",
    type: "Recovery Session",
    startTime: "11:00",
    endTime: "11:45",
    day: 5,
    slotStart: 4,
    duration: 1,
    color: "bg-chart-4/15 border-chart-4/30 text-chart-4",
    mode: "in-person",
  },
]

const upcomingToday = [
  { time: "10:00", name: "Sarah van Dijk", initials: "SD", type: "Check-in Call", mode: "video" },
  { time: "11:30", name: "Tom Bakker", initials: "TB", type: "Program Review", mode: "video" },
  { time: "14:00", name: "Group HIIT", initials: "GS", type: "Group Class", mode: "in-person" },
  { time: "16:00", name: "Lisa de Vries", initials: "LV", type: "Nutrition Review", mode: "video" },
]

export function ScheduleSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Schedule</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your coaching sessions and availability</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Calendar Grid */}
        <Card className="border-border shadow-sm xl:col-span-3 overflow-hidden">
          <CardHeader className="pb-0 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">February 2026</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous week</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs border-border">
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next week</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-2" />
              {days.map((day, i) => (
                <div
                  key={day}
                  className={`flex flex-col items-center gap-0.5 p-2 ${i === currentDay ? "bg-primary/5" : ""}`}
                >
                  <span className="text-[11px] text-muted-foreground font-medium uppercase">{day}</span>
                  <span className={`text-sm font-semibold flex items-center justify-center size-7 rounded-full ${
                    i === currentDay ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}>
                    {dates[i]}
                  </span>
                </div>
              ))}
            </div>
            {/* Time grid */}
            <div className="max-h-[480px] overflow-y-auto">
              <div className="grid grid-cols-8">
                {timeSlots.map((time, timeIdx) => (
                  <div key={time} className="contents">
                    <div className="flex items-start justify-end pr-2 pt-1 h-16 border-b border-border/50">
                      <span className="text-[11px] text-muted-foreground">{time}</span>
                    </div>
                    {days.map((_, dayIdx) => {
                      const session = sessions.find(
                        (s) => s.day === dayIdx && s.slotStart === timeIdx
                      )
                      return (
                        <div
                          key={`${time}-${dayIdx}`}
                          className={`relative h-16 border-b border-r border-border/50 ${
                            dayIdx === currentDay ? "bg-primary/[0.02]" : ""
                          }`}
                        >
                          {session && (
                            <div
                              className={`absolute inset-x-0.5 top-0.5 rounded-md border px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity ${session.color}`}
                              style={{ height: `${session.duration * 64 - 4}px` }}
                            >
                              <p className="text-[11px] font-semibold truncate">{session.title}</p>
                              <p className="text-[10px] opacity-75 truncate">{session.startTime} - {session.endTime}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Agenda */}
        <div className="flex flex-col gap-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Today{"'"}s Agenda</CardTitle>
              <p className="text-xs text-muted-foreground">Wednesday, Feb 26</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {upcomingToday.map((session, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 transition-colors cursor-pointer">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {session.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{session.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{session.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-foreground">{session.time}</span>
                      {session.mode === "video" ? (
                        <Video className="size-3.5 text-primary" />
                      ) : (
                        <MapPin className="size-3.5 text-chart-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sessions this week</span>
                  <span className="text-sm font-semibold text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Hours coached</span>
                  <span className="text-sm font-semibold text-foreground">8.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Completion rate</span>
                  <span className="text-sm font-semibold text-success">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">No-shows</span>
                  <span className="text-sm font-semibold text-foreground">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
