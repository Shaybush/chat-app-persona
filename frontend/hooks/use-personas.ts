import { useState, useCallback, useEffect } from 'react'
import { personaAPI } from '@/lib/api'
import { useLocalStorage } from './use-local-storage'
import type {
    Persona,
    CreatePersonaRequest,
    UsePersonasReturn
} from '@/types'

// Default personas
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

export function usePersonas(): UsePersonasReturn {
    // Local storage for personas
    const {
        value: storedPersonas,
        setValue: setStoredPersonas,
        loading: personasLoading
    } = useLocalStorage<Persona[]>('personas', defaultPersonas)

    // Local storage for selected persona
    const {
        value: storedSelectedPersona,
        setValue: setStoredSelectedPersona,
        loading: selectedPersonaLoading
    } = useLocalStorage<Persona>('selectedPersona', defaultPersonas[0])

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Initialize personas state
    const [personas, setPersonas] = useState<Persona[]>(defaultPersonas)
    const [selectedPersona, setSelectedPersona] = useState<Persona>(defaultPersonas[0])

    // Sync with localStorage when loaded
    useEffect(() => {
        if (!personasLoading && storedPersonas) {
            setPersonas(storedPersonas)
        }
    }, [personasLoading, storedPersonas])

    useEffect(() => {
        if (!selectedPersonaLoading && storedSelectedPersona) {
            setSelectedPersona(storedSelectedPersona)
        }
    }, [selectedPersonaLoading, storedSelectedPersona])

    // Select a persona
    const selectPersona = useCallback((persona: Persona) => {
        setSelectedPersona(persona)
        setStoredSelectedPersona(persona)
    }, [setStoredSelectedPersona])

    // Add a new persona
    const addPersona = useCallback(async (request: CreatePersonaRequest): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            // Create the persona object
            const newPersona: Persona = {
                id: `custom-${Date.now()}`,
                name: request.name.trim(),
                description: request.description.trim(),
                systemPrompt: request.systemPrompt?.trim() || `You are ${request.name}. ${request.description}`,
                isCustom: true,
            }

            // In a real app, you'd call the API here
            // const response = await personaAPI.createPersona(request)
            // if (response.success && response.data) {
            //   const updatedPersonas = [...personas, response.data]
            //   setPersonas(updatedPersonas)
            //   setStoredPersonas(updatedPersonas)
            // } else {
            //   throw new Error(response.error || 'Failed to create persona')
            // }

            // For now, just add locally
            const updatedPersonas = [...personas, newPersona]
            setPersonas(updatedPersonas)
            setStoredPersonas(updatedPersonas)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add persona'
            setError(errorMessage)
            console.error('Error adding persona:', err)
        } finally {
            setIsLoading(false)
        }
    }, [personas, setStoredPersonas])

    // Update a persona
    const updatePersona = useCallback(async (id: string, updates: Partial<Persona>): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            // In a real app, you'd call the API here
            // const response = await personaAPI.updatePersona(id, updates)
            // if (response.success && response.data) {
            //   const updatedPersonas = personas.map(p => 
            //     p.id === id ? { ...p, ...response.data } : p
            //   )
            //   setPersonas(updatedPersonas)
            //   setStoredPersonas(updatedPersonas)
            // } else {
            //   throw new Error(response.error || 'Failed to update persona')
            // }

            // For now, just update locally
            const updatedPersonas = personas.map(p =>
                p.id === id ? { ...p, ...updates } : p
            )
            setPersonas(updatedPersonas)
            setStoredPersonas(updatedPersonas)

            // Update selected persona if it was the one being updated
            if (selectedPersona.id === id) {
                const updatedSelectedPersona = { ...selectedPersona, ...updates }
                setSelectedPersona(updatedSelectedPersona)
                setStoredSelectedPersona(updatedSelectedPersona)
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update persona'
            setError(errorMessage)
            console.error('Error updating persona:', err)
        } finally {
            setIsLoading(false)
        }
    }, [personas, selectedPersona, setStoredPersonas, setStoredSelectedPersona])

    // Delete a persona
    const deletePersona = useCallback(async (id: string): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            // Don't allow deleting default personas
            const personaToDelete = personas.find(p => p.id === id)
            if (!personaToDelete?.isCustom) {
                throw new Error('Cannot delete default personas')
            }

            // In a real app, you'd call the API here
            // const response = await personaAPI.deletePersona(id)
            // if (response.success) {
            //   const updatedPersonas = personas.filter(p => p.id !== id)
            //   setPersonas(updatedPersonas)
            //   setStoredPersonas(updatedPersonas)
            // } else {
            //   throw new Error(response.error || 'Failed to delete persona')
            // }

            // For now, just delete locally
            const updatedPersonas = personas.filter(p => p.id !== id)
            setPersonas(updatedPersonas)
            setStoredPersonas(updatedPersonas)

            // If the selected persona was deleted, select the first available one
            if (selectedPersona.id === id) {
                const newSelected = updatedPersonas[0] || defaultPersonas[0]
                setSelectedPersona(newSelected)
                setStoredSelectedPersona(newSelected)
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete persona'
            setError(errorMessage)
            console.error('Error deleting persona:', err)
        } finally {
            setIsLoading(false)
        }
    }, [personas, selectedPersona, setStoredPersonas, setStoredSelectedPersona])

    return {
        personas,
        selectedPersona,
        isLoading: isLoading || personasLoading || selectedPersonaLoading,
        error,
        selectPersona,
        addPersona,
        updatePersona,
        deletePersona,
    }
} 