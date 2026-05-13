import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import SoftAurora from '@/components/ui/SoftAurora'

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute inset-0 z-0">
                <SoftAurora
                    speed={0.2}
                    scale={1.5}
                    brightness={0.8}
                    color1="#00d4ff"
                    color2="#8e2de2"
                    noiseFrequency={1.5}
                    noiseAmplitude={1}
                    enableMouseInteraction
                    mouseInfluence={0.2}
                />
            </div>

            <div className="absolute inset-0 bg-black/40 z-[1]" />

            {/* Content animation container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-7xl mx-auto space-y-12"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-400 text-sm font-black tracking-[0.2em] uppercase mb-4 font-outfit"
                >
                    <Sparkles className="w-4 h-4" />
                    Revolutionizing Fitness Technology
                </motion.div>

                <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[0.8] text-white font-bebas italic">
                    Train <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 not-italic font-outfit">smarter.</span><br />
                    Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x not-italic font-outfit">stronger.</span>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed tracking-wide font-inter"
                >
                    The all-in-one ecosystem for elite performance.
                    Precision nutrition, world-class coaching, and real-time biometric tracking for those who settle for nothing but the best.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                >
                    <Link to="/user/login">
                        <Button
                            size="lg"
                            className="h-16 px-12 text-xl rounded-full bg-white text-black hover:bg-gray-100 font-black transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.15)] font-outfit uppercase italic tracking-tighter"
                        >
                            Start Your Journey
                            <ArrowRight className="w-6 h-6 ml-3" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-16 px-12 text-xl rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold backdrop-blur-xl transition-all font-outfit"
                    >
                        Explore Features
                    </Button>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-40">
                <div className="w-6 h-12 rounded-full border-2 border-white/20 flex justify-center p-1.5 backdrop-blur-sm">
                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1.5 h-1.5 rounded-full bg-white"
                    />
                </div>
            </div>
        </section>
    )
}
