import { Head, Link, usePage } from '@inertiajs/react';
import {
    BrainCircuit,
    Target,
    BookOpen,
    ArrowRight,
    ShieldCheck,
    Zap,
    PenTool,
} from 'lucide-react';
import ShowGuideContent from '@/components/custom/showGuideContent';
import { dashboard, login, register, blundersList } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Master Your Chess Mistakes">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Header Navigation */}
                <header className="w-full p-6 lg:p-8">
                    <nav className="mx-auto flex max-w-7xl items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center rounded-md border border-[#19140035] bg-white px-5 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:bg-muted/50"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center rounded-md px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-md border border-black bg-[#1b1b18] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Main Content Area */}
                <main className="flex flex-1 items-center justify-center p-4 lg:p-6">
                    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
                        <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                            <div className="space-y-3">
                                <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
                                    <ShieldCheck className="mr-2 h-3 w-3" />
                                    Not an Engine. A Personal Coach.
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                                    Stop Repeating <br />
                                    <span className="text-[#f53003] dark:text-[#FF4433]">
                                        The Same Mistakes
                                    </span>
                                </h1>
                                <p className="mx-auto max-w-lg text-lg text-muted-foreground lg:mx-0">
                                    The first flashcard system built
                                    specifically for your chess blunders.
                                    Manually curate your mistakes, analyze why
                                    they happened, and master them forever with
                                    spaced repetition.
                                </p>
                            </div>

                            {/* Feature Grid */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left shadow-sm">
                                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                                        <PenTool className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Manual Entry
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Force yourself to admit and analyze
                                            errors. No automated engine imports.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left shadow-sm">
                                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                                        <BrainCircuit className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Spaced Repetition
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Our algorithm resurfaces blunders
                                            right before you forget them.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left shadow-sm">
                                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Notation Training
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Type moves (e.g., Nf3) to improve
                                            board visualization and reading
                                            skills.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left shadow-sm">
                                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Contextual Notes
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Add remarks about ELO, opening
                                            traps, or tactical themes for deeper
                                            retention.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row lg:justify-start">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center justify-center rounded-md bg-[#f53003] px-8 py-3 text-base font-medium text-white shadow transition-colors hover:bg-[#d12c02] dark:bg-[#FF4433] dark:hover:bg-[#ff2211]"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-md bg-[#f53003] px-8 py-3 text-base font-medium text-white shadow transition-colors hover:bg-[#d12c02] dark:bg-[#FF4433] dark:hover:bg-[#ff2211]"
                                    >
                                        Start Building Library
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                )}
                                <a
                                    href="#show-guide"
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Visual Abstract Art */}
                        <div className="relative hidden lg:block">
                            <div className="relative mx-auto aspect-square w-full max-w-md">
                                {/* Background Decorative Blob */}
                                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-orange-100 to-red-50 opacity-60 blur-3xl dark:from-orange-950/30 dark:to-red-950/30" />

                                {/* Floating Cards Composition */}
                                <div className="relative z-10 h-full w-full">
                                    {/* Card 1: Top Left */}
                                    <div className="absolute top-10 left-0 w-64 -rotate-6 transform rounded-xl border border-border bg-card p-4 shadow-xl transition-transform duration-500 hover:rotate-0">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                                                <Target className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="h-2 w-20 rounded bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full rounded bg-muted/30" />
                                            <div className="h-2 w-3/4 rounded bg-muted/30" />
                                            <div className="h-2 w-1/2 rounded bg-muted/30" />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex h-6 w-16 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                                                Nf3
                                            </div>
                                            <div className="h-2 w-8 rounded bg-muted/50" />
                                        </div>
                                    </div>

                                    {/* Card 2: Center Right */}
                                    <div className="absolute top-24 right-0 z-20 w-72 rotate-3 transform rounded-xl border border-border bg-card p-5 shadow-2xl transition-transform duration-500 hover:rotate-0">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <BrainCircuit className="h-5 w-5 text-orange-500" />
                                                <span className="text-sm font-bold">
                                                    Blunder #42
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                ELO 1250
                                            </span>
                                        </div>
                                        <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 bg-muted/50">
                                            <span className="text-xs text-muted-foreground">
                                                Position Preview
                                            </span>
                                        </div>
                                        <div className="rounded border border-orange-100 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950/30">
                                            <p className="text-xs text-orange-800 italic dark:text-orange-200">
                                                "Missed the back-rank mate
                                                because I didn't check the
                                                rook's line."
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card 3: Bottom Left */}
                                    <div className="absolute bottom-10 left-10 w-60 -rotate-2 transform rounded-xl border border-border bg-card p-4 shadow-xl transition-transform duration-500 hover:rotate-0">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            <span className="text-xs font-bold tracking-wider uppercase">
                                                Streak
                                            </span>
                                        </div>
                                        <div className="text-3xl font-bold text-foreground">
                                            12 Days
                                        </div>
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div className="h-full w-3/4 rounded-full bg-yellow-500" />
                                        </div>
                                        <p className="mt-2 text-[10px] text-muted-foreground">
                                            Keep practicing to maintain!
                                        </p>
                                    </div>

                                    {/* Decorative Elements */}
                                    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />
                                    <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <div
                    id="show-guide"
                    className="mx-auto mt-40 w-full max-w-5xl scroll-mt-40"
                >
                    <ShowGuideContent />
                    <div className="mx-5 flex flex-col justify-center gap-3 sm:flex-row">
                        {auth.user ? (
                            <Link
                                href={blundersList()}
                                className="inline-flex items-center justify-center rounded-md bg-[#f53003] px-8 py-3 text-base font-medium text-white shadow transition-colors hover:bg-[#d12c02] dark:bg-[#FF4433] dark:hover:bg-[#ff2211]"
                            >
                                View Library
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href={register()}
                                className="inline-flex items-center justify-center rounded-md bg-[#f53003] px-8 py-3 text-base font-medium text-white shadow transition-colors hover:bg-[#d12c02] dark:bg-[#FF4433] dark:hover:bg-[#ff2211]"
                            >
                                Start Building Library
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </div>
                {/* Footer Simple */}
                {/* Footer with Legal Links */}
                <footer className="py-8 pt-20 text-center text-xs text-muted-foreground">
                    <div className="mb-3 flex justify-center gap-6">
                        <Link
                            href="/privacy-policy"
                            className="transition-colors hover:text-foreground hover:underline"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms-of-use"
                            className="transition-colors hover:text-foreground hover:underline"
                        >
                            Terms of Use
                        </Link>
                    </div>
                    <p>
                        © {new Date().getFullYear()} Blunder Bank. Made by
                        Calify
                    </p>
                </footer>
            </div>
        </>
    );
}
