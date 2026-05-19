<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function dhuhur(Request $request): Response
    {
        $attendances = Attendance::query()
            ->where('attendance_type', 'dhuhur')
            ->with(['student:id,name,classroom_id', 'student.classroom:id,name', 'operator:id,name'])
            ->when($request->date_from, fn ($q) => $q->where('attendance_date', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->where('attendance_date', '<=', $request->date_to))
            ->when($request->classroom_id, fn ($q) => $q->whereHas('student', fn ($q2) => $q2->where('classroom_id', $request->classroom_id)))
            ->latest('attendance_date')
            ->paginate(20)
            ->through(fn (Attendance $attendance) => [
                'student_name' => $attendance->student->name,
                'classroom_name' => $attendance->student->classroom?->name,
                'operator_name' => $attendance->operator->name,
                'attendance_date' => $attendance->attendance_date->format('d M Y'),
                'attended_at' => $attendance->attended_at->format('H:i'),
            ]);

        $classrooms = Classroom::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('reports/dhuhur', [
            'attendances' => $attendances,
            'classrooms' => $classrooms,
            'filters' => $request->only(['date_from', 'date_to', 'classroom_id']),
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

    public function exportDhuhur(Request $request): StreamedResponse
    {
        $attendances = Attendance::query()
            ->where('attendance_type', 'dhuhur')
            ->with(['student:id,name,classroom_id', 'student.classroom:id,name', 'operator:id,name'])
            ->when($request->date_from, fn ($q) => $q->where('attendance_date', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->where('attendance_date', '<=', $request->date_to))
            ->when($request->classroom_id, fn ($q) => $q->whereHas('student', fn ($q2) => $q2->where('classroom_id', $request->classroom_id)))
            ->latest('attendance_date')
            ->get();

        $filename = 'rekap_presensi_dhuhur_'.now()->format('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($attendances) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tanggal', 'Waktu', 'NIS', 'Nama Siswa', 'Kelas', 'Operator']);

            foreach ($attendances as $attendance) {
                fputcsv($file, [
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
