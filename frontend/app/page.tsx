"use client";

import { useState } from "react";
import { PersonaSelector } from "@/components/persona-selector";
import { ChatWindow } from "@/components/chat-window";
import { ChatInput } from "@/components/chat-input";
import AppLayout from "@/components/layout/app-layout";
import { usePersonas } from "@/hooks/use-personas";
import { useChat } from "@/hooks/use-chat";
import type { CreatePersonaRequest } from "@/types";

export default function ChatPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use custom hooks for state management
  const {
    personas,
    selectedPersona,
    isLoading: personasLoading,
    error: personasError,
    selectPersona,
    addPersona,
  } = usePersonas();

  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    sendMessage,
  } = useChat(selectedPersona.id);

  // Handle persona change with transition effect
  const handlePersonaChange = (persona: typeof selectedPersona) => {
    setIsTransitioning(true);
    setTimeout(() => {
      selectPersona(persona);
      setIsTransitioning(false);
    }, 150);
  };

  // Handle adding custom persona
  const handleAddPersona = async (personaData: CreatePersonaRequest) => {
    try {
      await addPersona(personaData);
    } catch (error) {
      console.error("Failed to add persona:", error);
      // Error handling is managed by the usePersonas hook
      throw error; // Re-throw to let PersonaSelector handle the error display
    }
  };

  // Handle sending message
  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Error handling is managed by the useChat hook
    }
  };

  // Determine overall loading state
  const isLoading = personasLoading || chatLoading;

  // Combine errors
  const error = personasError || chatError;

  return (
    <AppLayout
      title="Persona Chat"
      description="Chat with AI personas powered by advanced language models"
      loading={isLoading}
      error={error}
      showHeader={true}
      showFooter={false}
    >
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card p-4">
          <PersonaSelector
            personas={personas}
            selectedPersona={selectedPersona}
            onPersonaChange={handlePersonaChange}
            onAddPersona={handleAddPersona}
            isLoading={personasLoading}
            error={personasError}
          />
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          <div
            className={`flex-1 transition-opacity duration-150 ${
              isTransitioning ? "opacity-50" : "opacity-100"
            }`}
          >
            <ChatWindow
              messages={messages}
              selectedPersona={selectedPersona}
              isLoading={chatLoading}
            />
          </div>
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={chatLoading}
            isLoading={chatLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
