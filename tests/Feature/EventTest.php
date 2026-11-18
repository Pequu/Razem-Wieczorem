<?php

use App\Models\User;

test('niezalogowany uzytkownik jest przekierowywany ze strony dodawania wydarzenia', function () {
    $response = $this->get('/events/create');

    $response->assertRedirect('/login');
});

test('zalogowany uzytkownik moze wyswietlic formularz dodawania wydarzenia', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/events/create');

    $response->assertSuccessful();
});

test('walidacja odrzuca zapis wydarzenia bez wymaganych danych', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/events', []);

    $response->assertSessionHasErrors();
});