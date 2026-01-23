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
        <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="opacity-30 grayscale-[0.2]">
                    <Beams />
                </div>
            </div>

            {/* Content Overlay */}
            <div className={`relative z-10 p-4 md:p-8 mx-auto flex flex-col gap-8 ${fullWidth ? 'w-full' : 'max-w-7xl'}`}>
                {/* Header */}
                {(title || actions) && (
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div>
                            {title && (
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-blue-200 to-white bg-clip-text text-transparent mb-2">
                                    {title}
                                </h1>
                            )}
                            {subtitle && <p className="text-gray-400 text-lg font-light max-w-2xl">{subtitle}</p>}
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
