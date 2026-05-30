import { type ReactNode } from "react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { GymSidebar } from "@/components/user/gym/GymSidebar";

interface UserGymLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function UserGymLayout({ children }: UserGymLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-x-hidden font-outfit">
      <div className="fixed inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>

      <SiteHeader />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-12 flex gap-8 flex-1 z-10">
        {/* Sidebar Space Provider */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <GymSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 py-12 space-y-12 min-w-0">
          {children}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
