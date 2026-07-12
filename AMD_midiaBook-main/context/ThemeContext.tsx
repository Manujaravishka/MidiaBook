import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { Colors, DarkColors, ThemeColors } from '../constants/theme'

interface ThemeContextType {
  isDark: boolean
  colors: ThemeColors
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: Colors,
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemScheme === 'dark')

  useEffect(() => {
    setIsDark(systemScheme === 'dark')
  }, [systemScheme])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  const colors = isDark ? DarkColors : Colors

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
