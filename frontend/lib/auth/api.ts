import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { CONFIG } from '../env'
import type {
    APIResponse,
} from '@/types'

// Extend the AxiosRequestConfig to include our metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    metadata?: {
        startTime: Date
    }
}

export class ApiClient {
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

    protected handleError<T>(error: AxiosError): APIResponse<T> {
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

    protected async request<T>(
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

            // Handle server response format: { success: boolean, data: T, error?: string }
            const serverResponse = response.data

            // Check if response has the expected format
            if (typeof serverResponse === 'object' && serverResponse !== null) {
                if ('success' in serverResponse) {
                    // Standard API response format
                    if (serverResponse.success) {
                        return {
                            success: true,
                            data: serverResponse.data,
                        }
                    } else {
                        return {
                            success: false,
                            error: serverResponse.error || 'Server returned error',
                            data: undefined as T,
                        }
                    }
                } else {
                    // Legacy/direct response format - treat as successful data
                    return {
                        success: true,
                        data: serverResponse as T,
                    }
                }
            } else {
                // Unexpected response format
                return {
                    success: false,
                    error: 'Unexpected response format from server',
                    data: undefined as T,
                }
            }
        } catch (error) {
            return this.handleError<T>(error as AxiosError)
        }
    }
}