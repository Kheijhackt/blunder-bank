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
            $flashCard->priority_score -= 0.01;
        } else {
            $flashCard->increment('times_wrong');
            $flashCard->priority_score += 0.05;
        }
        $flashCard->save();

        return response()->json([
            'result' => $isCorrect,
        ]);
    }

    // Algorithm for which card to practice next
    public function getNextCard() {
        $user = Auth::user();

        // 1. Fetch top 20 candidates efficiently using SQLite-friendly ordering
        // Order: NULLs first (new cards), then highest static score.
        $candidates = $user->flashCards()
            ->orderByRaw('last_practiced_at IS NULL DESC') // TRUE (1) comes after FALSE (0)? Wait. 
            // Correction: In SQLite, IS NULL returns 1 for true. We want NULLs FIRST.
            // So we order by 'last_practiced_at IS NOT NULL' ASC (0 comes before 1).
            ->orderByRaw('last_practiced_at IS NOT NULL ASC') 
            ->orderByDesc('priority_score')
            ->limit(20)
            ->get();

        if ($candidates->isEmpty()) {
            return response()->json([
                'message' => 'No flashcards available.',
                'flash_card' => null
            ], 404);
        }

        $now = Carbon::now();
        $bestCard = null;
        $highestDynamicScore = -999999;

        foreach ($candidates as $card) {
            $dynamicScore = $card->priority_score;

            if ($card->last_practiced_at === null) {
                // New Card Bonus
                $dynamicScore += 50.0;
                // Tiny random nudge to shuffle new cards
                $dynamicScore += (mt_rand() / mt_getrandmax()) * 0.001; 
            } else {
                // Calculate minutes (Carbon works perfectly with SQLite timestamps)
                $minutesSince = $now->diffInMinutes($card->last_practiced_at, false);
                $minutesSince = max(0, $minutesSince);
                
                // Time Decay
                $dynamicScore += ($minutesSince * 0.01);
            }

            if ($dynamicScore > $highestDynamicScore) {
                $highestDynamicScore = $dynamicScore;
                $bestCard = $card;
            }
        }

        return response()->json([
            'flash_card' => $bestCard,
            'debug_dynamic_score' => round($highestDynamicScore, 4),
            'debug_static_score' => $bestCard->priority_score,
            'is_new_card' => ($bestCard->last_practiced_at === null)
        ]);
    }
}
