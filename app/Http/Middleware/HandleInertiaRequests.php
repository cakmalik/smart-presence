<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $roles = $user ? $user->getRoleNames() : collect();
        $permissions = $user ? $user->getAllPermissions()->pluck('name') : collect();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'roles' => $roles,
                    'permissions' => $permissions,
                ] : null,
                'roles' => $roles,
                'permissions' => $permissions,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'message' => session('success') ?? session('error'),
                'success' => session('success'),
                'error' => session('error'),
            ],
        ];
    }
}
