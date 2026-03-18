import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { blundersList } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';

interface FlashCard {
    id: number;
    fen: string; // Required
    correct_move: string; // Required
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blunders List" />

            {/* Template Structure Preserved */}
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

                {loading && (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                        Loading data...
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                        {error}
                    </div>
                )}

                {!loading && !error && (
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
                            /* Grid Layout matching your template */
                            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="relative flex flex-col space-y-3 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border"
                                    >
                                        {/* ID Badge */}
                                        <div className="flex items-start justify-between">
                                            <Badge variant="outline">
                                                ID: {card.id}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Created:{' '}
                                                {formatDate(card.created_at)}
                                            </span>
                                        </div>

                                        {/* Required Fields */}
                                        <div className="space-y-1">
                                            <div>
                                                <span className="text-xs font-bold text-muted-foreground uppercase">
                                                    FEN
                                                </span>
                                                <p className="rounded bg-muted/50 p-1 font-mono text-sm break-all">
                                                    {card.fen}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-muted-foreground uppercase">
                                                    Correct Move
                                                </span>
                                                <p className="text-sm font-semibold">
                                                    {card.correct_move}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Optional Fields Grid */}
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
                                                    {card.opening_name || '-'}
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

                                        {/* Stats Row */}
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

                                        {/* Source URL */}
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

                                        {/* Edit Button Placeholder */}
                                        <div className="mt-auto pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs"
                                            >
                                                Edit Card
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
