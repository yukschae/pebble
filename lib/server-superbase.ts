import { createClient } from "@supabase/supabase-js"

// サーバーサイド専用のSupabaseクライアント
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const DEMO_MODE = false

export function createServerSupabaseClient(accessToken?: string) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {},
  )
}

export async function getSelectedPassionShuttle(userId: string, accessToken?: string) {
  try {
    const supabase = createServerSupabaseClient(accessToken)
    const { data, error } = await supabase
      .from("passion_shuttles")
      .select("*")
      .eq("user_id", userId)
      .eq("selected", true)
      .single()
    if (error && error.code !== "PGRST116") throw error
    return data ?? null
  } catch (err) {
    console.error("[server-supabase] getSelectedPassionShuttle error:", err)
    throw err
  }
}

export async function getSelectedQuestDirection(userId: string, accessToken?: string) {
  if (DEMO_MODE) {
    const demo = {
      id: 1,
      user_id: "demo-user-id",
      title: "アートセラピーワークショップの企画と実施",
      description: "芸術活動を通じて心の健康をサポートするワークショップを企画・実施する",
      focus_areas: ["ワークショップ設計", "参加者募集", "アート技法", "心理的効果測定"],
      selected: true,
      created_at: new Date().toISOString(),
    }
    return { ...demo, tags: demo.focus_areas }
  }
  try {
    const supabase = createServerSupabaseClient(accessToken)
    const { data, error } = await supabase
      .from("quest_directions")
      .select("*")
      .eq("user_id", userId)
      .eq("selected", true)
      .limit(1)
    if (error) {
      console.error("[server-supabase] fetch selected quest direction error:", error)
      throw error
    }
    const record = data?.[0] || null
    return record ? { ...record, tags: record.focus_areas } : null
  } catch (error) {
    console.error("[server-supabase] getSelectedQuestDirection error:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

export async function getUserOceanResults(userId: string, accessToken?: string) {
  try {
    const supabase = createServerSupabaseClient(accessToken)
    const { data, error } = await supabase
      .from("ocean_results")
      .select("results")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
    if (error) throw error
    return data?.[0] ?? null
  } catch (err) {
    console.error("[server-supabase] getUserOceanResults error:", err)
    throw err instanceof Error ? err : new Error(String(err))
  }
}

export async function getUserRiasecResults(userId: string, accessToken?: string) {
  try {
    const supabase = createServerSupabaseClient(accessToken)
    const { data, error } = await supabase
      .from("riasec_results")
      .select("results")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
    if (error) throw error
    return data?.[0] ?? null
  } catch (err) {
    console.error("[server-supabase] getUserRiasecResults error:", err)
    throw err instanceof Error ? err : new Error(String(err))
  }
}