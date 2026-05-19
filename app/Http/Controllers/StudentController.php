<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Services\QrCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

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

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        $header = fgetcsv($handle);

        $classrooms = Classroom::query()->pluck('id', 'name');

        while ($row = fgetcsv($handle)) {
            $data = array_combine($header, $row);

            $classroomId = $classrooms[$data['classroom']] ?? null;

            if (! $classroomId) {
                continue;
            }

            Student::create([
                'nis' => $data['nis'] ?? null,
                'nisn' => $data['nisn'] ?? null,
                'name' => $data['name'],
                'classroom_id' => $classroomId,
                'qr_code' => Str::uuid()->toString(),
                'status' => 'active',
            ]);
        }

        fclose($handle);

        return redirect()->route('students.index')->with('success', 'Data siswa berhasil diimport.');
    }
}
