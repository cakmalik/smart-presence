<?php

namespace App\Concerns;

use App\Models\School;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToSchool
{
    public static function bootBelongsToSchool(): void
    {
        static::addGlobalScope('school', function (Builder $builder) {
            if (auth()->check() && ! auth()->user()->isSuperadmin()) {
                $builder->where('school_id', auth()->user()->school_id);
            }
        });

        static::creating(function ($model) {
            if (auth()->check() && ! auth()->user()->isSuperadmin() && ! $model->school_id) {
                $model->school_id = auth()->user()->school_id;
            }
        });
    }

    public function scopeForSchool(Builder $query, School|int|null $school): Builder
    {
        if (auth()->check() && auth()->user()->isSuperadmin() && $school) {
            $schoolId = $school instanceof School ? $school->id : $school;

            return $query->where('school_id', $schoolId);
        }

        return $query;
    }
}
