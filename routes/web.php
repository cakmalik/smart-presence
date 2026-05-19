<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UserController;
use App\Models\Student;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['can:manage schools'])->group(function () {
        Route::resource('schools', SchoolController::class)->except(['show']);
    });

    Route::middleware(['can:manage users'])->group(function () {
        Route::resource('users', UserController::class)->except(['show']);
    });

    Route::middleware(['role:superadmin'])->group(function () {
        Route::resource('roles', RoleController::class)->except(['show']);
    });

    Route::middleware(['can:manage classrooms'])->group(function () {
        Route::resource('classrooms', ClassroomController::class)->except(['show']);
    });

    Route::middleware(['can:manage students'])->group(function () {
        Route::resource('students', StudentController::class)->except(['show']);
        Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
        Route::get('students/{student}/qr', [StudentController::class, 'qr'])->name('students.qr');
        Route::get('students/{student}/qr-data', [StudentController::class, 'qrData'])->name('students.qr.data');
    });

    Route::middleware(['can:manage events'])->group(function () {
        Route::resource('events', EventController::class)->except(['show']);
    });

    Route::middleware(['can:scan attendance'])->group(function () {
        Route::get('attendance/scan/{qr_code}', function ($qrCode) {
            $student = Student::query()
                ->where('qr_code', $qrCode)
                ->with('classroom:id,name')
                ->first();

            return response()->json([
                'found' => (bool) $student,
                'student' => $student ? [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nis' => $student->nis,
                    'classroom' => $student->classroom?->name,
                ] : null,
            ]);
        })->name('attendance.scan');
        Route::get('attendance/prayer', [AttendanceController::class, 'prayer'])->name('attendance.prayer');
        Route::post('attendance/prayer', [AttendanceController::class, 'storePrayer'])->name('attendance.prayer.store');
        Route::get('attendance/prayer/students/search', [AttendanceController::class, 'searchStudents'])->name('attendance.prayer.search');
        Route::get('attendance/event', [AttendanceController::class, 'event'])->name('attendance.event');
        Route::post('attendance/event', [AttendanceController::class, 'storeEvent'])->name('attendance.event.store');
    });

    Route::middleware(['can:view reports'])->group(function () {
        Route::get('reports/prayer', [ReportController::class, 'prayer'])->name('reports.prayer');
        Route::get('reports/event', [ReportController::class, 'event'])->name('reports.event');
        Route::get('reports/export/prayer', [ReportController::class, 'exportPrayer'])->name('reports.export.prayer');
        Route::get('reports/export/event/{event}', [ReportController::class, 'exportEvent'])->name('reports.export.event');
    });
});

require __DIR__.'/settings.php';
