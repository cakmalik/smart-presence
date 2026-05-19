<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function index(): Response
    {
        $classrooms = Classroom::query()
            ->withCount('students')
            ->with('teacher:id,name')
            ->latest()
            ->paginate(10)
            ->through(fn (Classroom $classroom) => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'grade' => $classroom->grade,
                'teacher_name' => $classroom->teacher?->name,
                'students_count' => $classroom->students_count,
                'created_at' => $classroom->created_at->format('d M Y'),
            ]);

        return Inertia::render('classrooms/index', [
            'classrooms' => $classrooms,
        ]);
    }

    public function create(): Response
    {
        $teachers = User::query()
            ->role(['admin', 'operator'])
            ->when(auth()->user()->school_id, fn ($q) => $q->where('school_id', auth()->user()->school_id))
            ->get(['id', 'name']);

        return Inertia::render('classrooms/create', [
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:50'],
            'teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        Classroom::create($validated);

        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function edit(Classroom $classroom): Response
    {
        $teachers = User::query()
            ->role(['admin', 'operator'])
            ->when(auth()->user()->school_id, fn ($q) => $q->where('school_id', auth()->user()->school_id))
            ->get(['id', 'name']);

        return Inertia::render('classrooms/edit', [
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'grade' => $classroom->grade,
                'teacher_id' => $classroom->teacher_id,
            ],
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:50'],
            'teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        $classroom->update($validated);

        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(Classroom $classroom): RedirectResponse
    {
        $classroom->delete();

        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil dihapus.');
    }
}
