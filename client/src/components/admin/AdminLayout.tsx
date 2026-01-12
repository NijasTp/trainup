
import type React from "react"
import { useState } from "react"
import {
    Dumbbell, LayoutDashboard, Settings,
    Shield,
    FileText, Menu, X, Users, UserCheck, LogOut, DollarSign, Star
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logoutAdmin } from "@/services/authService"
import { logout } from "@/redux/slices/adminAuthSlice"
import { Button } from "@/components/ui/button"

const Logo = ({ className }: { className?: string }) => (
    <div className={`flex items-center ${className} `}>
        <Dumbbell className="mr-2 h-6 w-6 text-primary" />
        <div className="text-2xl font-bold text-foreground">
            <span className="text-primary">Train</span>up
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
        { icon: DollarSign, label: "Transactions", path: "/admin/transactions" },
        { icon: Star, label: "Ratings", path: "/admin/ratings" },
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
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background/95 to-secondary/20">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 z-50">
                <Logo />
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="hover:bg-primary/5">
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-md border-r border-border/50 transform transition-transform duration-200 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6 hidden md:block">
                        <Logo />
                    </div>

                    {/* Mobile Menu Header inside Sidebar */}
                    <div className="md:hidden p-6 flex items-center justify-between border-b border-border/50">
                        <Logo />
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
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
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        } `}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} `} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-border/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors group"
                        >
                            <LogOut className="mr-3 h-5 w-5 group-hover:text-destructive" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0 relative z-0">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}