/*  API route: /api/chat  —  streams Claude-3 Haiku response,
    saves both user & assistant messages to Supabase.
    Demo-mode removed; request must include valid auth  */

    import { NextRequest, NextResponse } from "next/server"
    import { cookies } from "next/headers"
    import { createClient } from "@supabase/supabase-js"
    import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
    import { streamText } from "ai"
    import { anthropic } from "@ai-sdk/anthropic"
    import type { Message } from "ai"
    
    export async function POST(req: NextRequest) {
      /* ── auth setup ─────────────────────────────────────────────────── */
      const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined
    
      const supabase =
        token
          ? createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              { global: { headers: { Authorization: `Bearer ${token}` } } },
            )
          : createRouteHandlerClient({ cookies })
    
      /* verify user */
      const { data: userData, error: userErr } = await supabase.auth.getUser(token)
      if (userErr || !userData?.user)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
      const userId = userData.user.id
    
      try {
        /* ── parse incoming messages ──────────────────────────────────── */
        const { messages } = (await req.json()) as { messages: Message[] }
        const lastMsg       = messages[messages.length - 1]?.content ?? ""
    
        /* ── persist user message ─────────────────────────────────────── */
        await supabase.from("chat_history").insert({
          user_id: userId,
          message: lastMsg,
          role: "user",
          created_at: new Date().toISOString(),
        })
    
        /* ── fetch auxiliary data in parallel ─────────────────────────── */
        const [
          { data: profile },
          { data: riasecRes },
          { data: shuttle },
          { data: quests },
        ] = await Promise.all([
          supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
          supabase
            .from("riasec_results")
            .select("results")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1),
          supabase.from("passion_shuttles").select("*").eq("user_id", userId).eq("selected", true).single(),
          supabase.from("quests").select("*").eq("user_id", userId).order("order", { ascending: true }),
        ])
    
        const questList: any[] = quests ?? [] 
        const currentQuest     = questList.find((q) => q.current)
        const riasecCode     = riasecRes?.[0]?.results?.threeLetterCode ?? "不明"
        
    
        /* ── system prompt ────────────────────────────────────────────── */
        const systemPrompt = `あなたはLimitFreeというキャリア教育アプリのAIアシスタントです。
    ユーザーの「パッションシャトル」に関連するクエストのアイデアを提案したり、探究活動のヒントを提供します。
    回答は必ず日本語で、見やすいマークダウン形式で提供してください。
    クエストを提案する場合は、テーマ・内容・具体的なクエスト（目的、行動例、成果物）の形式で構造化してください。
    常に具体的で実行可能なアドバイスを含め、同じ高校生の友達のようにフレンドリーな口調で答えてください。
    
    ▼ ユーザー情報
    - ユーザー名: ${profile?.display_name ?? "ゲスト"}
    - RIASECタイプ: ${riasecCode}
    
    ▼ パッションシャトル
    - タイトル: ${shuttle?.title ?? "未設定"}
    - 説明: ${shuttle?.description ?? "未設定"}
    - タグ: ${(shuttle?.tags ?? []).join(", ") || "未設定"}
    
    ▼ クエスト一覧
    ${
      questList.length
        ? questList
            .map(
              (q) => `- クエスト${q.id} (${q.completed ? "完了" : q.current ? "進行中" : "未開始"}): ${q.title}`,
            )
            .join("\n")
        : "（まだ設定されていません）"
    }
    
    現在進行中: ${currentQuest ? `クエスト${currentQuest.id} ${currentQuest.title}` : "なし"}`
    
        /* ── stream Claude-3 Haiku reply ─────────────────────────────── */
        const result = await streamText(
          {
            model: anthropic("claude-3-haiku-20240307"),
            messages,
            system: systemPrompt,
            temperature: 0.7,
            maxTokens: 1000,
            onFinish: async ({ text }) => {
              await supabase.from("chat_history").insert({
                user_id: userId,
                message: text,
                role: "assistant",
                created_at: new Date().toISOString(),
              })
            },
          },
        )
    
        return result.toDataStreamResponse()
      } catch (err) {
        console.error("[chat] unexpected error:", err)
        return NextResponse.json(
          { error: "Unhandled error", details: (err as Error).message },
          { status: 500 },
        )
      }
    }
    