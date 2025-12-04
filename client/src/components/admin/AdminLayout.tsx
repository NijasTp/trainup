import type React from "react"
import { useState } from "react"
import { Dumbbell, LayoutDashboard, Users, UserCheck, Building2, LogOut, FileText, Menu, X } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logoutAdmin } from "@/services/authService"
import { logout } from "@/redux/slices/adminAuthSlice"
import { Button } from "@/components/ui/button"

const Logo = ({ className }: { className?: string }) => (
    <div className={`flex items-center ${className}`}>
        <Dumbbell className="mr-2 h-6 w-6 text-[#4B8B9B]" />
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#1F2A44]">
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
        `}
            </style>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111827] border-b border-[#4B8B9B]/30 flex items-center justify-between px-4 z-50">
                <Logo />
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white hover:bg-[#1F2A44]">
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#111827] border-r border-[#4B8B9B]/30 transform transition-transform duration-200 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6 hidden md:block">
                        <Logo />
                    </div>

                    {/* Mobile Menu Header inside Sidebar */}
                    <div className="md:hidden p-6 flex items-center justify-between border-b border-[#4B8B9B]/30">
                        <Logo />
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${isActive
                                        ? "bg-[#4B8B9B]/20 text-[#4B8B9B] border border-[#4B8B9B]/50"
                                        : "text-gray-400 hover:bg-[#1F2A44] hover:text-white"
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-[#4B8B9B]" : "text-gray-500 group-hover:text-white"}`} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-[#4B8B9B]/30">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-gray-400 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors group"
                        >
                            <LogOut className="mr-3 h-5 w-5 group-hover:text-red-400" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}