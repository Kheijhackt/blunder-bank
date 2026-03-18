import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { blundersList } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FlashCard {
    id: number;
    fen: string;
    correct_move: string;
    note?: string | null;
    times_correct: number;
    times_wrong: number;
    user_elo_at_time?: number | null;
    opening_name?: string | null;
    source_game_url?: string | null;
    last_practiced_at?: string | null;
    created_at: string;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Blunders List',
        href: blundersList(),
    },
];

// Validation Function
const validateFEN = (fen: string): boolean => {
    if (!fen || typeof fen !== 'string') return false;
    const parts = fen.trim().split(/\s+/);
    if (parts.length < 2) return false;
    const board = parts[0];
    const activeColor = parts[1];
    const boardRegex = /^[prnbqkPRNBQK1-8\/]+$/;
    if (!boardRegex.test(board)) return false;
    if (activeColor !== 'w' && activeColor !== 'b') return false;
    return true;
};

// Helper for Image Data
const getFenImageData = (fen: string) => {
    if (!validateFEN(fen)) {
        return { isValid: false, turn: 'white', imageUrl: '' };
    }
    const parts = fen.trim().split(/\s+/);
    const turnChar = parts[1].toLowerCase();
    const pov = turnChar === 'b' ? 'black' : 'white';
    const cleanFen = parts.join(' ');
    const encodedFen = encodeURIComponent(cleanFen);
    const imageUrl = `https://fen2image.chessvision.ai/${encodedFen}?pov=${pov}`;
    return { isValid: true, turn: pov, imageUrl };
};

// Helper for Accuracy Percentage
const calculateAccuracy = (correct: number, wrong: number) => {
    const total = correct + wrong;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
};

export default function BlundersList() {
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await axios.get('/api/flashcards');
                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.flash_cards || [];
                setCards(data);
            } catch (err) {
                setError('Failed to load flashcards.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, []);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Blunders List" />
                <div className="flex h-full items-center justify-center">
                    <p className="text-lg font-semibold text-muted-foreground">
                        Loading your blunders...
                    </p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blunders List" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2">
                    <h2 className="text-lg font-semibold">
                        My Blunder Library
                    </h2>
                    <Button
                        size="sm"
                        onClick={() =>
                            (window.location.href = '/flashcards/create')
                        }
                    >
                        + Add New
                    </Button>
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                        {error}
                    </div>
                )}

                {!error && (
                    <>
                        {cards.length === 0 ? (
                            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <div className="text-center">
                                    <p className="font-semibold">
                                        No blunders found
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Create one to see it here.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {cards.map((card) => {
                                    const { isValid, imageUrl } =
                                        getFenImageData(card.fen);
                                    const accuracy = calculateAccuracy(
                                        card.times_correct,
                                        card.times_wrong,
                                    );

                                    // Determine badge color based on accuracy
                                    let accuracyVariant:
                                        | 'default'
                                        | 'destructive'
                                        | 'secondary' = 'default';
                                    if (accuracy < 50)
                                        accuracyVariant = 'destructive';
                                    else if (accuracy < 80)
                                        accuracyVariant = 'secondary';

                                    return (
                                        <div
                                            key={card.id}
                                            className="relative flex flex-col space-y-3 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border"
                                        >
                                            {/* Created Date (Top Right) */}
                                            <div className="flex justify-end">
                                                <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                                    {formatDate(
                                                        card.created_at,
                                                    )}
                                                </span>
                                            </div>

                                            {/* Board Container */}
                                            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-muted bg-white">
                                                {isValid ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Chess position`}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                        style={{
                                                            objectPosition:
                                                                'top',
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
                                                        Invalid FEN
                                                    </div>
                                                )}
                                            </div>

                                            {/* Correct Move */}
                                            <div className="space-y-1">
                                                <div>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                        Correct Move
                                                    </span>
                                                    <p className="text-sm leading-tight font-semibold">
                                                        {card.correct_move}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Optional Info Grid (Compact) */}
                                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                                <div>
                                                    <span className="block font-bold text-muted-foreground uppercase">
                                                        Note
                                                    </span>
                                                    <span className="block truncate">
                                                        {card.note || '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-muted-foreground uppercase">
                                                        Opening
                                                    </span>
                                                    <span className="block truncate">
                                                        {card.opening_name ||
                                                            '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-muted-foreground uppercase">
                                                        ELO
                                                    </span>
                                                    <span>
                                                        {card.user_elo_at_time ||
                                                            '-'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-muted-foreground uppercase">
                                                        Last Practiced
                                                    </span>
                                                    <span className="block truncate">
                                                        {formatDate(
                                                            card.last_practiced_at ??
                                                                null,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* ✅ NEW FOOTER LAYOUT: Accuracy (Left) | Source (Right) */}
                                            <div className="mt-auto flex items-center justify-between border-t border-sidebar-border/50 pt-3">
                                                {/* Left: Accuracy Percentage */}
                                                <Badge
                                                    variant={accuracyVariant}
                                                    className="px-2 py-0.5 text-xs font-bold"
                                                >
                                                    {accuracy}% Accuracy
                                                </Badge>

                                                {/* Right: Source Game Link (Inline) */}
                                                {card.source_game_url ? (
                                                    <a
                                                        href={
                                                            card.source_game_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80 hover:underline"
                                                    >
                                                        <span>🔗 Source</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        No source
                                                    </span>
                                                )}
                                            </div>

                                            {/* Edit Button (Full Width Bottom) */}
                                            <div className="pt-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-full text-xs"
                                                    onClick={() =>
                                                        console.log(
                                                            'Edit card',
                                                            card.id,
                                                        )
                                                    }
                                                >
                                                    Edit Card
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
