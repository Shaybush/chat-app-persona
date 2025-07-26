import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { CONFIG } from './env'
import type {
    APIResponse,
    SendMessageRequest,
    SendMessageResponse,
    CreatePersonaRequest,
    Persona
} from '@/types'

// Extend the AxiosRequestConfig to include our metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    metadata?: {
        startTime: Date
    }
}

class ApiClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: CONFIG.api.baseUrl,
            timeout: CONFIG.api.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Request interceptor
        this.client.interceptors.request.use(
            (config: ExtendedAxiosRequestConfig) => {
                // Add auth tokens, request ID, etc. here if needed
                if (CONFIG.openai.apiKey && config.url?.includes('/chat')) {
                    config.headers = config.headers || {}
                    config.headers['Authorization'] = `Bearer ${CONFIG.openai.apiKey}`
                }

                // Add request timestamp for debugging
                config.metadata = { startTime: new Date() }

                return config
            },
            (error) => {
                console.error('Request interceptor error:', error)
                return Promise.reject(error)
            }
        )

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                // Log response time in development
                const config = response.config as ExtendedAxiosRequestConfig
                if (config.metadata?.startTime) {
                    const duration = new Date().getTime() - config.metadata.startTime.getTime()
                    console.log(`API call to ${config.url} took ${duration}ms`)
                }

                return response
            },
            (error: AxiosError) => {
                // Handle common errors
                if (error.response?.status === 401) {
                    // Handle unauthorized
                    console.error('Unauthorized access')
                }

                if (error.response?.status === 429) {
                    // Handle rate limiting
                    console.warn('Rate limit exceeded')
                }

                if (error.code === 'ECONNABORTED') {
                    console.error('Request timeout')
                }

                return Promise.reject(this.handleError(error))
            }
        )
    }

    private handleError<T>(error: AxiosError): APIResponse<T> {
        if (error.response) {
            // Server responded with error status
            const responseData = error.response.data as any
            return {
                success: false,
                error: responseData?.message || responseData?.error || error.message || 'Server error',
                data: undefined as T,
            }
        } else if (error.request) {
            // Request made but no response
            return {
                success: false,
                error: 'Network error - no response from server',
                data: undefined as T,
            }
        } else {
            // Something else happened
            return {
                success: false,
                error: error.message || 'Unknown error occurred',
                data: undefined as T,
            }
        }
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        url: string,
        data?: any
    ): Promise<APIResponse<T>> {
        try {
            const response = await this.client.request({
                method,
                url,
                data,
            })

            return {
                success: true,
                data: response.data,
            }
        } catch (error) {
            return this.handleError<T>(error as AxiosError)
        }
    }

    // Chat API methods
    async sendMessage(request: SendMessageRequest): Promise<APIResponse<SendMessageResponse>> {
        return this.request<SendMessageResponse>('POST', '/chat', request)
    }

    async getChatHistory(personaId: string): Promise<APIResponse<any>> {
        return this.request('GET', `/chat/history/${personaId}`)
    }

    async clearChatHistory(personaId: string): Promise<APIResponse<any>> {
        return this.request('DELETE', `/chat/history/${personaId}`)
    }

    // Persona API methods
    async getPersonas(): Promise<APIResponse<Persona[]>> {
        return this.request<Persona[]>('GET', '/personas')
    }

    async createPersona(request: CreatePersonaRequest): Promise<APIResponse<Persona>> {
        return this.request<Persona>('POST', '/personas', request)
    }

    async updatePersona(id: string, updates: Partial<Persona>): Promise<APIResponse<Persona>> {
        return this.request<Persona>('PUT', `/personas/${id}`, updates)
    }

    async deletePersona(id: string): Promise<APIResponse<any>> {
        return this.request('DELETE', `/personas/${id}`)
    }

    // Health check
    async healthCheck(): Promise<APIResponse<{ status: string; timestamp: string }>> {
        return this.request('GET', '/health')
    }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export individual API functions for convenience
export const chatAPI = {
    sendMessage: apiClient.sendMessage.bind(apiClient),
    getChatHistory: apiClient.getChatHistory.bind(apiClient),
    clearChatHistory: apiClient.clearChatHistory.bind(apiClient),
}

export const personaAPI = {
    getPersonas: apiClient.getPersonas.bind(apiClient),
    createPersona: apiClient.createPersona.bind(apiClient),
    updatePersona: apiClient.updatePersona.bind(apiClient),
    deletePersona: apiClient.deletePersona.bind(apiClient),
}

export const systemAPI = {
    healthCheck: apiClient.healthCheck.bind(apiClient),
}

// Mock functions for development (when no backend is available)
export const mockAPI = {
    async sendMessage(request: SendMessageRequest): Promise<APIResponse<SendMessageResponse>> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

        // Mock response based on persona
        const responses = {
            yoda: [
                "Hmm, interesting this is. Much to learn, you still have.",
                "Patience, young one. The Force will guide you.",
                "Do or do not, there is no try.",
                "Strong with the Force, you are becoming.",
            ],
            'steve-jobs': [
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

        const personaResponses = responses[request.personaId as keyof typeof responses] || [
            "That's very interesting! Tell me more.",
            "I understand what you're saying.",
            "What do you think about that?",
            "That's a great point!",
        ]

        const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)]

        return {
            success: true,
            data: {
                message: {
                    id: Date.now().toString(),
                    content: randomResponse,
                    isUser: false,
                    timestamp: Date.now(),
                    personaId: request.personaId,
                },
                success: true,
            },
        }
    },
}

export default apiClient 