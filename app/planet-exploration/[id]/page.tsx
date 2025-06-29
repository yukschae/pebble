"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/supabase"
import { calculateEnergyGain, checkEarnedSpaceBadges, generateSpaceStory, PlanetQuest } from "@/lib/space-rpg-system"

export default function PlanetExplorationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [phase, setPhase] = useState(1)
  const [form, setForm] = useState<Partial<PlanetQuest>>({})
  const [showCelebration, setShowCelebration] = useState(false)

  const handleNext = () => setPhase((p) => p + 1)

  const handleComplete = () => {
    if (!user) return
    const quest: PlanetQuest = {
      id: undefined,
      user_id: user.id,
      planet_id: Number(params.id),
      planet_name: form.planet_name || "未知の惑星",
      planet_description: form.planet_description || "",
      planet_type: "exploration",
      expected_success_rate: form.expected_success_rate || 0,
      expected_excitement: form.expected_excitement || 0,
      expected_importance: form.expected_importance || 0,
      expected_difficulty: form.expected_difficulty || 0,
      actual_success_rate: form.actual_success_rate || 0,
      actual_excitement: form.actual_excitement || 0,
      actual_importance: form.actual_importance || 0,
      actual_difficulty: form.actual_difficulty || 0,
      what_discovered: form.what_discovered || "",
      what_could_improve: form.what_could_improve || "",
      cosmic_insights: form.cosmic_insights || "",
      next_destination: form.next_destination || "",
      energy_gained: 0,
      badges_earned: [],
      completed: true,
    }

    const energy = calculateEnergyGain(quest)
    quest.energy_gained = energy
    const badges = checkEarnedSpaceBadges(quest, { completedPlanets: 0, consecutiveCompletions: 0 })
    quest.badges_earned = badges

    const landing = generateSpaceStory("landing", quest, userProfile?.character_type)
    console.log(landing)
    setShowCelebration(true)
    setTimeout(() => router.push("/dashboard"), 3000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white p-6">
      <AnimatePresence>
        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <h2 className="text-2xl font-bold">打ち上げ前チェック</h2>
            <button onClick={handleNext} className="px-4 py-2 bg-blue-600 rounded">次へ</button>
          </motion.div>
        )}
        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <h2 className="text-2xl font-bold">惑星着陸</h2>
            <button onClick={handleNext} className="px-4 py-2 bg-blue-600 rounded">次へ</button>
          </motion.div>
        )}
        {phase === 3 && (
          <motion.div key="p3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <h2 className="text-2xl font-bold">探索ログ記録</h2>
            <button onClick={handleComplete} className="px-4 py-2 bg-green-600 rounded">完了</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <motion.div animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: 2 }} className="text-8xl mb-6">🌍</motion.div>
              <h2 className="text-4xl font-bold mb-4">惑星探索完了！</h2>
              <p className="text-gray-300">宇宙ステーションに帰還中...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}