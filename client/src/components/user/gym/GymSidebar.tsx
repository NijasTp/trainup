import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck2,
  Dumbbell,
  ShoppingBag,
  Megaphone,
  Heart,
  ChevronRight
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    path: ROUTES.USER_GYM_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Announcements",
    path: ROUTES.USER_GYM_ANNOUNCEMENTS,
    icon: Megaphone,
  },
  {
    title: "Attendance",
    path: ROUTES.USER_GYM_ATTENDANCE,
    icon: CalendarCheck2,
  },
  {
    title: "Equipment",
    path: ROUTES.USER_GYM_EQUIPMENT,
    icon: Dumbbell,
  },
  {
    title: "Shop",
    path: ROUTES.USER_GYM_SHOP,
    icon: ShoppingBag,
  },
  {
    title: "Wishlist",
    path: ROUTES.USER_WISHLIST,
    icon: Heart,
  },
];

export function GymSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-72 h-[calc(100vh-160px)] fixed top-28 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden transition-all duration-500 z-20">
      <div className="flex flex-col gap-2 relative z-10">
        <div className="px-4 py-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Tactical Navigation</p>
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-primary text-black font-black"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary-foreground opacity-100 animate-pulse" />
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "p-2 rounded-xl transition-colors duration-300",
                  isActive ? "bg-black/10" : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <Icon size={18} className={cn(isActive ? "text-black" : "text-primary")} />
                </div>
                <span className="text-xs uppercase tracking-widest italic">{item.title}</span>
              </div>

              <ChevronRight
                size={16}
                className={cn(
                  "relative z-10 transition-transform duration-300",
                  isActive ? "text-black opacity-100" : "text-zinc-700 group-hover:text-primary group-hover:translate-x-1"
                )}
              />
            </Link>
          );
        })}
      </div>

    </aside>
  );
}
