import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import video from '@/assets/gymhero.mp4'
import {
  Dumbbell,
  Users,
  TrendingUp,
  Activity,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string, index: number }) => (
  <div className="feature-card opacity-0 translate-y-10 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors duration-300">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
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
  <Card className="role-card opacity-0 scale-95 group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 bg-card/80 backdrop-blur-sm h-full flex flex-col">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`} />
    <CardHeader className="text-center pb-4 relative z-10">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-background/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
        <Icon size={40} className="text-primary group-hover:text-accent transition-colors duration-300" />
      </div>
      <CardTitle className="text-3xl font-bold text-foreground mb-2">
        {title}
      </CardTitle>
      <CardDescription className="text-base">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-0 relative z-10 flex-grow flex flex-col">
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Link to={linkTo} className="mt-auto">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
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

  useGSAP(() => {
    const tl = gsap.timeline()

    tl.from('.hero-badge', {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
      .from('.hero-title-main', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.hero-char', {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.03,
        ease: 'back.out(1.7)'
      }, '-=0.5')
      .from('.hero-desc', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.hero-buttons', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.5')

    gsap.to('.feature-card', {
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 80%',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    })

    gsap.to('.role-card', {
      scrollTrigger: {
        trigger: '.roles-section',
        start: 'top 75%',
      },
      scale: 1,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.2)'
    })

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-x-hidden">

      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>

        <div className="container relative z-10 mx-auto text-center max-w-4xl px-6 pt-20">
          <div className="hero-badge inline-flex items-center px-4 py-2 rounded-full bg-primary/20 text-primary-foreground mb-8 border border-primary/30 backdrop-blur-md">
            <Activity className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Elevate Your Fitness Journey</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-tight text-white">
            <span className="hero-title-main block mb-2">Transform Your Body</span>
          </h1>

          <p className="hero-desc text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Connect with elite trainers, track your progress with precision, and achieve your fitness goals through personalized guidance.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all duration-300 border-0"
              onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg rounded-full border-2 bg-transparent text-white hover:bg-white/10 hover:text-white border-white/20 backdrop-blur-sm"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 px-6 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and support to help you reach your full potential.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              index={0}
              icon={Users}
              title="Expert Trainers"
              description="Connect with certified professionals who customize plans just for you."
            />
            <FeatureCard
              index={1}
              icon={Activity}
              title="Workout Tracking"
              description="Log every rep, set, and mile. Visualize your progress over time."
            />
            <FeatureCard
              index={2}
              icon={Calendar}
              title="Smart Scheduling"
              description="Book sessions effortlessly and manage your fitness calendar."
            />
            <FeatureCard
              index={3}
              icon={TrendingUp}
              title="Progress Analytics"
              description="Detailed insights into your performance and body metrics."
            />
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section id="roles" className="roles-section py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-muted-foreground">
              Select how you want to join the Trainup community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <RoleCard
              title="Member"
              description="Start your personal transformation journey today."
              icon={Dumbbell}
              linkTo="/user/login"
              gradient="bg-gradient-to-br from-primary/20 to-transparent"
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
              gradient="bg-gradient-to-br from-accent/20 to-transparent"
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
      <footer className="py-12 px-6 border-t border-border/50 bg-background/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            &copy; {new Date().getFullYear()} Trainup. All rights reserved.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-primary transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}