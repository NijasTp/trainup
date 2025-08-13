import { Dumbbell } from "lucide-react"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="trainup-primary p-2 rounded-lg">
        <Dumbbell className="h-6 w-6 text-white" />
      </div>
      <span className="text-2xl font-bold">
        Train<span className="trainup-accent">Up</span>
      </span>
    </div>
  )
}
