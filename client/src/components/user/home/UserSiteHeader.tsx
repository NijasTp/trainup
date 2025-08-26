import type React from "react"
import { logout } from "@/redux/slices/userAuthSlice"
import type { RootState } from "@/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logout as logoutApi } from "@/services/authService"
import { Bell, CalendarClock, Megaphone, Search, Users, Flame } from "lucide-react"
import { Input } from "@/components/ui/input"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Avatar } from "@radix-ui/react-avatar"
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type SiteHeaderProps = {}

export const SiteHeader: React.FC<SiteHeaderProps> = () => {
  const user = useSelector((state: RootState) => state.userAuth.user)
  const userName = user?.name || "Me"
  const userAvatar =
    user?.profileImage || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop"
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    dispatch(logout())
     logoutApi()
    localStorage.removeItem("profilePrompted") // Clear profilePrompted on logout
    console.log("Successfully signed out")
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 font-display text-xl tracking-wider">
          <div className="ms-3">
            <span className="font-extrabold">TRAIN</span>
            <span className="text-accent font-extrabold">UP</span>
          </div>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl ml-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search workouts, diets, trainers..." className="pl-9 bg-secondary/40" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40">
            <Flame
              className={`h-5 w-5 ${user?.streak ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`}
            />
            <span className="text-sm font-medium">{user?.streak || 0}</span>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="p-2 rounded hover:bg-muted-foreground/5">
              <div className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 rounded-full bg-amber-400 text-[10px] grid place-items-center">
                  2
                </span>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="w-72 rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              <DropdownMenu.Label className="px-2 py-1 text-sm font-semibold">Notifications</DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-muted" />
              <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1 text-sm">
                <CalendarClock className="h-8 w-4 text-accent" />
                Next session in 3h 12m
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1 text-sm">
                <Megaphone className="h-8 w-4 text-accent" />
                New gym announcement
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1 text-sm">
                <Users className="h-8 w-4 text-accent" />
                Trainer accepted your request
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Avatar / Account dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted-foreground/5">
              <Avatar className="h-6 w-6">
                <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
                <AvatarFallback>{userName[0]?.toUpperCase() || "ME"}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{userName}</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="w-56 rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              <DropdownMenu.Label className="px-2 cursor-pointer py-2 text-sm font-semibold">
                My Account
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-muted" />
              <DropdownMenu.Item asChild>
                <Link to="/profile" className="block cursor-pointer px-2 py-2 text-sm">
                  Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/settings" className="block px-2 cursor-pointer py-2 text-sm">
                  Settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-2 cursor-pointer py-2 text-sm" onSelect={handleSignOut}>
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}