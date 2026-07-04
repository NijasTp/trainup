import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import SoftAurora from '@/components/ui/SoftAurora'

import HeroSection from './HeroSection'
import FeatureSection from './FeatureSection'
import CTASection from './CTASection'
import { Activity } from 'lucide-react'
import { useEffect } from 'react'

import dietTracking from "/src/assets/workouts/Pushups/0.jpg"
import trainerCoaching from "/src/assets/landing/trainer_coaching.png"
import fitnessAnalytics from "/src/assets/landing/fitness_analytics.png"
import workoutStreak from "/src/assets/landing/workout_streak.png"
import workoutCalendar from "/src/assets/landing/workout_calendar.png"

export default function LandingPage() {
  const { user } = useSelector((state: SafeAny) => state.userAuth)
  const { trainer } = useSelector((state: SafeAny) => state.trainerAuth)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/home')
    } else if (trainer) {
      navigate('/trainer/dashboard')
    }
  }, [user, trainer, navigate])

  return (
    <div className="relative bg-black text-white selection:bg-cyan-500/30 font-inter overflow-x-hidden">

      {/* Premium Background Layer */}
      <div className="fixed inset-0 z-0 opacity-60">
        <SoftAurora
          speed={0.4}
          scale={1.2}
          brightness={1.2}
          color1="#00e5ff"
          color2="#7000ff"
          noiseFrequency={2}
          noiseAmplitude={1.2}
          bandHeight={0.4}
          bandSpread={1.5}
          enableMouseInteraction
          mouseInfluence={0.3}
          className="pointer-events-none"
        />
      </div>



      <div className="relative z-10">

        <main>
          {/* Sections */}
          <HeroSection />

          <div id="features" className="relative">
            {/* Section Spacer */}
            <div className="h-24 w-full bg-gradient-to-b from-transparent to-black" />

            <FeatureSection
              title="Track Your Food Records"
              description="Easily log your meals and track calories, macros, and hydration. Our intuitive interface makes nutrition management effortless."
              imagePath={dietTracking}
              bullets={[
                "Real-time calorie tracking",
                "Detailed macro breakdown",
                "Custom meal templates for rapid logging",
                "Hydration and supplement tracking"
              ]}
              align="left"
            />

            <FeatureSection
              title="Get Personalized Trainer"
              description="Connect with certified fitness professionals who craft custom programs tailored to your specific biomechanics and lifestyle."
              imagePath={trainerCoaching}
              bullets={[
                "Direct 1-on-1 video coaching sessions",
                "Daily chat support with your coach",
                "Form checks via video uploads",
                "Professional accountability that works"
              ]}
              align="right"
            />

            <FeatureSection
              title="Track Your Progress"
              description="Visualize your journey with interactive charts and deep-dive metrics. Data-driven insights to optimize your training."
              imagePath={fitnessAnalytics}
              bullets={[
                "Interactive performance trend charts",
                "Body composition and photo logging",
                "One-rep max (1RM) estimations",
                "Training volume & intensity heatmaps"
              ]}
              align="left"
            />

            <FeatureSection
              title="Daily Streak Motivation"
              description="Consistency is the key to transformation. Our streak system gamifies your hard work and keeps you motivated every single day."
              imagePath={workoutStreak}
              bullets={[
                "Visual streak tracking & milestones",
                "Community leaderboard participation",
                "Personal record (PR) celebration system",
                "Motivational push notifications"
              ]}
              align="right"
              />

            <FeatureSection
              title="Workout Scheduling"
              description="Never guess what to do next. A seamless visual calendar that syncs directly with your trainer's assignments."
              imagePath={workoutCalendar}
              bullets={[
                "Intuitive drag-and-drop planning",
                "Syncs with your mobile calendar",
                "Flexible session rescheduling",
                "Past session history and notes"
              ]}
              align="left"
            />
          </div>

          <CTASection />
        </main>

        {/* Footer */}
        <footer className="py-32 px-6 border-t border-white/5 bg-[#030303] relative overflow-hidden font-inter">
          {/* Subtle footer glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-5 gap-16 mb-24">
              <div className="col-span-2 space-y-8">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <Activity className="w-8 h-8 text-cyan-500" />
                  <span className="text-3xl font-black tracking-tighter italic text-white font-bebas">TRAINUP</span>
                </div>
                <p className="text-gray-500 max-w-sm font-medium leading-relaxed text-lg font-outfit">
                  Revolutionizing personal training through high-end modern technology and community-driven success. Built for those who demand excellence.
                </p>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-cyan-400">
                    <span className="font-bold text-xs uppercase">tw</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-cyan-400">
                    <span className="font-bold text-xs uppercase">ig</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-cyan-400">
                    <span className="font-bold text-xs uppercase">ln</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-bold tracking-wide uppercase text-xs">Product</h4>
                <ul className="space-y-4 text-gray-500 text-sm font-medium">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Trainer Search</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing Plans</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Success Stories</a></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-bold tracking-wide uppercase text-xs">Platform</h4>
                <ul className="space-y-4 text-gray-500 text-sm font-medium">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Mobile App</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">For Trainers</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">API Docs</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-bold tracking-wide uppercase text-xs">Company</h4>
                <ul className="space-y-4 text-gray-500 text-sm font-medium">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-gray-600 text-[13px] font-medium tracking-wide">
                &copy; {new Date().getFullYear()} Trainup Platform S-Labs. Locally hosted version.
              </p>
              <div className="flex items-center gap-1.5 text-gray-600 text-[13px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                System Status: Operational
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
