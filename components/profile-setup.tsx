"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthContext } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const avatars = [
  "/images/avatars/avatar1.png",
  "/images/avatars/avatar2.png",
  "/images/avatars/avatar3.png",
]

interface ProfileSetupProps {
  open: boolean
  onClose: () => void
}

export default function ProfileSetupDialog({ open, onClose }: ProfileSetupProps) {
  const { userProfile, updateUserProfile } = useAuthContext()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState(avatars[0])

  useEffect(() => {
    if (open) {
      setName(userProfile?.display_name || "")
      setAvatar(userProfile?.avatar || avatars[0])
      setStep(userProfile?.display_name ? 1 : 0)
    }
  }, [open, userProfile])

  const next = async () => {
    if (step === 0) {
      setStep(1)
    } else {
      await updateUserProfile(name, avatar)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-6 text-white bg-gray-900">
        {step === 0 ? (
          <div className="space-y-4">
            <p className="text-center text-sm">ユーザー名を設定してください</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="表示名"
              className="bg-gray-800"
            />
            <div className="text-right">
              <Button size="sm" onClick={next} disabled={!name.trim()}>
                次へ
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm">アバターを選択してください</p>
            <div className="flex justify-center space-x-4">
              {avatars.map((src) => (
                <button
                  key={src}
                  onClick={() => setAvatar(src)}
                  className={cn(
                    "rounded-full p-1",
                    avatar === src ? "ring-2 ring-blue-500" : ""
                  )}
                >
                  <img src={src} alt="avatar" className="w-16 h-16 rounded-full" />
                </button>
              ))}
            </div>
            <div className="text-right">
              <Button size="sm" onClick={next}>
                保存
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}