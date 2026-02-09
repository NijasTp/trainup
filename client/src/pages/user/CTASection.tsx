import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 p-12 md:p-24 rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl text-center space-y-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-none italic">
                        Start your fitness <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">journey today.</span>
                    </h2>

                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        Whether you're a member looking to transform your body or a trainer looking to grow your business,
                        Trainup has the tools you need to succeed.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Link to="/user/login">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="h-16 px-10 text-xl rounded-full bg-white text-black hover:bg-gray-100 font-bold shadow-xl shadow-white/5">
                                    Join as Member
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </motion.div>
                        </Link>

                        <Link to="/trainer/login">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" className="h-16 px-10 text-xl rounded-full border-white/20 text-white hover:bg-white/5 font-bold">
                                    Become a Trainer
                                </Button>
                            </motion.div>
                        </Link>

                        <Link to="/gym/register">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" className="h-16 px-10 text-xl rounded-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 font-bold shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                    Join as Gym Owner
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-64 bg-cyan-500/5 blur-[120px] rounded-full -z-10" />
        </section>
    )
}
