import { useRef, useEffect, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Dumbbell,
  Activity,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import ColorBends from '@/components/ui/ColorBends'
import DumbbellScene from './DumbbellScene'
import FeatureSection from './FeatureSection'

gsap.registerPlugin(ScrollTrigger)

const RoleCard = ({
  title,
  description,
  icon: Icon,
  linkTo,
  gradient,
  features
}: {
  title: string
  description: string
  icon: any
  linkTo: string
  gradient: string
  features: string[]
}) => (
  <Card className="role-card group relative overflow-hidden border-0 shadow-2xl bg-white/5 backdrop-blur-md h-full flex flex-col border border-white/10">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`} />
    <CardHeader className="text-center pb-6 relative z-10 pt-10">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
        <Icon size={36} className="text-primary" />
      </div>
      <CardTitle className="text-3xl font-bold text-white mb-2 tracking-tight">
        {title}
      </CardTitle>
      <CardDescription className="text-gray-400">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-0 relative z-10 flex-grow flex flex-col px-8 pb-10">
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-gray-300 text-sm">
            <CheckCircle2 className="w-4 h-4 mr-3 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Link to={linkTo} className="mt-auto block">
        <Button
          className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl transition-all duration-300"
        >
          Join as {title}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </CardContent>
  </Card>
)

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const dumbbellRef = useRef<any>(null)
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

  useGSAP(() => {
    if (!dumbbellRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      }
    })

    // Stage 1 -> Stage 2 (Hero to Feature 1)
    // Horizontal [0, 0, 1.57] -> Vertical [0, 0, 0]
    // Move to Right [2, -1, 0]
    tl.to(dumbbellRef.current.position, { x: 2, y: -0.5, z: 0 }, 0)
    tl.to(dumbbellRef.current.rotation, { z: 0, y: 0.5 }, 0)

    // Stage 2 -> Stage 3 (Feature 1 to Feature 2)
    // Move to Left [-2, -0.5, 0]
    // Slight Y rotation
    tl.to(dumbbellRef.current.position, { x: -2, y: -0.5, z: 0 }, 1)
    tl.to(dumbbellRef.current.rotation, { y: -0.5, z: 0.2 }, 1)

    // Stage 3 -> Stage 4 (Feature 2 to Feature 3)
    // Recenters [0, -1, 0]
    // Gentle tilt
    tl.to(dumbbellRef.current.position, { x: 0, y: -1, z: 1 }, 2)
    tl.to(dumbbellRef.current.rotation, { x: 0.3, y: 0, z: 0 }, 2)

    // Stage 4 -> Stage 5 (Feature 3 to Feature 4)
    // Move Right again or rotate differently
    tl.to(dumbbellRef.current.position, { x: 2, y: 0, z: 0 }, 3)
    tl.to(dumbbellRef.current.rotation, { x: 0, y: Math.PI, z: 1.57 }, 3)

    // Final Stage (to Roles)
    tl.to(dumbbellRef.current.position, { x: 0, y: -5, z: -2 }, 4)
    tl.to(dumbbellRef.current.scale, { x: 0.5, y: 0.5, z: 0.5 }, 4)

    // Fade in text elements
    gsap.utils.toArray('.feature-section').forEach((section: any) => {
      gsap.fromTo(section.querySelector('div'),
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
            toggleActions: 'play reverse play reverse'
          }
        })
    })

  }, { scope: containerRef, dependencies: [dumbbellRef.current] })

  return (
    <div ref={containerRef} className="relative bg-black text-white overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ColorBends
          colors={['#1a1a1a', '#333333', '#4d4d4d', '#ff8e3c']}
          speed={0.1}
          scale={1.5}
          noise={0.05}
          warpStrength={0.5}
        />
      </div>

      {/* 3D Scene Layer */}
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center text-primary font-bold">LOADING EXPERIENCE...</div>}>
        <DumbbellScene modelRef={dumbbellRef} />
      </Suspense>

      {/* Content Layer */}
      <div className="relative z-20">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-6">
          <div className="space-y-4 max-w-4xl">
            <span className="inline-block px-4 py-1 rounded-full border border-white/20 bg-white/5 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              The Future of Fitness
            </span>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
              TRAIN<span className="text-primary">UP</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
              Experience authorized training with personalized plans, real-time tracking, and expert guidance.
            </p>
            <div className="pt-10">
              <Button
                size="lg"
                className="h-16 px-10 text-xl rounded-full bg-white text-black hover:bg-gray-100 font-bold transition-transform hover:scale-105"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              >
                Start Your Journey
              </Button>
            </div>
          </div>
          <div className="absolute bottom-10 animate-bounce">
            <ArrowRight className="rotate-90 text-gray-500" />
          </div>
        </section>

        {/* Features Sections */}
        <div className="relative">
          <section className="feature-container">
            <FeatureSection
              title="Personalized Workouts"
              description="Get custom workouts assigned directly by your professional trainer."
              align="left"
            />
          </section>
          <section className="feature-container">
            <FeatureSection
              title="Track Your Progress"
              description="Monitor every metric. Visualize your improvements with detailed analytics."
              align="right"
            />
          </section>
          <section className="feature-container">
            <FeatureSection
              title="Online Sessions"
              description="Connect face-to-face with your trainer for real-time guidance and motivation."
              align="center"
            />
          </section>
          <section className="feature-container">
            <FeatureSection
              title="Expert Community"
              description="Join a thriving community of fitness enthusiasts and certified pros."
              align="left"
            />
          </section>
        </div>

        {/* Role Selection */}
        <section id="roles" className="py-32 px-6 bg-black">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">CHOOSE YOUR PATH</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Select how you want to join the Trainup revolution.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <RoleCard
                title="Member"
                description="Start your personal transformation journey today."
                icon={Dumbbell}
                linkTo="/user/login"
                gradient="bg-primary/20"
                features={[
                  "Access to certified trainers",
                  "Personalized workout plans",
                  "Progress tracking tools",
                  "Community support"
                ]}
              />

              <RoleCard
                title="Trainer"
                description="Grow your business and inspire others."
                icon={Award}
                linkTo="/trainer/login"
                gradient="bg-orange-500/20"
                features={[
                  "Client management dashboard",
                  "Workout plan builder",
                  "Schedule management",
                  "Performance analytics"
                ]}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-6 border-t border-white/5 bg-black">
          <div className="container mx-auto text-center space-y-12">
            <div className="flex items-center justify-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-3xl font-black tracking-tighter italic">TRAINUP</span>
            </div>

            <div className="flex flex-wrap justify-center gap-10 text-gray-500 font-medium">
              <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-white transition-colors">Contact Support</Link>
            </div>

            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} Trainup. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
