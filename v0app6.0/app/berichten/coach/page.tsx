"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Send, Paperclip, Mic } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "coach"
  time: string
  read?: boolean
}

const initialMessages: Message[] = [
  { id: "1", text: "Hey Michael, hoe gaat het met je training?", sender: "coach", time: "18:19" },
  { id: "2", text: "Jaa goed!", sender: "user", time: "18:19", read: true },
  { id: "3", text: "Mooi zo! Ik heb een video voor je klaargezet met wat tips voor je deadlift techniek.", sender: "coach", time: "18:23" },
  { id: "4", text: "Goeiemorgen", sender: "user", time: "08:17", read: true },
  { id: "5", text: "Goeiemorgen!", sender: "coach", time: "08:18" },
  { id: "6", text: "Ik krijg jouw response niet binnen?", sender: "user", time: "08:18", read: true },
  { id: "7", text: "Dat zou goed kunnen", sender: "coach", time: "08:18" },
  { id: "8", text: "Probeer nog een keer", sender: "coach", time: "08:19" },
  { id: "9", text: "goedemorgen zonnestraal", sender: "coach", time: "08:24" },
]

export default function CoachChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }
    setMessages((prev) => [...prev, newMsg])
    setInput("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group consecutive messages from same sender
  const groupedMessages: { messages: Message[]; sender: "user" | "coach" }[] = []
  messages.forEach((msg) => {
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup && lastGroup.sender === msg.sender) {
      lastGroup.messages.push(msg)
    } else {
      groupedMessages.push({ sender: msg.sender, messages: [msg] })
    }
  })

  return (
    <div className="h-dvh bg-background max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 pt-14 pb-3 border-b border-border bg-background">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <Image
              src="/images/avatar-michael.jpg"
              alt="Coach"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">Zorin Wijnands</h2>
          <p className="text-[11px] text-emerald-400">Online</p>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {groupedMessages.map((group, gi) => (
          <div key={gi} className={`flex gap-2 ${group.sender === "user" ? "justify-end" : "justify-start"}`}>
            {/* Coach avatar */}
            {group.sender === "coach" && (
              <div className="shrink-0 self-end mb-5">
                <div className="h-7 w-7 rounded-full overflow-hidden">
                  <Image
                    src="/images/avatar-michael.jpg"
                    alt="Coach"
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}

            <div className={`flex flex-col gap-1 max-w-[75%] ${group.sender === "user" ? "items-end" : "items-start"}`}>
              {group.messages.map((msg, mi) => {
                const isFirst = mi === 0
                const isLast = mi === group.messages.length - 1

                return (
                  <div key={msg.id} className="flex flex-col">
                    <div
                      className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#bad4e1]/20 text-foreground"
                          : "bg-card border border-border text-foreground"
                      } ${
                        msg.sender === "user"
                          ? `${isFirst ? "rounded-t-2xl" : "rounded-t-lg"} ${isLast ? "rounded-bl-2xl rounded-br-md" : "rounded-b-lg"} rounded-l-2xl`
                          : `${isFirst ? "rounded-t-2xl" : "rounded-t-lg"} ${isLast ? "rounded-br-2xl rounded-bl-md" : "rounded-b-lg"} rounded-r-2xl`
                      }`}
                    >
                      {msg.text}
                    </div>
                    {isLast && (
                      <span className={`text-[10px] text-muted-foreground mt-1 flex items-center gap-1 ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}>
                        {msg.time}
                        {msg.sender === "user" && msg.read && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#bad4e1]">
                            <path d="M2 13l5 5L18 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 13l5 5L24 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 pb-8 pt-3 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 transition-colors hover:bg-secondary/80">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex-1 flex items-center bg-card border border-border rounded-xl px-4 py-2.5">
            <input
              ref={inputRef}
              type="text"
              placeholder="Typ een bericht..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {input.trim() ? (
            <button
              onClick={handleSend}
              className="h-10 w-10 rounded-xl bg-[#bad4e1] flex items-center justify-center shrink-0 transition-all hover:bg-[#bad4e1]/80 active:scale-95"
            >
              <Send className="h-4 w-4 text-[#0a0b0f]" />
            </button>
          ) : (
            <button className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 transition-colors hover:bg-secondary/80">
              <Mic className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
