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

      // 2. Advanced Streak Logic (Status & State)
      // We calculate this inline here to ensure we use the latest UTC time context
      $now = Carbon::now('UTC');
      $today = $now->copy()->startOfDay();
      $yesterday = $today->copy()->subDay();
      
      $lastPracticed = $user->stats_last_practiced_at 
          ? Carbon::parse($user->stats_last_practiced_at, 'UTC') 
          : null;

      $currentStreakCount = $user->stats_current_streak ?? 0;
      $highestStreakCount = $user->stats_highest_streak ?? 0;
      $isActive = false;
      $isAtRisk = false;
      $canStartNew = false;
      $displayStreak = 0;

      if (!$lastPracticed) {
          // Case: Never practiced
          $displayStreak = 0;
          $canStartNew = true; 
      } else {
          $lastDate = $lastPracticed->copy()->startOfDay();

          if ($lastDate->eq($today)) {
              // Case: Practiced Today -> Active
              $isActive = true;
              $displayStreak = $currentStreakCount;
          } elseif ($lastDate->eq($yesterday)) {
              // Case: Practiced Yesterday -> At Risk (Streak alive, but needs today)
              $isAtRisk = true;
              $displayStreak = $currentStreakCount;
          } else {
              // Case: Last practiced older than yesterday -> Broken
              // But! If they practice TODAY, they start a NEW streak of 1.
              $displayStreak = 0;
              $canStartNew = true;
          }
      }

      // Determine icon color for frontend
      $iconColor = ($isActive || $isAtRisk) ? 'orange' : 'gray';

      // 3. Total Cards in Library
      $totalCards = $user->flashCards()->count();

      // 4. Cards Due for Review (Spaced Repetition Logic)
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
          
          // Updated Streak Response
          'streak_count' => $displayStreak,
          'streak_highest_count' => $highestStreakCount,
          'streak_is_active' => $isActive,
          'streak_is_at_risk' => $isAtRisk,
          'streak_can_start_new' => $canStartNew,
          'streak_icon_color' => $iconColor,
          
          'cards_due' => $cardsDue,
          'total_cards' => $totalCards,
      ]);
  }
}