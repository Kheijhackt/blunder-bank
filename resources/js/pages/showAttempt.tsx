import { useState, FormEvent, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';

interface FlashCard {
    id: number;
    user_id: number;
    fen: string;
    correct_move: string; // Fetched but NOT shown
    note?: string;
    created_at: string;
    updated_at: string;
}

export default function ShowAttempt({ id }: { id: number }) {
    const [fen, setFen] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [answer, setAnswer] = useState<string>('');

    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    id = 1; // ONLY FOR TESTING PURPOSES - REMOVE

    // Fetch data (FEN and Note only for display)
    useEffect(() => {
        axios
            .get(`/api/flashcards/${id}`)
            .then((res: AxiosResponse<{ flash_card: FlashCard }>) => {
                const card = res.data.flash_card;
                setFen(card.fen);
                setNote(card.note || '');
                // We do NOT set correct_move into state to avoid accidental leaks
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
        setIsSubmitting(true);
        setMessage('');

        try {
            // Submit to your specific assessment endpoint
            const response = await axios.post(
                `/api/flashcards/answer-attempt/${id}`,
                {
                    answer: answer,
                },
            );

            if (response.data.result === true) {
                setMessage('✅ Correct! Well done.');
                setAnswer(''); // Clear input for next try if needed
            } else {
                setMessage('❌ Incorrect. Try again!');
            }

            // Optional: Update stats if your backend returns them
            if (response.data.stats) {
                console.log('Updated Stats:', response.data.stats);
            }
        } catch (err: any) {
            console.error(err);
            setMessage(
                err.response?.data?.message ||
                    err.response?.data?.result ||
                    'Error submitting answer',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Loading flashcard...</div>;

    return (
        <div
            style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                border: '1px solid #ccc',
                borderRadius: '8px',
            }}
        >
            <h2>Assessment Mode</h2>

            {/* Message Display */}
            {message && (
                <div
                    style={{
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px',
                        backgroundColor: message.includes('Correct')
                            ? '#d1fae5'
                            : '#fee2e2',
                        color: message.includes('Correct')
                            ? '#065f46'
                            : '#991b1b',
                        fontWeight: 'bold',
                    }}
                >
                    {message}
                </div>
            )}

            {/* FEN Display (Read Only) */}
            <div style={{ marginBottom: '15px' }}>
                <label
                    style={{
                        fontWeight: 'bold',
                        display: 'block',
                        marginBottom: '5px',
                    }}
                >
                    Position (FEN):
                </label>
                <div
                    style={{
                        padding: '10px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                    }}
                >
                    {fen}
                </div>
            </div>

            {/* Note Display (Read Only) */}
            {note && (
                <div style={{ marginBottom: '15px' }}>
                    <label
                        style={{
                            fontWeight: 'bold',
                            display: 'block',
                            marginBottom: '5px',
                        }}
                    >
                        Note:
                    </label>
                    <div
                        style={{
                            padding: '10px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: '4px',
                            fontStyle: 'italic',
                        }}
                    >
                        {note}
                    </div>
                </div>
            )}

            {/* Answer Input Form */}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label
                        htmlFor="answer"
                        style={{
                            fontWeight: 'bold',
                            display: 'block',
                            marginBottom: '5px',
                        }}
                    >
                        Your Move:
                    </label>
                    <input
                        id="answer"
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="e.g., e4, Nf3, O-O"
                        required
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        backgroundColor: isSubmitting ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        width: '100%',
                    }}
                >
                    {isSubmitting ? 'Checking...' : 'Submit Answer'}
                </button>
            </form>
        </div>
    );
}
