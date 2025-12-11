
import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "@/services/authService"
import { toast } from "react-toastify"

interface OTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (otp: string) => void
  email: string
}

export function OTPDialog({ open, onOpenChange, onVerify, email }: OTPDialogProps) {
  const [otp, setOtp] = useState("")
  const [isResendCooldown, setIsResendCooldown] = useState(true)
  const [cooldownSeconds, setCooldownSeconds] = useState(30)

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
    return () => clearInterval(timer)
  }, [isResendCooldown, cooldownSeconds])

  useEffect(() => {
    if (open) {
      setIsResendCooldown(true)
      setCooldownSeconds(30)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onVerify(otp)
  }

  const handleResend = async () => {
    if (isResendCooldown) {
      toast.warning(`Please wait ${cooldownSeconds} seconds before requesting another OTP.`)
      return
    }

    try {
      const response = await forgotPassword(email)
      toast.success(response)
      setIsResendCooldown(true)
      setCooldownSeconds(30)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Verify OTP</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="otp" className="text-white">
              Enter the 6-digit code sent to your email
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="bg-gray-700 border-gray-600 text-white mt-2"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-1">
              Verify OTP
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendCooldown}
              className={`text-sm trainup-accent hover:underline ${isResendCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isResendCooldown ? `Resend OTP in ${cooldownSeconds}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}