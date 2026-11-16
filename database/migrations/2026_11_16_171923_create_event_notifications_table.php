<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_notifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('recipient_id') //id odbiorcy
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('plan_version_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('event_type', 60);

            $table->timestamp('created_at')->useCurrent();

            $table->boolean('is_read')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_notifications');
    }
};