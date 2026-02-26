"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, Send, X, Sparkles, User, Loader2, Plus, MessageSquare, Trash2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  sendAiCoachMessagePersistent,
  getAiChats,
  getAiChatMessages,
  deleteAiChat,
  type AiChatMessage,
  type AiChat,
} from "@/app/actions/ai-coach"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

interface AiCoachPanelProps {
  open: boolean
  onClose: () => void
  selectedClientId?: string
  selectedClientName?: string
}

export function AiCoachPanel({ open, onClose, selectedClientId, selectedClientName }: AiCoachPanelProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [totalTokens, setTotalTokens] = useState(0)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<AiChat[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus textarea when panel opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 200)
    }
  }, [open])

  // Load chat history when panel opens or client changes
  useEffect(() => {
    if (open) {
      loadChatHistory()
    }
  }, [open, selectedClientId])

  async function loadChatHistory() {
    const chats = await getAiChats(selectedClientId)
    setChatHistory(chats)

    // Auto-resume latest chat if exists
    if (chats.length > 0 && !activeChatId) {
      await loadChat(chats[0].id)
    }
  }

  async function loadChat(chatId: string) {
    setLoadingHistory(true)
    const msgs = await getAiChatMessages(chatId)
    setMessages(msgs)
    setActiveChatId(chatId)
    setShowHistory(false)
    setLoadingHistory(false)
  }

  function startNewChat() {
    setMessages([])
    setActiveChatId(null)
    setTotalTokens(0)
    setShowHistory(false)
  }

  async function handleDeleteChat(chatId: string) {
    await deleteAiChat(chatId)
    setChatHistory(prev => prev.filter(c => c.id !== chatId))
    if (activeChatId === chatId) {
      startNewChat()
    }
  }

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: AiChatMessage = { role: "user", content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    const result = await sendAiCoachMessagePersistent(
      activeChatId,
      trimmed,
      selectedClientId,
    )

    if (result.success && result.reply) {
      setMessages(prev => [...prev, { role: "assistant", content: result.reply! }])
      setTotalTokens(prev => prev + (result.tokensUsed || 0))
      if (result.chatId) {
        setActiveChatId(result.chatId)
      }
      // Refresh history list
      loadChatHistory()
    } else {
      setMessages(prev => [...prev, { role: "assistant", content: `Fout: ${result.error || "Onbekend"}` }])
    }

    setLoading(false)
  }, [input, loading, activeChatId, selectedClientId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!open) return null

  return (
    <div className="fixed right-0 top-0 h-full w-[420px] bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Coach</h3>
            <p className="text-[11px] text-muted-foreground">
              {selectedClientName ? `Context: ${selectedClientName}` : "Alle cliënten"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setShowHistory(!showHistory)}
            title="Chat geschiedenis"
          >
            <History className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={startNewChat}
            title="Nieuw gesprek"
          >
            <Plus className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="border-b border-border bg-secondary/30 max-h-[280px] overflow-y-auto">
          <div className="px-3 py-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Eerdere gesprekken
            </p>
            {chatHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Nog geen gesprekken</p>
            ) : (
              <div className="flex flex-col gap-1">
                {chatHistory.map(chat => (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors group ${
                      chat.id === activeChatId
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary text-foreground"
                    }`}
                    onClick={() => loadChat(chat.id)}
                  >
                    <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{chat.title || "Nieuw gesprek"}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: nl })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id) }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Hoi, ik ben je AI coach assistent</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedClientName
                  ? `Stel me vragen over ${selectedClientName} — ik houd rekening met de AI-instellingen per domein.`
                  : "Stel me vragen over je cliënten, of selecteer eerst een specifieke cliënt."}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {selectedClientName ? (
                <>
                  <SuggestionChip onClick={(t) => setInput(t)} text="Hoe doet deze cliënt het qua compliance?" />
                  <SuggestionChip onClick={(t) => setInput(t)} text="Wat zou je aanraden voor de voeding?" />
                  <SuggestionChip onClick={(t) => setInput(t)} text="Geef een samenvatting van de afgelopen week" />
                </>
              ) : (
                <>
                  <SuggestionChip onClick={(t) => setInput(t)} text="Welke cliënt heeft het meeste aandacht nodig?" />
                  <SuggestionChip onClick={(t) => setInput(t)} text="Geef een overzicht van alle compliance scores" />
                  <SuggestionChip onClick={(t) => setInput(t)} text="Zijn er rode vlaggen bij mijn cliënten?" />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                      <Bot className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <MessageContent content={msg.content} />
                </div>
                {msg.role === "user" && (
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                      <User className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <Avatar className="size-7 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    <Bot className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-xl bg-secondary px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Denkt na...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3 bg-card">
        {totalTokens > 0 && (
          <p className="text-[10px] text-muted-foreground mb-2 text-right">
            {totalTokens.toLocaleString()} tokens gebruikt
          </p>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedClientName ? `Vraag over ${selectedClientName}...` : "Stel een vraag over je cliënten..."}
            className="min-h-[40px] max-h-[120px] resize-none text-sm bg-secondary border-border"
            rows={1}
          />
          <Button
            size="icon"
            className="size-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SuggestionChip({ text, onClick }: { text: string; onClick: (text: string) => void }) {
  return (
    <button
      className="text-left text-xs px-3 py-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => onClick(text)}
    >
      {text}
    </button>
  )
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n")
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />
        const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-muted-foreground shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: boldProcessed.replace(/^[-•]\s*/, "") }} />
            </div>
          )
        }
        const numberedMatch = line.trim().match(/^(\d+)\.\s(.*)/)
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-1.5 ml-1">
              <span className="text-muted-foreground shrink-0">{numberedMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: numberedMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          )
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: boldProcessed }} />
      })}
    </div>
  )
}
