<?php

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('niezalogowany uzytkownik jest przekierowywany do logowania przy probie wejscia w wydarzenia', function () {
    $this->get('/events')->assertRedirect('/login');
    $this->get('/events/create')->assertRedirect('/login');
});

test('zalogowany uzytkownik moze utworzyc wydarzenie z terminami i aktywnosciami', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/events', [
        'name' => 'test nazwa',
        'description' => 'test opis',
        'activities' => ['planszowki', 'pizza'],
        'terms' => [
            [
                'date' => now()->addDays(3)->format('Y-m-d'),
                'starts_at' => '18:00',
                'ends_at' => '22:00',
            ],
        ],
    ]);

    $event = Event::first();
    expect($event)->not->toBeNull();
    expect($event->name)->toBe('test nazwa');

    $response->assertRedirect(route('events.created', ['event' => $event->id]));

    $this->assertDatabaseHas('memberships', [
        'event_id' => $event->id,
        'user_id' => $user->id,
        'role' => 'organizer',
    ]);
});

test('walidacja odrzuca utworzenie wydarzenia bez nazwy lub z bledna data', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/events', [
        'name' => '',
        'terms' => [
            [
                'date' => now()->subDay()->format('Y-m-d'), //bledna data
                'starts_at' => '18:00',
                'ends_at' => '17:00', //koniec przed poczatkiem
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['name', 'terms.0.date', 'terms.0.ends_at']);
    $this->assertDatabaseCount('events', 0);
});

test('zaproszony uzytkownik moze dolaczyc do wydarzenia przez link zaproszenia', function () {
    $organizer = User::factory()->create();
    $guest = User::factory()->create();

    $event = Event::create([
        'organizer_id' => $organizer->id,
        'name' => 'Wypad na kręgle',
        'voting_status' => 'open',
        'invitation_code' => 'ABC123XYZ789',
        'short_invitation' => 'ABC123',
    ]);

    $this->actingAs($guest)
        ->get('/events/invite/ABC123XYZ789')
        ->assertOk();

    $this->actingAs($guest)
        ->post('/events/invite/ABC123XYZ789/join')
        ->assertRedirect(route('events.show', ['event' => $event->id]));

    $this->assertDatabaseHas('memberships', [
        'event_id' => $event->id,
        'user_id' => $guest->id,
        'role' => 'member',
    ]);
});

test('osoba spoza wydarzenia nie widzi jego szczegolow i nie moze edytowac opisu', function () {
    $organizer = User::factory()->create();
    $intruder = User::factory()->create();

    $event = Event::create([
        'organizer_id' => $organizer->id,
        'name' => 'Tajne spotkanie',
        'voting_status' => 'open',
        'invitation_code' => 'SECRET123456',
        'short_invitation' => 'SECRET',
    ]);

    $this->actingAs($intruder)
        ->get(route('events.show', $event))
        ->assertNotFound();

    $this->actingAs($intruder)
        ->patch(route('events.description.update', $event), ['description' => 'Zhakowano'])
        ->assertForbidden();
});

test('uczestnik wydarzenia moze zaglosowac na swoja dostepnosc i zaproponowac aktywnosc', function () {
    $organizer = User::factory()->create();
    $member = User::factory()->create();

    $event = Event::create([
        'organizer_id' => $organizer->id,
        'name' => 'Integracja',
        'voting_status' => 'open',
        'invitation_code' => 'VOTE12345678',
        'short_invitation' => 'VOTE12',
    ]);

    $membership = $event->memberships()->create([
        'user_id' => $member->id,
        'role' => 'member',
    ]);

    $term = $event->terms()->create([
        'date' => now()->addDays(5)->format('Y-m-d'),
        'starts_at' => '19:00',
        'ends_at' => '23:00',
    ]);

    //dostepnosc glosowanie
    $this->actingAs($member)
        ->patch(route('events.availabilities.update', $event), [
            'availabilities' => [
                ['term_id' => $term->id, 'response' => 'available'],
            ],
        ])
        ->assertRedirect(route('events.show', $event));

    $this->assertDatabaseHas('availabilities', [
        'membership_id' => $membership->id,
        'term_id' => $term->id,
        'response' => 'available',
    ]);

    //nowa propozycj aktywnosci
    $this->actingAs($member)
        ->post(route('events.activities.store', $event), [
            'name' => 'Karaoke',
        ])
        ->assertRedirect(route('events.show', $event));

    $this->assertDatabaseHas('proposals', [
        'event_id' => $event->id,
        'author_id' => $member->id,
        'name' => 'Karaoke',
    ]);
});