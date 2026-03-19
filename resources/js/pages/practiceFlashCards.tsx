import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { blundersList, practiceFlashCards } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Utils & Icons
import { getFenImageData, validateFEN } from '@/utils/chess';
import {
    CheckCircle2,
    XCircle,
    Lightbulb,
    ArrowRight,
    Loader2,
    AlertCircle,
    Trophy,
} from 'lucide-react';

interface FlashCard {
    id: number;
    fen: string;
    correct_move: string;
    note?: string | null;
    user_elo_at_time?: number | null;
    opening_name?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Practice Blunders',
        href: practiceFlashCards(),
    },
];

export default function PracticeFlashcards() {
    const [card, setCard] = useState<FlashCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionCount, setSessionCount] = useState(0); // Tracks cards answered
    const [sessionEnded, setSessionEnded] = useState(false); // Tracks if user clicked "End"

    // Interaction State
    const [userAnswer, setUserAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [showHint, setShowHint] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch Next Card
    const fetchNextCard = async () => {
        setLoading(true);
        setError(null);
        setFeedback(null);
        setShowHint(false);
        setUserAnswer('');

        try {
            const response = await axios.get('/api/flashcards/next-card');
            // Adjust based on your actual API response structure
            const data = response.data.flash_card || response.data;

            if (!data || !data.fen) {
                setError('No more cards available for practice! Great job.');
                setCard(null);
                return;
            }

            setCard(data);
        } catch (err) {
            console.error(err);
            setError('No blunders found. Please add some.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = () => {
        setHasStarted(true);
    };

    const handleEndSession = () => {
        setSessionEnded(true);
    };

    const handleRestartSession = () => {
        setSessionEnded(false);
        setSessionCount(0);
        setHasStarted(true); // Keep them in practice mode, just reset count
        fetchNextCard();
    };

    const handleExitToLibrary = () => {
        // navigate to blundersList() route using inertia
        window.location.href = blundersList().url;
    };

    // Only fetch when the user actually clicks "Start Practice"
    useEffect(() => {
        if (hasStarted) {
            fetchNextCard();
        }
    }, [hasStarted]);

    // Focus input when card loads or feedback changes
    useEffect(() => {
        if (card && !loading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [card, loading, feedback]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!card || !userAnswer.trim() || submitting) return;

        setSubmitting(true);
        setFeedback(null);
        setShowHint(false);

        try {
            const response = await axios.post(
                `/api/flashcards/answer-attempt/${card.id}`,
                {
                    answer: userAnswer.trim(),
                },
            );

            const result = response.data.result; // boolean

            if (result === true) {
                // ✅ CORRECT
                setFeedback({
                    type: 'success',
                    message: 'Correct! Moving to next card...',
                });
                setUserAnswer('');
                setSessionCount((prev) => prev + 1); // <--- Add this line

                // Wait 1s then fetch next
                setTimeout(() => {
                    fetchNextCard();
                }, 1000);
            } else {
                // ❌ INCORRECT
                setFeedback({
                    type: 'error',
                    message: 'Incorrect. Try again!',
                });
                setShowHint(true); // Reveal the note
                setUserAnswer(''); // Clear input for retry
            }
        } catch (err) {
            console.error(err);
            setFeedback({
                type: 'error',
                message: 'Error submitting answer. Please try again.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // --- INTRO SCREEN (Shown before starting) ---
    if (!hasStarted) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Smart Practice" />
                <div className="flex h-full items-center justify-center p-6">
                    <Card className="w-full max-w-2xl overflow-hidden shadow-xl">
                        <CardContent className="p-0">
                            <div className="grid md:grid-cols-2">
                                {/* Left: Visual/Icon */}
                                <div className="flex flex-col items-center justify-center bg-muted/50 p-8 text-center">
                                    <div className="mb-4 p-4">
                                        <Lightbulb className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold">
                                        Smart Review
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Powered by spaced repetition algorithms.
                                    </p>
                                </div>

                                {/* Right: Content & Button */}
                                <div className="flex flex-col justify-center space-y-4 p-8">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight">
                                            Practice Mode
                                        </h2>
                                        <p className="mt-2 leading-relaxed text-muted-foreground">
                                            Not sure what to study? This mode
                                            automatically selects your next
                                            blunder based on:
                                        </p>
                                        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                <span>
                                                    <strong>Recency:</strong>{' '}
                                                    Prioritizes cards you
                                                    haven't seen in a while.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                <span>
                                                    <strong>
                                                        Performance:
                                                    </strong>{' '}
                                                    Resurfaces blunders you
                                                    frequently get wrong.
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                <span>
                                                    <strong>
                                                        Long-term Retention:
                                                    </strong>{' '}
                                                    Optimized intervals to move
                                                    knowledge to long-term
                                                    memory.
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <Button
                                        size="lg"
                                        onClick={handleStartSession}
                                        className="mt-4 w-full gap-2"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        Start Practice Session
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Unlimited session • You control the pace
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // --- SESSION SUMMARY (Shown when ended) ---
    if (sessionEnded) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Session Complete" />
                <div className="flex h-full items-center justify-center">
                    <Card className="w-full max-w-md space-y-6 p-8 text-center">
                        <div className="mx-auto rounded-full bg-primary/10 p-4">
                            <Trophy className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                Session Ended
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Great work! You reviewed:
                            </p>
                            <div className="mt-4 text-4xl font-bold text-primary">
                                {sessionCount}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {sessionCount === 0
                                    ? 'cards'
                                    : sessionCount === 1
                                      ? 'card'
                                      : 'cards'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                onClick={handleRestartSession}
                                className="w-full"
                            >
                                Start New Session
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleExitToLibrary}
                                className="w-full"
                            >
                                Back to Library
                            </Button>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (loading && !card) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Practice Mode" />
                <div className="flex h-full items-center justify-center">
                    <div className="space-y-4 text-center">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                        <p className="text-lg font-semibold text-muted-foreground">
                            Finding your next blunder...
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error && !card) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Practice Mode" />
                <div className="flex h-full items-center justify-center">
                    <Card className="w-full max-w-md space-y-4 p-6 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="text-xl font-bold">Session Complete!</h2>
                        <p className="text-muted-foreground">{error}</p>
                        <Button onClick={handleExitToLibrary}>
                            Back to Library
                        </Button>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (!card) return null;

    const { isValid, imageUrl } = getFenImageData(card.fen);
    const turn = isValid
        ? card.fen.split(' ')[1] === 'w'
            ? 'White'
            : 'Black'
        : 'Unknown';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Practice Mode" />

            <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Practice Mode
                        </h1>
                        <p className="text-muted-foreground">
                            Find the best move for{' '}
                            <span className="font-semibold text-primary">
                                {turn}
                            </span>{' '}
                            • Session: {sessionCount} cards
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEndSession}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        End Session
                    </Button>
                </div>

                {/* Main Card Area */}
                <Card className="overflow-hidden border-2 shadow-lg">
                    <CardContent className="grid grid-cols-1 p-0 md:grid-cols-2">
                        {/* Left: Board Image */}
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

                            <div className="relative aspect-square w-full max-w-[360px] overflow-hidden rounded-md border bg-white shadow-sm">
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
                                {/* NEW SECTION: ELO and Opening Name above Input */}
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
                                                setUserAnswer(e.target.value)
                                            }
                                            placeholder="e.g., Nf3, O-O, Bxc4"
                                            className="h-12 font-mono text-lg"
                                            disabled={submitting}
                                            autoComplete="off"
                                        />
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={
                                                submitting || !userAnswer.trim()
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

                                {/* Feedback Area */}
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

                                {/* Hint Area (Hidden until incorrect) - KEPT ORIGINAL */}
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
                                            Try entering the correct move again.
                                        </p>
                                    </div>
                                )}
                            </div>

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
