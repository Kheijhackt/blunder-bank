import { useState, FormEvent, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

interface FlashCard {
    id: number;
    user_id: number;
    fen: string;
    correct_move: string;
    note?: string;
    created_at: string;
    updated_at: string;
}

// Pass the ID as a prop instead of using URL params
export default function EditFlashCard({ id }: { id: number }) {
    const [fen, setFen] = useState<string>('');
    const [correctMove, setCorrectMove] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    id = 2; // for testing purposes

    // Fetch data from show() method on load
    useEffect(() => {
        axios
            .get(`/api/flashcards/${id}`)
            .then((res: AxiosResponse<{ flashcard: FlashCard }>) => {
                const card = res.data.flashcard;
                setFen(card.fen);
                setCorrectMove(card.correct_move);
                setNote(card.note || '');
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
            // Use PATCH to update
            await axios.patch(`/api/flashcards/${id}`, {
                fen,
                correct_move: correctMove,
                note,
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

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Edit Flash Card</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>FEN:</label>
                    <input
                        type="text"
                        value={fen}
                        onChange={(e) => setFen(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Correct Move:</label>
                    <input
                        type="text"
                        value={correctMove}
                        onChange={(e) => setCorrectMove(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Note:</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
                <button type="submit">Update Flash Card</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
