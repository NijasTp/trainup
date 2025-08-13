
import { Badge, CheckCircle, Clock, Dumbbell, Users, Zap, Award } from "lucide-react"

export function GymFacilities() {
  return (
    <section id="gym" className="py-24 bg-gray-800">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-[#176B87]/20 text-[#176B87] border-[#176B87]/30">Our Facilities</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Premium Gym Experience</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Train in comfort with our modern facilities and top-tier equipment
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start space-x-3">
                <div className="bg-[#176B87]/20 rounded-lg p-2">
                  <Dumbbell className="h-6 w-6 text-[#176B87]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Free Weights</h3>
                  <p className="text-sm text-gray-400">Complete range of dumbbells and barbells</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[#001C30]/30 rounded-lg p-2">
                  <Zap className="h-6 w-6 text-[#176B87]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Cardio Zone</h3>
                  <p className="text-sm text-gray-400">Treadmills, bikes, and ellipticals</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[#176B87]/20 rounded-lg p-2">
                  <Users className="h-6 w-6 text-[#176B87]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Group Classes</h3>
                  <p className="text-sm text-gray-400">Yoga, Pilates, and HIIT sessions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[#001C30]/30 rounded-lg p-2">
                  <Award className="h-6 w-6 text-[#176B87]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Recovery Zone</h3>
                  <p className="text-sm text-gray-400">Sauna, steam room, and massage</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Why Choose Our Gym?</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#176B87]" />
                  <span className="text-gray-300">24/7 access for premium members</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#176B87]" />
                  <span className="text-gray-300">Clean and sanitized equipment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#176B87]" />
                  <span className="text-gray-300">Air-conditioned environment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#176B87]" />
                  <span className="text-gray-300">Free parking available</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="relative">
            <img
              src="/placeholder.svg?height=500&width=600"
              alt="Gym facilities"
              width={600}
              height={500}
              className="rounded-2xl shadow-lg"
            />
            <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#176B87]" />
                <span className="font-semibold text-sm text-white">Open 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}