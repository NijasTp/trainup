import { useEffect, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Activity } from 'lucide-react'
import ColorBends from '@/components/ui/ColorBends'
import HeroSection from './HeroSection'
import FeatureSection from './FeatureSection'
import CTASection from './CTASection'

export default function LandingPage() {
  const { user } = useSelector((state: any) => state.userAuth)
  const { trainer } = useSelector((state: any) => state.trainerAuth)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/home')
    } else if (trainer) {
      navigate('/trainer/dashboard')
    }
  }, [user, trainer, navigate])

  return (
    <div className="relative bg-black text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">

      {/* Premium Background Layer */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <ColorBends
          colors={['#000000', '#0a1a1f', '#072e33', '#000000']}
          speed={0.03}
          scale={1.5}
          noise={0.02}
          warpStrength={0.2}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation / Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-8">
          <nav className="container mx-auto max-w-7xl flex items-center justify-between backdrop-blur-xl bg-black/40 px-8 py-4 rounded-full border border-white/10 shadow-2xl transition-all hover:bg-black/50">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-2xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors">TRAINUP</span>
            </div>

            <div className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide text-gray-400">
              <a href="#features" className="hover:text-white transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
              </a>
              <a href="#community" className="hover:text-white transition-colors relative group">
                Community
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
              </a>
              <a href="#pricing" className="hover:text-white transition-colors relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full" />
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/user/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors px-4">Login</Link>
              <Link to="/user/login" className="bg-white text-black px-8 py-3 rounded-full text-sm font-black hover:bg-cyan-400 hover:text-black transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        <main>
          {/* Sections */}
          <HeroSection />

          <div id="features" className="relative">
            {/* Section Spacer */}
            <div className="h-24 w-full bg-gradient-to-b from-transparent to-black" />

            <FeatureSection
              title="Track Your Food Records"
              description="Easily log your meals and track calories, macros, and hydration. Our intuitive interface makes nutrition management effortless."
              imagePath="/src/assets/diet-image.png"
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
              imagePath="/assets/trainer-image.png"
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
              imagePath="/assets/progress-image.png"
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
        <footer className="py-32 px-6 border-t border-white/5 bg-[#030303] relative overflow-hidden">
          {/* Subtle footer glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-5 gap-16 mb-24">
              <div className="col-span-2 space-y-8">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <Activity className="w-8 h-8 text-cyan-500" />
                  <span className="text-3xl font-black tracking-tighter italic text-white">TRAINUP</span>
                </div>
                <p className="text-gray-500 max-w-sm font-light leading-relaxed text-lg">
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
