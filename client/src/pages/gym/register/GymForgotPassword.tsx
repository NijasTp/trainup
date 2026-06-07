import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { gymForgotPassword } from "@/services/authService"
import { toast } from "react-toastify"
import ColorBends from "@/components/ui/ColorBends"
import { OTPDialog } from "@/components/ui/otp-dialog"
import { ROUTES } from "@/constants/routes"

export default function GymForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await gymForgotPassword(email)
      toast.success("OTP sent to your gym email successfully")
      setShowOTP(true)
    } catch (errVal) { const err = errVal as SafeAny;
      toast.error(err.response?.data?.error || "Failed to send OTP. Please check your email and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = (otp: string) => {
    toast.success("OTP code entered successfully")
    setShowOTP(false)
    navigate('/gym/reset-password', { state: { email, otp } })
  }

  const handleResendOtp = async () => {
    try {
      await gymForgotPassword(email)
      toast.success("OTP Resent Successfully")
    } catch (errVal) { const err = errVal as SafeAny;
      toast.error(err.response?.data?.error || "Failed to resend OTP. Please try again.")
      throw err
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4 lg:p-8">
      {/* ColorBends Background Layer */}
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
          className="pointer-events-none"
          style={{ pointerEvents: 'none' }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-center text-4xl font-black tracking-tighter text-white mb-2">
            TRAIN<span className="text-[#176B87]">UP</span>
          </h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest text-center">
            Gym Recovery
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              Enter your registered gym email to receive an OTP verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                  Gym Email Address
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your gym email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#176B87] hover:bg-[#64CCC5] text-white font-black rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-gray-400 text-sm">Remembered your password?</p>
              <Link to={ROUTES.GYM_LOGIN} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <OTPDialog
        open={showOTP}
        onOpenChange={setShowOTP}
        onVerify={handleOTPVerify}
        onResend={handleResendOtp}
        email={email}
      />
    </div>
  )
}
