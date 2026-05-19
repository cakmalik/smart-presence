<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\School;
use App\Models\Student;
use App\Services\PrayerService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(PrayerService $prayerService): Response
    {
        $schoolId = auth()->user()->school_id;
        $prayerTypes = $prayerService->getAllPrayerTypes();
        $stats = [];

        if (auth()->user()->isSuperadmin()) {
            $stats = [
                'total_schools' => School::count(),
                'total_students' => Student::count(),
                'total_classrooms' => 0,
                'total_events' => 0,
                'today_prayer' => Attendance::query()
                    ->whereIn('attendance_type', $prayerTypes)
                    ->where('attendance_date', now())
                    ->count(),
                'active_events' => 0,
            ];
        } else {
            $stats = [
                'total_students' => Student::query()->where('school_id', $schoolId)->count(),
                'total_classrooms' => 0,
                'today_prayer' => Attendance::query()
                    ->where('school_id', $schoolId)
                    ->whereIn('attendance_type', $prayerTypes)
                    ->where('attendance_date', now())
                    ->count(),
                'active_events' => Event::query()
                    ->where('school_id', $schoolId)
                    ->where('status', 'active')
                    ->count(),
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
