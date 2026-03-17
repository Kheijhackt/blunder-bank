<?php

namespace App\Http\Controllers;

use App\Models\FlashCard;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class FlashCardController extends Controller
{
    // Inside your FlashCardController class

    private function isAuthorized(FlashCard $flashCard): bool
    {
        return Auth::id() === $flashCard->user_id;
    }
    private function unauthorizedResponse() {
        return response()->json([
            'result' => 'Unauthorized',
        ], 403);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Shows the user's flashcards
        $flashCards = Auth::user()->flashCards()->latest()->get();
        $result = response()->json([
            'flash_cards' => $flashCards,
        ]);
        return $result;
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'fen' => [
                'required',
                'string',
                Rule::unique('flash_cards')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
            'correct_move' => 'required|string',
            'note' => 'nullable|string',
            'user_elo_at_time'=> 'nullable|integer',
            'opening_name'=> 'nullable|string',
            'source_game_url'=> 'nullable|string',
        ]);

        FlashCard::create([
            'user_id' => Auth::id(),
            'fen' => trim($request->input('fen')),
            'correct_move' => trim($request->input('correct_move')),
            'note' => trim($request->input('note')),
            'user_elo_at_time' => trim($request->input('user_elo_at_time')),
            'opening_name'=> trim($request->input('opening_name')),
            'source_game_url'=> trim($request->input('source_game_url')),
        ]);

        return redirect()->route('addFlashCard')->with('success', 'Card created!');

    }

    /**
     * Display the specified resource.
     */
    public function show(FlashCard $flashCard)
    {
        if (!$this->isAuthorized($flashCard)) {
            return $this->unauthorizedResponse();
        }

        return response()->json([
            'flash_card' => $flashCard,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FlashCard $flashCard)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FlashCard $flashCard)
    {
        if(!$this->isAuthorized($flashCard)) {
            return $this->unauthorizedResponse();
        }
        try {
            $request->validate([
                'fen' => [
                    'required',
                    'string',
                    Rule::unique('flash_cards')->ignore($flashCard->id)->where(function ($query) {
                        return $query->where('user_id', Auth::id());
                    }),
                ],
                'correct_move' => 'required|string',
                'note' => 'nullable|string',
                'user_elo_at_time'=> 'nullable|string',
                'opening_name'=> 'nullable|string',
                'source_game_url'=> 'nullable|string',
            ]);
    
            $flashCard->update($request->only(
                [
                    'fen', 'correct_move', 'note', 'user_elo_at_time','opening_name','source_game_url'
                ]));
    
            return response()->json([
                'result' => true,
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'result'=> $e->getMessage(),
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FlashCard $flashCard)
    {
        if(!$this->isAuthorized($flashCard)) {
            return $this->unauthorizedResponse();
        }
        $flashCard->delete();
        return response()->json([
            'result' => true,
        ]);
    }

    // When a user attempts to answer a flashcard
    public function answerAttempt(Request $request, FlashCard $flashCard) 
    {
        if (!$this->isAuthorized($flashCard)) {
            return $this->unauthorizedResponse();
        }
        
        $request->validate([
            'answer' => 'required|string',
        ]);
        
        $answer = trim($request->answer);
        $correct = trim($flashCard->correct_move);
        
        $isCorrect = ($answer === $correct);

        if ($isCorrect) {
            $flashCard->increment('times_correct');
            $flashCard->last_practiced_at = Carbon::now()->format('Y-m-d H:i:s');
            $flashCard->save();
        } else {
            $flashCard->increment('times_wrong');
        }

        return response()->json([
            'result' => $isCorrect,
        ]);
    }

    // Algorithm for which card to practice next
    public function getNextCard() {
        
        // 1. Fetch all user flashcards
        $cards = Auth::user()->flashCards()->get();

        if ($cards->isEmpty()) {
            return response()->json([
                'message' => 'No flashcards available. Create some first!',
                'flash_card' => null
            ], 404);
        }

        $now = Carbon::now();
        $bestCard = $cards->first(); // Default to the first one if logic fails
        $highestScore = PHP_FLOAT_MIN; // Start with the lowest possible number

        foreach ($cards as $card) {
            // --- SCORING ALGORITHM ---

            // A. Difficulty Factor (0 to 100)
            // Prioritizes cards with high failure rates.
            $totalAttempts = $card->times_correct + $card->times_wrong;
            
            // If new card (0 attempts), assume 50% difficulty so it gets picked up.
            // If has attempts, calculate actual failure rate.
            $failureRate = $totalAttempts === 0 
                ? 0.5 
                : ($card->times_wrong + 1) / ($totalAttempts + 1);
                
            $difficultyScore = $failureRate * 100; 

            // B. Time Readiness Factor (Continuous Growth)
            // Uses seconds/minutes so even short gaps increase the score.
            $timeScore = 0;
            
            if ($card->last_practiced_at) {
                // Get difference in minutes (float). 
                // Example: 30 seconds = 0.5 minutes. 2 hours = 120 minutes.
                $minutesSince = $now->diffInRealMinutes($card->last_practiced_at, false);
                
                // Ensure non-negative (in case of clock skew)
                $minutesSince = max(0, $minutesSince);

                // Logarithmic or Linear growth? 
                // Let's use Linear: +1 point per minute. 
                // So 1 hour ago = +60 points. 10 mins ago = +10 points.
                // This ensures recently seen cards have LOW scores, but not negative.
                $timeScore = $minutesSince * 1.5; 
            } else {
                // Never practiced? Give maximum time bonus immediately.
                $timeScore = 500; 
            }

            // C. "Recency" Soft Penalty (The Tie-Breaker)
            // Instead of blocking, we just dampen the score if seen VERY recently.
            // If seen within last 2 minutes, reduce score by 20%.
            // This pushes it to the bottom of the list, but doesn't hide it.
            $recencyMultiplier = 1.0;
            if ($card->last_practiced_at) {
                $secondsSince = $now->diffInSeconds($card->last_practiced_at, false);
                if ($secondsSince < 120) { // Less than 2 minutes
                    $recencyMultiplier = 0.5; // Cut the total score in half
                }
            }

            // Final Calculation
            $rawScore = $difficultyScore + $timeScore;
            $finalScore = $rawScore * $recencyMultiplier;

            // Select the highest scorer
            if ($finalScore > $highestScore) {
                $highestScore = $finalScore;
                $bestCard = $card;
            }
        }

        // Always return a card if the list wasn't empty
        return response()->json([
            'flash_card' => $bestCard
        ]);
    }
}
