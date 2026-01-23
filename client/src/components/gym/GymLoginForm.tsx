import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'react-toastify'
import { gymLogin as gymLoginApi } from "@/services/authService"
import { useDispatch } from "react-redux"
import { loginGym } from "@/redux/slices/gymAuthSlice"
import { ROUTES } from "@/constants/routes"

export default function GymLoginForm() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await gymLoginApi(email, password)
            dispatch(loginGym(res.gym))
            toast.success("Gym portal logged in")
            navigate(ROUTES.GYM_DASHBOARD)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed")
            console.log('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-center text-2xl font-semibold text-white mb-6">Gym Sign In</h2>

            <div>
                <Label htmlFor="gym-email" className="text-white sr-only">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="gym-email"
                        type="email"
                        placeholder="Gym Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white pl-10 h-12 focus:ring-2 focus:ring-[#176B87] focus:border-transparent transition-all"
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="gym-password" className="text-white sr-only">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="gym-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white pl-10 pr-10 h-12 focus:ring-2 focus:ring-[#176B87] focus:border-transparent transition-all"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Link to={ROUTES.GYM_FORGOT_PASSWORD} className="text-sm text-[#176B87] hover:text-[#64CCC5] transition-colors">
                    Forgot password?
                </Link>
            </div>

            <Button
                type="submit"
                className="w-full bg-[#176B87] hover:bg-[#135D76] text-white h-12 font-semibold tracking-wide transition-all duration-300 transform hover:scale-[1.02]"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-5 w-5 mr-2"></div>
                        Signing In...
                    </div>
                ) : (
                    "SIGN IN"
                )}
            </Button>

            <div className="mt-6 text-center space-y-2">
                <p className="text-gray-400 text-sm">Don't have an account?</p>
                <Link to={ROUTES.GYM_SIGNUP} className="text-sm text-[#176B87] hover:text-[#64CCC5] font-semibold transition-colors">
                    Partner with us
                </Link>
            </div>
        </form>
    )
}
