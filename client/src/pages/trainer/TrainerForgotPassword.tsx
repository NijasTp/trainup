import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { trainerForgotPassword as trainerForgotPasswordApi } from "@/services/authService"

export default function TrainerForgotPassword() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        try {
            await trainerForgotPasswordApi(email)
            navigate('/trainer/forgot-password/verify', { state: { email } })
        } catch (err) {
            setError("Failed to send OTP. Please check your email and try again.")
        } finally {
            setIsLoading(false)
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
                        <CardTitle className="text-white">Forgot Password</CardTitle>
                        <CardDescription className="text-gray-400">
                            Enter your email to receive an OTP
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
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full trainup-primary text-white hover:bg-opacity-80"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending OTP..." : "Send OTP"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-gray-400 text-sm">Remembered your password?</p>
                            <Link to="/trainer/login" className="text-sm trainup-accent hover:underline font-medium">
                                Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}