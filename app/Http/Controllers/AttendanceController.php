<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\Student;
use App\Services\PrayerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function prayer(PrayerService $prayerService): Response
    {
        $today = now()->format('Y-m-d');

        try {
            $currentPrayer = $prayerService->determinePrayerType();
        } catch (\InvalidArgumentException) {
            $currentPrayer = null;
        }

        $recentAttendances = Attendance::query()
            ->whereIn('attendance_type', $prayerService->getAllPrayerTypes())
            ->where('attendance_date', $today)
            ->with(['student:id,name', 'operator:id,name'])
            ->latest('attended_at')
            ->take(20)
            ->get()
            ->map(fn (Attendance $attendance) => [
                'student_name' => $attendance->student->name,
                'prayer_type' => $prayerService->getPrayerLabel($attendance->attendance_type),
                'operator_name' => $attendance->operator->name,
                'attended_at' => $attendance->attended_at->format('H:i'),
            ]);

        $todayCount = Attendance::query()
            ->whereIn('attendance_type', $prayerService->getAllPrayerTypes())
            ->where('attendance_date', $today)
            ->count();

        return Inertia::render('attendance/prayer', [
            'recent_attendances' => $recentAttendances,
            'today_count' => $todayCount,
            'current_prayer' => $currentPrayer,
            'prayer_label' => $currentPrayer ? $prayerService->getPrayerLabel($currentPrayer) : null,
        ]);
    }

    public function storePrayer(Request $request, PrayerService $prayerService): JsonResponse
    {
        $validated = $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        $student = Student::query()
            ->where('qr_code', $validated['qr_code'])
            ->where('status', 'active')
            ->first();

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan atau tidak aktif.',
            ], 404);
        }

        try {
            $prayerType = $prayerService->determinePrayerType();
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        $today = now()->format('Y-m-d');
        $prayerLabel = $prayerService->getPrayerLabel($prayerType);

        $existing = Attendance::query()
            ->where('student_id', $student->id)
            ->where('attendance_type', $prayerType)
            ->where('attendance_date', $today)
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "Siswa sudah presensi sholat {$prayerLabel} hari ini.",
            ], 409);
        }

        $attendance = Attendance::create([
            'school_id' => $student->school_id,
            'student_id' => $student->id,
            'operator_id' => auth()->id(),
            'attendance_type' => $prayerType,
            'attendance_date' => $today,
            'attended_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Presensi sholat {$prayerLabel} berhasil dicatat.",
            'data' => [
                'student_name' => $student->name,
                'prayer_type' => $prayerLabel,
                'attended_at' => $attendance->attended_at->format('H:i'),
            ],
        ]);
    }

    public function event(): Response
    {
        $events = Event::query()
            ->where('status', 'active')
            ->orderBy('start_date')
            ->get(['id', 'name', 'start_date', 'location']);

        return Inertia::render('attendance/event', [
            'events' => $events,
        ]);
    }

    public function storeEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_code' => ['required', 'string'],
            'event_id' => ['required', 'exists:events,id'],
        ]);

        $student = Student::query()
            ->where('qr_code', $validated['qr_code'])
            ->where('status', 'active')
            ->first();

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan atau tidak aktif.',
            ], 404);
        }

        $event = Event::query()->find($validated['event_id']);

        $existing = Attendance::query()
            ->where('student_id', $student->id)
            ->where('attendance_type', 'event')
            ->where('event_id', $event->id)
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa sudah presensi untuk event ini.',
            ], 409);
        }

        $attendance = Attendance::create([
            'school_id' => $student->school_id,
            'student_id' => $student->id,
            'operator_id' => auth()->id(),
            'event_id' => $event->id,
            'attendance_type' => 'event',
            'attendance_date' => now(),
            'attended_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Presensi berhasil dicatat.',
            'data' => [
                'student_name' => $student->name,
                'event_name' => $event->name,
                'attended_at' => $attendance->attended_at->format('H:i'),
            ],
        ]);
    }
}
