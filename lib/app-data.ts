import fs from "fs"
import path from "path"

export type PassionShuttle = {
  title: string
  description: string
  tags: string[]
  progress: number
}

export type Quest = {
  id: number
  title: string
  completed: boolean
  current: boolean
  description: string
  actions: string[]
  outcome: string
  funRating: number
  confidenceRating?: number
  color: string
  planet: string
}

export type User = {
  name: string
  level: number
  riasecTypes: string[]
  oceanTypes: { name: string; score: number }[]
  monsterLevel: number
  xp: number
  xpMax: number
}

export type AppData = {
  passionShuttle: PassionShuttle
  quests: Quest[]
  user: User
}

export function getAppData(): AppData {
  const filePath = path.join(process.cwd(), "data/app-data.json")
  const fileContents = fs.readFileSync(filePath, "utf8")
  return JSON.parse(fileContents) as AppData
}

export function getCurrentQuest(): Quest | undefined {
  const appData = getAppData()
  return appData.quests.find((quest) => quest.current)
}

export function getQuestById(id: number): Quest | undefined {
  const appData = getAppData()
  return appData.quests.find((quest) => quest.id === id)
}
