import { useState, FormEvent } from 'react';
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

export default function AddFlashCard() {
    const [fen, setFen] = useState<string>('');
    const [correctMove, setCorrectMove] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response: AxiosResponse<FlashCard> = await axios.post(
                '/api/flashcards',
                {
                    fen,
                    correct_move: correctMove,
                    note,
                },
            );

            setMessage('Flash card added successfully!');
            setFen('');
            setCorrectMove('');
            setNote('');
            console.log(response.data);
        } catch (err: any) {
            console.error(err);
            setMessage(
                err.response?.data?.message || 'Error adding flash card',
            );
        }
    };

    return (
        <div>
            <h2>Add a new flash card</h2>
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
                <button type="submit">Add Flash Card</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
