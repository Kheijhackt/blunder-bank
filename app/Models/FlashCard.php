<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashCard extends Model
{
    use HasFactory;

    // Allow mass assignment
    protected $fillable = [
        'user_id',
        'fen',
        'correct_move',
        'note',
        'user_elo_at_time',
        'opening_name',
        'source_game_url',
    ];

    protected $hidden = [
        'user_id',
        'updated_at',
        'priority_score',
    ];

    protected $casts = [
        'last_practiced_at'=> 'datetime',
    ];

    // Relationship back to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}