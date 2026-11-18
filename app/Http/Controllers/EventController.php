<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('events/create');
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $event = DB::transaction(function () use ($data, $user): Event {

            $event = $user->organizedEvents()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'voting_status' => 'open',
                'invitation_code' => Str::random(64),
            ]);

            $event->memberships()->create([
                'user_id' => $user->id,
                'role' => 'organizer',
            ]);

            foreach ($data['terms'] as $term) {
                $event->terms()->create([
                    'date' => $term['date'],
                    'starts_at' => $term['starts_at'],
                    'ends_at' => $term['ends_at'],
                ]);
            }

            foreach (array_unique($data['activities'] ?? []) as $activity) {
                $event->proposals()->create([
                    'author_id' => $user->id,
                    'type' => 'activity',
                    'name' => $activity,
                ]);
            }

            return $event;
        });

        return to_route('events.create')
            ->with('success', "Wydarzenie „{$event->name}” zostało utworzone.");
    }
}