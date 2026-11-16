<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::inertia('/events/create', 'events/create')->name('events.create');

Route::inertia('/events', 'events/index')->name('events.index');

require __DIR__.'/settings.php';
