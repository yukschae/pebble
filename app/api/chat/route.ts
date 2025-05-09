import { type Message, StreamingTextResponse } from "ai"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const maxDuration = 30

// サーバーサイド専用のSupabaseクライアントを作成
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function POST(req: Request) {
  try {
    // APIキーが設定されているか確認
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // リクエストボディを取得
    const { messages } = (await req.json()) as { messages: Message[] }

    // サーバーサイドのSupabaseクライアントを作成
    const supabase = createServerSupabaseClient()

    // ユーザーセッションを取得
    const cookieStore = cookies()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // デモモードの確認
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    // ユーザーIDを取得（デモモードの場合はデモユーザーID）
    const userId = isDemo ? "demo-user-id" : session?.user?.id

    if (!userId && !isDemo) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // ユーザープロファイルを取得
    const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

    // RIASEC結果を取得
    const { data: riasecResults } = await supabase
      .from("riasec_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    // RIASECの結果を安全に取得
    const riasecCode =
      riasecResults && riasecResults.length > 0 && riasecResults[0].results
        ? riasecResults[0].results.threeLetterCode
        : "不明"

    // パッションシャトルを取得
    const { data: passionShuttle } = await supabase
      .from("passion_shuttles")
      .select("*")
      .eq("user_id", userId)
      .eq("selected", true)
      .single()

    // クエストを取得
    const { data: quests } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .order("order", { ascending: true })

    // 現在のクエストを取得
    const currentQuest = quests && quests.length > 0 ? quests.find((quest: any) => quest.current) : null

    // チャット履歴を保存
    if (!isDemo) {
      await supabase.from("chat_history").insert({
        user_id: userId,
        message: messages[messages.length - 1]?.content || "",
        role: "user",
        created_at: new Date().toISOString(),
      })
    }

    // システムプロンプトを作成
    const systemPrompt = `あなたはLimitFreeというキャリア教育アプリのAIアシスタントです。
    ユーザーの「パッションシャトル」に関連するクエストのアイデアを提案したり、探究活動のヒントを提供します。
    回答は必ず日本語で、見やすいマークダウン形式で提供してください。
    クエストを提案する場合は、テーマ、内容、具体的なクエスト（目的、行動例、成果物）の形式で構造化してください。
    回答は常に具体的で実行可能なアドバイスを含めてください。

    以下はユーザーに関する情報です：
    ユーザー名: ${userProfile?.display_name || "ゲスト"}
    RIASECタイプ: ${riasecCode}
    
    以下はユーザーのパッションシャトルに関する情報です：
    タイトル: ${passionShuttle?.title || "未設定"}
    説明: ${passionShuttle?.description || "未設定"}
    タグ: ${passionShuttle?.tags?.join(", ") || "未設定"}
    
    以下はユーザーのクエスト一覧です：
    ${
      quests && quests.length > 0
        ? quests
            .map(
              (quest: any) => `
    クエスト${quest.id}: ${quest.title}
    状態: ${quest.completed ? "完了済み" : quest.current ? "進行中" : "未開始"}
    説明: ${quest.description}
    行動例: ${quest.actions.join(" / ")}
    成果物: ${quest.outcome}
    `,
            )
            .join("\n")
        : "クエストはまだ設定されていません"
    }
    
    現在進行中のクエスト: ${currentQuest ? `クエスト${currentQuest.id}: ${currentQuest.title}` : "なし"}
    
    ユーザーがクエストについて質問した場合は、上記の情報を参照して回答してください。
    クエストの難易度調整や代替案を求められた場合は、現在のクエスト内容を踏まえた上で、より適切な提案をしてください。
    ユーザーの質問に直接関係のない情報は開示しないでください。
    最も重要な点として、敬語はなしで同じ高校生のような、フレンドリーで親しみやすい口調を使い、ユーザーの探究活動をサポートしてください。`

    // デモモードの場合は、ハードコードされた応答を返す
    if (isDemo) {
      const demoResponse = `こんにちは！LimitFreeのAIアシスタントだよ。何か質問があれば気軽に聞いてね！

パッションシャトルやクエストについて相談したいことがあれば、いつでも手伝うよ。

例えば、こんなことを聞いてみてね：
- 「アート x 人助け」のクエストを考えて
- パッションシャトルのアイデアが欲しい
- クエストの進め方を教えて
- 探究活動のヒントを教えて

デモモードでは実際のAI応答は制限されているけど、本番環境では完全な機能が使えるよ！`

      // ストリーミングレスポンスをシミュレート
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          // 文字ごとに少し遅延を入れてストリーミングをシミュレート
          for (const char of demoResponse) {
            controller.enqueue(encoder.encode(char))
            await new Promise((resolve) => setTimeout(resolve, 10))
          }
          controller.close()
        },
      })

      return new StreamingTextResponse(stream)
    }

    // AI SDKを使用してテキストをストリーミング
    try {
      // Vercel AI SDKを使用してAnthropicモデルを呼び出す
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          system: systemPrompt,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Anthropic API error: ${response.status} ${JSON.stringify(errorData)}`)
      }

      // レスポンスをai SDKの形式に変換
      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk)
          const lines = text.split("\n").filter((line) => line.trim() !== "")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              if (line === "data: [DONE]") {
                return
              }

              try {
                const data = JSON.parse(line.substring(6))
                if (data.type === "content_block_delta" && data.delta && data.delta.text) {
                  // AI SDKの形式に変換
                  const aiEvent = {
                    type: "text",
                    text: data.delta.text,
                  }
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(aiEvent)}\n\n`))
                }
              } catch (e) {
                console.error("Error parsing JSON:", e)
              }
            }
          }
        },
      })

      // AIの応答を保存するためのリスナー
      if (!isDemo) {
        const clonedResponse = response.clone()

        // 非同期で応答を処理して保存
        const processResponse = async () => {
          try {
            const reader = clonedResponse.body?.getReader()
            if (!reader) return

            let responseText = ""
            let done = false

            while (!done) {
              const { value, done: doneReading } = await reader.read()
              done = doneReading

              if (value) {
                const chunk = new TextDecoder().decode(value)
                const lines = chunk.split("\n").filter((line) => line.trim() !== "")

                for (const line of lines) {
                  if (line.startsWith("data: ") && line !== "data: [DONE]") {
                    try {
                      const data = JSON.parse(line.substring(6))
                      if (data.type === "content_block_delta" && data.delta.text) {
                        responseText += data.delta.text
                      }
                    } catch (e) {
                      // JSONパースエラーは無視
                    }
                  }
                }
              }
            }

            // チャット履歴に保存
            await supabase.from("chat_history").insert({
              user_id: userId,
              message: responseText,
              role: "assistant",
              created_at: new Date().toISOString(),
            })
          } catch (error) {
            console.error("Error processing response:", error)
          }
        }

        // 非同期で処理を開始（レスポンスを待たない）
        processResponse()
      }

      // レスポンスをストリーミング
      const stream = response.body?.pipeThrough(transformStream)
      if (!stream) {
        throw new Error("Failed to get response stream")
      }

      return new StreamingTextResponse(stream)
    } catch (error) {
      console.error("Error calling Anthropic API:", error)
      return new Response(
        JSON.stringify({
          error: "Error calling Anthropic API",
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
