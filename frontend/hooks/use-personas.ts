import { useState, useCallback, useEffect } from 'react'
import { personaAPI } from '@/lib/api'
import { useLocalStorage } from './use-local-storage'
import type {
    Persona,
    CreatePersonaRequest,
    UsePersonasReturn
} from '@/types'

export function usePersonas(): UsePersonasReturn {
    // Local storage for caching (will sync with server)
    const {
        value: storedPersonas,
        setValue: setStoredPersonas,
        loading: personasLoading
    } = useLocalStorage<Persona[]>('personas', [])

    // Local storage for selected persona
    const {
        value: storedSelectedPersona,
        setValue: setStoredSelectedPersona,
        loading: selectedPersonaLoading
    } = useLocalStorage<Persona | null>('selectedPersona', null)

    const [personas, setPersonas] = useState<Persona[]>([])
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // Load personas from server on initialization
    const loadPersonas = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await personaAPI.getPersonas()

            if (response.success && response.data) {
                // Ensure the response data is an array
                const personasData = Array.isArray(response.data) ? response.data : []
                setPersonas(personasData)
                setStoredPersonas(personasData)

                // Set initial selected persona if none is selected
                if (!selectedPersona && personasData.length > 0) {
                    const defaultPersona = personasData[0]
                    setSelectedPersona(defaultPersona)
                    setStoredSelectedPersona(defaultPersona)
                }
            } else {
                throw new Error(response.error || 'Failed to load personas')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load personas'
            setError(errorMessage)
            console.error('Error loading personas:', err)

            // Fallback to cached personas if server fails
            if (storedPersonas && Array.isArray(storedPersonas) && storedPersonas.length > 0) {
                setPersonas(storedPersonas)
                if (!selectedPersona && storedPersonas.length > 0) {
                    const defaultPersona = storedPersonas[0]
                    setSelectedPersona(defaultPersona)
                }
            } else {
                // Ensure we always have an empty array as fallback
                setPersonas([])
            }
        } finally {
            setIsLoading(false)
            setIsInitialized(true)
        }
    }, [selectedPersona, storedPersonas, setStoredPersonas, setStoredSelectedPersona])

    // Initialize on mount
    useEffect(() => {
        if (!personasLoading && !selectedPersonaLoading && !isInitialized) {
            // Restore selected persona from localStorage first
            if (storedSelectedPersona) {
                setSelectedPersona(storedSelectedPersona)
            }

            // Load fresh data from server
            loadPersonas()
        }
    }, [personasLoading, selectedPersonaLoading, isInitialized, storedSelectedPersona, loadPersonas])

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

            const response = await personaAPI.createPersona(request)

            if (response.success && response.data) {
                const updatedPersonas = [...personas, response.data]
                setPersonas(updatedPersonas)
                setStoredPersonas(updatedPersonas)
            } else {
                throw new Error(response.error || 'Failed to create persona')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add persona'
            setError(errorMessage)
            console.error('Error adding persona:', err)
            throw err // Re-throw to allow caller to handle
        } finally {
            setIsLoading(false)
        }
    }, [personas, setStoredPersonas])

    // Update a persona
    const updatePersona = useCallback(async (id: string, updates: Partial<Persona>): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await personaAPI.updatePersona(id, updates)

            if (response.success && response.data) {
                const updatedPersonas = personas.map(p =>
                    p.id === id ? response.data! : p
                )
                setPersonas(updatedPersonas)
                setStoredPersonas(updatedPersonas)

                // Update selected persona if it was the one being updated
                if (selectedPersona?.id === id) {
                    const updatedSelectedPersona = response.data
                    setSelectedPersona(updatedSelectedPersona)
                    setStoredSelectedPersona(updatedSelectedPersona)
                }
            } else {
                throw new Error(response.error || 'Failed to update persona')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update persona'
            setError(errorMessage)
            console.error('Error updating persona:', err)
            throw err // Re-throw to allow caller to handle
        } finally {
            setIsLoading(false)
        }
    }, [personas, selectedPersona, setStoredPersonas, setStoredSelectedPersona])

    // Delete a persona
    const deletePersona = useCallback(async (id: string): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await personaAPI.deletePersona(id)

            if (response.success) {
                const updatedPersonas = personas.filter(p => p.id !== id)
                setPersonas(updatedPersonas)
                setStoredPersonas(updatedPersonas)

                // If the selected persona was deleted, select the first available one
                if (selectedPersona?.id === id) {
                    const newSelected = updatedPersonas.length > 0 ? updatedPersonas[0] : null
                    setSelectedPersona(newSelected)
                    setStoredSelectedPersona(newSelected)
                }
            } else {
                throw new Error(response.error || 'Failed to delete persona')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete persona'
            setError(errorMessage)
            console.error('Error deleting persona:', err)
            throw err // Re-throw to allow caller to handle
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