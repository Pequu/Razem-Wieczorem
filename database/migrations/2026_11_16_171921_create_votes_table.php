<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('membership_id') //kto głosuje
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('proposal_id') //na co głosuje
                ->constrained()
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['membership_id', 'proposal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};