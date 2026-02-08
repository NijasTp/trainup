import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
            {/* Content animation container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-5xl mx-auto space-y-8"
            >
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                >
                    Premium Fitness Integration
                </motion.span>

                <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-white">
                    Train <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">smarter.</span><br />
                    Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">stronger.</span>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed tracking-wide"
                >
                    The all-in-one platform for professional trainers and dedicated athletes.
                    Personalized diet plans, expert coaching, and real-time progress tracking.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
                >
                    <Button
                        size="lg"
                        className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200 font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        Start Your Journey
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-14 px-10 text-lg rounded-full border-white/20 text-white hover:bg-white/5 font-medium transition-all"
                    >
                        Learn More
                    </Button>
                </motion.div>
            </motion.div>

            {/* Subtle floating decoration */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 blur-[120px] rounded-full -z-10 pointer-events-none"
            />

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 16, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-white/60"
                    />
                </div>
            </div>
        </section>
    )
}
