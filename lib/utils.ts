import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



/**
 * Attempt to parse JSON from an AI response. The response may include
 * surrounding text or a fenced code block. This helper extracts the first
 * JSON object found in the string and parses it.
 */
export function parseJsonSafe(text: string) {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const fenceMatch = trimmed.match(/```json([\s\S]*?)```/i)
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim())
      } catch {}
    }

    const start = trimmed.indexOf("{")
    if (start !== -1) {
      let depth = 0
      let inString = false
      let escape = false
      for (let i = start; i < trimmed.length; i++) {
        const ch = trimmed[i]
        if (escape) {
          escape = false
          continue
        }
        if (ch === "\\") {
          escape = true
          continue
        }
        if (ch === '"') {
          inString = !inString
          continue
        }
        if (!inString) {
          if (ch === "{") depth++
          else if (ch === "}") {
            depth--
            if (depth === 0) {
              const candidate = trimmed.slice(start, i + 1)
              try {
                return JSON.parse(candidate)
              } catch {}
              break
            }
          }
        }
      }
    }
    throw new Error("Failed to parse JSON from text")
  }
}