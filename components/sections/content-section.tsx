"use client"

import { Plus, Search, Video, FileText, Image, Play, Clock, Eye, MoreHorizontal, Upload, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const contentItems = [
  {
    title: "Proper Squat Form Guide",
    type: "video",
    icon: Video,
    duration: "8:24",
    views: 342,
    category: "Exercise Guides",
    dateAdded: "2 days ago",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    title: "Macro Counting for Beginners",
    type: "article",
    icon: FileText,
    duration: "5 min read",
    views: 528,
    category: "Nutrition",
    dateAdded: "5 days ago",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    title: "Bench Press Progression",
    type: "video",
    icon: Video,
    duration: "12:05",
    views: 891,
    category: "Exercise Guides",
    dateAdded: "1 week ago",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    title: "Pre-Workout Meal Ideas",
    type: "article",
    icon: FileText,
    duration: "3 min read",
    views: 267,
    category: "Nutrition",
    dateAdded: "1 week ago",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    title: "Hip Mobility Routine",
    type: "video",
    icon: Video,
    duration: "15:30",
    views: 445,
    category: "Mobility",
    dateAdded: "2 weeks ago",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    title: "Sleep Optimization Tips",
    type: "article",
    icon: FileText,
    duration: "4 min read",
    views: 612,
    category: "Lifestyle",
    dateAdded: "2 weeks ago",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    title: "Deadlift Setup Checklist",
    type: "image",
    icon: Image,
    duration: "Infographic",
    views: 198,
    category: "Exercise Guides",
    dateAdded: "3 weeks ago",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    title: "Rest Day Active Recovery",
    type: "video",
    icon: Video,
    duration: "10:15",
    views: 312,
    category: "Recovery",
    dateAdded: "3 weeks ago",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    title: "Protein Sources Comparison",
    type: "image",
    icon: Image,
    duration: "Infographic",
    views: 445,
    category: "Nutrition",
    dateAdded: "1 month ago",
    color: "bg-chart-2/10 text-chart-2",
  },
]

export function ContentSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Content Library</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage educational content for your clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border">
            <Upload className="size-4" />
            Upload
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="size-4" />
            Create Content
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search content..." className="pl-9 h-9 bg-card border-border" />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2 border-border">
          <Filter className="size-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({contentItems.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({contentItems.filter(c => c.type === "video").length})</TabsTrigger>
          <TabsTrigger value="articles">Articles ({contentItems.filter(c => c.type === "article").length})</TabsTrigger>
          <TabsTrigger value="images">Images ({contentItems.filter(c => c.type === "image").length})</TabsTrigger>
        </TabsList>

        {["all", "videos", "articles", "images"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contentItems
                .filter((item) => tab === "all" || (tab === "videos" && item.type === "video") || (tab === "articles" && item.type === "article") || (tab === "images" && item.type === "image"))
                .map((item) => (
                  <Card key={item.title} className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-10 items-center justify-center rounded-lg ${item.color}`}>
                            {item.type === "video" ? (
                              <Play className="size-5" />
                            ) : (
                              <item.icon className="size-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{item.title}</p>
                            <Badge variant="outline" className="text-[10px] mt-1 border-border text-muted-foreground">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground shrink-0">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Share with Client</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {item.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="size-3" />
                          {item.views} views
                        </div>
                        <span>{item.dateAdded}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
