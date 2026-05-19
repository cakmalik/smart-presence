<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\School;
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
            ->with(['teacher:id,name', 'school:id,name'])
            ->latest()
            ->paginate(10)
            ->through(fn (Classroom $classroom) => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'grade' => $classroom->grade,
                'teacher_name' => $classroom->teacher?->name,
                'school_name' => $classroom->school?->name,
                'students_count' => $classroom->students_count,
                'created_at' => $classroom->created_at->format('d M Y'),
            ]);

        return Inertia::render('classrooms/index', [
            'classrooms' => $classrooms,
            'isSuperadmin' => auth()->user()->isSuperadmin(),
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();

        $teachers = User::query()
            ->role(['admin', 'operator'])
            ->when($user->school_id, fn ($q) => $q->where('school_id', $user->school_id))
            ->get(['id', 'name']);

        $schools = $user->isSuperadmin()
            ? School::query()->where('status', 'active')->orderBy('name')->get(['id', 'name'])
            : collect();

        return Inertia::render('classrooms/create', [
            'teachers' => $teachers,
            'schools' => $schools,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:50'],
            'teacher_id' => ['nullable', 'exists:users,id'],
        ];

        if (auth()->user()->isSuperadmin()) {
            $rules['school_id'] = ['required', 'exists:schools,id'];
        }

        $validated = $request->validate($rules);

        if (! auth()->user()->isSuperadmin()) {
            $validated['school_id'] = auth()->user()->school_id;
        }

        Classroom::create($validated);

        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function edit(Classroom $classroom): Response
    {
        $user = auth()->user();

        $teachers = User::query()
            ->role(['admin', 'operator'])
            ->when($user->school_id, fn ($q) => $q->where('school_id', $user->school_id))
            ->get(['id', 'name']);

        $schools = $user->isSuperadmin()
            ? School::query()->where('status', 'active')->orderBy('name')->get(['id', 'name'])
            : collect();

        return Inertia::render('classrooms/edit', [
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'grade' => $classroom->grade,
                'teacher_id' => $classroom->teacher_id,
                'school_id' => $classroom->school_id,
            ],
            'teachers' => $teachers,
            'schools' => $schools,
        ]);
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:50'],
            'teacher_id' => ['nullable', 'exists:users,id'],
        ];

        if (auth()->user()->isSuperadmin()) {
            $rules['school_id'] = ['required', 'exists:schools,id'];
        }

        $validated = $request->validate($rules);

        if (! auth()->user()->isSuperadmin()) {
            $validated['school_id'] = auth()->user()->school_id;
        }

        $classroom->update($validated);

        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(Classroom $classroom): RedirectResponse
    {
        $classroom->delete();

        return redirect()->route('classrooms.index')->with('success', 'Kelas berhasil dihapus.');
    }
}
