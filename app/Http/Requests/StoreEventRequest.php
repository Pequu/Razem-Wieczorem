<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'activities' => ['nullable', 'array'],
            'activities.*' => ['string', 'max:255'],
            'terms' => ['required', 'array', 'min:1'],
            'terms.*.date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'terms.*.starts_at' => ['required', 'date_format:H:i'],
            'terms.*.ends_at' => ['required', 'date_format:H:i', 'after:terms.*.starts_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Wpisz nazwę wydarzenia.',
            'name.max' => 'Nazwa wydarzenia jest zbyt długa.',
            'description.max' => 'Opis może mieć maksymalnie 2000 znaków.',
            'activities.*.max' => 'Nazwa aktywności może mieć maksymalnie 255 znaków.',
            'terms.required' => 'Dodaj przynajmniej jeden termin.',
            'terms.array' => 'Dodaj przynajmniej jeden termin.',
            'terms.min' => 'Dodaj przynajmniej jeden termin.',
            'terms.*.date.required' => 'Podaj datę terminu.',
            'terms.*.date.date_format' => 'Data musi być w formacie RRRR-MM-DD.',
            'terms.*.date.after_or_equal' => 'Data terminu nie może być z przeszłości.',
            'terms.*.starts_at.required' => 'Podaj godzinę rozpoczęcia.',
            'terms.*.starts_at.date_format' => 'Godzina rozpoczęcia musi być w formacie GG:MM.',
            'terms.*.ends_at.required' => 'Podaj godzinę zakończenia.',
            'terms.*.ends_at.date_format' => 'Godzina zakończenia musi być w formacie GG:MM.',
            'terms.*.ends_at.after' => 'Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.',
        ];
    }
}