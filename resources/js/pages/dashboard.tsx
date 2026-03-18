import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    dashboard,
    practiceFlashCards,
    focusedPracticeFlashCards,
    blundersList,
} from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Shadcn Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Icons
import {
    Flame,
    Target,
    BookOpen,
    ArrowRight,
    Trophy,
    CalendarCheck,
    BrainCircuit,
    AlertCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

interface DashboardStats {
    total_correct: number;
    total_wrong: number;
    accuracy: number;
    streak: number;
    cards_due: number;
    total_cards: number;
    streak_count: number;
    streak_is_active: boolean;
    streak_is_at_risk: boolean;
    streak_can_start_new: boolean;
    streak_icon_color: 'orange' | 'gray';
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
                // Mock data for demonstration
                setStats({
                    total_correct: 145,
                    total_wrong: 32,
                    accuracy: 81.9,
                    streak: 5,
                    cards_due: 12,
                    total_cards: 250,
                    streak_count: 5,
                    streak_is_active: true,
                    streak_is_at_risk: false,
                    streak_can_start_new: true,
                    streak_icon_color: 'orange',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full items-center justify-center">
                    <div className="space-y-4 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-muted-foreground">
                            Loading your stats...
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!stats) return null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-muted-foreground">
                            Here's what's happening with your chess training
                            today.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                (window.location.href = blundersList().url)
                            }
                        >
                            View Library
                        </Button>
                        <Button
                            onClick={() =>
                                (window.location.href =
                                    practiceFlashCards().url)
                            }
                        >
                            Start Practice
                        </Button>
                    </div>
                </div>

                {/* Top Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Streak Card */}
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Streak
                            </CardTitle>
                            {/* Dynamic Icon Color */}
                            <Flame
                                className={`h-4 w-4 transition-colors duration-300 ${
                                    stats.streak_icon_color === 'orange'
                                        ? 'fill-orange-500 text-orange-500'
                                        : 'fill-gray-400 text-gray-400' // Gray if broken/inactive
                                }`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.streak_count}{' '}
                                {stats.streak_count === 1 ? 'Day' : 'Days'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.streak_is_active
                                    ? 'Nice! Come back tomorrow.'
                                    : stats.streak_is_at_risk
                                      ? 'Practice today to keep it alive!'
                                      : stats.streak_can_start_new
                                        ? 'Practice today to start a new streak!'
                                        : 'Start your journey today!'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Accuracy Card */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Overall Accuracy
                            </CardTitle>
                            <Target className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.accuracy.toFixed(1)}%
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${stats.accuracy}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stats.total_correct} correct /{' '}
                                {stats.total_wrong} wrong
                            </p>
                        </CardContent>
                    </Card>

                    {/* Due Cards Card */}
                    <Card
                        className={`border-l-4 ${stats.cards_due > 0 ? 'border-l-green-500' : 'border-l-gray-300'}`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Due for Review
                            </CardTitle>
                            <CalendarCheck
                                className={`h-4 w-4 ${stats.cards_due > 0 ? 'text-green-500' : 'text-muted-foreground'}`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.cards_due}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.cards_due > 0
                                    ? 'Cards ready for spaced repetition'
                                    : 'All caught up!'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Cards Card */}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Blunders
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_cards}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                In your personal library
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Action Area - Responsive Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left: Quick Actions (Takes 2 cols on large, 1 on mobile) */}
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-primary" />
                                Recommended Training
                            </CardTitle>
                            <CardDescription>
                                Based on your performance, we recommend
                                reviewing these now.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Spaced Repetition Item */}
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1">
                                        <h4 className="leading-none font-semibold">
                                            Spaced Repetition Mode
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Smart algorithm selects cards you're
                                            about to forget. Best for long-term
                                            retention.
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="bg-green-100 text-green-800 hover:bg-green-200"
                                            >
                                                {stats.cards_due} Due
                                            </Badge>
                                            <Badge variant="outline">
                                                Unlimited
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        size="default"
                                        className="w-full sm:w-auto"
                                        onClick={() =>
                                            (window.location.href =
                                                practiceFlashCards().url)
                                        }
                                        disabled={
                                            stats.cards_due === 0 &&
                                            stats.total_cards === 0
                                        }
                                    >
                                        Start Session{' '}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Focused Practice Item */}
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1">
                                        <h4 className="leading-none font-semibold">
                                            Focused Practice
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Filter by opening, date, or accuracy
                                            to target specific weaknesses.
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                            >
                                                Customizable
                                            </Badge>
                                            <Badge variant="outline">
                                                Manual
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="default"
                                        className="w-full sm:w-auto"
                                        onClick={() =>
                                            (window.location.href =
                                                focusedPracticeFlashCards().url)
                                        }
                                    >
                                        Configure{' '}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Performance Summary (Takes 1 col on large, 1 on mobile) */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Career Highlights
                            </CardTitle>
                            <CardDescription>
                                Your lifetime statistics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Mastery Level
                                    </span>
                                    <span className="font-medium">
                                        {stats.accuracy >= 90
                                            ? 'Paragon of Discipline' // 90-100%: Unwavering consistency
                                            : stats.accuracy >= 80
                                              ? 'Master of Consistency' // 80-89%: Highly reliable
                                              : stats.accuracy >= 70
                                                ? 'Steadfast Practitioner' // 70-79%: Solid, reliable effort
                                                : stats.accuracy >= 60
                                                  ? 'Dedicated Learner' // 60-69%: Committed to improvement
                                                  : stats.accuracy >= 50
                                                    ? 'Focused Builder' // 50-59%: Building a strong foundation
                                                    : stats.accuracy >= 40
                                                      ? 'Resilient Seeker' // 40-49%: Learning through challenges
                                                      : stats.accuracy >= 30
                                                        ? 'Awakening Mind' // 30-39%: The journey begins
                                                        : stats.accuracy >= 20
                                                          ? 'Humble Novice' // 20-29%: Embracing the basics
                                                          : stats.accuracy >= 10
                                                            ? 'Curious Beginner' // 10-19%: Taking the first steps
                                                            : 'Seed of Potential'}
                                    </span>
                                </div>
                                <Progress
                                    value={stats.accuracy}
                                    className="h-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="rounded-md bg-muted/50 p-3 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.total_correct}
                                    </div>
                                    <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                        Correct
                                    </div>
                                </div>
                                <div className="rounded-md bg-muted/50 p-3 text-center">
                                    <div className="text-2xl font-bold text-red-500">
                                        {stats.total_wrong}
                                    </div>
                                    <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                        Incorrect
                                    </div>
                                </div>
                            </div>

                            {stats.cards_due === 0 && stats.total_cards > 0 && (
                                <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-3">
                                    <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                    <div className="text-sm text-green-800">
                                        <p className="font-semibold">
                                            All Caught Up!
                                        </p>
                                        <p className="text-xs opacity-90">
                                            You've reviewed all your due cards.
                                            Come back later or try Focused
                                            Practice.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {stats.total_cards === 0 && (
                                <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold">
                                            Library Empty
                                        </p>
                                        <p className="text-xs opacity-90">
                                            Start adding blunders from your
                                            games to begin training.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
