import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Heart,
    ShieldAlert,
    Code2,
    UserCheck,
    AlertTriangle,
    RefreshCw,
    MessageCircle,
} from 'lucide-react';
import { login, register, dashboard } from '@/routes';
import { usePage } from '@inertiajs/react';

export default function TermsOfUse() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Terms of Use">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Header Navigation - Consistent with other pages */}
                <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:p-8">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold transition-colors hover:text-foreground/80"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center rounded-md border border-[#19140035] bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:bg-muted/50"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="hidden items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-md border border-black bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="flex-1 py-12 lg:py-20">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        {/* Title Section */}
                        <div className="mb-10 text-center">
                            <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                                <Heart className="mr-2 h-3 w-3" />
                                Simple & Human
                            </div>
                            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                Terms of Use
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Last Updated: March 21, 2026
                            </p>
                        </div>

                        {/* Terms Content Card */}
                        <div className="space-y-8">
                            {/* Welcome */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-3 text-xl font-semibold">
                                    1. Welcome
                                </h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    By using <strong>Blunder Bank</strong>, you
                                    agree to these simple terms. If you don't
                                    agree, please don't use the app. It's that
                                    simple!
                                </p>
                            </section>

                            {/* Hobby Project */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    2. It's a Hobby Project
                                </h2>
                                <p className="mb-4 text-muted-foreground">
                                    Blunder Bank is a{' '}
                                    <strong>
                                        personal, non-commercial hobby project
                                    </strong>
                                    . I built this for fun and to help chess
                                    players improve.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                                        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <span className="font-semibold text-foreground">
                                                "As Is":
                                            </span>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                The app is provided exactly as
                                                it is. I don't guarantee it will
                                                always work, be bug-free, or
                                                stay online forever.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <span className="font-semibold text-foreground">
                                                No Warranty:
                                            </span>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                There are no warranties here.
                                                You use the app at your own
                                                risk.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                                        <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                                        <div>
                                            <span className="font-semibold text-foreground">
                                                Educational Only:
                                            </span>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                This tool is for learning chess.
                                                Don't rely on it for anything
                                                critical (like gambling or
                                                professional coaching).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Code & Design */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                    <Code2 className="h-5 w-5 text-primary" />
                                    3. About the Code & Design
                                </h2>
                                <p className="mb-4 text-muted-foreground">
                                    This project was built with love using
                                    various tools. Transparency is key:
                                </p>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex gap-3">
                                        <span className="shrink-0 font-semibold text-foreground">
                                            •
                                        </span>
                                        It uses the <strong>Laravel</strong>{' '}
                                        framework and community starter kits.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0 font-semibold text-foreground">
                                            •
                                        </span>
                                        Code assistance was provided by{' '}
                                        <strong>AI tools</strong>.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0 font-semibold text-foreground">
                                            •
                                        </span>
                                        Visual assets (like icons/logos) were
                                        created using <strong>Canva</strong> and
                                        their licensed resources.
                                    </li>
                                    <li className="flex gap-3 border-t border-border/50 pt-2">
                                        While I put effort into assembling and
                                        maintaining this, I don't claim
                                        exclusive ownership over the underlying
                                        open-source technologies or third-party
                                        assets used.
                                    </li>
                                </ul>
                            </section>

                            {/* Responsibilities */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-4 text-xl font-semibold">
                                    4. Your Responsibilities
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-1">
                                    <div className="rounded-lg border bg-background p-4">
                                        <h3 className="mb-1 font-semibold text-foreground">
                                            Your Data
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            You are responsible for the chess
                                            positions and notes you enter.
                                            Please back up important data if
                                            it's critical to you (though I try
                                            my best not to lose anything!).
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-background p-4">
                                        <h3 className="mb-1 font-semibold text-foreground">
                                            Be Nice
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Don't try to hack the site, spam the
                                            feedback form, or use bots to abuse
                                            the system. Let's keep it friendly.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-background p-4">
                                        <h3 className="mb-1 font-semibold text-foreground">
                                            Account Safety
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Keep your password safe. I'm not
                                            responsible if someone else guesses
                                            it and deletes your blunders.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Liability */}
                            <section className="rounded-xl border border-orange-200 bg-orange-50 p-6 shadow-sm dark:border-orange-900 dark:bg-orange-950/20">
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-orange-800 dark:text-orange-200">
                                    <AlertTriangle className="h-5 w-5" />
                                    5. What If Things Go Wrong? (Liability)
                                </h2>
                                <p className="mb-3 text-orange-900/80 dark:text-orange-100/80">
                                    Since this is a free hobby project made in
                                    my spare time:
                                </p>
                                <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-orange-900/80 dark:text-orange-100/80">
                                    <li>
                                        <strong>I am not liable</strong> for any
                                        losses you experience while using the
                                        app.
                                    </li>
                                    <li>
                                        This includes lost chess data, broken
                                        streaks, bugs in the spaced repetition
                                        logic, or the site going down
                                        temporarily.
                                    </li>
                                </ul>
                                <div className="rounded-md bg-orange-100 p-3 text-sm font-medium text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                                    Basically:{' '}
                                    <strong>
                                        If something breaks, I'm sorry, but I
                                        can't be held legally responsible for
                                        damages.
                                    </strong>
                                </div>
                            </section>

                            {/* Changes */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                                    6. Changes or Shutdown
                                </h2>
                                <p className="mb-4 text-muted-foreground">
                                    Life happens. I might:
                                </p>
                                <ul className="mb-4 list-disc space-y-2 pl-5 text-muted-foreground">
                                    <li>Change how the app works.</li>
                                    <li>
                                        Take the app offline temporarily or
                                        permanently.
                                    </li>
                                    <li>
                                        Delete inactive accounts if I need to
                                        save database space (though I'll try to
                                        avoid this).
                                    </li>
                                </ul>
                                <p className="text-sm text-muted-foreground italic">
                                    I'll try to give notice if I can, but no
                                    promises.
                                </p>
                            </section>

                            {/* Contact */}
                            <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm dark:bg-primary/10">
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
                                    <MessageCircle className="h-5 w-5" />
                                    7. Questions?
                                </h2>
                                <p className="mb-4 text-muted-foreground">
                                    If you have questions or just want to chat
                                    about chess, use the button below.
                                </p>
                                <a
                                    href="https://docs.google.com/forms/d/e/1FAIpQLScmNx4z0hF40w7sEIS75k82WOthIH6Ofmh4AuoNrNPOfLd5MA/viewform?hl=en"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <button className="inline-flex items-center justify-center rounded-md bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-[#d12c02] dark:bg-[#FF4433] dark:hover:bg-[#ff2211]">
                                        Send Feedback (Google Form)
                                    </button>
                                </a>
                            </section>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-12 text-center text-sm text-muted-foreground">
                            <p>
                                Thanks for reading! Now go study those blunders.
                                ♟️
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer Simple */}
                <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} Blunder Bank. Made by
                        Calify
                    </p>
                </footer>
            </div>
        </>
    );
}
