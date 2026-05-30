import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trainerForgotPasswordResendOtp, trainerVerifyOtp as trainerForgotPasswordVerifyOtpApi } from "@/services/authService"
import { toast } from "react-toastify"
import ColorBends from "@/components/ui/ColorBends"
import { ArrowLeft } from "lucide-react"

export default function TrainerForgotPasswordVerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email } = location.state || { email: "" }
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!email) {
      toast.error("Invalid recovery session")
      navigate("/trainer/forgot-password")
    }
  }, [email, navigate])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resendTimer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return
    setIsLoading(true)
    try {
      await trainerForgotPasswordVerifyOtpApi(email, otp)
      toast.success('OTP Verified Successfully')
      navigate('/trainer/reset-password', { state: { email } })
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!canResend || isResending) return
    setIsResending(true)
    try {
      await trainerForgotPasswordResendOtp(email)
      toast.success('OTP Resent Successfully')
      setResendTimer(60)
      setCanResend(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
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
            Verification
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-2xl font-bold">Verify OTP</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              Enter the OTP sent to <span className="text-[#00ffd1] break-all">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 text-center">
                <Label htmlFor="otp" className="text-gray-300 font-bold uppercase tracking-wider text-xs block text-center">
                  OTP Code
                </Label>
                <div className="relative flex justify-center gap-3 py-2">
                  <input
                    id="otp"
                    type="text"
                    pattern="\d*"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                    autoFocus
                  />
                  {[...Array(6)].map((_, index) => {
                    const char = otp.split("")[index] || "";
                    const isFocused = otp.length === index;
                    return (
                      <div
                        key={index}
                        className={`w-12 h-14 bg-white/5 border-2 rounded-xl flex items-center justify-center text-xl font-mono font-bold transition-all duration-300 ${
                          isFocused 
                            ? "border-[#00ffd1] shadow-[0_0_15px_rgba(0,255,209,0.35)] bg-white/10 text-[#00ffd1]" 
                            : char 
                            ? "border-white/20 text-white" 
                            : "border-white/10 text-gray-500"
                        }`}
                      >
                        {char || (isFocused ? <span className="animate-pulse text-[#00ffd1]">|</span> : "•")}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#176B87] hover:bg-[#64CCC5] text-white font-black rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-400 text-sm">Didn't receive an OTP?</p>
              <div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isResending}
                  className={`text-xs uppercase tracking-widest font-black transition-all ${
                    !canResend || isResending
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-[#176B87] hover:text-[#64CCC5] cursor-pointer"
                  }`}
                >
                  {isResending
                    ? "Sending..."
                    : !canResend
                    ? `Resend OTP in ${resendTimer}s`
                    : 'Resend OTP'}
                </button>
              </div>
              <div className="pt-2 border-t border-white/5">
                <Link to="/trainer/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}