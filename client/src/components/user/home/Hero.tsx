import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Play, Target } from "lucide-react"
// import Image from "next/image"

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0">
        <img
          src="/placeholder.svg?height=1080&width=1920"
          alt="Gym background"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001C30]/30 to-[#176B87]/20" />
      </div>
      <div className="container relative px-4 py-24 md:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-[#176B87]/20 text-[#176B87] border-[#176B87]/30">{"#1 Fitness Platform"}</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Transform Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#176B87] to-cyan-400">
                  {" "}
                  Body & Mind
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Join thousands who've achieved their fitness goals with our expert trainers, state-of-the-art
                facilities, and personalized nutrition plans.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#001C30] hover:bg-[#001C30]/80 text-white px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#176B87] text-[#176B87] hover:bg-[#176B87] hover:text-white bg-transparent"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[#176B87]" />
                <span>No Equipment Needed</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[#176B87]" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="/placeholder.svg?height=600&width=500"
              alt="Fitness transformation"
              width={500}
              height={600}
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-[#176B87]/20 rounded-full p-2">
                  <Target className="h-6 w-6 text-[#176B87]" />
                </div>
                <div>
                  <p className="font-semibold text-white">5,000+</p>
                  <p className="text-sm text-gray-400">Goals Achieved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}