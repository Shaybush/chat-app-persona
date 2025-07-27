"use client";

import { useState } from "react";
import { PersonaSelector } from "@/components/persona-selector";
import { ChatWindow } from "@/components/chat-window";
import { ChatInput } from "@/components/chat-input";
import AppLayout from "@/components/layout/app-layout";
import { usePersonas } from "@/hooks/use-personas";
import { useChat } from "@/hooks/use-chat";
import type { CreatePersonaRequest, Persona } from "@/types";

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

  // Only initialize chat hook when we have a selected persona
  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    sendMessage,
  } = useChat(selectedPersona?.id || "");

  // Handle persona change with transition effect
  const handlePersonaChange = (persona: Persona) => {
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
    if (!selectedPersona) return;

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

  // Show loading state while personas are loading
  if (personasLoading) {
    return (
      <AppLayout
        title="Persona Chat"
        description="Chat with AI personas powered by advanced language models"
        error={error}
        showHeader={true}
        showFooter={false}
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading personas...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state if no personas could be loaded
  if (!selectedPersona && personas.length === 0 && !personasLoading) {
    return (
      <AppLayout
        title="Persona Chat"
        description="Chat with AI personas powered by advanced language models"
        error={error}
        showHeader={true}
        showFooter={false}
      >
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              No personas available. Please check your connection and try again.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Persona Chat"
      description="Chat with AI personas powered by advanced language models"
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
          {selectedPersona ? (
            <>
              <div
                className={`flex-1 transition-opacity duration-150 h-[calc(100vh-190px)] ${
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
                disabled={chatLoading || !selectedPersona}
                isLoading={chatLoading}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Select a persona to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
