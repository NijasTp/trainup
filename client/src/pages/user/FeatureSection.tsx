import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface FeatureSectionProps {
    title: string
    description: string
    imagePath?: string
    align?: 'left' | 'right'
    bullets?: string[]
}

export default function FeatureSection({ title, description, imagePath, align = 'left', bullets }: FeatureSectionProps) {
    const isReversed = align === 'right'

    return (
        <section className="py-32 md:py-48 px-6 overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-20 md:gap-32`}>

                    {/* Content Column */}
                    <motion.div
                        initial={{ opacity: 0, x: isReversed ? 60 : -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 space-y-10"
                    >
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none italic uppercase font-bebas">
                                {title}
                            </h2>
                            <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
                        </div>

                        <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-xl font-inter">
                            {description}
                        </p>

                        {bullets && (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                {bullets.map((bullet, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="flex items-start text-gray-300 group"
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mr-4 shrink-0 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all duration-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                                        </div>
                                        <span className="text-sm md:text-base font-bold tracking-wide font-outfit">{bullet}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </motion.div>

                    {/* Image Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: isReversed ? -10 : 10 }}
                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 relative group perspective-1000"
                    >
                        {/* Interactive Glow */}
                        <div className="absolute -inset-10 bg-gradient-to-tr from-cyan-500/30 via-purple-500/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transform-gpu transition-all duration-700 group-hover:scale-[1.02] group-hover:border-white/20">
                            {imagePath ? (
                                <>
                                    <img
                                        src={imagePath}
                                        alt={title}
                                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    {/* Subtle Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                </>
                            ) : (
                                <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                                    <div className="text-white/10 font-black text-4xl uppercase tracking-[0.2em]">Visual Representation</div>
                                </div>
                            )}
                        </div>

                        {/* Floating Decoration */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full -z-10 animate-pulse" />
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -z-10 animate-pulse delay-700" />
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
