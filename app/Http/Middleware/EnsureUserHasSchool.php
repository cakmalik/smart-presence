<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasSchool
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && ! auth()->user()->isSuperadmin() && ! auth()->user()->school_id) {
            abort(403, 'User tidak memiliki akses ke sekolah.');
        }

        return $next($request);
    }
}
