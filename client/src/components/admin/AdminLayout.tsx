import type React from "react"
import { Dumbbell, LayoutDashboard, Users, UserCheck, Building2, LogOut, FileText } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logoutAdmin } from "@/services/authService"
import { logout } from "@/redux/slices/adminAuthSlice"

const Logo = ({ className }: { className?: string }) => (
    <div className={`flex items-center ${className}`}>
        <Dumbbell className="mr-2" />
        <div className="text-2xl font-bold text-white">
            <span className="text-[#4B8B9B]">Train</span>up
        </div>
    </div>
)

interface AdminLayoutProps {
    children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: UserCheck, label: "Trainers", path: "/admin/trainers" },
        { icon: Building2, label: "Gyms", path: "/admin/gyms" },
        { icon: FileText, label: "Templates", path: "/admin/templates" },
    ]

    const handleLogout = async () => {
        try {
            dispatch(logout())
            await logoutAdmin()
            navigate("/admin/login")
        } catch (error: any) {
            console.log('error logout:', error)
        }
    }

    return (
        <div className="min-h-screen bg-[#1F2A44] flex">
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
        `}
            </style>

            {/* Sidebar */}
            <div className="w-64 bg-[#111827] border-r border-[#4B8B9B]/30">
                <div className="p-6">
                    <Logo />
                </div>

                <nav className="mt-8">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${isActive
                                    ? "bg-[#4B8B9B]/20 text-[#4B8B9B] border-r-2 border-[#4B8B9B]"
                                    : "text-gray-300 hover:bg-[#1F2A44] hover:text-white"
                                    }`}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </button>
                        )
                    })}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-md transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">{children}</div>
        </div>
    )
}