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

    public function determinePrayerType(?string $time = null, ?int $schoolId = null): string
    {
        $time ??= now()->format('H:i');
        [$hour, $minute] = explode(':', $time);
        $currentMinutes = ((int) $hour * 60) + (int) $minute;

        $times = $this->getPrayerTimes($schoolId);

        foreach ($times as $type => $timeslot) {
            $startParts = explode(':', $timeslot['start_time']);
            $endParts = explode(':', $timeslot['end_time']);
            $startMinutes = ((int) $startParts[0] * 60) + (int) ($startParts[1] ?? 0);
            $endMinutes = ((int) $endParts[0] * 60) + (int) ($endParts[1] ?? 0);

            if ($currentMinutes >= $startMinutes && $currentMinutes < $endMinutes) {
                return $type;
            }
        }

        $labels = collect($times)->map(
            fn ($time) => "{$time['label']} ({$time['start_time']}-{$time['end_time']})"
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
