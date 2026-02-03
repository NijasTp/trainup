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
        <section className="py-24 md:py-32 px-6 overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24`}>

                    {/* Content Column */}
                    <motion.div
                        initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1 space-y-6"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight italic">
                            {title}
                        </h2>
                        <p className="text-xl text-gray-400 font-light leading-relaxed max-w-xl">
                            {description}
                        </p>

                        {bullets && (
                            <ul className="space-y-4 pt-4">
                                {bullets.map((bullet, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        className="flex items-center text-gray-300"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mr-3 shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                                        </div>
                                        {bullet}
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </motion.div>

                    {/* Image Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex-1 relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-cyan-900/10">
                            {imagePath ? (
                                <img
                                    src={imagePath}
                                    alt={title}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                                    <div className="text-white/10 font-black text-4xl uppercase tracking-[0.2em]">Visual Representation</div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
