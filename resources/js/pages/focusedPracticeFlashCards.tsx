import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    CheckCircle2,
    XCircle,
    Lightbulb,
    ArrowRight,
    Loader2,
    AlertCircle,
    Filter,
    RotateCcw,
    Search,
    Play,
    Trophy,
} from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { focusedPracticeFlashCards } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// Shadcn Components

// Utils & Icons
import { getFenImageData } from '@/utils/chess';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

interface FlashCard {
    id: number;
    fen: string;
    correct_move: string;
    note?: string | null;
    times_correct: number;
    times_wrong: number;
    user_elo_at_time?: number | null;
    opening_name?: string | null;
    last_practiced_at?: string | null;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Focused Practice', href: focusedPracticeFlashCards() },
];

// --- Filter Logic Helpers (Copied from BlundersList) ---
const calculateAccuracy = (correct: number, wrong: number) => {
    const total = correct + wrong;

    if (total === 0) {
        return 0;
    }

    return Math.round((correct / total) * 100);
};

const parseDate = (dateString: string | null) => {
    if (!dateString) {
        return null;
    }

    return new Date(dateString);
};

export default function FocusedPracticeFlashcards() {
    // --- Global State ---
    const [allCards, setAllCards] = useState<FlashCard[]>([]);
    const [loadingLibrary, setLoadingLibrary] = useState(true);

    // --- Filter States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [accuracyMin, setAccuracyMin] = useState<number>(0);
    const [accuracyMax, setAccuracyMax] = useState<number>(100);
    const [eloMin, setEloMin] = useState<number | ''>('');
    const [eloMax, setEloMax] = useState<number | ''>('');
    const [createdFrom, setCreatedFrom] = useState<string>('');
    const [createdTo, setCreatedTo] = useState<string>('');
    const [practicedFrom, setPracticedFrom] = useState<string>('');
    const [practicedTo, setPracticedTo] = useState<string>('');
    const [isFilterOpen, setIsFilterOpen] = useState(true); // Open by default for focused practice

    // --- Session State ---
    const [sessionQueue, setSessionQueue] = useState<FlashCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    // --- Interaction State (Per Card) ---
    const [userAnswer, setUserAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [showHint, setShowHint] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch Library on Mount
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await axios.get('/api/flashcards');
                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.flash_cards || [];
                setAllCards(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingLibrary(false);
            }
        };
        fetchCards();
    }, []);

    // Filter Logic
    const filteredCards = useMemo(() => {
        return allCards.filter((card) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const noteMatch = card.note?.toLowerCase().includes(query);
                const openingMatch = card.opening_name
                    ?.toLowerCase()
                    .includes(query);

                if (!noteMatch && !openingMatch) {
                    return false;
                }
            }

            const accuracy = calculateAccuracy(
                card.times_correct,
                card.times_wrong,
            );

            if (accuracy < accuracyMin || accuracy > accuracyMax) {
                return false;
            }

            const elo = card.user_elo_at_time;

            if (elo !== null && elo !== undefined) {
                if (eloMin !== '' && elo < eloMin) {
                    return false;
                }

                if (eloMax !== '' && elo > eloMax) {
                    return false;
                }
            } else {
                if (eloMin !== '' || eloMax !== '') {
                    return false;
                }
            }

            const createdAt = parseDate(card.created_at);

            if (createdAt) {
                if (createdFrom && createdAt < new Date(createdFrom)) {
                    return false;
                }

                if (createdTo) {
                    const toDate = new Date(createdTo);
                    toDate.setHours(23, 59, 59, 999);

                    if (createdAt > toDate) {
                        return false;
                    }
                }
            }

            const practicedAt = parseDate(card.last_practiced_at ?? null);

            if (practicedFrom || practicedTo) {
                if (!practicedAt) {
                    return false;
                }

                if (practicedFrom && practicedAt < new Date(practicedFrom)) {
                    return false;
                }

                if (practicedTo) {
                    const toDate = new Date(practicedTo);
                    toDate.setHours(23, 59, 59, 999);

                    if (practicedAt > toDate) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [
        allCards,
        searchQuery,
        accuracyMin,
        accuracyMax,
        eloMin,
        eloMax,
        createdFrom,
        createdTo,
        practicedFrom,
        practicedTo,
    ]);

    const resetFilters = () => {
        setSearchQuery('');
        setAccuracyMin(0);
        setAccuracyMax(100);
        setEloMin('');
        setEloMax('');
        setCreatedFrom('');
        setCreatedTo('');
        setPracticedFrom('');
        setPracticedTo('');
    };

    // Start Session
    const startSession = () => {
        if (filteredCards.length === 0) {
            return;
        }

        // Create a copy to avoid mutating the original filtered list
        const shuffled = [...filteredCards];

        // Fisher-Yates Shuffle Algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setSessionQueue(shuffled);
        setCurrentIndex(0);
        setIsSessionActive(true);
        setSessionComplete(false);
        resetCardState();
    };

    const resetCardState = () => {
        setUserAnswer('');
        setFeedback(null);
        setShowHint(false);
        setSubmitting(false);
    };

    // Focus input on card change
    useEffect(() => {
        if (isSessionActive && !sessionComplete && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentIndex, isSessionActive, sessionComplete]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentCard = sessionQueue[currentIndex];

        if (!currentCard || !userAnswer.trim() || submitting) {
            return;
        }

        setSubmitting(true);
        setFeedback(null);
        setShowHint(false);

        try {
            // Use the same endpoint as standard practice
            const response = await axios.post(
                `/api/flashcards/answer-attempt/${currentCard.id}`,
                { answer: userAnswer.trim() },
            );

            const result = response.data.result;

            if (result === true) {
                setFeedback({
                    type: 'success',
                    message: 'Correct!',
                });

                // Auto advance after short delay
                setTimeout(() => {
                    handleNext();
                }, 1000);
            } else {
                setFeedback({
                    type: 'error',
                    message: 'Incorrect. Try again!',
                });
                setShowHint(true);
                setUserAnswer('');
            }
        } catch (err) {
            console.error(err);
            setFeedback({
                type: 'error',
                message: 'Error submitting answer.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < sessionQueue.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            resetCardState();
        } else {
            setSessionComplete(true);
        }
    };

    const endSession = () => {
        setIsSessionActive(false);
        setSessionComplete(false);
        setSessionQueue([]);
        setCurrentIndex(0);
        resetCardState();
    };

    // --- Loading State ---
    if (loadingLibrary) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Focused Practice Setup" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    {/* Header Skeleton */}
                    <div className="space-y-2 pb-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>

                    <Card className="overflow-hidden">
                        <CardContent className="space-y-6 p-6">
                            {/* Search & Toggle Skeleton */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative flex-1">
                                    <Skeleton className="absolute top-2.5 left-2.5 h-4 w-4" />
                                    <Skeleton className="h-10 w-full pl-9" />
                                </div>
                                <Skeleton className="h-10 w-28" />
                            </div>

                            {/* Filter Panel Skeleton (Always visible in loading state to match default open state) */}
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="flex flex-wrap items-end gap-4">
                                    {/* Accuracy Inputs */}
                                    <div className="flex w-[160px] shrink-0 flex-col gap-1.5">
                                        <Skeleton className="h-3 w-20" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-3 w-3" />
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                    </div>
                                    {/* ELO Inputs */}
                                    <div className="flex w-[160px] shrink-0 flex-col gap-1.5">
                                        <Skeleton className="h-3 w-16" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 w-full" />
                                            <Skeleton className="h-3 w-3" />
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                    </div>
                                    {/* Date Range 1 */}
                                    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                        <Skeleton className="h-3 w-24" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 flex-1" />
                                            <Skeleton className="h-3 w-6" />
                                            <Skeleton className="h-8 flex-1" />
                                        </div>
                                    </div>
                                    {/* Date Range 2 */}
                                    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                        <Skeleton className="h-3 w-28" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 flex-1" />
                                            <Skeleton className="h-3 w-6" />
                                            <Skeleton className="h-8 flex-1" />
                                        </div>
                                    </div>
                                    {/* Reset Button */}
                                    <div className="ml-auto pb-[2px]">
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </div>
                            </div>

                            {/* Results Summary & Action Skeleton */}
                            <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-12 w-40" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // --- Session Active View ---
    if (isSessionActive && !sessionComplete) {
        const card = sessionQueue[currentIndex];
        const { isValid, imageUrl } = getFenImageData(card.fen);
        const turn = isValid
            ? card.fen.split(' ')[1] === 'w'
                ? 'White'
                : 'Black'
            : 'Unknown';

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Focused Practice Session" />
                <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-6 p-6">
                    {/* Header with Progress */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Focused Practice
                            </h1>
                            <p className="text-muted-foreground">
                                Card {currentIndex + 1} of {sessionQueue.length}{' '}
                                •{' '}
                                <span className="font-semibold text-primary">
                                    {turn} to Move
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={endSession}
                                disabled={submitting}
                            >
                                End Session
                            </Button>
                        </div>
                    </div>

                    {/* Main Card Area */}
                    <Card className="overflow-hidden border-2 shadow-lg">
                        <CardContent className="grid grid-cols-1 p-0 md:grid-cols-2">
                            {/* Left: Board Image (Same style as PracticeFlashcards) */}
                            <div className="flex flex-col items-center justify-center space-y-3 p-4">
                                <div className="space-y-1 text-center">
                                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Position Preview
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {isValid
                                            ? card.fen.split(' ')[1] === 'w'
                                                ? 'White to Move'
                                                : 'Black to Move'
                                            : 'Invalid Position'}
                                    </p>
                                </div>
                                <div className="relative aspect-square w-full max-w-[360px] overflow-hidden rounded-md">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="Board Preview"
                                            className="h-full w-full object-cover"
                                            style={{ objectPosition: 'top' }}
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
                                            <AlertCircle className="mb-2 h-8 w-8 opacity-50" />
                                            <span className="text-sm font-medium">
                                                Invalid FEN
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Interaction Area */}
                            <div className="flex flex-col justify-between space-y-6 p-6">
                                <div className="space-y-4">
                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-2">
                                        {card.user_elo_at_time && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs font-semibold"
                                            >
                                                ELO: {card.user_elo_at_time}
                                            </Badge>
                                        )}
                                        {card.opening_name && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs font-semibold"
                                            >
                                                {card.opening_name}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Input */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="move-input"
                                            className="text-base font-bold tracking-wide uppercase"
                                        >
                                            Your Move
                                        </Label>
                                        <form
                                            onSubmit={handleSubmit}
                                            className="flex gap-2"
                                        >
                                            <Input
                                                id="move-input"
                                                ref={inputRef}
                                                value={userAnswer}
                                                onChange={(e) =>
                                                    setUserAnswer(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g., Nf3, O-O"
                                                className="h-12 font-mono text-lg"
                                                disabled={submitting}
                                                autoComplete="off"
                                            />
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={
                                                    submitting ||
                                                    !userAnswer.trim()
                                                }
                                                className="px-6"
                                            >
                                                {submitting ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <ArrowRight className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </form>
                                    </div>

                                    {/* Feedback */}
                                    {feedback && (
                                        <Alert
                                            variant={
                                                feedback.type === 'success'
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            className={
                                                feedback.type === 'success'
                                                    ? 'border-green-200 bg-green-50 text-green-900'
                                                    : ''
                                            }
                                        >
                                            {feedback.type === 'success' ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <XCircle className="h-5 w-5" />
                                            )}
                                            <AlertTitle className="font-bold">
                                                {feedback.type === 'success'
                                                    ? 'Correct!'
                                                    : 'Incorrect'}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {feedback.message}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Hint */}
                                    {showHint && card.note && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <Alert className="border-blue-200 bg-blue-50 text-blue-900">
                                                <Lightbulb className="h-5 w-5 text-blue-600" />
                                                <AlertTitle className="font-bold text-blue-800">
                                                    Note
                                                </AlertTitle>
                                                <AlertDescription className="mt-1 text-blue-700 italic">
                                                    "{card.note}"
                                                </AlertDescription>
                                            </Alert>
                                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                                Try entering the correct move
                                                again.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Controls */}
                                {/* Footer Info */}
                                <div className="border-t pt-4">
                                    <p className="text-center text-xs text-muted-foreground">
                                        Type standard algebraic notation (e.g.,{' '}
                                        <span className="rounded bg-muted px-1 font-mono">
                                            Nf3
                                        </span>
                                        ,{' '}
                                        <span className="rounded bg-muted px-1 font-mono">
                                            O-O
                                        </span>
                                        ).
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // --- Session Complete View ---
    if (isSessionActive && sessionComplete) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Session Complete" />
                <div className="flex h-full items-center justify-center">
                    <Card className="w-full max-w-md space-y-6 p-8 text-center">
                        <div className="mx-auto rounded-full bg-green-100 p-4 dark:bg-green-900">
                            <Trophy className="h-12 w-12 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                Session Complete!
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                You practiced all {sessionQueue.length} cards in
                                your filtered list.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" onClick={endSession}>
                                Back to Filters
                            </Button>
                            <Button onClick={startSession}>
                                Restart Same Set
                            </Button>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // --- Filter / Selection View (Default) ---
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Focused Practice Setup" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="pb-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Focused Practice
                    </h1>
                    <p className="text-muted-foreground">
                        Select a specific subset of your blunders to practice
                        intensively.
                    </p>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="space-y-6 p-6">
                        {/* Search & Toggle */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by Note or Opening..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={cn(isFilterOpen && 'bg-muted')}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>

                        {/* Filter Panel */}
                        {isFilterOpen && (
                            <div className="animate-in rounded-lg border bg-muted/30 p-4 fade-in slide-in-from-top-2">
                                <div className="flex flex-wrap items-end gap-4">
                                    {/* Accuracy */}
                                    <div className="flex w-[160px] shrink-0 flex-col gap-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider uppercase">
                                            Accuracy (%)
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="0"
                                                value={accuracyMin}
                                                onChange={(e) =>
                                                    setAccuracyMin(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="h-8 w-full text-xs"
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                -
                                            </span>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="100"
                                                value={accuracyMax}
                                                onChange={(e) =>
                                                    setAccuracyMax(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="h-8 w-full text-xs"
                                            />
                                        </div>
                                    </div>
                                    {/* ELO */}
                                    <div className="flex w-[160px] shrink-0 flex-col gap-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider uppercase">
                                            User ELO
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                value={eloMin}
                                                onChange={(e) =>
                                                    setEloMin(
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                                className="h-8 w-full text-xs"
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                -
                                            </span>
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                value={eloMax}
                                                onChange={(e) =>
                                                    setEloMax(
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(
                                                                  e.target
                                                                      .value,
                                                              ),
                                                    )
                                                }
                                                className="h-8 w-full text-xs"
                                            />
                                        </div>
                                    </div>
                                    {/* Created Date */}
                                    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider uppercase">
                                            Created Date
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="date"
                                                value={createdFrom}
                                                onChange={(e) =>
                                                    setCreatedFrom(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 flex-1 text-xs"
                                            />
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                to
                                            </span>
                                            <Input
                                                type="date"
                                                value={createdTo}
                                                onChange={(e) =>
                                                    setCreatedTo(e.target.value)
                                                }
                                                className="h-8 flex-1 text-xs"
                                            />
                                        </div>
                                    </div>
                                    {/* Practiced Date */}
                                    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider uppercase">
                                            Last Practiced
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="date"
                                                value={practicedFrom}
                                                onChange={(e) =>
                                                    setPracticedFrom(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 flex-1 text-xs"
                                            />
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                to
                                            </span>
                                            <Input
                                                type="date"
                                                value={practicedTo}
                                                onChange={(e) =>
                                                    setPracticedTo(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 flex-1 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="ml-auto pb-[2px]">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetFilters}
                                            className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
                                        >
                                            <RotateCcw className="mr-2 h-3 w-3" />{' '}
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Summary & Action */}
                        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    {filteredCards.length} card
                                    {filteredCards.length !== 1 && 's'} found
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {filteredCards.length === 0
                                        ? 'No cards match your filters.'
                                        : 'Ready to start focused practice session.'}
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={startSession}
                                disabled={filteredCards.length === 0}
                                className="gap-2"
                            >
                                <Play className="h-4 w-4" />
                                Start Practice
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
