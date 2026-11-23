<?php

use App\Models\Event;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('rejestracja zapisuje nowego uzytkownika w bazie i loguje go', function () {
    $response = $this->post('/register', [
        'name' => 'usertest1',
        'email' => 'usertest1@gmail.com',
        'password' => 'Password123@',
        'password_confirmation' => 'Password123@',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/events');

    $this->assertDatabaseHas('users', [
        'name' => 'usertest1',
        'email' => 'usertest1@gmail.com',
    ]);
});

test('rejestracja odrzuca zajety adres email i niezgodne haslo', function () {
    User::factory()->create([
        'email' => 'user1@gmail.com',
    ]);

    $response = $this->post('/register', [
        'name' => 'user2',
        'email' => 'user1@gmail.com',
        'password' => 'Password123@',
        'password_confirmation' => 'Password12321@',
    ]);

    $response->assertSessionHasErrors(['email', 'password']);
    $this->assertGuest();
});

test('istniejacy uzytkownik moze sie zalogowac poprawnymi danymi i nie moze zlym haslem', function () {
    $user = User::factory()->create([
        'email' => 'user1@gmail.com',
        'password' => 'Password123@',
    ]);

    $this->post('/login', [
        'email' => 'user1@gmail.com',
        'password' => 'Password123321@',
    ]);

    $this->assertGuest();

    $response = $this->post('/login', [
        'email' => 'user1@gmail.com',
        'password' => 'Password123@',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect('/events');
});

test('user seeder poprawnie dodaje uzytkownikow startowych z rolami', function () {
    $this->seed(UserSeeder::class);

    $this->assertDatabaseHas('users', [
        'email' => 'admin@example.com',
        'access_type' => 'admin',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'organizer@example.com',
        'access_type' => 'organizer',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'user@example.com',
        'access_type' => 'user',
    ]);
});

test('nowo dodany uzytkownik moze dolaczyc do wydarzenia jako czlonek', function () {
    $organizer = User::factory()->create();
    $newUser = User::factory()->create();

    $event = Event::create([
        'organizer_id' => $organizer->id,
        'name' => 'Spotkanie integracyjne',
        'voting_status' => 'open',
        'invitation_code' => '123456789ABCDEFG',
        'short_invitation' => '123ABC',
    ]);

    $this->actingAs($newUser)
        ->post(route('events.join', ['code' => '123456789ABCDEFG']))
        ->assertRedirect(route('events.show', ['event' => $event->id]));

    $this->assertDatabaseHas('memberships', [
        'event_id' => $event->id,
        'user_id' => $newUser->id,
        'role' => 'member',
    ]);
});