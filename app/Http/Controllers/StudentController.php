<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\SimpleExcel\SimpleExcelReader;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentController extends Controller
{
    public function __construct(
        protected QrCodeService $qrCodeService
    ) {}

    public function index(Request $request): Response
    {
        $students = Student::query()
            ->with('classroom:id,name')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->classroom_id, fn ($q) => $q->where('classroom_id', $request->classroom_id))
            ->latest()
            ->paginate(10)
            ->through(fn (Student $student) => [
                'id' => $student->id,
                'nis' => $student->nis,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'classroom' => $student->classroom?->name,
                'qr_code' => $student->qr_code,
                'status' => $student->status,
                'created_at' => $student->created_at->format('d M Y'),
            ]);

        $classrooms = Classroom::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('students/index', [
            'students' => $students,
            'classrooms' => $classrooms,
            'filters' => $request->only(['search', 'classroom_id']),
        ]);
    }

    public function create(): Response
    {
        $classrooms = Classroom::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('students/create', [
            'classrooms' => $classrooms,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nis' => ['nullable', 'string', 'max:50'],
            'nisn' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'classroom_id' => ['required', 'exists:classrooms,id'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $classroom = Classroom::findOrFail($validated['classroom_id']);
        $validated['school_id'] = $classroom->school_id;
        $validated['qr_code'] = Str::uuid()->toString();

        Student::create($validated);

        return redirect()->route('students.index')->with('success', 'Siswa berhasil ditambahkan.');
    }

    public function edit(Student $student): Response
    {
        $classrooms = Classroom::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('students/edit', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'classroom_id' => $student->classroom_id,
                'qr_code' => $student->qr_code,
                'status' => $student->status,
            ],
            'classrooms' => $classrooms,
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'nis' => ['nullable', 'string', 'max:50'],
            'nisn' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'classroom_id' => ['required', 'exists:classrooms,id'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $classroom = Classroom::findOrFail($validated['classroom_id']);
        $validated['school_id'] = $classroom->school_id;

        $student->update($validated);

        return redirect()->route('students.index')->with('success', 'Siswa berhasil diperbarui.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();

        return redirect()->route('students.index')->with('success', 'Siswa berhasil dihapus.');
    }

    public function qr(Student $student): Response
    {
        $qrData = route('attendance.scan', $student->qr_code);
        $qrImage = $this->qrCodeService->generatePng($qrData);

        return Inertia::render('students/qr', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->name,
                'classroom' => $student->classroom?->name,
            ],
            'qr_code' => $student->qr_code,
            'qr_image' => $qrImage,
        ]);
    }

    public function qrData(Student $student): JsonResponse
    {
        $qrData = route('attendance.scan', $student->qr_code);
        $qrImage = $this->qrCodeService->generatePng($qrData);

        return response()->json([
            'qr_image' => $qrImage,
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->name,
                'classroom' => $student->classroom?->name,
            ],
            'qr_code' => $student->qr_code,
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $schoolId = auth()->user()->school_id;

        $classrooms = Classroom::query()
            ->where('school_id', $schoolId)
            ->pluck('id', 'name');

        $reader = SimpleExcelReader::create($request->file('file'), 'csv');

        $imported = 0;
        $skipped = 0;

        DB::transaction(function () use ($reader, $classrooms, $schoolId, &$imported, &$skipped) {
            $reader->getRows()->each(function (array $row) use ($classrooms, $schoolId, &$imported, &$skipped) {
                $name = trim($row['name'] ?? '');

                if ($name === '') {
                    $skipped++;

                    return;
                }

                $classroomName = trim($row['classroom'] ?? '');
                $classroomId = $classrooms[$classroomName] ?? null;

                if (! $classroomId) {
                    $skipped++;

                    return;
                }

                Student::create([
                    'school_id' => $schoolId,
                    'classroom_id' => $classroomId,
                    'nis' => ! empty($row['nis']) ? trim($row['nis']) : null,
                    'nisn' => ! empty($row['nisn']) ? trim($row['nisn']) : null,
                    'name' => $name,
                    'qr_code' => Str::uuid()->toString(),
                    'status' => 'active',
                ]);

                $imported++;
            });
        });

        $message = "{$imported} siswa berhasil diimport.";

        if ($skipped > 0) {
            $message .= " {$skipped} siswa dilewati (kelas tidak ditemukan atau data tidak lengkap).";
        }

        return redirect()->route('students.index')->with('success', $message);
    }

    public function importSample(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="contoh_format_import_siswa.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['name', 'nis', 'nisn', 'classroom']);
            fputcsv($file, ['Ahmad Fauzi', '123456', '0012345678', 'Kelas 7A']);
            fputcsv($file, ['Siti Nurhaliza', '123457', '0012345679', 'Kelas 7A']);
            fputcsv($file, ['Budi Santoso', '123458', '0012345680', 'Kelas 7B']);
            fputcsv($file, ['Dewi Lestari', '123459', '0012345681', 'Kelas 8A']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
