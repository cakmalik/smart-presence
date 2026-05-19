<?php

namespace App\Services;

use InvalidArgumentException;

class PrayerService
{
    public function determinePrayerType(?int $hour = null): string
    {
        $hour ??= now()->hour;

        if ($hour >= 10 && $hour < 14) {
            return 'prayer_dzuhur';
        }

        if ($hour >= 14 && $hour < 16) {
            return 'prayer_ashar';
        }

        throw new InvalidArgumentException('Tidak ada waktu sholat berjamaah pada jam ini.');
    }

    public function getPrayerLabel(string $prayerType): string
    {
        return match ($prayerType) {
            'prayer_dzuhur' => 'Dzuhur',
            'prayer_ashar' => 'Ashar',
            default => 'Unknown',
        };
    }

    public function getPrayerTimeSlot(string $prayerType): string
    {
        return match ($prayerType) {
            'prayer_dzuhur' => '10:00 - 14:00',
            'prayer_ashar' => '14:00 - 16:00',
            default => '-',
        };
    }

    public function getAllPrayerTypes(): array
    {
        return ['prayer_dzuhur', 'prayer_ashar'];
    }
}
