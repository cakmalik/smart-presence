<?php

namespace App\Services;

use App\Models\PrayerTime;
use InvalidArgumentException;

class PrayerService
{
    private static array $defaults = [
        'prayer_dzuhur' => ['label' => 'Dzuhur', 'start_time' => '10:00', 'end_time' => '14:00'],
        'prayer_ashar' => ['label' => 'Ashar', 'start_time' => '14:00', 'end_time' => '16:00'],
    ];

    public function getPrayerTimes(?int $schoolId = null): array
    {
        $dbTimes = $schoolId
            ? PrayerTime::query()->where('school_id', $schoolId)->get()->keyBy('prayer_type')
            : collect();

        $result = [];
        foreach (self::$defaults as $type => $default) {
            $existing = $dbTimes->get($type);
            $result[$type] = [
                'label' => $existing?->label ?? $default['label'],
                'start_time' => $existing?->start_time ?? $default['start_time'],
                'end_time' => $existing?->end_time ?? $default['end_time'],
            ];
        }

        return $result;
    }

    public function determinePrayerType(?int $hour = null, ?int $schoolId = null): string
    {
        $hour ??= now()->hour;
        $times = $this->getPrayerTimes($schoolId);

        foreach ($times as $type => $time) {
            $start = (int) explode(':', $time['start_time'])[0];
            $end = (int) explode(':', $time['end_time'])[0];

            if ($hour >= $start && $hour < $end) {
                return $type;
            }
        }

        $labels = collect($times)->pluck('label', 'start_time')->map(
            fn ($l, $s) => "{$l} ({$times[array_search($l, array_column($times, 'label'))]['start_time']}-{$times[array_search($l, array_column($times, 'label'))]['end_time']})"
        )->implode(', ');

        throw new InvalidArgumentException("Saat ini bukan waktu sholat berjamaah. Jadwal: {$labels}");
    }

    public function getPrayerLabel(string $prayerType, ?int $schoolId = null): string
    {
        $times = $this->getPrayerTimes($schoolId);

        return $times[$prayerType]['label'] ?? match ($prayerType) {
            'prayer_dzuhur' => 'Dzuhur',
            'prayer_ashar' => 'Ashar',
            default => 'Unknown',
        };
    }

    public function getPrayerTimeSlot(string $prayerType, ?int $schoolId = null): string
    {
        $times = $this->getPrayerTimes($schoolId);

        if (isset($times[$prayerType])) {
            return "{$times[$prayerType]['start_time']} - {$times[$prayerType]['end_time']}";
        }

        return match ($prayerType) {
            'prayer_dzuhur' => '10:00 - 14:00',
            'prayer_ashar' => '14:00 - 16:00',
            default => '-',
        };
    }

    public function getAllPrayerTypes(): array
    {
        return array_keys(self::$defaults);
    }
}
