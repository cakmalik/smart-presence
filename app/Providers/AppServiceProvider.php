<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureInertia();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureInertia(): void
    {
        Inertia::share('auth.roles', function () {
            if (auth()->check()) {
                return auth()->user()->roles()->pluck('name')->toArray();
            }

            return [];
        });

        Inertia::share('auth.permissions', function () {
            if (auth()->check()) {
                return auth()->user()->getPermissionsViaRoles()->pluck('name')->toArray();
            }

            return [];
        });
    }
}
