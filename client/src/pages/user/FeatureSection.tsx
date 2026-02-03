import React from 'react'

interface FeatureSectionProps {
    title: string
    description: string
    align?: 'left' | 'right' | 'center'
    active?: boolean
}

export default function FeatureSection({ title, description, align = 'left' }: FeatureSectionProps) {
    const alignmentClass = {
        left: 'text-left mr-auto',
        right: 'text-right ml-auto',
        center: 'text-center mx-auto'
    }[align]

    return (
        <div className="feature-section h-screen w-full flex items-center px-10 md:px-24">
            <div className={`max-w-xl ${alignmentClass} space-y-6`}>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    {title}
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    )
}
