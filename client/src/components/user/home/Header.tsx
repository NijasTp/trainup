import { Button } from "@/components/ui/button"
import { logout } from "@/redux/slices/userAuthSlice"
import { logout as logoutApi } from "@/services/authService"
import { Dumbbell } from "lucide-react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
// import Link from "next/link"

export function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  async function handleLogout() {
    try {
       logoutApi()
      dispatch(logout());
      toast.success("Successfully Logged out")
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-[#176B87]" />
          <span className="text-2xl font-bold text-white">TrainUp</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/services" className="text-sm font-medium text-gray-300 hover:text-[#176B87] transition-colors">
            Services
          </Link>
          <Link to="/trainers" className="text-sm font-medium text-gray-300 hover:text-[#176B87] transition-colors">
            Trainers
          </Link>
          <Link to="/gym" className="text-sm font-medium text-gray-300 hover:text-[#176B87] transition-colors">
            Gym
          </Link>
          <Link to="/nutrition" className="text-sm font-medium text-gray-300 hover:text-[#176B87] transition-colors">
            Nutrition
          </Link>
          <Link to="/profile" className="text-sm font-medium text-gray-300 hover:text-[#176B87] transition-colors">
            Profile
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button className="text-white bg-[#001C30]" onClick={handleLogout}>Logout</Button>
          <Button size="sm" className="bg-[#001C30] hover:bg-[#001C30]/80 text-white">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}