export interface Persona {
    id: string
    name: string
    description: string
    systemPrompt: string
    avatarUrl?: string
    isCustom?: boolean
    createdAt?: string
    updatedAt?: string
    createdById?: string | null
}

export interface Message {
    id: string
    content: string
    isUser: boolean
    timestamp: number
    personaId?: string
}

export interface ChatHistory {
    [personaId: string]: Message[]
}

export interface CreatePersonaRequest {
    name: string
    description: string
    systemPrompt?: string
}

export interface SendMessageRequest {
    message: string
    personaId: string
    chatHistory: Message[]
}

export interface SendMessageResponse {
    message: Message
    success: boolean
    error?: string
}

export interface APIResponse<T> {
    data?: T
    success: boolean
    error?: string
    message?: string
}

// Chat-related types
export type ChatState = 'idle' | 'loading' | 'error'

// UI Component Props
export interface BaseComponentProps {
    className?: string
    children?: React.ReactNode
}

// Hook return types
export interface UseChatReturn {
    messages: Message[]
    isLoading: boolean
    error: string | null
    sendMessage: (message: string) => Promise<void>
    clearMessages: () => void
    clearAllMessages: () => void
    getMessageStats: () => {
        total: number
        user: number
        ai: number
        lastActivity: number | null
    }
    searchMessages: (query: string) => Message[]
    exportChat: () => void
}

export interface UsePersonasReturn {
    personas: Persona[]
    selectedPersona: Persona | null
    isLoading: boolean
    error: string | null
    selectPersona: (persona: Persona) => void
    addPersona: (persona: CreatePersonaRequest) => Promise<void>
    updatePersona: (id: string, updates: Partial<Persona>) => Promise<void>
    deletePersona: (id: string) => Promise<void>
}

export interface UseLocalStorageReturn<T> {
    value: T
    setValue: (value: T | ((prev: T) => T)) => void
    loading: boolean
    error: string | null
    clearValue: () => void
} 