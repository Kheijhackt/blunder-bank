import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { validateFEN, getFenImageData } from '@/utils/chess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Save, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface FlashCardData {
    fen: string;
    correct_move: string;
    note?: string | null;
    user_elo_at_time?: number | string | null;
    opening_name?: string | null;
    source_game_url?: string | null;
}

interface EditCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    card: {
        id: number;
        fen: string;
        correct_move: string;
        note?: string | null;
        user_elo_at_time?: number | null;
        opening_name?: string | null;
        source_game_url?: string | null;
    } | null;
    onSuccess: () => void;
}

export default function EditCardModal({
    open,
    onOpenChange,
    card,
    onSuccess,
}: EditCardModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isFenValid, setIsFenValid] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, processing, errors } = useForm<FlashCardData>({
        fen: '',
        correct_move: '',
        note: '',
        user_elo_at_time: '',
        opening_name: '',
        source_game_url: '',
    });

    // Populate form when card changes
    useEffect(() => {
        if (card) {
            setData({
                fen: card.fen,
                correct_move: card.correct_move,
                note: card.note ?? '',
                user_elo_at_time:
                    card.user_elo_at_time === null ? '' : card.user_elo_at_time,
                opening_name: card.opening_name ?? '',
                source_game_url: card.source_game_url ?? '',
            });
        }
    }, [card]);

    // Validate FEN & Update Image
    useEffect(() => {
        if (!open) return;
        const result = getFenImageData(data.fen);
        setIsFenValid(result.isValid);
        setImageUrl(result.isValid ? result.imageUrl : null);
    }, [data.fen, open]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!card || !isFenValid || !data.correct_move.trim()) return;

        const formData = new FormData();
        formData.append('fen', data.fen);
        formData.append('correct_move', data.correct_move);
        if (data.note) formData.append('note', data.note);
        if (data.user_elo_at_time)
            formData.append('user_elo_at_time', String(data.user_elo_at_time));
        if (data.opening_name)
            formData.append('opening_name', data.opening_name);
        if (data.source_game_url)
            formData.append('source_game_url', data.source_game_url);
        formData.append('_method', 'PATCH');

        try {
            await axios.post(`/api/flashcards/${card.id}`, formData);
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!card || !confirm('Are you sure you want to delete this blunder?'))
            return;

        setIsDeleting(true);
        try {
            await axios.delete(`/api/flashcards/${card.id}`);
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!card) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Standard Shadcn Width - Responsive */}
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Edit Blunder Details
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSave} className="space-y-6 py-4">
                    {/* 1. FEN IMAGE PREVIEW (Top Centered) */}
                    <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border bg-muted/50 p-4">
                        <div className="space-y-1 text-center">
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Position Preview
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {isFenValid
                                    ? data.fen.split(' ')[1] === 'w'
                                        ? 'White to Move'
                                        : 'Black to Move'
                                    : 'Invalid Position'}
                            </p>
                        </div>

                        <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-md border bg-white shadow-sm">
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

                    {/* 2. FEN INPUT FIELD (Directly Below Image) */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-fen" className="font-semibold">
                            FEN Text <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-fen"
                            value={data.fen}
                            onChange={(e) => setData('fen', e.target.value)}
                            className={`font-mono text-xs ${!isFenValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            placeholder="rnbqkbnr/pppppppp..."
                        />
                        {!isFenValid && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Invalid FEN. Check board position and turn
                                    (w/b).
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* 3. CORRECT MOVE */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-move" className="font-semibold">
                            Correct Move{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-move"
                            value={data.correct_move}
                            onChange={(e) =>
                                setData('correct_move', e.target.value)
                            }
                            placeholder="e.g., Nf3, O-O"
                            className={`font-semibold ${!data.correct_move.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        {!data.correct_move.trim() && (
                            <p className="text-xs text-destructive">
                                Move cannot be empty.
                            </p>
                        )}
                    </div>

                    {/* 4. OTHER DETAILS (Grid) */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-elo">ELO at Time</Label>
                            <Input
                                type="number"
                                value={data.user_elo_at_time || ''}
                                onChange={(e) =>
                                    setData('user_elo_at_time', e.target.value)
                                }
                                placeholder="1200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-opening">Opening</Label>
                            <Input
                                value={data.opening_name || ''}
                                onChange={(e) =>
                                    setData('opening_name', e.target.value)
                                }
                                placeholder="Sicilian"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="edit-note">Note / Remarks</Label>
                            <Input
                                value={data.note || ''}
                                onChange={(e) =>
                                    setData('note', e.target.value)
                                }
                                placeholder="What went wrong?"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="edit-url">Source Game URL</Label>
                            <Input
                                type="url"
                                value={data.source_game_url || ''}
                                onChange={(e) =>
                                    setData('source_game_url', e.target.value)
                                }
                                placeholder="https://lichess.org/..."
                            />
                        </div>
                    </div>

                    {/* 5. BUTTONS (Footer) */}
                    <DialogFooter className="mt-6 flex items-center justify-between gap-2 border-t pt-4 pt-6 sm:justify-between">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={processing || isDeleting}
                            className="order-2 sm:order-1"
                        >
                            {isDeleting ? (
                                'Deleting...'
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </>
                            )}
                        </Button>

                        <div className="order-1 flex gap-2 sm:order-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={processing || isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    isDeleting ||
                                    !isFenValid ||
                                    !data.correct_move.trim()
                                }
                            >
                                {processing ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Save
                                        Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
