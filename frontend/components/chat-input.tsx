"use client";

import React, { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AdvancedLoadingDots } from "@/components/ui/advanced-loading-dots";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  isLoading = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!message.trim() || disabled || isLoading) return;

    const messageToSend = message.trim();
    setMessage(""); // Clear immediately for better UX

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      // Error is handled by the parent component
      // Restore message if sending failed
      setMessage(messageToSend);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-[20px] max-h-32 resize-none"
          rows={1}
        />
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || isLoading}
          size="icon"
          className="h-10 w-10 flex-shrink-0"
        >
          {isLoading ? (
            <AdvancedLoadingDots variant="pulse" size="small" color="gray" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}
