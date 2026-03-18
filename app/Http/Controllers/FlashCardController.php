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
        
        $request->validate(['answer' => 'required|string']);

        $user = Auth::user();
        $answer = trim($request->answer);
        $correct = trim($flashCard->correct_move);
        $isCorrect = ($answer === $correct);
        $now = Carbon::now('UTC');

        // 1. Update Card Stats
        if ($isCorrect) {
            $flashCard->increment('times_correct');
            $flashCard->priority_score -= 10.0;
            $user->increment('stats_total_correct');
        } else {
            $flashCard->increment('times_wrong');
            $flashCard->priority_score += 25.0;
            $user->increment('stats_total_wrong');
        }

        // Update card timestamp
        $flashCard->last_practiced_at = $now;
        $flashCard->save();

        // 2. Update User Stats & Streak (Handled entirely by Model)
        $user->updateLastPracticeTimestamp();

        return response()->json([
            'result' => $isCorrect,
        ]);
    }

    // Algorithm for which card to practice next
    public function getNextCard() {
    $user = Auth::user();
    $now = Carbon::now();

    // Configuration Constants (Only used for practiced cards)
    $timeDecayRate = 0.05;     // Points gained per minute
    $halfLife = 45;            // Minutes until penalty is cut in half
    $maxPenaltyDepth = 0.95;   // At 0 mins, multiplier = 0.05

    // STEP 1: Check for New Cards (last_practiced_at IS NULL)
    // Logic: Simply return the oldest created card. No scoring math needed.
    $newCard = $user->flashCards()
        ->whereNull('last_practiced_at')
        ->orderBy('created_at', 'asc') // Oldest first
        ->first();

    if ($newCard) {
        // Found a new card. Return immediately.
        return response()->json([
            'flash_card' => $newCard,
            'debug_dynamic_score' => null, // Not applicable for new cards
            'debug_static_score' => $newCard->priority_score,
            'debug_multiplier' => null,    // Not applicable
            'is_new_card' => true
        ]);
    }

    // STEP 2: No New Cards. Handle Practiced Cards.
    // Fetch top 30 candidates based on STATIC priority_score DESC
    $candidates = $user->flashCards()
        ->whereNotNull('last_practiced_at')
        ->orderByDesc('priority_score')
        ->limit(30)
        ->get();

    if ($candidates->isEmpty()) {
        return response()->json([
            'message' => 'No flashcards available.',
            'flash_card' => null
        ], 404);
    }

    $bestCard = null;
    $highestDynamicScore = -999999;

    foreach ($candidates as $card) {
        $currentScore = $card->priority_score;
        
        // Calculate Time Since Practice
        $minutesSince = $now->diffInMinutes($card->last_practiced_at, false);
        $minutesSince = max(0, $minutesSince);

        // Calculate Multiplier (Exponential Decay Recovery)
        // Formula: 1 - (maxPenalty * e^(-minutes / halfLife))
        $multiplier = 1 - ($maxPenaltyDepth * exp(-$minutesSince / $halfLife));
        
        // Clamp multiplier between 0.05 and 1.0
        $multiplier = min(1.0, max(0.05, $multiplier));

        // Apply Multiplier to Base Score
        $dynamicScore = $currentScore * $multiplier;

        // Add Time Decay Bonus (helps cards recover as time passes)
        $dynamicScore += ($minutesSince * $timeDecayRate);

        if ($dynamicScore > $highestDynamicScore) {
            $highestDynamicScore = $dynamicScore;
            $bestCard = $card;
        }
    }

    if (!$bestCard) {
        return response()->json([
            'message' => 'No flashcards available.',
            'flash_card' => null
        ], 404);
    }

    // Calculate debug multiplier for the response
    $debugMultiplier = 1.0;
    if ($bestCard->last_practiced_at) {
        $mins = $now->diffInMinutes($bestCard->last_practiced_at, false);
        $debugMultiplier = 1 - ($maxPenaltyDepth * exp(-max(0, $mins) / $halfLife));
        $debugMultiplier = min(1.0, max(0.05, $debugMultiplier));
    }

    return response()->json([
        'flash_card' => $bestCard,
        'debug_dynamic_score' => round($highestDynamicScore, 4),
        'debug_static_score' => $bestCard->priority_score,
        'debug_multiplier' => round($debugMultiplier, 4),
        'is_new_card' => false
    ]);
}
}
