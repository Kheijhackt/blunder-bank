import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Save, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFenImageData } from '@/utils/chess';
import { Textarea } from '@/components/ui/textarea';

interface FlashCardData {
    fen: string;
    correct_move: string;
    note?: string | null;
    user_elo_at_time?: number | string | null;
    opening_name?: string | null;
    source_game_url?: string | null;
}

interface NewCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function NewCardModal({
    open,
    onOpenChange,
    onSuccess,
}: NewCardModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isFenValid, setIsFenValid] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, processing } = useForm<FlashCardData>({
        fen: '',
        correct_move: '',
        note: '',
        user_elo_at_time: '',
        opening_name: '',
        source_game_url: '',
    });

    // Reset form when modal opens
    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            // Use setData to clear fields instead of reset which doesn't accept an object
            setData({
                fen: '',
                correct_move: '',
                note: '',
                user_elo_at_time: '',
                opening_name: '',
                source_game_url: '',
            });
            setIsFenValid(false);
            setImageUrl(null);
        }
    }, [open, setData]);

    // Validate FEN & Update Image
    useEffect(() => {
        if (!open) {
            return;
        }

        const result = getFenImageData(data.fen);
        setIsFenValid(result.isValid);
        setImageUrl(result.isValid ? result.imageUrl : null);
    }, [data.fen, open]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFenValid || !data.correct_move.trim()) {
            return;
        }

        setIsCreating(true);
        const formData = new FormData();
        formData.append('fen', data.fen);
        formData.append('correct_move', data.correct_move);

        if (data.note) {
            formData.append('note', data.note);
        }

        if (data.user_elo_at_time) {
            formData.append('user_elo_at_time', String(data.user_elo_at_time));
        }

        if (data.opening_name) {
            formData.append('opening_name', data.opening_name);
        }

        if (data.source_game_url) {
            formData.append('source_game_url', data.source_game_url);
        }

        try {
            // POST Request to create new card
            await axios.post('/api/flashcards', formData);
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Add New Blunder
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-6 py-4">
                    {/* 1. FEN IMAGE PREVIEW */}
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
                                        {data.fen
                                            ? 'Invalid FEN'
                                            : 'Enter FEN to preview'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. FEN INPUT FIELD */}
                    <div className="space-y-2">
                        <Label htmlFor="new-fen" className="font-semibold">
                            FEN Text <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="new-fen"
                            value={data.fen}
                            onChange={(e) => setData('fen', e.target.value)}
                            className={`font-mono text-xs ${!isFenValid && data.fen ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            placeholder="rnbqkbnr/pppppppp..."
                        />
                        {!isFenValid && data.fen && (
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
                        <Label htmlFor="new-move" className="font-semibold">
                            Correct Move{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="new-move"
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

                    {/* 4. OTHER DETAILS */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-elo">ELO at Time</Label>
                            <Input
                                type="number"
                                value={data.user_elo_at_time || ''}
                                onChange={(e) =>
                                    setData('user_elo_at_time', e.target.value)
                                }
                                placeholder="e.g., 1200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-opening">Opening</Label>
                            <Input
                                value={data.opening_name || ''}
                                onChange={(e) =>
                                    setData('opening_name', e.target.value)
                                }
                                placeholder="e.g., Sicilian Defense"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="new-note">Note / Remarks</Label>
                            <Textarea
                                value={data.note || ''}
                                onChange={(e) =>
                                    setData('note', e.target.value)
                                }
                                placeholder="What went wrong?"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="new-url">Source Game URL</Label>
                            <Input
                                type="url"
                                value={data.source_game_url || ''}
                                onChange={(e) =>
                                    setData('source_game_url', e.target.value)
                                }
                                placeholder="https://lichess.org/... or https://www.chess.com/..."
                            />
                        </div>
                    </div>

                    {/* 5. BUTTONS */}
                    <DialogFooter className="mt-6 grid grid-cols-2 gap-4 border-t pt-6">
                        {/* Left: Cancel */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing || isCreating}
                            className="w-full"
                        >
                            Cancel
                        </Button>

                        {/* Right: Create */}
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                isCreating ||
                                !isFenValid ||
                                !data.correct_move.trim()
                            }
                            className="w-full"
                        >
                            {isCreating ? (
                                'Creating...'
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Create
                                    Card
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
