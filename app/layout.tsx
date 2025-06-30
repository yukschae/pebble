import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/providers/theme-provider"
import { AuthProvider } from "@/components/auth-provider";


export const metadata: Metadata = {
  title: "LimitFree - 探究活動支援アプリ",
  description: "あなたの興味と才能を掛け合わせた、独自のキャリアパスを探索しましょう。",
    generator: 'v0.dev'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark" 
          enableSystem={false} 
          disableTransitionOnChange
        >
          <AuthProvider> 
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}