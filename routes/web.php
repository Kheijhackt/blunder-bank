<?php

use App\Http\Controllers\FlashCardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // For Views
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('blunders-list','blundersList')->name('blundersList');
    Route::inertia('practice-blunders','practiceFlashCards')->name('practiceFlashCards');
    Route::inertia('focused-practice-blunders','focusedPracticeFlashCards')->name('focusedPracticeFlashCards');
    Route::inertia('user-guide','guide')->name('guide');
    Route::inertia('about','about')->name('about');

    Route::inertia('add-flashcard','addFlashCard')->name('addFlashCard');
    Route::inertia('edit-flashcard','editFlashCard')->name('editFlashCard');
    Route::inertia('show-attempt','showAttempt')->name('showAttempt');

    // For APIs
    // ==========================================
    // 1. CRUD Operations
    // ==========================================
    Route::post('api/flashcards', [FlashCardController::class, 'store'])->name('flashcards.store');
    Route::get('api/flashcards', [FlashCardController::class, 'index'])->name('flashcards.index');
    Route::get('api/dashboard/stats', [UserController::class, 'stats'])->name('dashboard.stats');

    // ⚠️ CRITICAL: Specific static routes MUST come before dynamic {id} routes
    Route::get('api/flashcards/next-card', [FlashCardController::class, 'getNextCard'])->name('flashcards.getNextCard');

    // Dynamic CRUD routes (These catch anything else starting with /api/flashcards/)
    Route::get('api/flashcards/{flashCard}', [FlashCardController::class, 'show'])->name('flashcards.show');
    Route::patch('api/flashcards/{flashCard}', [FlashCardController::class, 'update'])->name('flashcards.update');
    Route::delete('api/flashcards/{flashCard}', [FlashCardController::class, 'destroy'])->name('flashcards.destroy');

    Route::post('api/flashcards/answer-attempt/{flashCard}', [FlashCardController::class, 'answerAttempt'])->name('flashcards.answerAttempt');
});


require __DIR__.'/settings.php';