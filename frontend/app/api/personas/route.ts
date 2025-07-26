import { NextRequest, NextResponse } from 'next/server'
import type { CreatePersonaRequest, Persona, APIResponse } from '@/types'

// Default personas (in a real app, this would be in a database)
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

export async function GET() {
    // Get all personas
    try {
        // In a real app, you'd fetch from database
        const response: APIResponse<Persona[]> = {
            success: true,
            data: defaultPersonas,
        }

        return NextResponse.json(response, { status: 200 })
    } catch (error) {
        console.error('Personas GET error:', error)

        const response: APIResponse<null> = {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch personas',
        }

        return NextResponse.json(response, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    // Create a new persona
    try {
        const body: CreatePersonaRequest = await request.json()
        const { name, description, systemPrompt } = body

        // Validate request
        if (!name?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Persona name is required',
                } as APIResponse<null>,
                { status: 400 }
            )
        }

        if (!description?.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Persona description is required',
                } as APIResponse<null>,
                { status: 400 }
            )
        }

        // Create new persona
        const newPersona: Persona = {
            id: `custom-${Date.now()}`,
            name: name.trim(),
            description: description.trim(),
            systemPrompt: systemPrompt?.trim() || `You are ${name}. ${description}`,
            isCustom: true,
        }

        // In a real app, you'd save to database here
        // await db.personas.create(newPersona)

        const response: APIResponse<Persona> = {
            success: true,
            data: newPersona,
        }

        return NextResponse.json(response, { status: 201 })

    } catch (error) {
        console.error('Personas POST error:', error)

        const response: APIResponse<null> = {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create persona',
        }

        return NextResponse.json(response, { status: 500 })
    }
} 