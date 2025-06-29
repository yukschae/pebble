/**
 * 宇宙テーマRPGシステム管理モジュール
 */

export interface SpaceExplorerProfile {
    level: number
    energy: number
    explorer_type: keyof typeof EXPLORER_TYPES
    badges: SpaceBadge[]
    current_sector: string
  }
  
  export interface SpaceBadge {
    id: string
    name: string
    description: string
    icon: string
    earned_at: string
    rarity: "common" | "rare" | "epic" | "legendary"
    constellation?: string
  }
  
  export interface PlanetQuest {
    id?: number
    user_id: string
    planet_id: number
    planet_name: string
    planet_description: string
    planet_type: "research" | "exploration" | "discovery" | "creation" | "connection"
    expected_success_rate: number
    expected_excitement: number
    expected_importance: number
    expected_difficulty: number
    actual_success_rate: number
    actual_excitement: number
    actual_importance: number
    actual_difficulty: number
    what_discovered: string
    what_could_improve: string
    cosmic_insights: string
    next_destination: string
    energy_gained: number
    badges_earned: SpaceBadge[]
    completed: boolean
    created_at?: string
    updated_at?: string
  }
  
  export const EXPLORER_TYPES = {
    astronaut: {
      name: "宇宙飛行士",
      description: "バランスの取れた万能探索者",
      emoji: "👨‍🚀",
      color: "from-blue-500 to-indigo-600",
      ship: "🚀",
    },
    scientist: {
      name: "宇宙科学者",
      description: "研究と発見を重視する探索者",
      emoji: "🔬",
      color: "from-purple-500 to-indigo-600",
      ship: "🛸",
    },
    navigator: {
      name: "宇宙航海士",
      description: "新しい世界を求める探索者",
      emoji: "🧭",
      color: "from-green-500 to-teal-600",
      ship: "🚁",
    },
    artist: {
      name: "宇宙アーティスト",
      description: "美と創造を追求する探索者",
      emoji: "🎨",
      color: "from-pink-500 to-rose-600",
      ship: "✨",
    },
    guardian: {
      name: "宇宙ガーディアン",
      description: "平和と調和を守る探索者",
      emoji: "🛡️",
      color: "from-amber-500 to-orange-600",
      ship: "🛰️",
    },
  } as const
  
  export const SPACE_BADGE_DEFINITIONS = {
    first_launch: {
      id: "first_launch",
      name: "初回打ち上げ",
      description: "初めての惑星探索を完了しました",
      icon: "🚀",
      rarity: "common" as const,
      constellation: "Starter",
    },
    stellar_performer: {
      id: "stellar_performer",
      name: "恒星級パフォーマー",
      description: "期待を大きく上回る発見をしました",
      icon: "⭐",
      rarity: "rare" as const,
      constellation: "Excellence",
    },
    cosmic_challenger: {
      id: "cosmic_challenger",
      name: "宇宙の挑戦者",
      description: "高難易度の惑星に挑戦しました",
      icon: "🌌",
      rarity: "epic" as const,
      constellation: "Courage",
    },
    deep_thinker: {
      id: "deep_thinker",
      name: "深宇宙思考者",
      description: "詳細な探索ログを記録しました",
      icon: "🧠",
      rarity: "common" as const,
      constellation: "Wisdom",
    },
    constellation_master: {
      id: "constellation_master",
      name: "星座マスター",
      description: "3つの惑星を連続で探索しました",
      icon: "✨",
      rarity: "rare" as const,
      constellation: "Persistence",
    },
    cosmic_growth: {
      id: "cosmic_growth",
      name: "宇宙的成長",
      description: "困難から多くを学びました",
      icon: "🌱",
      rarity: "epic" as const,
      constellation: "Growth",
    },
  } as const
  
  export const PLANET_TYPES = {
    research: {
      name: "研究惑星",
      emoji: "🔬",
      color: "from-purple-500 to-indigo-600",
      description: "知識と理解を深める惑星",
    },
    exploration: {
      name: "探索惑星",
      emoji: "🗺️",
      color: "from-green-500 to-teal-600",
      description: "新しい領域を発見する惑星",
    },
    discovery: {
      name: "発見惑星",
      emoji: "💎",
      color: "from-blue-500 to-cyan-600",
      description: "隠された宝物を見つける惑星",
    },
    creation: {
      name: "創造惑星",
      emoji: "🎨",
      color: "from-pink-500 to-rose-600",
      description: "新しいものを生み出す惑星",
    },
    connection: {
      name: "交流惑星",
      emoji: "🤝",
      color: "from-amber-500 to-orange-600",
      description: "他者とのつながりを築く惑星",
    },
  } as const
  
  export interface ExplorerStats {
    completedPlanets: number
    consecutiveCompletions: number
  }
  
  export function calculateExplorerLevel(energy: number): number {
    if (!energy || energy < 0) return 1
  
    let level = 1
    let requiredEnergy = 100
    let totalEnergy = 0
  
    while (energy >= totalEnergy + requiredEnergy) {
      totalEnergy += requiredEnergy
      level++
      requiredEnergy += 100
    }
  
    return level
  }
  
  export function getEnergyForNextLevel(currentEnergy: number): {
    current: number
    required: number
    progress: number
  } {
    if (!currentEnergy || currentEnergy < 0) {
      return { current: 0, required: 100, progress: 0 }
    }
  
    const currentLevel = calculateExplorerLevel(currentEnergy)
    let totalEnergy = 0
    let requiredEnergy = 100
  
    for (let i = 1; i < currentLevel; i++) {
      totalEnergy += requiredEnergy
      requiredEnergy += 100
    }
  
    const currentLevelEnergy = currentEnergy - totalEnergy
    const nextLevelRequiredEnergy = requiredEnergy
    const progress = (currentLevelEnergy / nextLevelRequiredEnergy) * 100
  
    return {
      current: currentLevelEnergy,
      required: nextLevelRequiredEnergy,
      progress: Math.min(Math.max(progress, 0), 100),
    }
  }
  
  export function calculateEnergyGain(exploration: Partial<PlanetQuest>): number {
    let baseEnergy = 50
  
    if (exploration.expected_difficulty != null) {
      baseEnergy += exploration.expected_difficulty * 10
    }
  
    if (
      exploration.actual_success_rate != null &&
      exploration.expected_success_rate != null
    ) {
      const diff = exploration.actual_success_rate - exploration.expected_success_rate
      if (diff > 0) baseEnergy += diff
    }
  
    const logLength =
      (exploration.what_discovered?.length || 0) +
      (exploration.what_could_improve?.length || 0) +
      (exploration.cosmic_insights?.length || 0)
  
    if (logLength > 200) baseEnergy += 20
    if (logLength > 500) baseEnergy += 30
  
    return Math.max(baseEnergy, 10)
  }
  
  export function checkEarnedSpaceBadges(
    exploration: PlanetQuest,
    explorerStats: ExplorerStats,
  ): SpaceBadge[] {
    const earned: SpaceBadge[] = []
  
    if (explorerStats.completedPlanets === 0) {
      earned.push({ ...SPACE_BADGE_DEFINITIONS.first_launch, earned_at: new Date().toISOString() })
    }
  
    if (exploration.actual_success_rate - exploration.expected_success_rate >= 30) {
      earned.push({ ...SPACE_BADGE_DEFINITIONS.stellar_performer, earned_at: new Date().toISOString() })
    }
  
    if (exploration.expected_difficulty >= 4) {
      earned.push({ ...SPACE_BADGE_DEFINITIONS.cosmic_challenger, earned_at: new Date().toISOString() })
    }
  
    const logLength =
      (exploration.what_discovered?.length || 0) +
      (exploration.what_could_improve?.length || 0) +
      (exploration.cosmic_insights?.length || 0)
  
    if (logLength > 300) {
      earned.push({ ...SPACE_BADGE_DEFINITIONS.deep_thinker, earned_at: new Date().toISOString() })
    }
  
    if (explorerStats.consecutiveCompletions >= 2) {
      earned.push({ ...SPACE_BADGE_DEFINITIONS.constellation_master, earned_at: new Date().toISOString() })
    }
  
    if (exploration.actual_success_rate < 50 && (exploration.cosmic_insights?.length || 0) > 100) {
      earned.push({ ...SPACE_BADGE_DEFINITIONS.cosmic_growth, earned_at: new Date().toISOString() })
    }
  
    return earned
  }
  
  export function generateSpaceStory(
    type: "launch" | "progress" | "landing" | "exploration_log",
    data: any,
    explorerType: keyof typeof EXPLORER_TYPES = "astronaut",
  ): string {
    const explorer = EXPLORER_TYPES[explorerType] || EXPLORER_TYPES.astronaut
  
    switch (type) {
      case "launch":
        return `${explorer.emoji} 勇敢な${explorer.name}よ、新たな惑星「${data.planet_name}」への探索ミッションが始まる！\n\n${data.planet_description}\n\n${explorer.ship} パッションシャトルの準備は完了。この未知の世界で君はどんな発見をするだろうか...？`
  
      case "progress":
        return `🛰️ ${data.step} が進行中... 現在の状況を確認してください。`
  
      case "landing":
        const energyGain = data.energy_gained || 0
        const badges = data.badges_earned || []
        let story = `🎉 素晴らしい！${explorer.name}は惑星「${data.planet_name}」の探索を見事に完了した！\n\n`
  
        if (data.actual_success_rate >= 80) {
          story += `期待を上回る驚異的な発見だ！君の探索スキルが光っている。\n`
        } else if (data.actual_success_rate >= 50) {
          story += `着実な探索成果を上げたね！宇宙の謎がまた一つ解けた。\n`
        } else {
          story += `思うようにいかない部分もあったが、それも貴重な宇宙体験だ。失敗は成功の母星というからね。\n`
        }
  
        story += `\n⚡ エネルギー +${energyGain} を獲得！\n`
  
        if (badges.length > 0) {
          story += `🏆 新しい星座バッジを獲得: ${badges.map((b: SpaceBadge) => `${b.icon} ${b.name}`).join(", ")}\n`
        }
  
        return story
  
      case "exploration_log":
        let logStory = `📡 ${explorer.name}の宇宙探索ログ\n\n`
  
        if (data.what_discovered) {
          logStory += `🔍 発見したもの:\n${data.what_discovered}\n\n`
        }
  
        if (data.cosmic_insights) {
          logStory += `💫 宇宙的洞察:\n${data.cosmic_insights}\n\n`
        }
  
        if (data.next_destination) {
          logStory += `🚀 次の目的地:\n${data.next_destination}\n\n`
        }
  
        logStory += `この探索データを胸に、${explorer.name}は次の惑星へと向かう...`
  
        return logStory
  
      default:
        return `${explorer.emoji} ${explorer.name}の宇宙探索は続く...`
    }
  }
  
  export const SPACE_SECTORS = {
    starter_system: {
      name: "スターター星系",
      description: "探索の第一歩を踏み出す星系",
      color: "from-blue-400 to-indigo-500",
      planets: ["基礎研究惑星", "初心者探索惑星"],
    },
    discovery_nebula: {
      name: "発見星雲",
      description: "新しい可能性を見つける星雲",
      color: "from-purple-400 to-pink-500",
      planets: ["創造惑星", "アート惑星"],
    },
    wisdom_galaxy: {
      name: "知恵銀河",
      description: "深い洞察を得られる銀河",
      color: "from-green-400 to-teal-500",
      planets: ["哲学惑星", "思考惑星"],
    },
  } as const
  
  export default {
    EXPLORER_TYPES,
    SPACE_BADGE_DEFINITIONS,
    PLANET_TYPES,
    SPACE_SECTORS,
    calculateExplorerLevel,
    getEnergyForNextLevel,
    calculateEnergyGain,
    checkEarnedSpaceBadges,
    generateSpaceStory,
  }

