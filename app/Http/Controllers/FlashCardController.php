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
        $data = $request->validate([
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

        $data['fen'] = trim($data['fen']);
        $data['correct_move'] = trim($data['correct_move']);
        $data['note'] = isset($data['note']) ? trim($data['note']) : null;
        $data['opening_name'] = isset($data['opening_name']) ? trim($data['opening_name']) : null;
        $data['source_game_url'] = isset($data['source_game_url']) ? trim($data['source_game_url']) : null;

        FlashCard::create([
            'user_id' => Auth::id(),
            ...$data,
        ]);

        return response()->json([
            'result'=> true,
        ]);
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
        if (!$this->isAuthorized($flashCard)) {
            return $this->unauthorizedResponse();
        }

        $data = $request->validate([
            'fen' => [
                'required',
                'string',
                Rule::unique('flash_cards')
                    ->ignore($flashCard->id)
                    ->where(fn ($query) =>
                        $query->where('user_id', Auth::id())
                    ),
            ],
            'correct_move' => 'required|string',
            'note' => 'nullable|string',
            'user_elo_at_time'=> 'nullable|integer',
            'opening_name'=> 'nullable|string',
            'source_game_url'=> 'nullable|string',
        ]);

        // Trim only strings safely
        $data['fen'] = trim($data['fen']);
        $data['correct_move'] = trim($data['correct_move']);
        $data['note'] = isset($data['note']) ? trim($data['note']) : null;
        $data['user_elo_at_time'] = isset($data['user_elo_at_time']) ? $data['user_elo_at_time'] : null;
        $data['opening_name'] = isset($data['opening_name']) ? trim($data['opening_name']) : null;
        $data['source_game_url'] = isset($data['source_game_url']) ? trim($data['source_game_url']) : null;

        $flashCard->update($data);

        return response()->json([
            'result' => true,
        ]);
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

        $correctPenalty = 1.0;
        $incorrectPenalty = 10.0;

        $user = Auth::user();
        $answer = trim($request->answer);
        $correct = trim($flashCard->correct_move);
        $isCorrect = ($answer === $correct);
        $now = Carbon::now('UTC');

        // 1. Update Card Stats
        if ($isCorrect) {
            $flashCard->increment('times_correct');
            $flashCard->priority_score -= $correctPenalty;
            $flashCard->last_practiced_at = $now;

            $user->increment('stats_total_correct');
        } else {
            $flashCard->increment('times_wrong');
            $flashCard->priority_score += $incorrectPenalty;
            $user->increment('stats_total_wrong');
        }
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
        $hiddenFields = [
            'correct_move',
            'updated_at', 
            'created_at', 
            'times_correct', 
            'times_wrong', 
            'source_game_url',
            'priority_score',
            'last_practiced_at',
        ];

        // --- CONFIGURATION ---
        $timeGrowthRate = 0.01;     // Multiplier increases by 0.01 per minute
        $minBaseScore = 1.0;        // SAFETY NET: Prevents negative/zero raw scores from breaking math

        // STEP 1: Check for New Cards
        $newCard = $user->flashCards()
            ->whereNull('last_practiced_at')
            ->orderBy('created_at', 'asc')
            ->first();

        if ($newCard) {
            $newCard->makeHidden($hiddenFields);

            return response()->json([
                'flash_card' => $newCard,
                'debug_dynamic_score' => null,
                'debug_static_score' => $newCard->priority_score,
                'debug_multiplier' => null,
                'is_new_card' => true
            ]);
        }

        // STEP 2: Handle Practiced Cards
        $candidates = $user->flashCards()
            ->whereNotNull('last_practiced_at')
            ->orderByDesc('priority_score') 
            ->limit(50) 
            ->get();

        if ($candidates->isEmpty()) {
            return response()->json(['message' => 'No flashcards available.', 'flash_card' => null], 404);
        }

        $bestCard = null;
        $highestDynamicScore = -PHP_FLOAT_MAX;

        foreach ($candidates as $card) {
            $rawScore = $card->priority_score;
            
            // 1. Calculate Time Since Practice
            $minutesSince = $now->diffInMinutes($card->last_practiced_at, true);
            $minutesSince = max(0, $minutesSince);

            // 2. Calculate Multiplier STARTING AT 0
            // Formula: minutes * 0.01
            // 0 mins = 0.0
            // 1 min = 0.01
            // 100 mins = 1.0 (Back to baseline)
            // 200 mins = 2.0 (Double priority)
            $multiplier = $minutesSince * $timeGrowthRate;

            // 3. Apply Safety Net to Raw Score
            // Ensures that even if rawScore is -500, we calculate based on at least 1.0
            $effectiveBaseScore = max($minBaseScore, $rawScore);

            // 4. Calculate Final Dynamic Score
            $dynamicScore = $effectiveBaseScore * $multiplier;

            if ($dynamicScore > $highestDynamicScore) {
                $highestDynamicScore = $dynamicScore;
                $bestCard = $card;
            }
        }

        if (!$bestCard) {
            return response()->json(['message' => 'No flashcards available.', 'flash_card' => null], 404);
        }

        $bestCard->makeHidden($hiddenFields);

        // Debug calculations
        $debugMinutes = $now->diffInMinutes($bestCard->last_practiced_at, true);
        $debugMultiplier = max(0, $debugMinutes) * $timeGrowthRate;
        $debugEffectiveBase = max($minBaseScore, $bestCard->priority_score);

        return response()->json([
            'flash_card' => $bestCard,
            'debug_dynamic_score' => round($highestDynamicScore, 4),
            'debug_static_score' => $bestCard->priority_score,
            'debug_effective_base_score' => round($debugEffectiveBase, 4),
            'debug_multiplier' => round($debugMultiplier, 4), // Will be 0.00 immediately after practice
            'debug_minutes_since' => $debugMinutes,
            'is_new_card' => false
        ]);
    }
}
