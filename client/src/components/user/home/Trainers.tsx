import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
// import Image from "next/image"

export function Trainers() {
  const trainers = [
    {
      name: "Sarah Johnson",
      specialty: "Strength Training",
      experience: "8 years",
      rating: 4.9,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Mike Chen",
      specialty: "HIIT & Cardio",
      experience: "6 years",
      rating: 4.8,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Emma Davis",
      specialty: "Yoga & Flexibility",
      experience: "10 years",
      rating: 5.0,
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <section id="trainers" className="py-24 bg-gray-900">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-[#001C30]/30 text-[#176B87] border-[#176B87]/30">Meet Our Team</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">World-Class Trainers</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn from certified experts who are passionate about your success
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {trainers.map((trainer, index) => (
            <Card key={index} className="border-gray-700 bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <img
                    src={trainer.image || "/placeholder.svg"}
                    alt={trainer.name}
                    width={120}
                    height={120}
                    className="rounded-full mx-auto"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-white">{trainer.name}</h3>
                    <p className="text-[#176B87] font-medium">{trainer.specialty}</p>
                    <p className="text-sm text-gray-400">{trainer.experience} experience</p>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(trainer.rating) ? "text-yellow-400 fill-current" : "text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-400 ml-2">{trainer.rating}</span>
                  </div>
                  <Button className="w-full bg-[#001C30] hover:bg-[#001C30]/80 text-white">Book Session</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}