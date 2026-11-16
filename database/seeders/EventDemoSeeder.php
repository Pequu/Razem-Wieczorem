<?php

namespace Database\Seeders;

use App\Models\Availability;
use App\Models\Event;
use App\Models\EventNotification;
use App\Models\Membership;
use App\Models\PlanVersion;
use App\Models\Proposal;
use App\Models\Term;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class EventDemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->first();

        if (!$user) {
            throw new RuntimeException(
                'Brak użytkownika w bazie danych. Najpierw uruchom istniejący UserSeeder.'
            );
        }

        DB::transaction(function () use ($user) {

            // Wydarzenie
            $event = Event::firstOrCreate(
                [
                    'invitation_code' => 'DEMO-EVENT-2026',
                ],
                [
                    'organizer_id' => $user->id,
                    'name' => 'Wspólny wyjazd integracyjny',
                    'description' => 'Przykładowe wydarzenie demonstracyjne.',
                    'voting_status' => 'open',
                ]
            );

            // Członkostwo organizatora
            $membership = Membership::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                ],
                [
                    'role' => 'organizer',
                ]
            );

            // Termin wydarzenia
            $term = Term::firstOrCreate(
                [
                    'event_id' => $event->id,
                    'date' => '2026-12-12',
                    'starts_at' => '10:00:00',
                ],
                [
                    'ends_at' => '18:00:00',
                ]
            );

            // Propozycja aktywności
            $activity = Proposal::firstOrCreate(
                [
                    'event_id' => $event->id,
                    'type' => 'activity',
                    'name' => 'Escape room',
                ],
                [
                    'author_id' => $user->id,
                    'description' => 'Wspólne rozwiązywanie zagadek.',
                ]
            );

            // Propozycja miejsca
            $place = Proposal::firstOrCreate(
                [
                    'event_id' => $event->id,
                    'type' => 'place',
                    'name' => 'Centrum miasta',
                ],
                [
                    'author_id' => $user->id,
                    'description' => 'Miejsce spotkania uczestników.',
                ]
            );

            // Dostępność użytkownika
            Availability::firstOrCreate(
                [
                    'membership_id' => $membership->id,
                    'term_id' => $term->id,
                ],
                [
                    'response' => 'available',
                ]
            );

            // Głos na aktywność
            Vote::firstOrCreate([
                'membership_id' => $membership->id,
                'proposal_id' => $activity->id,
            ]);

            // Pierwsza wersja planu
            $plan = PlanVersion::firstOrCreate(
                [
                    'event_id' => $event->id,
                    'version_number' => 1,
                ],
                [
                    'term_id' => $term->id,
                    'activity_proposal_id' => $activity->id,
                    'place_proposal_id' => $place->id,
                    'saved_at' => now(),
                ]
            );

            // Powiadomienie
            EventNotification::firstOrCreate(
                [
                    'recipient_id' => $user->id,
                    'plan_version_id' => $plan->id,
                    'event_type' => 'plan_created',
                ],
                [
                    'created_at' => now(),
                    'is_read' => false,
                ]
            );
        });
    }
}