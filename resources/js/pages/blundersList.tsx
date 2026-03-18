import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { blundersList } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ Import the new Modal
import EditCardModal from '@/components/editCardModal';

// Utils
import { getFenImageData } from '@/utils/chess';

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
    { title: 'Blunders List', href: blundersList() },
];

const calculateAccuracy = (correct: number, wrong: number) => {
    const total = correct + wrong;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const parseDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString);
};

export default function BlundersList() {
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [accuracyMin, setAccuracyMin] = useState<number>(0);
    const [accuracyMax, setAccuracyMax] = useState<number>(100);
    const [eloMin, setEloMin] = useState<number | ''>('');
    const [eloMax, setEloMax] = useState<number | ''>('');
    const [createdFrom, setCreatedFrom] = useState<string>('');
    const [createdTo, setCreatedTo] = useState<string>('');
    const [practicedFrom, setPracticedFrom] = useState<string>('');
    const [practicedTo, setPracticedTo] = useState<string>('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    const filteredCards = useMemo(() => {
        return cards.filter((card) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const noteMatch = card.note?.toLowerCase().includes(query);
                const openingMatch = card.opening_name
                    ?.toLowerCase()
                    .includes(query);
                if (!noteMatch && !openingMatch) return false;
            }
            const accuracy = calculateAccuracy(
                card.times_correct,
                card.times_wrong,
            );
            if (accuracy < accuracyMin || accuracy > accuracyMax) return false;
            const elo = card.user_elo_at_time;
            if (elo !== null && elo !== undefined) {
                if (eloMin !== '' && elo < eloMin) return false;
                if (eloMax !== '' && elo > eloMax) return false;
            } else {
                if (eloMin !== '' || eloMax !== '') return false;
            }
            const createdAt = parseDate(card.created_at);
            if (createdAt) {
                if (createdFrom && createdAt < new Date(createdFrom))
                    return false;
                if (createdTo) {
                    const toDate = new Date(createdTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (createdAt > toDate) return false;
                }
            }
            const practicedAt = parseDate(card.last_practiced_at ?? null);
            if (practicedFrom || practicedTo) {
                if (!practicedAt) return false;
                if (practicedFrom && practicedAt < new Date(practicedFrom))
                    return false;
                if (practicedTo) {
                    const toDate = new Date(practicedTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (practicedAt > toDate) return false;
                }
            }
            return true;
        });
    }, [
        cards,
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

    const handleEditClick = (card: FlashCard) => {
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        // Refresh the list after successful update/delete
        const fetchCards = async () => {
            try {
                const response = await axios.get('/api/flashcards');
                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.flash_cards || [];
                setCards(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCards();
        setEditingCard(null);
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
                {/* Header & Controls */}
                <div className="flex flex-col gap-4 pb-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            My Blunder Library
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={cn(isFilterOpen && 'bg-muted')}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filters{' '}
                                {filteredCards.length !== cards.length &&
                                    `(${filteredCards.length})`}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() =>
                                    (window.location.href =
                                        '/flashcards/create')
                                }
                            >
                                + Add New
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by Note or Opening..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Panel */}
                    {isFilterOpen && (
                        <div className="animate-in rounded-lg border bg-card p-4 fade-in slide-in-from-top-2">
                            <div className="flex flex-wrap items-end gap-4">
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
                                            className="h-8 w-full [appearance:textfield] text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                                            className="h-8 w-full [appearance:textfield] text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
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
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            className="h-8 w-full [appearance:textfield] text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            className="h-8 w-full [appearance:textfield] text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                    <Label className="text-[10px] font-bold tracking-wider uppercase">
                                        Created Date
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            value={createdFrom}
                                            onChange={(e) =>
                                                setCreatedFrom(e.target.value)
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
                                <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                    <Label className="text-[10px] font-bold tracking-wider uppercase">
                                        Last Practiced
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            value={practicedFrom}
                                            onChange={(e) =>
                                                setPracticedFrom(e.target.value)
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
                                                setPracticedTo(e.target.value)
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
                </div>

                {error && (
                    <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                        {error}
                    </div>
                )}

                {!error && (
                    <>
                        {filteredCards.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                                <div className="mb-4 rounded-full bg-muted p-4">
                                    <Search className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">
                                    No blunders match your filters
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Try adjusting your search or filters.
                                </p>
                                {cards.length > 0 && (
                                    <Button
                                        variant="link"
                                        onClick={resetFilters}
                                        className="mt-2"
                                    >
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCards.map((card) => {
                                    const { isValid, imageUrl } =
                                        getFenImageData(card.fen);
                                    const accuracy = calculateAccuracy(
                                        card.times_correct,
                                        card.times_wrong,
                                    );
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
                                            <div className="flex justify-end">
                                                <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                                    {formatDate(
                                                        card.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-muted bg-white">
                                                {isValid ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt="Chess position"
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
                                                        {card.user_elo_at_time ??
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
                                            <div className="mt-auto flex items-center justify-between border-t border-sidebar-border/50 pt-3">
                                                <Badge
                                                    variant={accuracyVariant}
                                                    className="px-2 py-0.5 text-xs font-bold"
                                                >
                                                    {accuracy}% Accuracy
                                                </Badge>
                                                {card.source_game_url ? (
                                                    <a
                                                        href={
                                                            card.source_game_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80 hover:underline"
                                                    >
                                                        <span>
                                                            🔗 Game Source
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        No source
                                                    </span>
                                                )}
                                            </div>
                                            <div className="pt-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-full text-xs"
                                                    onClick={() =>
                                                        handleEditClick(card)
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

            {/* ✅ Edit Modal */}
            <EditCardModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                card={editingCard}
                onSuccess={handleModalSuccess}
            />
        </AppLayout>
    );
}
