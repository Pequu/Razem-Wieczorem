<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanVersion extends Model
{
    protected $fillable = [
        'event_id',
        'version_number',
        'term_id',
        'activity_proposal_id',
        'place_proposal_id',
        'saved_at',
    ];

    protected function casts(): array
    {
        return [
            'saved_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'activity_proposal_id');
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'place_proposal_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(EventNotification::class);
    }
}