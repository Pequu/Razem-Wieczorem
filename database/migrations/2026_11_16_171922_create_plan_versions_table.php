<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_versions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('event_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedInteger('version_number'); //numer wersji planu

            $table->foreignId('term_id') //id terminu
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('activity_proposal_id') //id propozycji aktywności (zmienne z miejscem)
                ->nullable()
                ->constrained('proposals')
                ->nullOnDelete();

            $table->foreignId('place_proposal_id') //id propozycji miejsca (zmienne z aktywnością)
                ->nullable()
                ->constrained('proposals')
                ->nullOnDelete();

            $table->timestamp('saved_at')->useCurrent(); //Do wyświetlania na powiadomieniach / tablicy edycji

            $table->timestamps();

            $table->unique(['event_id', 'version_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_versions');
    }
};