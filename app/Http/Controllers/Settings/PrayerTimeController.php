<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PrayerTime;
use App\Models\School;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrayerTimeController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $schoolId = $user->isSuperadmin()
            ? request('school_id', optional($user->school)->id)
            : $user->school_id;

        $school = $schoolId ? School::find($schoolId) : null;

        $prayerTimes = $schoolId
            ? PrayerTime::query()->where('school_id', $schoolId)->get()->keyBy('prayer_type')
            : collect();

        $defaults = [
            ['prayer_type' => 'prayer_dzuhur', 'label' => 'Dzuhur', 'start_time' => '10:00', 'end_time' => '14:00'],
            ['prayer_type' => 'prayer_ashar', 'label' => 'Ashar', 'start_time' => '14:00', 'end_time' => '16:00'],
        ];

        $prayerTypes = collect($defaults)->map(function ($default) use ($prayerTimes) {
            $existing = $prayerTimes->get($default['prayer_type']);

            return [
                'prayer_type' => $default['prayer_type'],
                'label' => $default['label'],
                'start_time' => $existing?->start_time ?? $default['start_time'],
                'end_time' => $existing?->end_time ?? $default['end_time'],
            ];
        });

        $schools = $user->isSuperadmin()
            ? School::query()->where('status', 'active')->get(['id', 'name'])
            : collect();

        return Inertia::render('settings/prayer-times', [
            'prayer_types' => $prayerTypes,
            'school_id' => $schoolId,
            'school' => $school,
            'schools' => $schools,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'school_id' => ['nullable', 'exists:schools,id'],
            'prayer_types' => ['required', 'array', 'min:1'],
            'prayer_types.*.prayer_type' => ['required', 'string'],
            'prayer_types.*.label' => ['required', 'string', 'max:100'],
            'prayer_types.*.start_time' => ['required', 'date_format:H:i'],
            'prayer_types.*.end_time' => ['required', 'date_format:H:i', 'after:prayer_types.*.start_time'],
        ]);

        $user = auth()->user();
        $schoolId = $validated['school_id']
            ?? ($user->isSuperadmin() ? null : $user->school_id);

        foreach ($validated['prayer_types'] as $pt) {
            PrayerTime::updateOrCreate(
                [
                    'school_id' => $schoolId,
                    'prayer_type' => $pt['prayer_type'],
                ],
                [
                    'label' => $pt['label'],
                    'start_time' => $pt['start_time'],
                    'end_time' => $pt['end_time'],
                ]
            );
        }

        return redirect()->back()->with('success', 'Jadwal sholat berhasil diperbarui.');
    }
}
