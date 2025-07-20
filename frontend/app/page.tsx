"use client"

import { useState, useEffect } from "react"
import { PersonaSelector } from "@/components/persona-selector"
import { ChatWindow } from "@/components/chat-window"
import { ChatInput } from "@/components/chat-input"

export interface Persona {
  id: string
  name: string
  description: string
  systemPrompt: string
  isCustom?: boolean
}

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: number
}

const defaultPersonas: Persona[] = [
  {
    id: "yoda",
    name: "Yoda",
    description: "Wise Jedi Master",
    systemPrompt:
      'You are Yoda from Star Wars. Speak in Yoda\'s distinctive syntax, with wisdom and patience. Use "hmm" and "yes" often, and reference the Force when appropriate.',
  },
  {
    id: "steve-jobs",
    name: "Steve Jobs",
    description: "Apple Co-founder & Visionary",
    systemPrompt:
      "You are Steve Jobs, the co-founder of Apple. Speak with passion about innovation, design, and thinking different. Be direct, inspiring, and focus on simplicity and excellence.",
  },
  {
    id: "grandma",
    name: "My Grandma",
    description: "Loving & Caring Grandmother",
    systemPrompt:
      "You are a loving, caring grandmother. Speak warmly and offer comfort, wisdom, and unconditional love. Share stories, give advice, and always be supportive and nurturing.",
  },
]

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>(defaultPersonas)
  const [selectedPersona, setSelectedPersona] = useState<Persona>(defaultPersonas[0])
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({})
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPersonas = localStorage.getItem("personas")
    const savedSelectedPersona = localStorage.getItem("selectedPersona")
    const savedChatHistory = localStorage.getItem("chatHistory")

    if (savedPersonas) {
      const parsedPersonas = JSON.parse(savedPersonas)
      setPersonas(parsedPersonas)
    }

    if (savedSelectedPersona) {
      const parsedSelectedPersona = JSON.parse(savedSelectedPersona)
      setSelectedPersona(parsedSelectedPersona)
    }

    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory))
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("personas", JSON.stringify(personas))
  }, [personas])

  useEffect(() => {
    localStorage.setItem("selectedPersona", JSON.stringify(selectedPersona))
  }, [selectedPersona])

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory))
  }, [chatHistory])

  const handlePersonaChange = (persona: Persona) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedPersona(persona)
      setIsTransitioning(false)
    }, 150)
  }

  const addCustomPersona = (persona: Persona) => {
    setPersonas((prev) => [...prev, persona])
  }

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: Date.now(),
    }

    setChatHistory((prev) => ({
      ...prev,
      [selectedPersona.id]: [...(prev[selectedPersona.id] || []), newMessage],
    }))
  }

  const handleSendMessage = (message: string) => {
    // Add user message
    addMessage(message, true)

    // Simulate AI response (in a real app, this would call an AI API)
    setTimeout(
      () => {
        const responses = {
          yoda: [
            "Hmm, interesting this is. Much to learn, you still have.",
            "Patience, young one. The Force will guide you.",
            "Do or do not, there is no try.",
            "Strong with the Force, you are becoming.",
          ],
          "steve-jobs": [
            "That's exactly the kind of thinking that changes everything.",
            "Innovation distinguishes between a leader and a follower.",
            "Stay hungry, stay foolish.",
            "Think different. That's what makes all the difference.",
          ],
          grandma: [
            "Oh sweetie, that reminds me of when you were little!",
            "You know, dear, everything happens for a reason.",
            "Have you been eating enough? You look thin in your photos!",
            "I'm so proud of you, my dear. You're doing wonderfully.",
          ],
        }

        const personaResponses = responses[selectedPersona.id as keyof typeof responses] || [
          "That's very interesting! Tell me more.",
          "I understand what you're saying.",
          "What do you think about that?",
          "That's a great point!",
        ]

        const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)]
        addMessage(randomResponse, false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const currentMessages = chatHistory[selectedPersona.id] || []

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Persona Chat</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card p-4">
          <PersonaSelector
            personas={personas}
            selectedPersona={selectedPersona}
            onPersonaChange={handlePersonaChange}
            onAddPersona={addCustomPersona}
          />
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          <div className={`flex-1 transition-opacity duration-150 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
            <ChatWindow messages={currentMessages} selectedPersona={selectedPersona} />
          </div>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}
