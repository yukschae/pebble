"use client"

import { createContext, useContext } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

type ThemeProviderState = {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "dark",
  setTheme: () => null,
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // 常にダークモードを強制
  props.forcedTheme = "dark"

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  // テーマ切り替え機能は無効化し、常にダークモードを返す
  return {
    theme: "dark",
    setTheme: () => null,
    // 互換性のためにtoggleThemeも提供
    toggleTheme: () => null,
  }
}
