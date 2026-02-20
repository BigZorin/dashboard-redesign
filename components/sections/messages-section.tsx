"use client"

import { useState } from "react"
import { Search, Paperclip, Send, Image, Mic, MoreVertical, Phone, Video, Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const conversations = [
  {
    id: "1",
    name: "Sarah van Dijk",
    initials: "SD",
    lastMessage: "Thanks coach! I'll try the new shoulder warm-up tomorrow",
    time: "10 min ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Tom Bakker",
    initials: "TB",
    lastMessage: "Should I still do cardio on rest days?",
    time: "32 min ago",
    unread: 1,
    online: true,
  },
  {
    id: "3",
    name: "Lisa de Vries",
    initials: "LV",
    lastMessage: "Check-in submitted! Peak week is going great",
    time: "1 hr ago",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "James Peters",
    initials: "JP",
    lastMessage: "Sorry, I missed Monday's session. Can we reschedule?",
    time: "2 hrs ago",
    unread: 1,
    online: false,
  },
  {
    id: "5",
    name: "Emma Jansen",
    initials: "EJ",
    lastMessage: "I feel so much better after the mobility work!",
    time: "3 hrs ago",
    unread: 0,
    online: true,
  },
  {
    id: "6",
    name: "Marco Visser",
    initials: "MV",
    lastMessage: "Long run done! 18km at a comfortable pace",
    time: "5 hrs ago",
    unread: 0,
    online: false,
  },
  {
    id: "7",
    name: "Anna Groot",
    initials: "AG",
    lastMessage: "The exercises are getting easier, can we progress?",
    time: "1 day ago",
    unread: 1,
    online: false,
  },
]

const chatMessages = [
  { id: "1", sender: "client", text: "Hey coach! Just finished my workout. The bench felt heavy today.", time: "09:15", read: true },
  { id: "2", sender: "coach", text: "That's normal after the deload week. Your nervous system is readjusting. How was your sleep last night?", time: "09:18", read: true },
  { id: "3", sender: "client", text: "Not great, only about 5-6 hours. My shoulder also felt a bit tight on the warm-up sets.", time: "09:20", read: true },
  { id: "4", sender: "coach", text: "Sleep can definitely impact your performance. Let's add some extra shoulder mobility work before your next pressing session. I'll update your warm-up protocol.", time: "09:22", read: true },
  { id: "5", sender: "client", text: "That would be great! Should I still hit the planned weights for Thursday?", time: "09:24", read: true },
  { id: "6", sender: "coach", text: "Yes, stick to the plan. But if the shoulder feels off during warm-up, drop the weight 10% and focus on control. Quality over ego.", time: "09:26", read: true },
  { id: "7", sender: "client", text: "Thanks coach! I'll try the new shoulder warm-up tomorrow", time: "09:30", read: false },
  { id: "8", sender: "client", text: "Also, quick question about nutrition - can I swap the rice for sweet potatoes in meal 3?", time: "09:31", read: false },
]

export function MessagesSection() {
  const [selectedChat, setSelectedChat] = useState("1")
  const selectedConversation = conversations.find((c) => c.id === selectedChat)

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversation List */}
      <div className="flex w-80 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-9 h-9 bg-secondary border-border" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 border-b border-border/50",
                  selectedChat === conversation.id && "bg-secondary"
                )}
              >
                <div className="relative">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {conversation.initials}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{conversation.name}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{conversation.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                    {conversation.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {selectedConversation?.initials}
                </AvatarFallback>
              </Avatar>
              {selectedConversation?.online && (
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-success" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedConversation?.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedConversation?.online ? "Online" : "Last seen " + selectedConversation?.time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <Phone className="size-4" />
              <span className="sr-only">Call</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <Video className="size-4" />
              <span className="sr-only">Video call</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <MoreVertical className="size-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            <div className="text-center">
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Today</span>
            </div>
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[75%]",
                  message.sender === "coach" ? "items-end ml-auto" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    message.sender === "coach"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  )}
                >
                  {message.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[11px] text-muted-foreground">{message.time}</span>
                  {message.sender === "coach" && (
                    message.read ? (
                      <CheckCheck className="size-3 text-primary" />
                    ) : (
                      <Check className="size-3 text-muted-foreground" />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground shrink-0">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground shrink-0">
              <Image className="size-4" />
              <span className="sr-only">Send image</span>
            </Button>
            <Input
              placeholder="Type your message..."
              className="flex-1 h-10 bg-secondary border-border rounded-full px-4"
            />
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground shrink-0">
              <Mic className="size-4" />
              <span className="sr-only">Voice message</span>
            </Button>
            <Button size="icon" className="size-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shrink-0">
              <Send className="size-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
