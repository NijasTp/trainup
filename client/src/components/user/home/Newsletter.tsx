import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="py-16 bg-black">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-bold text-white">Stay Updated</h3>
          <p className="text-gray-400">
            Get fitness tips, nutrition advice, and exclusive offers delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
            />
            <Button className="bg-[#001C30] hover:bg-[#001C30]/80 text-white">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  )
}   