"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DisplayNameDialogProps {
  open: boolean
  onSave: (name: string) => Promise<void>
}

export function DisplayNameDialog({ open, onSave }: DisplayNameDialogProps) {
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setName("")
  }, [open])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim())
    setSaving(false)
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md p-6 text-white bg-gray-900 border border-cyan-500/30">
        <div className="space-y-4">
          <p className="text-sm text-center">表示名を入力してください</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="表示名" className="bg-gray-800" />
          <div className="text-right">
            <Button size="sm" onClick={handleSave} disabled={!name.trim() || saving}>
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
