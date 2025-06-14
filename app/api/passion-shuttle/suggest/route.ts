import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { parseJsonSafe } from "@/lib/utils"

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

  /* ── 1. parse body & build Supabase client ───────────────────── */
  const { socialIssue = null } = await req.json().catch(() => ({ socialIssue: null }))
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
        const prompt = `あなたはキャリア探究アプリ **LimitFree** の AI アシスタントです。  
ユーザーのデータと社会課題意識を踏まえ、  
**「動き + 対象/手段 + 意図/視点 + 人」**\u200bで 1行に凝縮した "パッションシャトル" を提案してください。  
（例）「里山と都会をぐるっと循環でつなげる人」、「古着で誰でも自己表現！ジェンダーフリーリメイクを広める人"

────────────────────────
▼ ユーザー情報
- 名前 : ${profile?.display_name ?? "ゲスト"}
- RIASEC タイプ : ${riasecCode}
- RIASEC 詳細 : ${riasecDetail}
- OCEAN 詳細 : ${oceanDetail}
- 関心を寄せる社会課題 : ${JSON.stringify(socialIssue, null, 2)}

▼ パッションシャトルとは
- *内発的動機型* : 好奇心・楽しさが源（例: "数式で物語を紡ぐ人"）  
- *外発的目的型* : 社会的インパクトが源（例:"捨てられた服に第二の命を与える人"）  
- *ミックス型*   : 両者をブレンド（例:"AIアートで医療体験を癒やす人"）  
- 従来の職業名を避け、**抽象度＞具体度** のタイトルにする。  
- 中学生でも理解できる言葉を用いる。

▼ 出力指示
1. **5 件** のパッションシャトルを提案する。
2. 各提案は以下キーを必ず含む。

| キー | 内容 |
|----|------|
| title | 「動き＋対象＋独自視点+人」を 20字以内で。|
| informative_description | ① どんな活動か（ワクワク要素）<br>② 社会や周囲とどう繋がるか・価値を提供できるのか（外発的意義）<br>③ RIASEC／OCEAN のタイプにどこがマッチするかを具体的に明示 ─ 上記①②③を 情報調・3〜5文 で整理し、語調はやや堅め・専門用語は最小限。|
| colloquial_description | informative_description と同じ①②③を 高校生に話しかけるフレンドリーな口調 で3〜5文に言い換える。難しいカタカナ語は控えつつ、具体的な場面をイメージできるようにする。|
| tags | 関連キーワード 3‑5 個|

3. **JSON 形式のみ** を返す。余計なテキストは絶対に書かない。
4. 日本語で出力する。
5. 不要な改行・コメントは入れない。
6. 各パッションシャトルは、できるだけ多様な5種類を揃えて。研究的なプロジェクトやアートのプロジェクト、起業など、クリエイティブなものの比率を大きく持ちつつ、1-2個は企業に勤めてる前提で目指せる内容を提示して（数はRIASEC結果次第; 企業的が一番高ければ2-3個、など）。
7. ${socialIssue ? `${socialIssue.title} の"attachment" (1-10の値)は"title"の社会課題への関心の強さを表すので、数値によって、その社会課題に関連したパッションシャトルの提案数を調整して。残りは"others"の社会課題に関連するパッションシャトルを提案して。` : ""}`


    /* 6. call Anthropic ------------------------------------------- */
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: anthropicHeaders(process.env.ANTHROPIC_API_KEY!),
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
        max_tokens: 3000,
      }),
    })

    const aiJson = await aiRes.json()
    const raw    = aiJson.content?.[0]?.text ?? ""
    let suggestions
    try {
      suggestions = parseJsonSafe(raw)
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
