import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export const maxDuration = 30

function anthropicHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
  }
}

export async function POST(req: NextRequest) {
  /* ── 0. env check ─────────────────────────────────────────────── */
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 },
    )
  }

  /* ── 1. build Supabase client ─────────────────────────────────── */
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined

  const supabase =
    token
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } },
        )
      : createRouteHandlerClient({ cookies })

  /* ── 2. verify user (dual path) ───────────────────────────────── */
  let userId: string | null = null
  let supaErr: Error | null = null

  if (token) {
    /* header JWT path */
    const { data, error } = await supabase.auth.getUser()
    supaErr = error ?? null
    userId  = data.user?.id ?? null
  } else {
    /* cookie session path */
    const { data, error } = await supabase.auth.getSession()
    supaErr = error ?? null
    userId  = data.session?.user?.id ?? null
  }

  if (supaErr) console.warn("[passion-shuttle] supabase auth warning:", supaErr.message)
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })


  try {
    /* 4. fetch auxiliary user data in parallel --------------------- */
    const [
      { data: profile },
      { data: riasec },
      { data: ocean },
    ] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
      supabase
        .from("riasec_results")
        .select("results")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("ocean_results")
        .select("results")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
    ])

    const riasecCode    = riasec?.[0]?.results?.threeLetterCode ?? "不明"
    const riasecDetail  = riasec?.[0]?.results ? JSON.stringify(riasec[0].results, null, 2) : "{}"
    const oceanDetail   = ocean?.[0]?.results ? JSON.stringify(ocean[0].results, null, 2) : "{}"

    /* 5. craft prompt --------------------------------------------- */
    const prompt = `
あなたはキャリア教育アプリのAIアシスタントです。ユーザーの「パッションシャトル」を提案します。

▼ パッションシャトルとは
ユーザーの興味を掛け合わせて生み出す、将来に繋がり社会に貢献できる興味=探究テーマ。重要なのは、従来の具体的な職業名ではなく、多少抽象的でオープンなキャリアパスをタイトルとすること。あくまで参考までの例ですが、「アートxスポーツ」というような感じです。詳細説明では、具体的なイメージと社会との繋がりの可能性をいくつか例示する。中学生でもわかるレベルの言葉で回答すること。

▼ ユーザー情報
- 名前: ${profile?.display_name ?? "ゲスト"}
- RIASECタイプ: ${riasecCode}
- RIASEC詳細: ${riasecDetail}
- OCEAN詳細:  ${oceanDetail}

▼ 指示
1. ユーザーの興味・特性を踏まえて **5件** のパッションシャトルを提案せよ。
2. 提案ごとに以下のキーを含むこと:
   - title        : タイトル
   - description  : 詳細説明
   - tags         : キーワード配列
3. **JSONのみ** を返すこと。余計な文は書かない。

▼ フォーマット
{
  "suggestions": [
    { "title": "", "description": "", "tags": [] },
    { "title": "", "description": "", "tags": [] },
    { "title": "", "description": "", "tags": [] },
    { "title": "", "description": "", "tags": [] },
    { "title": "", "description": "", "tags": [] }
  ]
}
`

    /* 6. call Anthropic ------------------------------------------- */
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: anthropicHeaders(process.env.ANTHROPIC_API_KEY!),
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    const aiJson = await aiRes.json()
    const raw    = aiJson.content?.[0]?.text ?? ""
    let suggestions

    try {
      suggestions = JSON.parse(raw)
    } catch (parseErr) {
      console.error("[passion-shuttle] JSON parse error:", parseErr, "raw:", raw)
      return NextResponse.json(
        { error: "Failed to parse AI JSON", details: raw.slice(0, 200) },
        { status: 502 },
      )
    }

    /* 7. persist & respond ---------------------------------------- */
    await supabase.from("passion_shuttle_suggestions").insert({
      user_id: userId,
      suggestions: suggestions.suggestions,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json(suggestions)
  } catch (err) {
    console.error("[passion-shuttle] unexpected error:", err)
    return NextResponse.json(
      { error: "Unhandled error", details: (err as Error).message },
      { status: 500 },
    )
  }
}
