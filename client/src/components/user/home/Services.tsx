import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Apple, Dumbbell, Users } from "lucide-react"

export function Services() {
  return (
    <section id="services" className="py-24 bg-gray-800">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-[#176B87]/20 text-[#176B87] border-[#176B87]/30">Our Services</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive fitness solutions tailored to your goals and lifestyle
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-[#176B87]/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-[#176B87]" />
              </div>
              <CardTitle className="text-xl text-white">Expert Trainers</CardTitle>
              <CardDescription className="text-gray-400">
                Certified professionals to guide your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Personalized workout plans</li>
                <li>• 1-on-1 training sessions</li>
                <li>• Group fitness classes</li>
                <li>• Progress tracking</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-[#001C30]/30 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-[#176B87]" />
              </div>
              <CardTitle className="text-xl text-white">Premium Gym</CardTitle>
              <CardDescription className="text-gray-400">State-of-the-art equipment and facilities</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Latest fitness equipment</li>
                <li>• Spacious workout areas</li>
                <li>• Locker rooms & showers</li>
                <li>• 24/7 access available</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-gray-700 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-[#176B87]/20 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Apple className="h-8 w-8 text-[#176B87]" />
              </div>
              <CardTitle className="text-xl text-white">Nutrition Plans</CardTitle>
              <CardDescription className="text-gray-400">Custom meal plans for optimal results</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Personalized meal plans</li>
                <li>• Nutritionist consultations</li>
                <li>• Recipe recommendations</li>
                <li>• Supplement guidance</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}