
import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { toast } from 'react-toastify'
import { trainerLogin as trainerLoginApi } from "@/services/authService"
import { useDispatch } from "react-redux"
import { loginTrainer } from "@/redux/slices/trainerAuthSlice"

export default function TrainerLogin() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res=await trainerLoginApi(email, password)
            dispatch(loginTrainer({trainer:res.trainer}))
            toast.success('Trainer Logged in')
            navigate('/trainer/dashboard', { state: { email } })
        } catch (error: any) {
            toast.error(error.response.data.error||error.message)
            console.log('Error:',error)
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
                        <CardTitle className="text-white">Trainer Login</CardTitle>
                        <CardDescription className="text-gray-400">Sign in to your trainer account</CardDescription>
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

                            <div>
                                <Label htmlFor="password" className="text-white">
                                    Password
                                </Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
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

                            <div className="flex items-center justify-between">
                                <Link to="/trainer/forgot-password" className="text-sm trainup-accent hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full trainup-primary text-white hover:bg-opacity-80">
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-gray-400 text-sm">Don't have an account?</p>
                            <Link to="/trainer/apply" className="text-sm trainup-accent hover:underline font-medium">
                                Apply as a Trainer
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
