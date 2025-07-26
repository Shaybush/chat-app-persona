import { NextRequest, NextResponse } from 'next/server'
import { CONFIG } from '@/lib/env'
import type { SendMessageRequest, SendMessageResponse, APIResponse } from '@/types'

// Rate limiting (in a real app, you'd use Redis or a database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const limit = rateLimitMap.get(ip)

    if (!limit || now > limit.resetTime) {
        // Reset or create new limit
        rateLimitMap.set(ip, {
            count: 1,
            resetTime: now + CONFIG.rateLimit.windowMs,
        })
        return true
    }

    if (limit.count >= CONFIG.rateLimit.maxRequests) {
        return false
    }

    limit.count++
    return true
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                } as APIResponse<null>,
                { status: 429 }
            )
        }

        // Parse request body
        const body: SendMessageRequest = await request.json()
        const { message, personaId, chatHistory } = body

        // Validate request
        if (!message?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Message content is required',
                } as APIResponse<null>,
                { status: 400 }
            )
        }

        if (!personaId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Persona ID is required',
                } as APIResponse<null>,
                { status: 400 }
            )
        }

        if (message.length > CONFIG.chat.maxMessageLength) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Message too long. Maximum ${CONFIG.chat.maxMessageLength} characters allowed.`,
                } as APIResponse<null>,
                { status: 400 }
            )
        }

        // TODO: In a real application, you would:
        // 1. Validate the persona exists
        // 2. Get the persona's system prompt
        // 3. Call OpenAI API with the conversation context
        // 4. Store the conversation in a database
        // 5. Handle errors and retries

        // For now, we'll return a mock response based on persona
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

        const personaResponses = responses[personaId as keyof typeof responses] || [
            "That's very interesting! Tell me more.",
            "I understand what you're saying.",
            "What do you think about that?",
            "That's a great point!",
        ]

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

        const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)]

        const aiMessage = {
            id: `ai-${Date.now()}`,
            content: randomResponse,
            isUser: false,
            timestamp: Date.now(),
            personaId,
        }

        const response: APIResponse<SendMessageResponse> = {
            success: true,
            data: {
                message: aiMessage,
                success: true,
            },
        }

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error('Chat API error:', error)

        const response: APIResponse<null> = {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        }

        return NextResponse.json(response, { status: 500 })
    }
}

export async function GET() {
    // Health check for chat API
    return NextResponse.json({
        success: true,
        data: {
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'chat-api',
        },
    })
} 