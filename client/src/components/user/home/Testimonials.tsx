import { Card, CardContent } from "@/components/ui/card"
import { Badge, Star } from "lucide-react"
// import Image from "next/image"

export function Testimonials() {
  const testimonials = [
    {
      name: "Alex Rodriguez",
      result: "Lost 30 lbs in 4 months",
      quote:
        "The trainers at TrainUp completely transformed my approach to fitness. I've never felt stronger or more confident!",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Jessica Kim",
      result: "Gained 15 lbs muscle",
      quote:
        "The personalized nutrition plan made all the difference. I finally achieved the muscle gain I was working towards.",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "David Thompson",
      result: "Completed first marathon",
      quote:
        "From couch to marathon in 8 months! The structured training program and support were incredible.",
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <section className="py-24 bg-gray-800">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-[#001C30]/30 text-[#176B87] border-[#176B87]/30">Success Stories</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">What Our Members Say</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-gray-700 bg-gray-900 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-[#176B87]">{testimonial.result}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}