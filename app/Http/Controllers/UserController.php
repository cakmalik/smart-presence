<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $users = User::query()
            ->with('school:id,name')
            ->when($user->school_id, fn ($q) => $q->where('school_id', $user->school_id))
            ->when($request->search, fn ($q, $s) => $q->where(function ($q2) use ($s) {
                $q2->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%");
            }))
            ->when($request->role, fn ($q, $r) => $q->role($r))
            ->when($request->school_id && $user->isSuperadmin(), fn ($q, $sid) => $q->where('school_id', $sid))
            ->latest()
            ->paginate(10)
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'school_name' => $u->school?->name,
                'roles' => $u->getRoleNames(),
                'created_at' => $u->created_at->format('d M Y'),
            ]);

        $schools = $user->isSuperadmin()
            ? School::query()->where('status', 'active')->orderBy('name')->get(['id', 'name'])
            : collect();

        $roles = Role::query()->orderBy('name')->pluck('name');

        return Inertia::render('users/index', [
            'users' => $users,
            'schools' => $schools,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'school_id']),
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();

        $schools = $user->isSuperadmin()
            ? School::query()->where('status', 'active')->orderBy('name')->get(['id', 'name'])
            : collect();

        $roles = $user->isSuperadmin()
            ? Role::query()->orderBy('name')->pluck('name')
            : Role::query()->where('name', '!=', 'superadmin')->orderBy('name')->pluck('name');

        return Inertia::render('users/create', [
            'schools' => $schools,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'school_id' => ['nullable', 'exists:schools,id'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'password' => $validated['password'],
            'school_id' => $validated['school_id'],
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(User $user): Response
    {
        $authUser = auth()->user();

        $schools = $authUser->isSuperadmin()
            ? School::query()->where('status', 'active')->orderBy('name')->get(['id', 'name'])
            : collect();

        $roles = $authUser->isSuperadmin()
            ? Role::query()->orderBy('name')->pluck('name')
            : Role::query()->where('name', '!=', 'superadmin')->orderBy('name')->pluck('name');

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'school_id' => $user->school_id,
                'role' => $user->getRoleNames()->first(),
            ],
            'schools' => $schools,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:50', 'alpha_dash', 'unique:users,username,'.$user->id],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['nullable', Password::defaults()],
            'school_id' => ['nullable', 'exists:schools,id'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email' => $validated['email'],
            'school_id' => $validated['school_id'],
        ];

        if ($validated['password']) {
            $updateData['password'] = $validated['password'];
        }

        $user->update($updateData);
        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->isSuperadmin()) {
            return redirect()->route('users.index')->with('error', 'Tidak dapat menghapus Superadmin.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
