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
    const end = trimmed.lastIndexOf("}")
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1))
    }
    throw new Error("Failed to parse JSON from text")
  }
}