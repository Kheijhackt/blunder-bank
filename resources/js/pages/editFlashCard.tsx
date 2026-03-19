import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { FormEvent} from 'react';
import { useState, useEffect } from 'react';

interface FlashCard {
    id: number;
    user_id: number;
    fen: string;
    correct_move: string;
    note?: string;
    user_elo_at_time?: number | null;
    opening_name?: string | null;
    source_game_url?: string | null;
    created_at: string;
    updated_at: string;
}

export default function EditFlashCard({ id }: { id: number }) {
    // Core Fields
    const [fen, setFen] = useState<string>('');
    const [correctMove, setCorrectMove] = useState<string>('');
    const [note, setNote] = useState<string>('');

    // New Optional Fields
    const [elo, setElo] = useState<string>('');
    const [opening, setOpening] = useState<string>('');
    const [gameUrl, setGameUrl] = useState<string>('');

    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    id = 6; // ONLY FOR TESTING PURPOSES - REMOVE

    // Fetch data from show() method on load
    useEffect(() => {
        axios
            .get(`/api/flashcards/${id}`)
            .then((res: AxiosResponse<{ flash_card: FlashCard }>) => {
                const card = res.data.flash_card;
                setFen(card.fen);
                setCorrectMove(card.correct_move);
                setNote(card.note || '');

                // Populate new fields (convert elo number back to string for input)
                setElo(card.user_elo_at_time?.toString() || '');
                setOpening(card.opening_name || '');
                setGameUrl(card.source_game_url || '');

                setLoading(false);
            })
            .catch((err) => {
                setMessage('Error loading card or unauthorized.');
                setLoading(false);
                console.error(err);
            });
    }, [id]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await axios.patch(`/api/flashcards/${id}`, {
                fen: fen.trim(),
                correct_move: correctMove.trim(),
                note: note.trim() || null,

                // Send null if empty, otherwise send value (Laravel handles int conversion)
                user_elo_at_time: elo.trim() === '' ? null : elo.trim(),
                opening_name: opening.trim() || null,
                source_game_url: gameUrl.trim() || null,
            });
            setMessage('Flash card updated successfully!');
        } catch (err: any) {
            console.error(err);
            setMessage(
                err.response?.data?.message ||
                    err.response?.data?.result ||
                    'Error updating flash card',
            );
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm('Are you sure you want to delete this flashcard?')
        ) {
            return;
        }

        try {
            await axios.delete(`/api/flashcards/${id}`);
            setMessage('Flash card deleted successfully!');
            // Optional: Clear form or notify parent to redirect
            setFen('');
            setCorrectMove('');
            setNote('');
            setElo('');
            setOpening('');
            setGameUrl('');
        } catch (err: any) {
            console.error(err);
            setMessage(
                err.response?.data?.message || 'Error deleting flash card',
            );
        }
    };

    if (loading) {
return <div>Loading...</div>;
}

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Edit Flash Card #{id}</h2>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                }}
            >
                {/* Core Fields */}
                <div>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        FEN:
                    </label>
                    <input
                        type="text"
                        value={fen}
                        onChange={(e) => setFen(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                        }}
                        placeholder="rnbqkbnr/pppppppp/..."
                    />
                </div>

                <div>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Correct Move:
                    </label>
                    <input
                        type="text"
                        value={correctMove}
                        onChange={(e) => setCorrectMove(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                        }}
                        placeholder="e.g., e4, Nf3"
                    />
                </div>

                <div>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Note:
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                        }}
                        rows={3}
                        placeholder="Optional notes..."
                    />
                </div>

                <hr
                    style={{
                        border: '0',
                        borderTop: '1px solid #eee',
                        margin: '10px 0',
                    }}
                />
                <h3>Optional Context</h3>

                {/* New Optional Fields */}
                <div>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Your ELO at time:
                    </label>
                    <input
                        type="number"
                        value={elo}
                        onChange={(e) => setElo(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                        }}
                        placeholder="e.g., 1200"
                        min="0"
                        max="3500"
                    />
                </div>

                <div>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Opening Name:
                    </label>
                    <input
                        type="text"
                        value={opening}
                        onChange={(e) => setOpening(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                        }}
                        placeholder="e.g., Sicilian Defense"
                    />
                </div>

                <div>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Source Game URL:
                    </label>
                    <input
                        type="url"
                        value={gameUrl}
                        onChange={(e) => setGameUrl(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            boxSizing: 'border-box',
                        }}
                        placeholder="https://lichess.org/... or https://chess.com/..."
                    />
                </div>

                {/* Action Buttons */}
                <div
                    style={{ marginTop: '10px', display: 'flex', gap: '10px' }}
                >
                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Update Flash Card
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Delete
                    </button>
                </div>
            </form>
            {message && (
                <p
                    style={{
                        marginTop: '15px',
                        padding: '10px',
                        backgroundColor:
                            message.includes('success') ||
                            message.includes('deleted')
                                ? '#d1fae5'
                                : '#fee2e2',
                        borderRadius: '4px',
                        color:
                            message.includes('success') ||
                            message.includes('deleted')
                                ? '#065f46'
                                : '#991b1b',
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
