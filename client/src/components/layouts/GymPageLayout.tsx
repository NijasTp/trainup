import type { ReactNode } from 'react';
import Beams from '@/components/ui/Beams';

interface GymPageLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    fullWidth?: boolean;
}

export default function GymPageLayout({ children, title, subtitle, actions, fullWidth = false }: GymPageLayoutProps) {
    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
            {/* Background Beams */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 grayscale-[0.2]">
                <Beams />
            </div>

            {/* Content Overlay */}
            <div className={`relative z-10 p-4 md:p-8 mx-auto flex flex-col gap-8 ${fullWidth ? 'w-full' : 'max-w-7xl'}`}>
                {/* Header */}
                {(title || actions) && (
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div>
                            {title && <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">{title}</h1>}
                            {subtitle && <p className="text-blue-200/60 text-lg font-light max-w-2xl">{subtitle}</p>}
                        </div>
                        <div className="flex gap-3">
                            {actions}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
