/**
 * Supabase連携モジュール
 *
 * このファイルは、Supabaseとの連携機能を提供します。
 * 認証、データベース操作、ユーザープロファイル管理などの機能を実装しています。
 *
 * 主な機能：
 * - Supabaseクライアントの初期化と提供
 * - 認証機能（サインイン、サインアップ、サインアウト）
 * - ユーザープロファイル管理
 * - RIASEC/OCEAN分析結果の保存と取得
 * - パッションシャトル管理
 * - クエスト管理
 * - デモモードのサポート
 *
 * 使用している主要なライブラリ：
 * - @supabase/supabase-js
 * - React (createContext, useState, useEffect)
 * - Next.js (useRouter)
 *
 * データフロー：
 * 1. 環境変数からSupabase接続情報を取得
 * 2. シングルトンパターンでクライアントインスタンスを管理
 * 3. 各種データベース操作関数を提供
 * 4. デモモードの場合はモックデータを返す
 *
 * 関連ファイル：
 * - app/dashboard/page.tsx (データ表示)
 * - app/riasec/assessment/page.tsx (RIASEC分析)
 * - app/ocean/assessment/page.tsx (OCEAN分析)
 * - app/passion-shuttle/page.tsx (パッションシャトル)
 * - app/quest-setup/quests/page.tsx (クエスト設定)
 */

"use client"

import { createClient } from "@supabase/supabase-js"
import { createContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// 環境変数からSupabase情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// デモモードの設定
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// クライアント側のシングルトンパターンを実装
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.")
  }

  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// サーバーサイドでの使用
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// デモユーザーの情報
const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@example.com",
  user_metadata: {
    name: "デモユーザー",
  },
}

// デモユーザープロファイル
const DEMO_PROFILE = {
  id: 1,
  user_id: "demo-user-id",
  display_name: "デモユーザー",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// 認証コンテキスト
type AuthContextType = {
  user: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<boolean>
  userProfile: any | null
  updateUserProfile: (displayName: string) => Promise<any>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => false,
  userProfile: null,
  updateUserProfile: async () => null,
})

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Initial state
  const supabase = getSupabaseClient();
  const router = useRouter();

  console.log("useAuth: Hook initialized. Initial loading state:", loading); // Log hook initialization

  useEffect(() => {
    console.log("useAuth: Main auth useEffect RUNNING/RE-RUNNING. DEMO_MODE:", DEMO_MODE);

    if (DEMO_MODE) {
      console.log("useAuth: DEMO_MODE enabled. Setting demo user and profile.");
      setUser(DEMO_USER);
      setUserProfile(DEMO_PROFILE);
      console.log("useAuth: DEMO_MODE - setLoading(false)");
      setLoading(false);
      return;
    }

    console.log("useAuth: Setting up onAuthStateChange listener and initial session check.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("useAuth: onAuthStateChange triggered. Event:", event, "Session:", session ? `User ID: ${session.user.id}` : "No session");
      // setLoading(true); // <<< Potentially problematic if it causes rapid re-renders or gets stuck. Let's keep it commented for now.
      if (session?.user) {
        setUser(session.user);
        console.log(`useAuth: onAuthStateChange - User set. Attempting to get profile for ${session.user.id}`);
        try {
          const profile = await getUserProfile(session.user.id); // Make sure getUserProfile has its own logs
          setUserProfile(profile);
          console.log("useAuth: onAuthStateChange - User profile fetched:", profile ? "Profile found" : "No profile");
        } catch (error) {
          console.error("useAuth: onAuthStateChange - Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        console.log("useAuth: onAuthStateChange - User and profile set to null.");
      }
      console.log("useAuth: onAuthStateChange - setLoading(false) for event:", event);
      setLoading(false);
    });

    const checkSession = async () => {
      console.log("useAuth: checkSession - Starting initial session check.");
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("useAuth: checkSession - Error getting session:", sessionError);
          setUser(null);
          setUserProfile(null);
        } else if (session?.user) {
          setUser(session.user);
          console.log(`useAuth: checkSession - Session found for ${session.user.id}. Attempting to get profile.`);
          try {
            const profile = await getUserProfile(session.user.id);
            setUserProfile(profile);
            console.log("useAuth: checkSession - User profile fetched:", profile ? "Profile found" : "No profile");
          } catch (error) {
            console.error("useAuth: checkSession - Error fetching profile in checkSession:", error);
            setUserProfile(null);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          console.log("useAuth: checkSession - No active session found.");
        }
      } catch (error) {
        console.error("useAuth: checkSession - Exception during getSession/profile fetch:", error);
        setUser(null);
        setUserProfile(null);
      } finally {
        console.log("useAuth: checkSession - finally block, setLoading(false)");
        setLoading(false);
      }
    };

    if (!DEMO_MODE) {
      checkSession();
    }

    return () => {
      console.log("useAuth: Main auth useEffect CLEANUP - Unsubscribing from onAuthStateChange.");
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array: runs on mount and unmount

  // Separate useEffects to log state changes clearly
  useEffect(() => {
    console.log("useAuth DEBUG: `user` state changed to:", user ? user.id : null);
  }, [user]);

  useEffect(() => {
    console.log("useAuth DEBUG: `loading` state changed to:", loading);
  }, [loading]);

  useEffect(() => {
    console.log("useAuth DEBUG: `userProfile` state changed to:", userProfile ? userProfile.id : null);
  }, [userProfile]);


  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error.message)
        throw error
      }

      console.log("Sign in successful")
      return data
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const handleSignUp = async (email: string, password: string) => {
    try {
      console.log("Attempting sign up for:", email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Sign up error:", error.message)
        throw error
      }

      console.log("Sign up successful")
      return data
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      console.log("Attempting sign out")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error.message)
        throw error
      }

      console.log("Sign out successful")
      router.push("/")
      return true
    } catch (error) {
      console.error("Error signing out:", error)
      return false
    }
  }

  const updateUserProfile = async (displayName: string) => {
    try {
      if (!user) {
        console.error("Cannot update profile: User not authenticated")
        throw new Error("User not authenticated")
      }

      console.log("Updating user profile for:", user.id)
      const result = await saveUserProfile(user.id, displayName)
      setUserProfile({ ...userProfile, display_name: displayName })
      console.log("Profile update successful")
      return result
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  }

  return {
    user,
    userProfile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    updateUserProfile,
  }
}

export async function getUserProfile(userId: string) { // Add logs here too
  console.log(`lib/supabase: getUserProfile - Called for userId: ${userId}`);
  const supabase = getSupabaseClient(); // Ensure client is fresh if needed, or use passed instance
  try {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single();
    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found, not necessarily an error for this logic
      console.error(`lib/supabase: getUserProfile - Error fetching profile for ${userId}:`, error);
      throw error;
    }
    console.log(`lib/supabase: getUserProfile - Profile data for ${userId}:`, data);
    return data;
  } catch (error) {
    console.error(`lib/supabase: getUserProfile - Exception for ${userId}:`, error);
    return null;
  }
}

// ユーザープロファイルを保存する関数
export async function saveUserProfile(userId: string, displayName: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    console.log("Saving user profile for:", userId)
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )

    if (error) {
      console.error("Error saving user profile:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in saveUserProfile:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// ユーザーのRIASEC結果を取得する関数
export async function getUserRiasecResults(userId: string) {
  if (DEMO_MODE) {
    // デモデータを返す
    return {
      results: {
        dimensionScores: {
          R: 65,
          I: 45,
          A: 85,
          S: 70,
          E: 50,
          C: 30,
        },
        sortedDimensions: ["A", "S", "R", "E", "I", "C"],
        threeLetterCode: "ASR",
        consistency: 2,
        differentiation: 55,
      },
    }
  }

  // 通常の処理
  try {
    console.log("Getting RIASEC results for:", userId)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("riasec_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching RIASEC results:", error)
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error in getUserRiasecResults:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// RIASECの回答を保存する関数
export async function saveRiasecResponses(userId: string, responses: any) {
  try {
    console.log("Saving RIASEC responses for:", userId)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("riasec_responses").insert([
      {
        user_id: userId,
        responses: responses,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error saving RIASEC responses:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in saveRiasecResponses:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// RIASECの結果を保存する関数
export async function saveRiasecResults(userId: string, results: any) {
  try {
    console.log("Saving RIASEC results for:", userId)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("riasec_results").insert([
      {
        user_id: userId,
        results: results,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error saving RIASEC results:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in saveRiasecResults:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// ユーザーのOCEAN結果を取得する関数
export async function getUserOceanResults(userId: string) {
  if (DEMO_MODE) {
    // デモデータを返す
    return {
      results: {
        scores: {
          O: 75, // 開放性
          C: 60, // 誠実性
          E: 85, // 外向性
          A: 65, // 協調性
          N: 40, // 神経症的傾向
        },
        interpretation: {
          O: "好奇心が強く、創造的で、新しいアイデアや経験に開かれています。芸術や抽象的な思考を楽しみます。",
          C: "中間的な傾向があります。状況によって柔軟に対応できる可能性があります。",
          E: "社交的で活発、自己主張が強いです。グループ活動を楽しみ、人との交流からエネルギーを得ます。",
          A: "中間的な傾向があります。状況によって柔軟に対応できる可能性があります。",
          N: "中間的な傾向があります。状況によって柔軟に対応できる可能性があります。",
        },
        timestamp: new Date().toISOString(),
      },
    }
  }

  // 通常の処理
  try {
    console.log("Getting OCEAN results for:", userId)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("ocean_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching OCEAN results:", error)
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error in getUserOceanResults:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// OCEANの回答を保存する関数
export async function saveOceanResponses(userId: string, responses: any) {
  try {
    console.log("Saving OCEAN responses for:", userId)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("ocean_responses").insert([
      {
        user_id: userId,
        responses: responses,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error saving OCEAN responses:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in saveOceanResponses:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// OCEANの結果を保存する関数
export async function saveOceanResults(userId: string, results: any) {
  try {
    console.log("Saving OCEAN results for:", userId)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("ocean_results").insert([
      {
        user_id: userId,
        results: results,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error saving OCEAN results:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in saveOceanResults:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// パッションシャトル提案を保存する関数
export async function savePassionShuttleSuggestions(userId: string, suggestions: any[], feedback?: string) {
  try {
    console.log("Saving passion shuttle suggestions for:", userId)
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("passion_shuttle_suggestions").insert({
      user_id: userId,
      suggestions: suggestions,
      feedback: feedback || null,
    })

    if (error) {
      console.error("Error saving passion shuttle suggestions:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error saving passion shuttle suggestions:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// 最新のパッションシャトル提案を取得する関数
export async function getLatestPassionShuttleSuggestions(userId: string) {
  if (DEMO_MODE) {
    // デモデータを返す
    return {
      suggestions: [
        {
          title: "アート x 人助け",
          description: "芸術的な手法を用いて、人々の心理的・感情的な健康をサポートするアプローチ。",
          tags: ["アートセラピー", "イベント企画", "コミュニティ支援"],
        },
        {
          title: "テクノロジー x 教育",
          description: "最新のテクノロジーを活用して、より効果的で魅力的な学習体験を提供する。",
          tags: ["EdTech", "オンライン学習", "インタラクティブコンテンツ"],
        },
        {
          title: "環境 x デザイン",
          description: "持続可能性を考慮したデザインで、環境問題の解決に貢献する。",
          tags: ["サステナブルデザイン", "エコプロダクト", "環境教育"],
        },
      ],
    }
  }

  // 通常の処理
  try {
    console.log("Getting latest passion shuttle suggestions for:", userId)
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("passion_shuttle_suggestions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching passion shuttle suggestions:", error)
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error getting latest passion shuttle suggestions:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// パッションシャトルを保存する関数
export async function savePassionShuttle(userId: string, title: string, description: string, tags: string[]) {
  try {
    console.log("Saving passion shuttle for:", userId)
    const supabase = getSupabaseClient()

    // 既存のパッションシャトルを非選択状態にする
    const { error: updateError } = await supabase
      .from("passion_shuttles")
      .update({ selected: false })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating passion shuttles:", updateError)
      throw updateError
    }

    // 新しいパッションシャトルを保存
    const { error } = await supabase.from("passion_shuttles").insert({
      user_id: userId,
      title: title,
      description: description,
      tags: tags,
      selected: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving passion shuttle:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error saving passion shuttle:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// 選択されたパッションシャトルを取得する関数
export async function getSelectedPassionShuttle(userId: string) {
  if (DEMO_MODE) {
    // デモデータを返す
    return {
      id: 1,
      user_id: "demo-user-id",
      title: "アート x 人助け",
      description: "芸術的な手法を用いて、人々の心理的・感情的な健康をサポートするアプローチ。",
      tags: ["アートセラピー", "イベント企画", "コミュニティ支援"],
      selected: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // 通常の処理
  try {
    console.log("Getting selected passion shuttle for:", userId)
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("passion_shuttles")
      .select("*")
      .eq("user_id", userId)
      .eq("selected", true)
      .limit(1)

    if (error) {
      console.error("Error fetching selected passion shuttle:", error)
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error getting selected passion shuttle:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// クエスト方向性を保存する関数
export async function saveQuestDirection(userId: string, direction: any) {
  try {
    console.log("Saving quest direction for:", userId)
    const supabase = getSupabaseClient()

    // 既存の方向性を非選択状態にする
    const { error: updateError } = await supabase
      .from("quest_directions")
      .update({ selected: false })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating quest directions:", updateError)
      throw updateError
    }

    // 新しい方向性を保存
    const { error } = await supabase.from("quest_directions").insert({
      user_id: userId,
      title: direction.title,
      description: direction.description,
      focus_areas: direction.focus_areas,
      selected: true,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving quest direction:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error saving quest direction:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// 選択されたクエスト方向性を取得する関数
export async function getSelectedQuestDirection(userId: string) {
  if (DEMO_MODE) {
    // デモデータを返す
    return {
      id: 1,
      user_id: "demo-user-id",
      title: "アートセラピーワークショップの企画と実施",
      description: "芸術活動を通じて心の健康をサポートするワークショップを企画・実施する",
      focus_areas: ["ワークショップ設計", "参加者募集", "アート技法", "心理的効果測定"],
      selected: true,
      created_at: new Date().toISOString(),
    }
  }

  // 通常の処理
  try {
    console.log("Getting selected quest direction for:", userId)
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("quest_directions")
      .select("*")
      .eq("user_id", userId)
      .eq("selected", true)
      .limit(1)

    if (error) {
      console.error("Error fetching selected quest direction:", error)
      throw error
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error getting selected quest direction:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// クエストを保存する関数
export async function saveQuests(userId: string, quests: any[]) {
  try {
    console.log("Saving quests for:", userId)
    const supabase = getSupabaseClient()

    // 既存のクエストを削除
    const { error: deleteError } = await supabase.from("quests").delete().eq("user_id", userId)

    if (deleteError) {
      console.error("Error deleting existing quests:", deleteError)
      throw deleteError
    }

    // 新しいクエストを保存
    const questsWithUserId = quests.map((quest, index) => ({
      ...quest,
      user_id: userId,
      order: index,
      created_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("quests").insert(questsWithUserId)

    if (error) {
      console.error("Error saving quests:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error saving quests:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// ユーザーのクエストを取得する関数
export async function getUserQuests(userId: string) {
  if (DEMO_MODE) {
    // デモデータを返す
    return [
      {
        id: 1,
        title: "アートセラピーの基礎理解",
        description: "アートセラピーとは何かを理解し、活動の土台を作る。",
        actions: [
          "書籍やオンライン資料を通じて「アートセラピー」の歴史や理論を調べる。",
          "メンタルケアや自己表現において、アートがどのような役割を果たすかを学ぶ。",
          "専門家や学校のカウンセラーにインタビューを申し込み、基礎知識や注意点を聞いてみる。",
        ],
        outcome: "アートセラピーに関するミニレポートやまとめスライド。",
        difficulty: 2,
        completed: true,
        current: false,
        order: 0,
      },
      {
        id: 2,
        title: "対象とゴールの設定",
        description: "どのような人をサポートしたいのか、そのためにどんな形のアートを活用したいのかを具体化する。",
        actions: [
          "「友人やクラスメイト向け」「地域の高齢者向け」「幼稚園児向け」など、支援したい層をイメージし、ニーズを考える。",
          "学校・地域・施設の協力を得られるか下調べし、アプローチ可能な場所を確認する。",
          "活用したいアートのジャンルを検討（絵画、粘土、音楽、演劇など）し、その理由や必要な準備をリストアップする。",
        ],
        outcome: "対象（ターゲット）とゴールを明文化した企画書の草案。",
        difficulty: 3,
        completed: false,
        current: true,
        order: 1,
      },
      {
        id: 3,
        title: "具体的アクティビティの設計",
        description: "実際に行う活動内容をプログラム化する。",
        actions: [
          "1回あたりのセッション内容（所要時間、使用する道具、手順、テーマ）を組み立てる。",
          "安全面やプライバシー、個人情報保護など、注意すべき項目を洗い出す。",
          "参加者がストレスなく取り組めるように、難易度や手順をできるだけシンプルに調整する。",
          "必要な物品をリストアップし、予算や購入先を検討する。",
        ],
        outcome: "アクティビティの進行プラン（タイムテーブル、役割分担、使用道具リストなど）。",
        difficulty: 4,
        completed: false,
        current: false,
        order: 2,
      },
      {
        id: 4,
        title: "実践（ワークショップまたは交流イベントの実施）",
        description: "実際にアートを用いたセラピー活動を開催してみる。",
        actions: [
          "学校や地域施設、オンラインなど、可能な形式で開催日を設定し、告知・募集を行う。",
          "当日、アクティビティを進行し、参加者の様子を見ながら臨機応変に調整する。",
          "アンケート用紙や簡易チェックリストを準備し、活動後の感想・満足度や気づきを収集する。",
        ],
        outcome: "ワークショップやイベントの実施写真・動画、参加者アンケートやフィードバックの記録",
        difficulty: 5,
        completed: false,
        current: false,
        order: 3,
      },
      {
        id: 5,
        title: "振り返りと発信",
        description: "プロジェクト全体を振り返り、学びや成果をまとめる。さらに今後の発展につなげる。",
        actions: [
          "アンケート結果や参加者の声を分析し、「アートセラピー」にどのような効果・インパクトがあったか検証する。",
          "自分自身が感じた成長や課題を整理し、次のステップ（さらなる企画や進学・将来プランとのつながり）を考える。",
          "SNSや校内新聞などで活動報告を行い、周りに共有する。必要があれば参加者や協力者へお礼のメッセージを送る。",
        ],
        outcome: "活動レポート、事後分析資料、今後のプラン提案書",
        difficulty: 4,
        completed: false,
        current: false,
        order: 4,
      },
    ]
  }

  // 通常の処理
  try {
    console.log("Getting quests for:", userId)
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .order("order", { ascending: true })

    if (error) {
      console.error("Error fetching user quests:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error getting user quests:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// クエストの進捗を更新する関数
export async function updateQuestProgress(questId: number, completed: boolean, current: boolean) {
  try {
    console.log("Updating quest progress for quest ID:", questId)
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("quests")
      .update({
        completed,
        current,
        updated_at: new Date().toISOString(),
      })
      .eq("id", questId)

    if (error) {
      console.error("Error updating quest progress:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error updating quest progress:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// テーブルが存在するか確認する関数
export async function checkTablesExist() {
  try {
    console.log("Checking if tables exist")
    const supabase = getSupabaseClient()

    // riasec_responses テーブルの確認
    const { error: responsesError } = await supabase.from("riasec_responses").select("id").limit(1)

    // riasec_results テーブルの確認
    const { error: resultsError } = await supabase.from("riasec_results").select("id").limit(1)

    // ocean_responses テーブルの確認
    const { error: oceanResponsesError } = await supabase.from("ocean_responses").select("id").limit(1)

    // ocean_results テーブルの確認
    const { error: oceanResultsError } = await supabase.from("ocean_results").select("id").limit(1)

    // passion_shuttles テーブルの確認
    const { error: passionShuttlesError } = await supabase.from("passion_shuttles").select("id").limit(1)

    // passion_shuttle_suggestions テーブルの確認
    const { error: passionShuttleSuggestionsError } = await supabase
      .from("passion_shuttle_suggestions")
      .select("id")
      .limit(1)

    // quest_directions テーブルの確認
    const { error: questDirectionsError } = await supabase.from("quest_directions").select("id").limit(1)

    // quests テーブルの確認
    const { error: questsError } = await supabase.from("quests").select("id").limit(1)

    return {
      responsesTableExists: !responsesError,
      resultsTableExists: !resultsError,
      oceanResponsesTableExists: !oceanResponsesError,
      oceanResultsTableExists: !oceanResultsError,
      passionShuttlesTableExists: !passionShuttlesError,
      passionShuttleSuggestionsTableExists: !passionShuttleSuggestionsError,
      questDirectionsTableExists: !questDirectionsError,
      questsTableExists: !questsError,
      responsesError: responsesError?.message || null,
      resultsError: resultsError?.message || null,
      oceanResponsesError: oceanResponsesError?.message || null,
      oceanResultsError: oceanResultsError?.message || null,
      passionShuttlesError: passionShuttlesError?.message || null,
      passionShuttleSuggestionsError: passionShuttleSuggestionsError?.message || null,
      questDirectionsError: questDirectionsError?.message || null,
      questsError: questsError?.message || null,
    }
  } catch (error) {
    console.error("Error checking tables:", error)
    return {
      responsesTableExists: false,
      resultsTableExists: false,
      oceanResponsesTableExists: false,
      oceanResultsTableExists: false,
      passionShuttlesTableExists: false,
      passionShuttleSuggestionsTableExists: false,
      questDirectionsTableExists: false,
      questsTableExists: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
