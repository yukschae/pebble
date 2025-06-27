/**
 * 認証チェックコンポーネント
 *
 * このコンポーネントは、ユーザーが認証されているかどうかをチェックし、
 * 認証されていない場合はログインページにリダイレクトします。
 * デモモードが有効な場合は、認証チェックをバイパスします。
 *
 * 主な機能：
 * - ユーザーの認証状態のチェック
 * - 未認証ユーザーのリダイレクト
 * - デモモードのサポート
 * - ローディング状態の表示
 *
 * 使用している主要なライブラリ：
 * - React (useEffect, useState)
 * - Next.js (useRouter)
 *
 * データフロー：
 * 1. useAuthフックからユーザー情報とローディング状態を取得
 * 2. ユーザーが認証されていない場合、ログインページにリダイレクト
 * 3. デモモードの場合、認証チェックをスキップ
 *
 * 関連ファイル：
 * - lib/supabase.ts (認証ロジック)
 */

"use client"

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/supabase";

interface AuthCheckProps {
  children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // const [loadingTimeout, setLoadingTimeout] = useState(false); // KEEP THIS COMMENTED OUT FOR NOW

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    console.log("AuthCheck: Component MOUNTED. Initial props from useAuth:", { user: !!user, loading, isDemoMode });
    setMounted(true);

    // Original timeout logic - keep commented for now to isolate the primary loading issue
    /*
    const timer = setTimeout(() => {
      if (loading) { // This 'loading' is the state from useAuth at the time setTimeout was scheduled
        console.error("AuthCheck: Authentication check TIMEOUT (10s) - redirecting to /");
        setLoadingTimeout(true);
        router.push("/");
      }
    }, 10000);
    return () => {
      console.log("AuthCheck: Cleanup for mount effect (clearing timeout)");
      clearTimeout(timer);
    };
    */
  }, []); // Empty dependency array for mount effect

  useEffect(() => {
    console.log("AuthCheck: Dependency effect [user, loading, mounted, router, isDemoMode] triggered.", { user: !!user, loading, mounted, isDemoMode });

    if (loading) {
      console.log("AuthCheck: Still loading (from useAuth), no action in this effect.");
      return;
    }

    if (isDemoMode) {
      console.log("AuthCheck: DEMO MODE, skipping redirect logic.");
      return;
    }

    if (!user && mounted) { // Only redirect if mounted and not loading
      console.log("AuthCheck: No user AND component is MOUNTED, redirecting to /");
      router.push("/");
    } else if (user && mounted) {
      console.log("AuthCheck: User authenticated, component is MOUNTED. Children should render.");
    } else if (!mounted) {
      console.log("AuthCheck: Component NOT YET MOUNTED, deferring redirect decision.");
    }
  }, [user, loading, mounted, router, isDemoMode]);


  // // ローディングタイムアウトの場合
  // if (loadingTimeout) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
  //       <div className="text-white mb-4">認証に時間がかかっています</div>
  //       <button onClick={() => router.push("/")} className="px-4 py-2 bg-blue-600 text-white rounded-md">
  //         ログインページに戻る
  //       </button>
  //     </div>
  //   )
  // }

  // ローディング中は読み込み表示
  if (loading) {
    console.log("AuthCheck: RENDERING loading spinner (loading is true).");
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not loading:
  if (isDemoMode) {
    console.log("AuthCheck: RENDERING children (demo mode, not loading).");
    return <>{children}</>;
  }

  if (!user) {
    console.log("AuthCheck: RENDERING null (no user, not loading). Expecting redirect effect to handle navigation.");
    // It's often better to show a loading/redirecting indicator here too,
    // rather than null, if the redirect is expected.
    return (
      <div className="flex items-center justify-center min-h-dvh bg-gray-900">
         <p className="text-white">Redirecting to login...</p>
     </div>
    );
  }

  console.log("AuthCheck: RENDERING children (user authenticated, not loading).");
  return <>{children}</>;
}