<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('membership_id') //kto może
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('term_id') //kiedy może
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('response', [
                'available',
                'unavailable',
                'maybe'
            ]);

            $table->timestamps();

            $table->unique(['membership_id', 'term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('availabilities');
    }
};