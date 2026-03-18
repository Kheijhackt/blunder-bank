<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FlashCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Get comprehensive stats for the user's dashboard.
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        // 1. Basic Stats (Direct from DB columns)
        $totalCorrect = $user->stats_total_correct ?? 0;
        $totalWrong = $user->stats_total_wrong ?? 0;
        $totalAnswers = $totalCorrect + $totalWrong;
        
        // Calculate Accuracy safely
        $accuracy = $totalAnswers > 0 
            ? round(($totalCorrect / $totalAnswers) * 100, 1) 
            : 0.0;

        // 2. Live Streak (Uses the Model logic to check if streak is still active)
        $currentStreak = $user->getCurrentStreak();

        // 3. Total Cards in Library
        $totalCards = $user->flashCards()->count();

        // 4. Cards Due for Review (Spaced Repetition Logic)
        // Logic: Card is due if:
        // A) It has NEVER been practiced (last_practiced_at IS NULL)
        // OR
        // B) It was practiced MORE than 45 minutes ago (adjustable threshold)
        $thresholdMinutes = 45; 
        
        $cardsDue = $user->flashCards()
            ->where(function ($query) use ($thresholdMinutes) {
                $query->whereNull('last_practiced_at')
                      ->orWhere('last_practiced_at', '<', now()->subMinutes($thresholdMinutes));
            })
            ->count();

        return response()->json([
            'total_correct' => $totalCorrect,
            'total_wrong' => $totalWrong,
            'accuracy' => $accuracy,
            'streak' => $currentStreak,
            'cards_due' => $cardsDue,
            'total_cards' => $totalCards,
            
            // Optional: Debug info (remove in production)
            // 'last_practiced_db' => $user->stats_last_practiced_at,
            // 'threshold_used' => "{$thresholdMinutes} mins"
        ]);
    }
}