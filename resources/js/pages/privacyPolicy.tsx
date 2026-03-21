import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheck,
    ArrowLeft,
    Database,
    Lock,
    UserCog,
    Globe,
} from 'lucide-react';
import { login, register, dashboard } from '@/routes';
import { usePage } from '@inertiajs/react';

export default function PrivacyPolicy() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Privacy Policy">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Header Navigation - Consistent with Welcome Screen */}
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
                            <div className="mb-4 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
                                <ShieldCheck className="mr-2 h-3 w-3" />
                                Transparent & Simple
                            </div>
                            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                Privacy Policy
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Last Updated: March 21, 2026
                            </p>
                        </div>

                        {/* Policy Content Card */}
                        <div className="space-y-8">
                            {/* Intro */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-3 text-xl font-semibold">
                                    1. Hi There!
                                </h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    Welcome to <strong>Blunder Bank</strong>.
                                    This is a{' '}
                                    <strong>personal hobby project</strong>{' '}
                                    created and maintained solely by{' '}
                                    <strong>me</strong>. There is no company
                                    behind this app—just one developer trying to
                                    build a cool chess tool.
                                </p>
                                <p className="mt-3 leading-relaxed text-muted-foreground">
                                    This Privacy Policy explains how I collect,
                                    use, and protect your information. By using
                                    Blunder Bank, you agree to these simple
                                    practices.
                                </p>
                                <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-200">
                                    <strong>⚠️ Quick Disclaimer:</strong> This
                                    app is provided <strong>"as is"</strong> for
                                    learning and fun. I don't guarantee it will
                                    be bug-free or always online. Since I'm just
                                    one person working on this in my spare time,
                                    resources are limited!
                                </div>
                            </section>

                            {/* Data Collection */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                    <Database className="h-5 w-5 text-primary" />
                                    2. What Information I Collect
                                </h2>
                                <p className="mb-4 text-muted-foreground">
                                    I only collect what's absolutely necessary
                                    to make the app work.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-foreground">
                                            A. Things You Give Me
                                        </h3>
                                        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                            <li>
                                                <strong>
                                                    Account Details:
                                                </strong>{' '}
                                                Name, email, and hashed
                                                password.
                                                <span className="mt-1 block text-xs italic opacity-80">
                                                    Note: Your name and email
                                                    don't have to be real! You
                                                    can use a nickname. I just
                                                    need a valid email for
                                                    password resets (feature
                                                    coming soon).
                                                </span>
                                            </li>
                                            <li>
                                                <strong>Chess Data:</strong> FEN
                                                positions, correct moves,
                                                personal notes, ELO rating,
                                                opening names, and source game
                                                links.
                                            </li>
                                            <li>
                                                <strong>Feedback:</strong> If
                                                you use the "Send Feedback"
                                                button, you'll visit a
                                                <strong> Google Form</strong>.
                                                That data is handled by Google,
                                                not me.
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="border-t border-border/50 pt-2">
                                        <h3 className="font-medium text-foreground">
                                            B. Things Collected Automatically
                                        </h3>
                                        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                            <li>
                                                <strong>Stats:</strong> Accuracy
                                                %, streaks, and last practiced
                                                timestamps.
                                            </li>
                                            <li>
                                                <strong>Preferences:</strong>{' '}
                                                Dark Mode or Light Mode
                                                settings.
                                            </li>
                                            <li>
                                                <strong>Server Logs:</strong>{' '}
                                                Laravel Cloud records basic
                                                technical data (IPs, request
                                                times) for security.{' '}
                                                <strong>
                                                    I don't look at, analyze, or
                                                    sell these logs.
                                                </strong>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Usage */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-3 text-xl font-semibold">
                                    3. How I Use Your Info
                                </h2>
                                <p className="mb-3 text-muted-foreground">
                                    I use your data for exactly three reasons:
                                </p>
                                <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                                    <li>
                                        To let you log in and manage your
                                        account.
                                    </li>
                                    <li>
                                        To show you your chess blunders and run
                                        the spaced repetition algorithm.
                                    </li>
                                    <li>
                                        To remember your settings (like Dark
                                        Mode) and keep the site secure.
                                    </li>
                                </ol>
                                <div className="mt-4 inline-flex items-center rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                    <Lock className="mr-2 h-3 w-3" />I do NOT
                                    sell, rent, or trade your data to anyone.
                                    Ever.
                                </div>
                            </section>

                            {/* Storage */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-3 text-xl font-semibold">
                                    4. Where Your Data Lives
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg border bg-background p-4 text-center">
                                        <Globe className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                        <div className="text-xs font-medium text-muted-foreground uppercase">
                                            Hosting
                                        </div>
                                        <div className="font-semibold">
                                            Laravel Cloud
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-background p-4 text-center">
                                        <Database className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                        <div className="text-xs font-medium text-muted-foreground uppercase">
                                            Location
                                        </div>
                                        <div className="font-semibold">
                                            Mumbai, Asia
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-background p-4 text-center">
                                        <UserCog className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                        <div className="text-xs font-medium text-muted-foreground uppercase">
                                            Retention
                                        </div>
                                        <div className="font-semibold">
                                            Indefinitely
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">
                                    I keep your data until you delete it. No
                                    automatic wiping of inactive accounts yet.
                                </p>
                            </section>

                            {/* Third Party */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-3 text-xl font-semibold">
                                    5. Third-Party Services
                                </h2>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex gap-3">
                                        <span className="shrink-0 font-semibold text-foreground">
                                            Laravel Cloud:
                                        </span>
                                        They host the site. They handle basic
                                        technical data to keep it running. They
                                        don't sell your data , and they don't
                                        see your chess blunders.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0 font-semibold text-foreground">
                                            Google Forms:
                                        </span>
                                        Used only for feedback. Google handles
                                        that data per their own policy.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0 font-semibold text-foreground">
                                            No Analytics:
                                        </span>
                                        I don't use Google Analytics, ads, or
                                        tracking scripts.
                                    </li>
                                </ul>
                            </section>

                            {/* Security */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-3 text-xl font-semibold">
                                    6. Security
                                </h2>
                                <p className="mb-3 text-muted-foreground">
                                    As a solo developer, I do my best: passwords
                                    are hashed, the site uses HTTPS, and Laravel
                                    handles session security.
                                </p>
                                <p className="text-sm text-muted-foreground italic">
                                    But remember: No website is 100% hack-proof.
                                    Since this is a hobby project without a
                                    dedicated security team, please use it at
                                    your own risk.
                                </p>
                            </section>

                            {/* Rights */}
                            <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                <h2 className="mb-3 text-xl font-semibold">
                                    7. Your Rights
                                </h2>
                                <p className="mb-3 text-muted-foreground">
                                    It's your data, so you're in control:
                                </p>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-md border bg-background p-3">
                                        <div className="font-semibold text-foreground">
                                            View
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            See all data in dashboard
                                        </div>
                                    </div>
                                    <div className="rounded-md border bg-background p-3">
                                        <div className="font-semibold text-foreground">
                                            Edit
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Change blunders anytime
                                        </div>
                                    </div>
                                    <div className="rounded-md border bg-background p-3">
                                        <div className="font-semibold text-foreground">
                                            Delete
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Remove cards or account
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Age & Changes */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                    <h2 className="mb-2 text-xl font-semibold">
                                        8. Age Stuff
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Blunder Bank is for all ages. I don't
                                        verify IDs. If you're under 13, please
                                        ask a parent first.
                                    </p>
                                </section>
                                <section className="rounded-xl border bg-card p-6 shadow-sm dark:bg-card/50">
                                    <h2 className="mb-2 text-xl font-semibold">
                                        9. Changes
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        I might update this policy as I tweak
                                        the project. I'll try to notify you of
                                        big changes, but feel free to check back
                                        occasionally.
                                    </p>
                                </section>
                            </div>

                            {/* Contact */}
                            <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm dark:bg-primary/10">
                                <h2 className="mb-3 text-xl font-semibold">
                                    10. Contact Me
                                </h2>
                                <p className="mb-4 text-muted-foreground">
                                    Got questions, found a bug, or want to
                                    suggest a feature?
                                </p>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <a
                                        href="https://docs.google.com/forms/d/e/1FAIpQLScmNx4z0hF40w7sEIS75k82WOthIH6Ofmh4AuoNrNPOfLd5MA/viewform?hl=en"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <button className="inline-flex items-center justify-center rounded-md bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-[#d12c02] dark:bg-[#FF4433] dark:hover:bg-[#ff2211]">
                                            Send Feedback (Google Form)
                                        </button>
                                    </a>
                                </div>
                            </section>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-12 text-center text-sm text-muted-foreground">
                            <p>
                                Thanks for using Blunder Bank! Hope it helps you
                                turn those blunders into wins. ♟️
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer Simple - Consistent with Welcome Screen */}
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
