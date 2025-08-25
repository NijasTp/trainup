import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const UserIcon = () => (
  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const GymOwnerIcon = () => (
  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const TrainerIcon = () => (
  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const RoleCard = ({ 
  title, 
  description, 
  icon: Icon, 
  linkTo, 
  gradient 
}: {
  title: string
  description: string
  icon: React.ComponentType
  linkTo: string
  gradient: string
}) => (
  <Card className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`} />
    <CardHeader className="text-center pb-4 relative z-10">
      <div className="text-primary group-hover:text-accent transition-colors duration-300">
        <Icon />
      </div>
      <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
        {title}
      </CardTitle>
      <CardDescription className="text-muted-foreground text-base leading-relaxed mt-2">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-0 relative z-10">
      <Link to={linkTo}>
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
          size="lg"
        >
          Continue as {title}
          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </Link>
    </CardContent>
  </Card>
)

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--accent)_0%,_transparent_50%)] opacity-5" />
      
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-8 shadow-lg">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Welcome to
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x">
              Trainup
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose your path to fitness excellence. Whether you're starting your journey, managing a facility, or guiding others to success.
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-8 rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <RoleCard
            title="User"
            description="Begin your fitness journey with personalized workouts, progress tracking, and expert guidance tailored to your goals."
            icon={UserIcon}
            linkTo="/user/login"
            gradient="bg-gradient-to-br from-primary to-primary/50"
          />
          
          <RoleCard
            title="Gym Owner"
            description="Manage your fitness facility with powerful tools for member management, scheduling, and business analytics."
            icon={GymOwnerIcon}
            linkTo="/gym/login"
            gradient="bg-gradient-to-br from-accent to-accent/50"
          />
          
          <RoleCard
            title="Trainer"
            description="Connect with clients, create custom workout plans, and grow your personal training business with professional tools."
            icon={TrainerIcon}
            linkTo="/trainer/login"
            gradient="bg-gradient-to-br from-secondary to-secondary/50"
          />
        </div>

        <div className="text-center mt-20 pt-12 border-t border-border/50">
          <p className="text-muted-foreground mb-4">
            Trusted by over 10,000+ fitness professionals worldwide
          </p>
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/support" className="hover:text-primary transition-colors duration-300">
              Support
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}