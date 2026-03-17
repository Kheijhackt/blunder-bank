<?php

namespace App\Http\Controllers;

use App\Models\FlashCard;
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
        ]);

        FlashCard::create([
            'user_id' => Auth::id(),
            'fen' => $request->input('fen'),
            'correct_move' => $request->input('correct_move'),
            'note' => $request->input('note'),
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
            ]);
    
            $flashCard->update($request->only(['fen', 'correct_move', 'note']));
    
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
        if(!$this->isAuthorized($flashCard)) {
            return $this->unauthorizedResponse();
        }
        
        $request->validate([
            'answer' => 'required|string',
        ]);
        
        $answer = trim($request->answer);
        if ($answer === $flashCard->correct_move) {
            $flashCard->increment('times_correct');
            $result = true;
        }
        else {
            $flashCard->increment('times_wrong');
            $result = false;
        }

        $flashCard->update([
            'last_practied_at'=> now(),
        ]);

        return response()->json([
            'result' => $result,
        ]);
            
    }
}
