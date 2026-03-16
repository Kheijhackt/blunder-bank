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

    // For APIs
    Route::post('api/flashcards', [FlashCardController::class, 'store'])->name('flashcards.store');
    Route::get('api/flashcards', [FlashCardController::class,'index'])->name('flashcards.index');
});

require __DIR__.'/settings.php';