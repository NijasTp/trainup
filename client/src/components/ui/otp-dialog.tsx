import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (otp: string) => void
  onResend?: () => Promise<void>
  email: string
}

export function OTPDialog({ open, onOpenChange, onVerify, email }: OTPDialogProps) {
  const [otp, setOtp] = useState("")
  const [isResendCooldown, setIsResendCooldown] = useState(true)
  const [cooldownSeconds, setCooldownSeconds] = useState(30)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isResendCooldown && cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setIsResendCooldown(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isResendCooldown, cooldownSeconds])

  useEffect(() => {
    if (open) {
      setIsResendCooldown(true)
      setCooldownSeconds(30)
      setOtp("")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      onVerify(otp)
    }
  };

  const handleResend = async () => {
    if (isResendCooldown || isSending) return;
    setIsSending(true)
    try {
      if (onVerify) {
        // Wait for the caller's action
        // (The parent handles the API call and resolves)
        if (onResend) {
          await onResend()
        }
      }
      setIsResendCooldown(true)
      setCooldownSeconds(30)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900/95 backdrop-blur-xl border border-white/10 text-white rounded-3xl p-6 lg:p-8 max-w-sm mx-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl font-bold tracking-tight">Verify Verification Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2 text-center">
            <Label htmlFor="otp" className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Enter the 6-digit code sent to
            </Label>
            <p className="text-[#00ffd1] text-xs font-semibold break-all">{email}</p>
            <Input
              id="otp"
              type="text"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="bg-white/5 border-white/10 text-white text-center tracking-[0.5em] pl-[0.25em] text-2xl h-14 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50 focus:ring-offset-0 font-mono transition-all mt-4"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl h-12 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={otp.length !== 6}
              className="flex-1 bg-[#176B87] hover:bg-[#64CCC5] text-white disabled:opacity-50 rounded-xl h-12 font-bold transition-all duration-300 cursor-pointer"
            >
              Verify OTP
            </Button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendCooldown || isSending}
              className={`text-xs uppercase tracking-widest font-black transition-all ${
                isResendCooldown || isSending
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-[#176B87] hover:text-[#64CCC5] cursor-pointer"
              }`}
            >
              {isSending
                ? "Sending..."
                : isResendCooldown
                ? `Resend OTP in ${cooldownSeconds}s`
                : "Resend OTP"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}