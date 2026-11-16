<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventNotification extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'recipient_id',
        'plan_version_id',
        'event_type',
        'created_at',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'is_read' => 'boolean',
        ];
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function planVersion(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class);
    }
}