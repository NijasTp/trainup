import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { trainerForgotPasswordResendOtp, trainerVerifyOtp as trainerForgotPasswordVerifyOtpApi } from "@/services/authService"
import { toast } from "react-toastify"

export default function TrainerForgotPasswordVerifyOtp() {
    const navigate = useNavigate()
    const location = useLocation()
    const { email } = location.state || { email: "" }
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [resendTimer, setResendTimer] = useState(60)
    const [canResend, setCanResend] = useState(false)

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => {
                setResendTimer((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        } else {
            setCanResend(true)
        }
    }, [resendTimer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        try {
            await trainerForgotPasswordVerifyOtpApi(email, otp)
            toast.success('OTP Verified Successfully')
            navigate('/trainer/reset-password', { state: { email } })
        } catch (err) {
            setError("Invalid OTP. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (canResend) {
            try {
                await trainerForgotPasswordResendOtp(email)
                toast.success('OTP Resent Successfully')
                setResendTimer(60)
                setCanResend(false)
            } catch (err) {
                toast.error('Failed to resend OTP. Please try again.')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Logo className="justify-center mb-6" />
                </div>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="text-center">
                        <CardTitle className="text-white">Verify OTP</CardTitle>
                        <CardDescription className="text-gray-400">
                            Enter the OTP sent to {email || "your email"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="otp" className="text-white">
                                    OTP Code
                                </Label>
                                <div className="relative mt-2">
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-gray-400 text-sm">Didn't receive an OTP?</p>
                            <Link
                                to="#"
                                onClick={handleResendOtp}
                                className={`text-sm trainup-accent font-medium ${!canResend ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
                            >
                                {canResend ? 'Resend OTP' : `Resend OTP in ${resendTimer}s`}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}