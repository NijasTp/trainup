
import type React from "react"

import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { toast } from "react-toastify"
import { passwordValidation } from "@/constants/validations"
import { resetPassword } from "@/services/authService"

export default function NewPasswordPage() {
    const bgImage = "https://png.pngtree.com/background/20230516/original/pngtree-dark-gym-where-you-can-take-in-the-surrounding-light-picture-image_2611114.jpg"
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { state } = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        console.log(state.email)
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (password !== confirmPassword) {
                toast.error("Passwords don't match")
                return
            }
            let isValid = passwordValidation(password)
            if (!isValid) {
                toast.error('Password should be at least 8 characters long and include uppercase, lowercase, number, and special character.')
                return
            }
            await resetPassword(state.email, password)
            toast.success("Password reset successful")
            navigate('/login')
        } catch (error: any) {
            toast.error('Error updating password')
            console.log(error.message)
        }

    }
    return (
        <div
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative",
            }}
            className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black opacity-70 z-0"

            />
            <div className="w-full max-w-md space-y-6 relative z-10">
                <div className="text-center">
                    <Logo className="justify-center mb-6" />
                </div>
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="text-center">
                        <CardTitle className="text-white">Set New Password</CardTitle>
                        <CardDescription className="text-gray-400">Create a strong password for your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="password" className="text-white">
                                    New Password
                                </Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword" className="text-white">
                                    Confirm Password
                                </Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-white pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full trainup-primary text-white hover:bg-opacity-80">
                                Update Password
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm trainup-accent hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
