"use client"

import { useEffect, useRef } from "react"
import { User, Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { Message, Persona } from "@/app/page"

interface ChatWindowProps {
  messages: Message[]
  selectedPersona: Persona
}

export function ChatWindow({ messages, selectedPersona }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPersonaInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Start chatting with {selectedPersona.name}</h3>
            <p className="text-muted-foreground text-sm mt-1">{selectedPersona.description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}>
          {!message.isUser && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getPersonaInitials(selectedPersona.name)}
              </AvatarFallback>
            </Avatar>
          )}

          <div className={`max-w-[70%] ${message.isUser ? "order-first" : ""}`}>
            <Card className={`${message.isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}>
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </CardContent>
            </Card>
          </div>

          {message.isUser && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="text-xs bg-secondary">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
