// components/user/home/HeroSection.tsx
import { Flame } from "lucide-react";
import LiquidEther from "@/components/ui/LiquidEther";

export default function HeroSection({ streak }: { streak: number }) {
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden rounded-3xl">
      <LiquidEther
        colors={['#7C3AED', '#EC4899', '#8B5CF6']}
        mouseForce={30}
        cursorSize={120}
        resolution={0.6}
        autoDemo={true}
        autoSpeed={0.4}
        autoIntensity={2.5}
        className="absolute inset-0"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="text-white font-semibold">{streak} Day Streak!</span>
        </div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
          Welcome Back, <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Champion!</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 max-w-3xl drop-shadow-md">
          Ready to crush today's goals? Let's see what's on your fitness agenda.
        </p>
      </div>
    </section>
  );
}