<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\School;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [];

        if (auth()->user()->isSuperadmin()) {
            $stats = [
                'total_schools' => School::count(),
                'total_students' => Student::count(),
                'total_classrooms' => 0,
                'total_events' => 0,
                'today_dhuhur' => Attendance::query()
                    ->where('attendance_type', 'dhuhur')
                    ->where('attendance_date', now())
                    ->count(),
                'active_events' => 0,
            ];
        } else {
            $schoolId = auth()->user()->school_id;

            $stats = [
                'total_students' => Student::query()->where('school_id', $schoolId)->count(),
                'total_classrooms' => 0,
                'today_dhuhur' => Attendance::query()
                    ->where('school_id', $schoolId)
                    ->where('attendance_type', 'dhuhur')
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
