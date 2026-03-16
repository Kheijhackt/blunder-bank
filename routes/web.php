<?php

use App\Http\Controllers\FlashCardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // For Views
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('add-flashcard','addFlashCard')->name('addFlashCard');
    Route::inertia('edit-flashcard','editFlashCard')->name('editFlashCard');

    // For APIs
    Route::post('api/flashcards', [FlashCardController::class, 'store'])->name('flashcards.store');
    Route::get('api/flashcards', [FlashCardController::class, 'index'])->name('flashcards.index');
    Route::get('api/flashcards/{flashCard}', [FlashCardController::class,'show'])->name('flashcards.show');
    Route::patch('api/flashcards/{flashCard}', [FlashCardController::class, 'update'])->name('flashcards.update');
});

require __DIR__.'/settings.php';