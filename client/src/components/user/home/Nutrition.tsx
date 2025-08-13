import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, Apple, Dumbbell, Target } from "lucide-react"

export function Nutrition() {
  return (
    <section id="nutrition" className="py-24 bg-gray-900">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-[#176B87]/20 text-[#176B87] border-[#176B87]/30">Nutrition</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Fuel Your Success</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Personalized nutrition plans designed to complement your fitness goals
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Apple className="h-6 w-6 text-[#176B87]" />
                <span>Weight Loss</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Sustainable meal plans for healthy weight management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Calorie-controlled meals</li>
                <li>• High-protein recipes</li>
                <li>• Portion control guidance</li>
                <li>• Weekly meal prep plans</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Dumbbell className="h-6 w-6 text-[#176B87]" />
                <span>Muscle Gain</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Nutrition plans optimized for muscle building
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• High-protein meal plans</li>
                <li>• Pre/post workout nutrition</li>
                <li>• Supplement recommendations</li>
                <li>• Bulk-friendly recipes</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-gray-700 bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Target className="h-6 w-6 text-[#176B87]" />
                <span>Performance</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fuel your athletic performance and recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Energy-optimized meals</li>
                <li>• Recovery nutrition</li>
                <li>• Hydration strategies</li>
                <li>• Competition prep plans</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}