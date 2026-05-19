<?php

namespace App\Http\Controllers;

use App\Models\School;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolController extends Controller
{
    public function index(): Response
    {
        $schools = School::query()
            ->latest()
            ->paginate(10)
            ->through(fn (School $school) => [
                'id' => $school->id,
                'name' => $school->name,
                'code' => $school->code,
                'address' => $school->address,
                'email' => $school->email,
                'phone' => $school->phone,
                'status' => $school->status,
                'users_count' => $school->users()->count(),
                'students_count' => $school->students()->count(),
                'created_at' => $school->created_at->format('d M Y'),
            ]);

        return Inertia::render('schools/index', [
            'schools' => $schools,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('schools/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:schools,code'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        School::create($validated);

        return redirect()->route('schools.index')->with('success', 'Sekolah berhasil ditambahkan.');
    }

    public function edit(School $school): Response
    {
        return Inertia::render('schools/edit', [
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
                'code' => $school->code,
                'address' => $school->address,
                'email' => $school->email,
                'phone' => $school->phone,
                'status' => $school->status,
            ],
        ]);
    }

    public function update(Request $request, School $school): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:schools,code,'.$school->id],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $school->update($validated);

        return redirect()->route('schools.index')->with('success', 'Sekolah berhasil diperbarui.');
    }

    public function destroy(School $school): RedirectResponse
    {
        $school->delete();

        return redirect()->route('schools.index')->with('success', 'Sekolah berhasil dihapus.');
    }
}
