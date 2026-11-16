<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proposal extends Model
{
    protected $fillable = [
        'event_id',
        'author_id',
        'type',
        'name',
        'description',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function activityPlanVersions(): HasMany
    {
        return $this->hasMany(
            PlanVersion::class,
            'activity_proposal_id'
        );
    }

    public function placePlanVersions(): HasMany
    {
        return $this->hasMany(
            PlanVersion::class,
            'place_proposal_id'
        );
    }
}