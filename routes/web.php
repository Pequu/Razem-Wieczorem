<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
Route::get('/events/create', [EventController::class, 'create'])
    ->name('events.create');

Route::post('/events', [EventController::class, 'store'])
    ->name('events.store');

Route::inertia('/events', 'events/index')->name('events.index');
require __DIR__.'/settings.php';
