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

// ✅ 1. STRICT VALIDATION FUNCTION
// Returns true only if FEN looks structurally valid to avoid unnecessary API calls
const validateFEN = (fen: string): boolean => {
    if (!fen || typeof fen !== 'string') return false;

    const parts = fen.trim().split(/\s+/);

    // Must have at least 2 parts: Board position and Active Color
    if (parts.length < 2) return false;

    const board = parts[0];
    const activeColor = parts[1];

    // Basic Board Validation:
    // - Must contain ranks separated by '/'
    // - Must only contain valid characters (p,P,r,R,n,N,b,B,q,Q,k,K,1-8)
    const boardRegex = /^[prnbqkPRNBQK1-8\/]+$/;
    if (!boardRegex.test(board)) return false;

    // Basic Turn Validation:
    // - Must be 'w' or 'b'
    if (activeColor !== 'w' && activeColor !== 'b') return false;

    return true;
};

// Helper to get POV and Image URL only if valid
const getFenImageData = (fen: string) => {
    if (!validateFEN(fen)) {
        return { isValid: false, turn: 'white', imageUrl: '' };
    }

    const parts = fen.trim().split(/\s+/);
    const turnChar = parts[1].toLowerCase();
    const pov = turnChar === 'b' ? 'black' : 'white';

    // Encode FEN for URL
    const cleanFen = parts.join(' ');
    const encodedFen = encodeURIComponent(cleanFen);

    const imageUrl = `https://fen2image.chessvision.ai/${encodedFen}?pov=${pov}`;

    return { isValid: true, turn: pov, imageUrl };
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
                                    const { isValid, turn, imageUrl } =
                                        getFenImageData(card.fen);

                                    return (
                                        <div
                                            key={card.id}
                                            className="relative flex flex-col space-y-3 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border"
                                        >
                                            {/* ID & Created Date */}
                                            <div className="flex items-start justify-between">
                                                <Badge variant="outline">
                                                    ID: {card.id}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(
                                                        card.created_at,
                                                    )}
                                                </span>
                                            </div>

                                            {/* ✅ BOARD / INVALID CONTAINER */}
                                            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-muted bg-white">
                                                {isValid ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Chess position: ${card.fen}`}
                                                        className="h-full w-full object-cover"
                                                        // ✅ 3. LAZY LOADING: Only fetches when scrolled into view
                                                        loading="lazy"
                                                        // ✅ 1. CROPPING: Aligns image to top to hide bottom watermark
                                                        style={{
                                                            objectPosition:
                                                                'top',
                                                        }}
                                                    />
                                                ) : (
                                                    // ✅ 2. INVALID STATE: Simple text, no API request
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
                                                        Invalid FEN
                                                    </div>
                                                )}

                                                {/* Turn Indicator (Only if valid) */}
                                                {isValid && (
                                                    <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                                                        {turn} to move
                                                    </div>
                                                )}
                                            </div>

                                            {/* Correct Move */}
                                            <div className="space-y-1">
                                                <div>
                                                    <span className="text-xs font-bold text-muted-foreground uppercase">
                                                        Correct Move
                                                    </span>
                                                    <p className="text-sm font-semibold">
                                                        {card.correct_move}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Optional Info Grid */}
                                            <div className="grid grid-cols-2 gap-2 text-xs">
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

                                            {/* Stats */}
                                            <div className="flex items-center gap-2 border-t border-sidebar-border/50 pt-2">
                                                <Badge
                                                    variant="default"
                                                    className="bg-green-600"
                                                >
                                                    ✓ {card.times_correct}
                                                </Badge>
                                                <Badge variant="destructive">
                                                    ✗ {card.times_wrong}
                                                </Badge>
                                            </div>

                                            {/* Source Link */}
                                            {card.source_game_url && (
                                                <a
                                                    href={card.source_game_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 block truncate text-xs text-primary hover:underline"
                                                >
                                                    🔗 Source Game
                                                </a>
                                            )}

                                            {/* Edit Button */}
                                            <div className="mt-auto pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs"
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
