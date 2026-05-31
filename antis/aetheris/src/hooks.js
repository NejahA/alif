import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading localStorage', error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error writing localStorage', error)
    }
  }

  return [storedValue, setValue]
}

export function useHackerKeys(handlers) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger if typing in an input (except for specific escape/enter logic)
      const isInput = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA'
      
      const key = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey

      if (isInput && key !== 'escape' && key !== 'enter') return

      if (handlers[key]) {
        handlers[key](event)
      } else if (ctrl && handlers[`ctrl+${key}`]) {
        handlers[`ctrl+${key}`](event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
