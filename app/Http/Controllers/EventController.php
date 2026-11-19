<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $events = Event::query()
            ->where(function ($query) use ($userId) {
                $query->where('organizer_id', $userId)
                    ->orWhereHas('memberships', function ($membership) use ($userId) {
                        $membership->where('user_id', $userId);
                    });
            })

            ->with([
                'terms',
                'proposals' => function ($query) {
                    $query->where('type', 'activity');
                },
                'latestPlanVersion.term',
                'latestPlanVersion.activity',
                'latestPlanVersion.place',
            ])
            ->withCount('memberships')
            ->latest()
            ->get()

            ->map(function (Event $event) use ($userId): array {
                $plan = $event->latestPlanVersion;

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'description' => $event->description,

                    'role' => (int) $event->organizer_id === (int) $userId
                        ? 'organizer'
                        : 'member',

                    'voting_status' => $event->voting_status,
                    'members_count' => $event->memberships_count,

                    'terms' => $event->terms->map(function ($term) {
                        return [
                            'id' => $term->id,
                            'date' => $term->date->format('Y-m-d'),
                            'starts_at' => substr($term->starts_at, 0, 5),
                            'ends_at' => substr($term->ends_at, 0, 5),
                        ];
                    })->values()->all(),

                    'activities' => $event->proposals
                        ->pluck('name')
                        ->values()
                        ->all(),

                    'plan' => $plan ? [
                        'date' => $plan->term?->date?->format('Y-m-d'),
                        'starts_at' => $plan->term
                            ? substr($plan->term->starts_at, 0, 5)
                            : null,
                        'place' => $plan->place?->name,
                        'activity' => $plan->activity?->name,
                    ] : null,

                    'invitation_url' =>
                        (int) $event->organizer_id === (int) $userId
                            ? route('events.invite', ['code' => $event->invitation_code])
                            : null,
                ];
            });

        return Inertia::render('events/index', ['events' => $events]);
    }

    public function create(): Response
    {
        return Inertia::render('events/create');
    }

    public function created(Request $request, Event $event): Response
    {
        abort_unless(
            (int) $event->organizer_id === (int) $request->user()->id,
            403
        );

        return Inertia::render('events/create', [
            'createdEvent' => [
                'name' => $event->name,
                'invitation_url' => route('events.invite', [
                    'code' => $event->invitation_code,
                ]),
            ],
        ]);
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

        return to_route('events.created', ['event' => $event->id]);
    }

    public function show(Request $request, Event $event): Response
    {
        $userId = (int) $request->user()->id;

        $isOrganizer = (int) $event->organizer_id === $userId;

        $isMember = $event->memberships()
            ->where('user_id', $userId)
            ->exists();

        abort_unless($isOrganizer || $isMember, 404);

        return Inertia::render('events/show', [
            'event' => $this->eventDetails($event, $userId),
        ]);
    }

    public function invite(
        Request $request,
        string $code
    ): Response|RedirectResponse {
        $event = Event::where('invitation_code', $code)->firstOrFail();

        $userId = (int) $request->user()->id;

        $alreadyJoined = (int) $event->organizer_id === $userId
            || $event->memberships()
                ->where('user_id', $userId)
                ->exists();

        if ($alreadyJoined) {
            return to_route('events.show', ['event' => $event->id]);
        }

        return Inertia::render('events/show', [
            'event' => $this->eventDetails($event, $userId),
            'join_url' => route('events.join', ['code' => $code]),
        ]);
    }

    public function join(
        Request $request,
        string $code
    ): RedirectResponse {
        $event = Event::where('invitation_code', $code)->firstOrFail();

        $userId = (int) $request->user()->id;

        if ((int) $event->organizer_id !== $userId) {
            $event->memberships()->firstOrCreate(
                ['user_id' => $userId],
                ['role' => 'member']
            );
        }

        return to_route('events.show', ['event' => $event->id]);
    }

    private function eventDetails(Event $event, int $userId): array
    {
        $event->load([
            'terms',
            'memberships.user',
            'proposals' => function ($query) {
                $query->where('type', 'activity');
            },
            'latestPlanVersion.term',
            'latestPlanVersion.activity',
            'latestPlanVersion.place',
        ])->loadCount('memberships');

        $isOrganizer = (int) $event->organizer_id === $userId;
        $isMember = $event->memberships->contains('user_id', $userId);
        $plan = $event->latestPlanVersion;

        return [
            'id' => $event->id,
            'name' => $event->name,
            'description' => $event->description,
            'voting_status' => $event->voting_status,

            'role' => $isOrganizer
                ? 'organizer'
                : ($isMember ? 'member' : null),

            'members_count' => $event->memberships_count,

            'members' => $event->memberships
                ->map(fn ($membership) => [
                    'id' => $membership->user_id,
                    'name' => $membership->user?->name ?? 'Użytkownik',
                    'role' => $membership->role,
                ])
                ->values()
                ->all(),

            'terms' => $event->terms
                ->map(fn ($term) => [
                    'id' => $term->id,
                    'date' => $term->date->format('Y-m-d'),
                    'starts_at' => substr($term->starts_at, 0, 5),
                    'ends_at' => substr($term->ends_at, 0, 5),
                ])
                ->values()
                ->all(),

            'activities' => $event->proposals
                ->pluck('name')
                ->values()
                ->all(),

            'plan' => $plan ? [
                'date' => $plan->term?->date?->format('Y-m-d'),
                'starts_at' => $plan->term
                    ? substr($plan->term->starts_at, 0, 5)
                    : null,
                'place' => $plan->place?->name,
                'activity' => $plan->activity?->name,
            ] : null,

            'invitation_url' => $isOrganizer
                ? route('events.invite', ['code' => $event->invitation_code])
                : null,
        ];
    }
}