import { useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GradientBlinds from '@/components/ui/GradientBlinds'
import {
  Dumbbell,
  Users,
  TrendingUp,
  Activity,
  Award,
  ArrowRight,
  CheckCircle2,
  Video
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string, index: number }) => (
  <div className="feature-card opacity-0 translate-y-10 p-6 rounded-2xl bg-card/50 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 text-primary group-hover:scale-110 transition-transform duration-300">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
)

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
  <Card className="role-card opacity-0 scale-95 group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 bg-card/40 backdrop-blur-md h-full flex flex-col user-select-none">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`} />
    <CardHeader className="text-center pb-6 relative z-10 pt-10">
      <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-b from-background/80 to-background/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/10">
        <Icon size={48} className="text-primary group-hover:text-accent transition-colors duration-300" />
      </div>
      <CardTitle className="text-4xl font-black text-foreground mb-3 tracking-tight">
        {title}
      </CardTitle>
      <CardDescription className="text-lg font-medium text-muted-foreground/80">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-0 relative z-10 flex-grow flex flex-col px-8 pb-10">
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-muted-foreground font-medium">
            <div className="mr-3 p-1 rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            {feature}
          </li>
        ))}
      </ul>
      <Link to={linkTo} className="mt-auto block">
        <Button
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold py-7 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group-hover:scale-[1.02]"
        >
          Join as {title}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </Link>
    </CardContent>
  </Card>
)


export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
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
    const tl = gsap.timeline()

    tl.from('.hero-badge', {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out'
    })
      .from('.hero-title-main', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.2
      }, '-=0.4')
      .from('.hero-desc', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.6')
      .from('.hero-buttons', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6')

    gsap.to('.feature-card', {
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 85%',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    })

    gsap.to('.role-card', {
      scrollTrigger: {
        trigger: '.roles-section',
        start: 'top 80%',
      },
      scale: 1,
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: 'back.out(1.2)'
    })

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-x-hidden font-sans selection:bg-primary/30">

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <GradientBlinds
            gradientColors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
            blindCount={12}
            noise={0.3}
            dpr={1}
            angle={-45}
            distortAmount={2}
            spotlightRadius={0.8}
            spotlightSoftness={0.6}
            mouseDampening={0.1}
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background z-[1]" />
          <div className="absolute inset-0 bg-black/10 z-[1]" />
        </div>

        <div className="container relative z-10 mx-auto text-center max-w-5xl px-6 pt-20">
          <div className="hero-badge inline-flex items-center px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-white mb-10 shadow-lg hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase">The Future of Fitness is Here</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] text-white drop-shadow-2xl">
            <span className="hero-title-main block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">Unleash</span>
            <span className="hero-title-main block text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-[200%_auto] animate-gradient">Your Potential</span>
          </h1>

          <p className="hero-desc text-xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            Experience authorized training with personalized plans, real-time tracking, and expert guidance.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              className="h-16 px-10 text-xl rounded-full bg-white text-black hover:bg-gray-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] transition-all duration-300 border-0 font-bold"
              onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Journey
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10 text-white/50">
          <ArrowRight className="rotate-90 w-6 h-6" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-32 px-6 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Elite Features</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Everything you need to transform your body and mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              index={0}
              icon={Dumbbell}
              title="Personalized Workouts"
              description="Get custom workouts assigned directly by your professional trainer."
            />
            <FeatureCard
              index={1}
              icon={TrendingUp}
              title="Track Your Progress"
              description="Monitor every metric. Visualize your improvements with detailed analytics."
            />
            <FeatureCard
              index={2}
              icon={Video}
              title="Online Sessions"
              description="Connect face-to-face with your trainer for real-time guidance and motivation."
            />
            <FeatureCard
              index={3}
              icon={Users}
              title="Expert Community"
              description="Join a thriving community of fitness enthusiasts and certified pros."
            />
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="roles" className="roles-section py-32 px-6 relative z-10 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Choose Your Path</h2>
            <p className="text-xl text-muted-foreground">
              Select how you want to join the Trainup revolution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            <RoleCard
              title="Member"
              description="Start your personal transformation journey today."
              icon={Dumbbell}
              linkTo="/user/login"
              gradient="bg-gradient-to-br from-blue-500/20 to-purple-500/20"
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
              gradient="bg-gradient-to-br from-orange-500/20 to-red-500/20"
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
      <footer className="py-16 px-6 border-t border-border/10 bg-black/20 backdrop-blur-lg relative z-10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-8 gap-2">
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-tighter">Trainup</span>
          </div>
          <p className="text-muted-foreground mb-8 text-lg">
            &copy; {new Date().getFullYear()} Trainup. All rights reserved.
          </p>
          <div className="flex justify-center space-x-10 text-muted-foreground font-medium">
            <Link to="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Terms of Service</Link>
            <Link to="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}