"use client"

import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/providers/theme-provider"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      className={`p-2 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={theme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </motion.button>
  )
}
