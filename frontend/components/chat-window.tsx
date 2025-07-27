"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdvancedLoadingDots } from "@/components/ui/advanced-loading-dots";
import type { Message, Persona } from "@/types";

interface ChatWindowProps {
  messages: Message[];
  selectedPersona: Persona | null;
  isLoading?: boolean;
}

export function ChatWindow({
  messages,
  selectedPersona,
  isLoading = false,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedPersona) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">
            Select a persona to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedPersona.avatarUrl} />
            <AvatarFallback>
              {selectedPersona.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{selectedPersona.name}</h2>
              {selectedPersona.isCustom && (
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedPersona.description}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-4">
                <AvatarImage src={selectedPersona.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {selectedPersona.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold mb-2">
                Chat with {selectedPersona.name}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {selectedPersona.systemPrompt}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isUser && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={selectedPersona.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {selectedPersona.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={`max-w-[70%] ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
                {message.isUser && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={selectedPersona.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {selectedPersona.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <AdvancedLoadingDots
                      variant="wave"
                      size="default"
                      color="blue"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
