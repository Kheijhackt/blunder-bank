<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'stats_last_practiced_at'=> 'datetime',
        ];
    }

    public function flashCards()
    {
        return $this->hasMany(FlashCard::class);
    }

    public function getOverallAccuracyAttribute(): float
    {
        $total = $this->stats_total_correct + $this->stats_total_wrong;
        if ($total === 0) {
            return 0.0;
        }
        return round(($this->stats_total_correct / $total) * 100, 1);
    }

     /**
     * Update the last practiced timestamp and adjust the streak counter.
     * Call this whenever the user answers a card (correct or wrong).
     */
    public function updateLastPracticeTimestamp(): void
    {
        $now = Carbon::now('UTC');
        $oldLastPracticed = $this->stats_last_practiced_at;
        
        // Set the new timestamp immediately
        $this->stats_last_practiced_at = $now;

        // Calculate the new streak based on the OLD timestamp
        $newStreak = $this->calculateStreakLogic($oldLastPracticed, $now);

        $this->stats_current_streak = $newStreak;
        
        // Save the model immediately so the DB is up to date
        $this->save();
    }

    /**
     * Get the current valid streak.
     * This checks if the streak is still alive (practiced today or yesterday).
     * If the user hasn't practiced since yesterday, it returns 0 (broken streak).
     */
    public function getCurrentStreak(): int
    {
        if (!$this->stats_last_practiced_at) {
            return 0;
        }

        $lastPractice = Carbon::parse($this->stats_last_practiced_at, 'UTC')->startOfDay();
        $today = Carbon::now('UTC')->startOfDay();
        $yesterday = $today->copy()->subDay();

        // If last practice was today or yesterday, the stored streak is valid
        if ($lastPractice->eq($today) || $lastPractice->eq($yesterday)) {
            return $this->stats_current_streak ?? 0;
        }

        // If older than yesterday, the streak is broken
        return 0;
    }

    /**
     * Internal helper to calculate streak increment/reset logic.
     */
    private function calculateStreakLogic(?string $oldLastPracticedString, Carbon $now): int
    {
        $currentStreak = $this->stats_current_streak ?? 0;

        if ($oldLastPracticedString === null) {
            // Case 1: First time ever
            return 1;
        }

        $oldDate = Carbon::parse($oldLastPracticedString, 'UTC')->startOfDay();
        $today = $now->copy()->startOfDay();
        $yesterday = $today->copy()->subDay();

        if ($oldDate->eq($today)) {
            // Case 2: Already practiced today -> Keep streak same
            return $currentStreak;
        } elseif ($oldDate->eq($yesterday)) {
            // Case 3: Practiced yesterday -> Increment
            return $currentStreak + 1;
        } else {
            // Case 4: Practiced earlier than yesterday -> Reset to 1 (New streak starts today)
            return 1;
        }
    }

    public function getStreakStatus(): array
    {
        $now = Carbon::now('UTC');
        $today = $now->copy()->startOfDay();
        $yesterday = $today->copy()->subDay();
        
        $lastPracticed = $this->stats_last_practiced_at 
            ? Carbon::parse($this->stats_last_practiced_at, 'UTC') 
            : null;

        $currentStreak = $this->stats_current_streak ?? 0;
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
                $displayStreak = $currentStreak;
            } elseif ($lastDate->eq($yesterday)) {
                // Case: Practiced Yesterday -> At Risk (Streak alive, but needs today)
                $isAtRisk = true;
                $displayStreak = $currentStreak;
            } else {
                // Case: Last practiced older than yesterday -> Broken
                // But! If they practice TODAY, they start a NEW streak of 1.
                $displayStreak = 0;
                $canStartNew = true;
            }
        }

        return [
            'count' => $displayStreak,
            'is_active' => $isActive,
            'is_at_risk' => $isAtRisk,
            'can_start_new' => $canStartNew,
            // Helper for frontend icon color
            'icon_color' => ($isActive || $isAtRisk) ? 'orange' : 'gray', 
        ];
    }
}
