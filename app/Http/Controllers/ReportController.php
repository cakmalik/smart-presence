<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Event;
use App\Models\Student;
use App\Services\PrayerService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function prayer(Request $request, PrayerService $prayerService): Response
    {
        $schoolId = auth()->user()->school_id;
        $prayerTypes = $prayerService->getAllPrayerTypes();
        $filter = $request->filter ?? 'present';

        if ($filter === 'absent') {
            $absentQuery = Student::query()
                ->with('classroom:id,name')
                ->where('status', 'active')
                ->when($request->classroom_id, fn ($q) => $q->where('classroom_id', $request->classroom_id))
                ->whereDoesntHave('attendances', function ($q) use ($request, $prayerTypes) {
                    $q->whereIn('attendance_type', $prayerTypes);
                    if ($request->date_from) {
                        $q->where('attendance_date', '>=', $request->date_from);
                    }
                    if ($request->date_to) {
                        $q->where('attendance_date', '<=', $request->date_to);
                    }
                    if ($request->prayer_type) {
                        $q->where('attendance_type', $request->prayer_type);
                    }
                });

            $data = $absentQuery->paginate(20)
                ->through(fn (Student $student) => [
                    'student_name' => $student->name,
                    'classroom_name' => $student->classroom?->name,
                    'nis' => $student->nis,
                    'prayer_type' => $request->prayer_type
                        ? $prayerService->getPrayerLabel($request->prayer_type, $schoolId)
                        : 'Semua sholat',
                    'attendance_date' => $request->date_from
                        ? ($request->date_from === $request->date_to ? $request->date_from : "{$request->date_from} - {$request->date_to}")
                        : 'Semua tanggal',
                    'attended_at' => '-',
                    'operator_name' => '-',
                ]);
        } else {
            $data = Attendance::query()
                ->whereIn('attendance_type', $prayerTypes)
                ->with(['student:id,name,classroom_id', 'student.classroom:id,name', 'operator:id,name'])
                ->when($request->date_from, fn ($q) => $q->where('attendance_date', '>=', $request->date_from))
                ->when($request->date_to, fn ($q) => $q->where('attendance_date', '<=', $request->date_to))
                ->when($request->classroom_id, fn ($q) => $q->whereHas('student', fn ($q2) => $q2->where('classroom_id', $request->classroom_id)))
                ->when($request->prayer_type, fn ($q, $type) => $q->where('attendance_type', $type))
                ->latest('attendance_date')
                ->paginate(20)
                ->through(fn (Attendance $attendance) => [
                    'student_name' => $attendance->student->name,
                    'classroom_name' => $attendance->student->classroom?->name,
                    'nis' => $attendance->student->nis,
                    'prayer_type' => $prayerService->getPrayerLabel($attendance->attendance_type, $schoolId),
                    'operator_name' => $attendance->operator->name,
                    'attendance_date' => $attendance->attendance_date->format('d M Y'),
                    'attended_at' => $attendance->attended_at->format('H:i'),
                ]);
        }

        $classrooms = Classroom::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('reports/prayer', [
            'attendances' => $data,
            'classrooms' => $classrooms,
            'filters' => $request->only(['date_from', 'date_to', 'classroom_id', 'prayer_type', 'filter']),
            'prayer_types' => collect($prayerTypes)->mapWithKeys(fn ($t) => [$t => $prayerService->getPrayerLabel($t, $schoolId)]),
        ]);
    }

    public function event(Request $request): Response
    {
        $events = Event::query()
            ->withCount(['attendances' => fn ($q) => $q->where('attendance_type', 'event')])
            ->latest()
            ->paginate(10)
            ->through(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
                'start_date' => $event->start_date->format('d M Y'),
                'location' => $event->location,
                'status' => $event->status,
                'attendances_count' => $event->attendances_count,
            ]);

        return Inertia::render('reports/event', [
            'events' => $events,
        ]);
    }

    public function exportPrayer(Request $request, PrayerService $prayerService): StreamedResponse
    {
        $schoolId = auth()->user()->school_id;
        $prayerTypes = $prayerService->getAllPrayerTypes();
        $filter = $request->filter ?? 'present';

        if ($filter === 'absent') {
            $students = Student::query()
                ->with('classroom:id,name')
                ->where('status', 'active')
                ->when($request->classroom_id, fn ($q) => $q->where('classroom_id', $request->classroom_id))
                ->whereDoesntHave('attendances', function ($q) use ($request, $prayerTypes) {
                    $q->whereIn('attendance_type', $prayerTypes);
                    if ($request->date_from) {
                        $q->where('attendance_date', '>=', $request->date_from);
                    }
                    if ($request->date_to) {
                        $q->where('attendance_date', '<=', $request->date_to);
                    }
                    if ($request->prayer_type) {
                        $q->where('attendance_type', $request->prayer_type);
                    }
                })
                ->orderBy('name')
                ->get();

            $filename = 'rekap_tidak_sholat_'.now()->format('Y-m-d').'.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ];

            $callback = function () use ($students) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['NIS', 'Nama Siswa', 'Kelas']);

                foreach ($students as $student) {
                    fputcsv($file, [
                        $student->nis ?? '-',
                        $student->name,
                        $student->classroom?->name ?? '-',
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        $attendances = Attendance::query()
            ->whereIn('attendance_type', $prayerTypes)
            ->with(['student:id,name,nis,classroom_id', 'student.classroom:id,name', 'operator:id,name'])
            ->when($request->date_from, fn ($q) => $q->where('attendance_date', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->where('attendance_date', '<=', $request->date_to))
            ->when($request->classroom_id, fn ($q) => $q->whereHas('student', fn ($q2) => $q2->where('classroom_id', $request->classroom_id)))
            ->when($request->prayer_type, fn ($q, $type) => $q->where('attendance_type', $type))
            ->latest('attendance_date')
            ->get();

        $filename = 'rekap_presensi_sholat_'.now()->format('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($attendances, $prayerService, $schoolId) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tanggal', 'Waktu', 'Jenis Sholat', 'NIS', 'Nama Siswa', 'Kelas', 'Operator']);

            foreach ($attendances as $attendance) {
                fputcsv($file, [
                    $attendance->attendance_date->format('d M Y'),
                    $attendance->attended_at->format('H:i'),
                    $prayerService->getPrayerLabel($attendance->attendance_type, $schoolId),
                    $attendance->student->nis ?? '-',
                    $attendance->student->name,
                    $attendance->student->classroom?->name ?? '-',
                    $attendance->operator->name,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportEvent(Request $request, Event $event): StreamedResponse
    {
        $attendances = Attendance::query()
            ->where('attendance_type', 'event')
            ->where('event_id', $event->id)
            ->with(['student:id,name,classroom_id', 'student.classroom:id,name', 'operator:id,name'])
            ->get();

        $filename = 'rekap_event_'.$event->name.'_'.now()->format('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($attendances, $event) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Event', 'Tanggal', 'Waktu', 'NIS', 'Nama Siswa', 'Kelas', 'Operator']);

            foreach ($attendances as $attendance) {
                fputcsv($file, [
                    $event->name,
                    $attendance->attendance_date->format('d M Y'),
                    $attendance->attended_at->format('H:i'),
                    $attendance->student->nis ?? '-',
                    $attendance->student->name,
                    $attendance->student->classroom?->name ?? '-',
                    $attendance->operator->name,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
