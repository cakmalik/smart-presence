<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\StudentController;
use App\Models\Student;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['can:manage schools'])->group(function () {
        Route::resource('schools', SchoolController::class)->except(['show']);
    });

    Route::middleware(['can:manage classrooms'])->group(function () {
        Route::resource('classrooms', ClassroomController::class)->except(['show']);
    });

    Route::middleware(['can:manage students'])->group(function () {
        Route::resource('students', StudentController::class)->except(['show']);
        Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
        Route::get('students/{student}/qr', [StudentController::class, 'qr'])->name('students.qr');
    });

    Route::middleware(['can:manage events'])->group(function () {
        Route::resource('events', EventController::class)->except(['show']);
    });

    Route::middleware(['can:scan attendance'])->group(function () {
        Route::get('attendance/scan/{qr_code}', function ($qrCode) {
            $student = Student::query()->where('qr_code', $qrCode)->first();

            return response()->json([
                'found' => (bool) $student,
                'student' => $student ? ['id' => $student->id, 'name' => $student->name, 'nis' => $student->nis] : null,
            ]);
        })->name('attendance.scan');
        Route::get('attendance/dhuhur', [AttendanceController::class, 'dhuhur'])->name('attendance.dhuhur');
        Route::post('attendance/dhuhur', [AttendanceController::class, 'storeDhuhur'])->name('attendance.dhuhur.store');
        Route::get('attendance/event', [AttendanceController::class, 'event'])->name('attendance.event');
        Route::post('attendance/event', [AttendanceController::class, 'storeEvent'])->name('attendance.event.store');
    });

    Route::middleware(['can:view reports'])->group(function () {
        Route::get('reports/dhuhur', [ReportController::class, 'dhuhur'])->name('reports.dhuhur');
        Route::get('reports/event', [ReportController::class, 'event'])->name('reports.event');
        Route::get('reports/export/dhuhur', [ReportController::class, 'exportDhuhur'])->name('reports.export.dhuhur');
        Route::get('reports/export/event', [ReportController::class, 'exportEvent'])->name('reports.export.event');
    });
});

require __DIR__.'/settings.php';
