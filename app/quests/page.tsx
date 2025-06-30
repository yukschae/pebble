"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  MessageCircle,
  ChevronDown,
  Star,
  CheckCircle,
  Rocket,
  Satellite,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { getUserQuests, useAuthContext } from "@/lib/supabase"
import { PLANET_TYPES } from "@/lib/space-rpg-system"

interface QuestPlanet {
  id: number
  title: string
  description: string
  actions: string[]
  outcome: string
  completed: boolean
  current: boolean
  position: { x: number; y: number }
  planetType: keyof typeof PLANET_TYPES
}

const POSITIONS = [
  { x: 10, y: 20 },
  { x: 30, y: 35 },
  { x: 50, y: 50 },
  { x: 70, y: 35 },
  { x: 90, y: 20 },
]

function Planet2D({ planet, isSelected, onClick, status }: {
  planet: QuestPlanet
  isSelected: boolean
  onClick: () => void
  status: string
}) {
  const planetType = PLANET_TYPES[planet.planetType] || PLANET_TYPES.exploration

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: `${planet.position.x}%`, top: `${planet.position.y}%`, transform: "translate(-50%, -50%)" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 rounded-full blur-xl w-20 h-20 -translate-x-2 -translate-y-2"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      />
      <motion.div
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${planetType.color} flex items-center justify-center border border-white/20`}
        animate={{
          boxShadow:
            isSelected
              ? `0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.2)`
              : status === "current"
                ? `0 0 20px rgba(255, 215, 0, 0.5)`
                : `0 4px 15px rgba(0,0,0,0.3)`,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xl">{planetType.emoji}</div>
        {status === "completed" && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center border-2 border-white">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
        {status === "current" && (
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Rocket className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isSelected ? 1 : 0.9, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xs text-white whitespace-nowrap">{planet.title}</div>
      </motion.div>
    </motion.div>
  )
}

function PlanetPath({ from, to, isActive }: { from: QuestPlanet; to: QuestPlanet; isActive: boolean }) {
  const pathLength = Math.sqrt(Math.pow(to.position.x - from.position.x, 2) + Math.pow(to.position.y - from.position.y, 2))
  const angle = Math.atan2(to.position.y - from.position.y, to.position.x - from.position.x) * (180 / Math.PI)
  return (
    <div
      className="absolute"
      style={{ left: `${from.position.x}%`, top: `${from.position.y}%`, width: `${pathLength}%`, height: "4px", transform: `rotate(${angle}deg)`, transformOrigin: "0 50%" }}
    >
      <motion.div
        className={`h-full rounded-full ${isActive ? "bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500" : "bg-gray-600/50"}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0.3 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  )
}

export default function QuestMapPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [quests, setQuests] = useState<QuestPlanet[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    getUserQuests(user.id)
      .then((qs) => {
        const mapped = qs.map((q, idx) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          actions: q.actions,
          outcome: q.outcome,
          completed: q.completed,
          current: q.current,
          position: POSITIONS[idx % POSITIONS.length],
          planetType: (q.planet as keyof typeof PLANET_TYPES) || "exploration",
        }))
        setQuests(mapped)
        const current = mapped.find((p) => p.current)
        if (current) setSelected(current.id)
      })
      .catch((err) => console.error("Error loading quests", err))
  }, [user])

  const completedCount = quests.filter((q) => q.completed).length

  const getStatus = (q: QuestPlanet) => {
    if (q.completed) return "completed"
    if (q.current) return "current"
    if (q.id <= completedCount + 2) return "available"
    return "locked"
  }

  const handleWarp = (id: number) => {
    const quest = quests.find((q) => q.id === id)
    if (quest?.current) router.push(`/quest-reflection/${id}`)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      <motion.div
        className="w-72 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 z-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-xl shadow-lg flex items-center">
            <span className="text-xl mr-2">🛰️</span>
            <span className="font-bold">クエストマップ</span>
          </div>
        </div>
        <div className="px-6 space-y-2">
          <motion.div className="flex items-center p-3 rounded-xl text-gray-300 hover:bg-white/5 transition" whileHover={{ x: 5 }} onClick={() => router.push("/dashboard")}> <Home className="w-5 h-5 mr-2" />ダッシュボード </motion.div>
          <motion.div className="flex items-center p-3 rounded-xl text-gray-300 hover:bg-white/5 transition" whileHover={{ x: 5 }} onClick={() => router.push("/ai-chat")}> <MessageCircle className="w-5 h-5 mr-2" />AIとチャット </motion.div>
          <motion.div className="flex items-center p-3 rounded-xl text-gray-300 hover:bg-white/5 transition" whileHover={{ x: 5 }} onClick={() => router.push("/quests")}> <Star className="w-5 h-5 mr-2" />クエスト一覧 </motion.div>
          <motion.div className="flex items-center p-3 rounded-xl text-gray-300 hover:bg-white/5 transition" whileHover={{ x: 5 }} onClick={() => router.push("/quests/map")}> <Rocket className="w-5 h-5 mr-2" />マップ </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
        <div className="relative w-full h-full">
          {quests.map((q, idx) => {
            if (idx === 0) return null
            const prev = quests[idx - 1]
            return <PlanetPath key={`path-${q.id}`} from={prev} to={q} isActive={prev.completed} />
          })}
          {quests.map((planet) => (
            <Planet2D
              key={planet.id}
              planet={planet}
              isSelected={selected === planet.id}
              onClick={() => {
                const status = getStatus(planet)
                if (status !== "locked") setSelected(selected === planet.id ? null : planet.id)
              }}
              status={getStatus(planet)}
            />
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900/90 backdrop-blur-xl border-l border-white/10 z-30 overflow-y-auto"
            >
              {(() => {
                const p = quests.find((pl) => pl.id === selected)
                if (!p) return null
                const status = getStatus(p)
                const pt = PLANET_TYPES[p.planetType]
                return (
                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pt.color} flex items-center justify-center mr-4 border border-white/20`}>
                          {status === "completed" ? <CheckCircle className="w-7 h-7 text-white" /> : pt.emoji}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{p.title}</h3>
                          <p className="text-sm text-gray-300">{pt.name}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                        <ChevronDown className="w-4 h-4 rotate-90" />
                      </button>
                    </div>
                    <p className="text-gray-200">{p.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2">行動例</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                        {p.actions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">成果物</h4>
                      <p className="text-sm text-gray-300">{p.outcome}</p>
                    </div>
                    {status === "current" && (
                      <motion.button
                        onClick={() => handleWarp(p.id)}
                        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Rocket className="w-5 h-5 mr-2" /> このクエストに取り組む
                      </motion.button>
                    )}
                    {status === "completed" && (
                      <div className="bg-green-900/40 border border-green-500/30 rounded-xl p-4 text-green-300 text-sm">完了済みのクエストです</div>
                    )}
                    {status === "locked" && (
                      <div className="bg-gray-800/40 border border-white/20 rounded-xl p-4 text-gray-400 text-sm">このクエストはまだ解放されていません</div>
                    )}
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}