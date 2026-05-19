<?php

namespace App\Models;

use App\Concerns\BelongsToSchool;
use Illuminate\Database\Eloquent\Model;

class PrayerTime extends Model
{
    use BelongsToSchool;

    protected $fillable = [
        'school_id',
        'prayer_type',
        'label',
        'start_time',
        'end_time',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'string',
            'end_time' => 'string',
        ];
    }
}
