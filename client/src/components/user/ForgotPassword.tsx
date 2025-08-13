import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { useNavigate } from "react-router-dom"
import { OTPDialog } from "@/components/ui/otp-dialog"
import { forgotPassword, verifyForgotPasswordOtp } from "@/services/authService"
import { toast } from "react-toastify"

export default function ForgotPasswordPage() {
  const bgImage = "https://png.pngtree.com/background/20230516/original/pngtree-dark-gym-where-you-can-take-in-the-surrounding-light-picture-image_2611114.jpg"
  const [email, setEmail] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [isCooldown, setIsCooldown] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCooldown) {
      toast.warning("Please wait 30 seconds before requesting another OTP.");
      return;
    }
    try {

      const response = await forgotPassword(email)
      toast.success(response)
      setShowOTP(true)
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), 30 * 1000);

    } catch (error: any) {
      toast.error(error.message)
      console.log(error.message)
    }
  }

  const handleOTPVerify = async (otp: string) => {
    try {
      console.log('working top')
      await verifyForgotPasswordOtp(otp, email)
      toast.success("Verification Successful")
      setShowOTP(false)
      navigate('/new-password', { state: { email } })

    } catch (error: any) {
      console.log(error)
      toast.error(error)
    }

  }

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-70 pointer-events-none z-0" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <Logo className="justify-center mb-6" />
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Forgot Password</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your email address and we'll send you a verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full trainup-primary text-white hover:bg-opacity-80">
                Send Verification Code
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-white text-sm trainup-accent hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <OTPDialog open={showOTP} onOpenChange={setShowOTP} onVerify={handleOTPVerify} email={email} />
    </div>
  )
}
