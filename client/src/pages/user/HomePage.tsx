import { useEffect } from "react";
import { TrainerCarousel } from "@/components/user/home/TrainerCerousel";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { Hero } from "@/components/user/home/UserHero";
import { QuickStats } from "@/components/user/home/UserQuickStats";
import { Upcoming } from "@/components/user/home/UserUpcoming";
import { CommunityPreview } from "@/components/user/home/UserCommunityPreview";
import { SuggestedWorkouts } from "./UserSuggestedWorkouts";
import { GymAnnouncements } from "@/components/user/home/UserGymAnnouncements";
import { TipOfTheDay } from "@/components/user/home/UserTipOfTheDay";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";



export default function HomePage() {
  useEffect(() => {
    document.title = "TrainUp - Dashboard";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your fitness hub: stats, workouts, diet, trainers and community.");

    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container py-6 space-y-8 animate-fade-in">
        <Hero />
        <QuickStats />
        <TrainerCarousel />
        <Upcoming />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SuggestedWorkouts />
            <CommunityPreview />
          </div>
          <div className="space-y-6">
            <GymAnnouncements />
            <TipOfTheDay />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}