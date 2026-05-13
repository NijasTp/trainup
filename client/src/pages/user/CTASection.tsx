import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
    return (
        <section className="py-48 px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 p-16 md:p-32 rounded-[4rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-3xl text-center space-y-12 shadow-[0_50px_150px_-30px_rgba(0,0,0,0.7)]"
                >
                    {/* Animated Top Border */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.2em] font-outfit"
                    >
                        <Zap className="w-4 h-4 fill-cyan-400" />
                        Limited Access
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] italic uppercase font-bebas">
                        Start your fitness <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 not-italic font-outfit">journey today.</span>
                    </h2>

                    <p className="text-lg md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed font-inter">
                        Join the elite community of high-performers. Whether you're an athlete or a professional trainer, 
                        TrainUp provides the ultimate ecosystem for unprecedented growth.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                        <Link to="/user/login">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="h-20 px-12 text-2xl rounded-full bg-white text-black hover:bg-gray-100 font-black shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all font-outfit uppercase italic tracking-tighter">
                                    Join as Member
                                    <ArrowRight className="w-6 h-6 ml-3" />
                                </Button>
                            </motion.div>
                        </Link>

                        <div className="flex flex-col gap-4">
                            <Link to="/trainer/login">
                                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                                    <Button variant="link" className="text-xl text-white hover:text-cyan-400 font-bold p-0 flex items-center gap-2 font-outfit">
                                        Become a Trainer <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link to="/gym/login">
                                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                                    <Button variant="link" className="text-xl text-cyan-400 hover:text-cyan-300 font-bold p-0 flex items-center gap-2 font-outfit">
                                        Join as Gym Owner <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    {/* Subtle internal glows */}
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                </motion.div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-cyan-500/5 blur-[150px] rounded-full -z-10" />
        </section>
    )
}
