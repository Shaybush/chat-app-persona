import { useState, useEffect, useCallback } from 'react'
import type { UseLocalStorageReturn } from '@/types'

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): UseLocalStorageReturn<T> {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [storedValue, setStoredValue] = useState<T>(initialValue)

    // Initialize value from localStorage
    useEffect(() => {
        try {
            setLoading(true)
            setError(null)

            // Check if we're on the client side
            if (typeof window === 'undefined') {
                setStoredValue(initialValue)
                setLoading(false)
                return
            }

            const item = window.localStorage.getItem(key)
            if (item) {
                const parsedValue = JSON.parse(item)
                setStoredValue(parsedValue)
            } else {
                setStoredValue(initialValue)
            }
        } catch (err) {
            console.error(`Error reading localStorage key "${key}":`, err)
            setError(err instanceof Error ? err.message : 'Failed to read from localStorage')
            setStoredValue(initialValue)
        } finally {
            setLoading(false)
        }
    }, [key]) // Remove initialValue from dependencies to prevent infinite loops

    // Return a wrapped version of useState's setter function that persists the new value to localStorage
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                setError(null)

                // Use functional update to avoid depending on storedValue
                setStoredValue((prevValue) => {
                    const valueToStore = value instanceof Function ? value(prevValue) : value

                    // Save to localStorage if on client side
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(key, JSON.stringify(valueToStore))
                    }

                    return valueToStore
                })
            } catch (err) {
                console.error(`Error setting localStorage key "${key}":`, err)
                setError(err instanceof Error ? err.message : 'Failed to write to localStorage')
            }
        },
        [key] // Remove storedValue from dependencies
    )

    // Clear the localStorage item
    const clearValue = useCallback(() => {
        try {
            setError(null)
            setStoredValue(initialValue)

            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key)
            }
        } catch (err) {
            console.error(`Error clearing localStorage key "${key}":`, err)
            setError(err instanceof Error ? err.message : 'Failed to clear localStorage')
        }
    }, [key, initialValue])

    return {
        value: storedValue,
        setValue,
        loading,
        error,
        clearValue,
    }
} 