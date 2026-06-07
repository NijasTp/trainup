import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { gymResetPassword as gymResetPasswordApi } from "@/services/authService"
import { toast } from "react-toastify"
import ColorBends from "@/components/ui/ColorBends"
import { passwordValidation } from "@/constants/validations"
import { ROUTES } from "@/constants/routes"

export default function GymResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, otp } = location.state || { email: "", otp: "" }
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!email || !otp) {
      toast.error("Invalid session. Please restart recovery flow.")
      navigate(ROUTES.GYM_FORGOT_PASSWORD)
    }
  }, [email, otp, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    const isValid = passwordValidation(password)
    if (!isValid) {
      toast.error('Password should have at least 8 chars, one uppercase, one lowercase, one number, one special char.')
      return
    }
    setIsLoading(true)
    try {
      const res = await gymResetPasswordApi(email, password, otp)
      toast.success(res.message || "Gym portal password reset successfully")
      navigate(ROUTES.GYM_LOGIN)
    } catch (errVal) { const err = errVal as SafeAny;
      toast.error(err.response?.data?.error || "Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
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
            <CardTitle className="text-white text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              Enter your new gym credentials for <span className="text-[#00ffd1] break-all">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="password" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                  New Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white pl-12 pr-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white pl-12 pr-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#176B87] hover:bg-[#64CCC5] text-white font-black rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to={ROUTES.GYM_LOGIN} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
