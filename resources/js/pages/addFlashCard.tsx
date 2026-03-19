import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { FormEvent } from 'react';
import { useState } from 'react';

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

export default function AddFlashCard() {
    const [fen, setFen] = useState<string>('');
    const [correctMove, setCorrectMove] = useState<string>('');
    const [note, setNote] = useState<string>('');

    // New Fields State
    const [elo, setElo] = useState<string>(''); // Keep as string for input, convert on submit
    const [opening, setOpening] = useState<string>('');
    const [gameUrl, setGameUrl] = useState<string>('');

    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response: AxiosResponse<FlashCard> = await axios.post(
                '/api/flashcards',
                {
                    fen,
                    correct_move: correctMove,
                    note: note.trim() || null, // Send null if empty

                    // Convert Elo to number or null
                    user_elo_at_time:
                        elo.trim() === '' ? null : parseInt(elo, 10),

                    // Send null if empty strings
                    opening_name: opening.trim() || null,
                    source_game_url: gameUrl.trim() || null,
                },
            );

            setMessage('Flash card added successfully!');

            // Reset all fields
            setFen('');
            setCorrectMove('');
            setNote('');
            setElo('');
            setOpening('');
            setGameUrl('');

            console.log(response.data);
        } catch (err: any) {
            console.error(err);
            setMessage(
                err.response?.data?.message || 'Error adding flash card',
            );
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Add a new flash card</h2>
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
                        placeholder="e.g., e4, Nf3, O-O"
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
                        placeholder="Optional notes about this position..."
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

                {/* New Nullable Fields */}
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

                <button
                    type="submit"
                    style={{
                        padding: '10px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    Add Flash Card
                </button>
            </form>
            {message && (
                <p
                    style={{
                        marginTop: '15px',
                        padding: '10px',
                        backgroundColor: message.includes('success')
                            ? '#d1fae5'
                            : '#fee2e2',
                        borderRadius: '4px',
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
