import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-[#001C30] to-[#176B87]">
      <div className="container px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-gray-200">
            Join thousands of members who've achieved their fitness goals with TrainUp. Start your journey today
            with a free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#001C30] hover:bg-gray-100 px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#001C30] px-8 bg-transparent"
            >
              Schedule Tour
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-200 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>No commitment required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Full access included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}