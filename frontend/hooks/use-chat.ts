import { useState, useCallback, useEffect, useRef } from 'react'
import { chatAPI } from '@/lib/api'
import { useLocalStorage } from './use-local-storage'
import { CONFIG } from '@/lib/env'
import type {
    Message,
    ChatHistory,
    UseChatReturn,
    SendMessageRequest
} from '@/types'

export function useChat(personaId: string): UseChatReturn {
    // Local storage for chat history
    const {
        value: chatHistory,
        setValue: setChatHistory,
        loading: historyLoading
    } = useLocalStorage<ChatHistory>('chatHistory', {})

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Current messages for the selected persona
    const messages = chatHistory[personaId] || []

    // Ref to track if component is mounted (to avoid state updates after unmount)
    const isMountedRef = useRef(true)

    // Ref to track current chat history for API calls without dependencies
    const chatHistoryRef = useRef<ChatHistory>(chatHistory)

    // Update ref when chat history changes
    useEffect(() => {
        chatHistoryRef.current = chatHistory
    }, [chatHistory])

    useEffect(() => {
        return () => {
            isMountedRef.current = false
        }
    }, [])

    // Add a message to the chat history
    const addMessage = useCallback((message: Message) => {
        setChatHistory((prevHistory) => {
            const currentMessages = prevHistory[personaId] || []
            const updatedMessages = [...currentMessages, message]

            // Limit chat history length
            const limitedMessages = updatedMessages.slice(-CONFIG.chat.maxHistoryLength)

            return {
                ...prevHistory,
                [personaId]: limitedMessages,
            }
        })
    }, [personaId, setChatHistory])

    // Send a message
    const sendMessage = useCallback(async (content: string): Promise<void> => {
        // Validate message content
        if (!content.trim()) {
            setError('Message cannot be empty')
            return
        }

        if (content.length > CONFIG.chat.maxMessageLength) {
            setError(`Message too long. Maximum ${CONFIG.chat.maxMessageLength} characters allowed.`)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Create user message
            const userMessage: Message = {
                id: `user-${Date.now()}`,
                content: content.trim(),
                isUser: true,
                timestamp: Date.now(),
                personaId,
            }

            // Add user message immediately
            addMessage(userMessage)

            // Get current messages from ref to avoid dependency issues
            const currentMessages = chatHistoryRef.current[personaId] || []

            // Prepare API request
            const request: SendMessageRequest = {
                message: content.trim(),
                personaId,
                chatHistory: currentMessages,
            }

            // Send to real API
            const response = await chatAPI.sendMessage(request)

            // Only update state if component is still mounted
            if (!isMountedRef.current) return

            if (response.success && response.data?.message) {
                // Add AI response
                addMessage(response.data.message)
            } else {
                throw new Error(response.error || 'Failed to get AI response')
            }

        } catch (err) {
            if (!isMountedRef.current) return

            const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
            setError(errorMessage)
            console.error('Error sending message:', err)

            // Add error message to chat
            const errorMessage_: Message = {
                id: `error-${Date.now()}`,
                content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
                isUser: false,
                timestamp: Date.now(),
                personaId,
            }
            addMessage(errorMessage_)
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false)
            }
        }
    }, [personaId, addMessage])

    // Clear messages for current persona
    const clearMessages = useCallback(() => {
        setChatHistory((prevHistory) => {
            const updatedHistory = { ...prevHistory }
            delete updatedHistory[personaId]
            return updatedHistory
        })
        setError(null)
    }, [personaId, setChatHistory])

    // Clear all chat history
    const clearAllMessages = useCallback(() => {
        setChatHistory({})
        setError(null)
    }, [setChatHistory])

    // Get message statistics
    const getMessageStats = useCallback(() => {
        const userMessages = messages.filter(m => m.isUser)
        const aiMessages = messages.filter(m => !m.isUser)

        return {
            total: messages.length,
            user: userMessages.length,
            ai: aiMessages.length,
            lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
        }
    }, [messages])

    // Search messages
    const searchMessages = useCallback((query: string) => {
        if (!query.trim()) return messages

        const searchTerm = query.toLowerCase().trim()
        return messages.filter(message =>
            message.content.toLowerCase().includes(searchTerm)
        )
    }, [messages])

    // Export chat history for current persona
    const exportChat = useCallback(() => {
        const chatData = {
            personaId,
            messages,
            exportedAt: new Date().toISOString(),
            stats: getMessageStats(),
        }

        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `chat-${personaId}-${new Date().toISOString().split('T')[0]}.json`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)
    }, [personaId, messages, getMessageStats])

    return {
        messages,
        isLoading: isLoading || historyLoading,
        error,
        sendMessage,
        clearMessages,
        clearAllMessages,
        getMessageStats,
        searchMessages,
        exportChat,
    }
} 