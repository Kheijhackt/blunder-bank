import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { about } from '@/routes';
import { Music, Rabbit, Sparkles, Wind } from 'lucide-react';

// --- Reusable Component (Simplified for this specific layout) ---
interface PersonCardProps {
    role: string;
    penName: string;
    theme: 'bunny' | 'piano';
}

function PersonCard({ role, penName, theme }: PersonCardProps) {
    const isBunny = theme === 'bunny';

    return (
        <div
            className={cn(
                'relative flex h-full w-full items-center justify-center p-6 transition-transform duration-500 hover:scale-105',
                isBunny ? 'animate-float-slow' : 'animate-float-music',
            )}
        >
            <Card
                className={cn(
                    'w-full max-w-sm border-2 shadow-xl backdrop-blur-sm',
                    isBunny
                        ? 'border-orange-200 bg-white/80 dark:border-orange-900/50 dark:bg-orange-950/20'
                        : 'border-zinc-800 bg-zinc-900/90 text-white dark:border-zinc-100 dark:bg-black/90',
                )}
            >
                <CardContent className="relative flex flex-col items-center justify-center overflow-hidden p-8 text-center">
                    {/* Background Decor based on theme */}
                    {isBunny ? (
                        <>
                            <Rabbit
                                className={cn(
                                    'mb-4 h-12 w-12',
                                    isBunny
                                        ? 'text-orange-500'
                                        : 'text-zinc-400',
                                )}
                            />
                        </>
                    ) : (
                        <>
                            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-zinc-700/20 blur-2xl" />
                            <Music
                                className={cn(
                                    'mb-4 h-12 w-12',
                                    !isBunny
                                        ? 'text-zinc-100'
                                        : 'text-orange-500',
                                )}
                            />
                        </>
                    )}

                    {/* Role Title */}
                    <h3
                        className={cn(
                            'text-2xl font-extrabold tracking-tight',
                            isBunny
                                ? 'text-orange-900 dark:text-orange-100'
                                : 'text-white',
                        )}
                    >
                        {role}
                    </h3>

                    {/* Pen Name */}
                    <div className="mt-2 flex items-center gap-2">
                        <span
                            className={cn(
                                'h-px w-8',
                                isBunny ? 'bg-orange-300' : 'bg-zinc-500',
                            )}
                        />
                        <p
                            className={cn(
                                'text-lg font-medium tracking-widest uppercase',
                                isBunny
                                    ? 'text-orange-700 dark:text-orange-300'
                                    : 'text-zinc-400',
                            )}
                        >
                            {penName}
                        </p>
                        <span
                            className={cn(
                                'h-px w-8',
                                isBunny ? 'bg-orange-300' : 'bg-zinc-500',
                            )}
                        />
                    </div>

                    {/* Theme Specific Badge */}
                    <div
                        className={cn(
                            'mt-6 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                            isBunny
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300'
                                : 'border border-zinc-700 bg-zinc-800 text-zinc-300',
                        )}
                    >
                        {isBunny ? (
                            <Sparkles className="mr-1 h-3 w-3" />
                        ) : (
                            <Wind className="mr-1 h-3 w-3" />
                        )}
                        {isBunny ? 'Peakaboo' : 'Ehhhh'}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'About Us', href: about() }];

export default function About() {
    const teamMembers = [
        { role: 'Logo Designer', penName: 'Buni', theme: 'bunny' as const },
        { role: 'Developer', penName: 'Calify', theme: 'piano' as const },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="About Us" />

            {/* Main Wrapper */}
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* 
                   DIAGONAL SPLIT BACKGROUND 
                   Using a rotated pseudo-element or absolute div to create the split.
                   Top-Left: Bunny (Soft Orange/Pink)
                   Bottom-Right: Piano (Dark Zinc/Black)
                */}
                <div className="pointer-events-none absolute inset-0 z-0">
                    {/* The Diagonal Divider Line */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/10"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-tl from-zinc-900/5 to-transparent dark:from-zinc-800/20"
                        style={{
                            clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
                        }}
                    />

                    {/* The actual hard line separator (Optional, adds definition) */}
                    <div
                        className="absolute inset-0 border-t-4 border-r-4 border-white/20 dark:border-black/20"
                        style={{
                            clipPath: 'polygon(100% 0, 100% 0, 0 100%, 0 100%)',
                        }} // Creates the diagonal edge visually
                    />
                    {/* Refined Diagonal Line using SVG for crispness */}
                    <svg
                        className="absolute inset-0 h-full w-full"
                        preserveAspectRatio="none"
                    >
                        <line
                            x1="100%"
                            y1="0"
                            x2="0"
                            y2="100%"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-border opacity-30"
                        />
                    </svg>
                </div>

                <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-0">
                    <div className="mx-auto w-full max-w-6xl space-y-8 text-center">
                        {/* Header */}
                        <div className="mb-12 space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                Meet the Duo
                            </h1>
                            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                                Where creativity meets code.
                            </p>
                        </div>

                        {/* 
                           GRID LAYOUT 
                           On Mobile: Stacked vertically.
                           On Desktop: 2 Columns. 
                        */}
                        <div className="grid grid-cols-1 place-items-center gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* Upper Left Content (Bunny) */}
                            <div className="order-1 flex w-full justify-center lg:order-1 lg:justify-end">
                                <PersonCard
                                    role={teamMembers[0].role}
                                    penName={teamMembers[0].penName}
                                    theme="bunny"
                                />
                            </div>

                            {/* Lower Right Content (Piano) */}
                            <div className="order-2 flex w-full justify-center lg:order-2 lg:justify-start">
                                <PersonCard
                                    role={teamMembers[1].role}
                                    penName={teamMembers[1].penName}
                                    theme="piano"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Custom Animations Style Tag (Normally put in global.css, but added here for single-file portability) */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float-music {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(1deg); }
                }
                .animate-float-slow {
                    animation: float-slow 6s ease-in-out infinite;
                }
                .animate-float-music {
                    animation: float-music 5s ease-in-out infinite;
                }
            `}</style>
        </AppLayout>
    );
}
