/**
 * 司令官メッセージシステム
 */

export const SPACE_COMMANDERS = {
    nova: {
      name: "ノヴァ司令官",
      rank: "宇宙ステーション司令官",
      emoji: "👩‍✈️",
      avatar: "from-blue-500 to-cyan-600",
      personality: "friendly",
    },
    orion: {
      name: "オリオン司令官",
      rank: "探索部門長",
      emoji: "👨‍🚀",
      avatar: "from-purple-500 to-indigo-600",
      personality: "wise",
    },
    stellar: {
      name: "ステラ司令官",
      rank: "訓練指導官",
      emoji: "👩‍🔬",
      avatar: "from-green-500 to-teal-600",
      personality: "energetic",
    },
  } as const
  
  export type CommanderId = keyof typeof SPACE_COMMANDERS
  
  export interface CommanderMessage {
    id: string
    type: CommanderMessageType
    title: string
    message: string
    priority: CommanderMessagePriority
    timestamp: string
    read: boolean
    actionButton?: {
      text: string
      action: 'navigate'
      route: string
    }
  }
  
  export type CommanderMessageType = 'reminder' | 'tip' | 'info'
  export type CommanderMessagePriority = 'low' | 'medium' | 'high'　
  
  export function getCommanderGreeting(
    commander: (typeof SPACE_COMMANDERS)[keyof typeof SPACE_COMMANDERS] = SPACE_COMMANDERS.nova
  ) {
    return commander.name
  }
  
  export function generateCommanderMessages(
    userProfile: any,
    dashboardData: any,
    commanderId: CommanderId = 'nova'
  ): CommanderMessage[] {
    const commander = SPACE_COMMANDERS[commanderId]
    const msgs: CommanderMessage[] = []
  
    const currentQuest = dashboardData.quests?.find((q: any) => q.current)
    if (currentQuest) {
      msgs.push({
        id: 'current-quest-reminder',
        type: 'reminder',
        title: 'アクティブミッション進行中',
        message: `${getCommanderGreeting(commander)}！現在「${currentQuest.title}」の探索が進行中です。惑星での発見を記録しましょう。`,
        priority: 'high',
        timestamp: new Date().toISOString(),
        read: false,
        actionButton: {
        text: '探索を完了する',
        action: 'navigate',
        route: `/planet-exploration/${currentQuest.id}`,
      },
      })
    }
  
    if (!dashboardData.passionShuttle) {
      msgs.push({
        id: 'passion-shuttle-setup',
        type: 'tip',
        title: 'パッションシャトル未設定',
        message: `${getCommanderGreeting(commander)}！探索を効率化するためにパッションシャトルを設定しましょう。`,
        priority: 'medium',
        timestamp: new Date().toISOString(),
        read: false,
        actionButton: {
          text: 'シャトル設定',
          action: 'navigate',
          route: '/passion-shuttle',
        },
      })
    }
  
    return msgs.slice(0, 4)
  }

  export function getMessagePriorityColor(priority: CommanderMessagePriority) {
    switch (priority) {
      case 'high':
        return 'border-red-500/50'
      case 'medium':
        return 'border-yellow-500/50'
      default:
        return 'border-cyan-500/30'
    }
  }
  
  export function getMessageTypeIcon(type: CommanderMessageType) {
    switch (type) {
      case 'reminder':
        return '📌'
      case 'tip':
        return '💡'
      default:
        return 'ℹ️'
    }
  }