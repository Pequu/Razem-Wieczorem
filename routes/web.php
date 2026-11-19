<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {

    Route::inertia('/dashboard', 'dashboard')
        ->middleware('verified')
        ->name('dashboard');

    Route::get('/events', [EventController::class, 'index'])
        ->name('events.index');

    Route::get('/events/create', [EventController::class, 'create'])
        ->name('events.create');

    Route::post('/events', [EventController::class, 'store'])
        ->name('events.store');

    Route::get('/events/{event}/created', [EventController::class, 'created'])
        ->whereNumber('event')
        ->name('events.created');

    Route::get('/events/invite/{code}', [EventController::class, 'invite'])
        ->name('events.invite');

    Route::post('/events/invite/{code}/join', [EventController::class, 'join'])
        ->name('events.join');

    Route::get('/events/{event}', [EventController::class, 'show'])
        ->whereNumber('event')
        ->name('events.show');
});

require __DIR__.'/settings.php';