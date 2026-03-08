<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$permissions  One or more permission names (user needs at least one)
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user's status is active
        if ($user->status !== 'active') {
            auth()->logout();
            return redirect()->route('login')->with('error', 'Your account has been deactivated.');
        }

        // If no permissions specified, just check authentication
        if (empty($permissions)) {
            return $next($request);
        }

        // Check if user has any of the required permissions
        if ($user->hasAnyPermission($permissions)) {
            return $next($request);
        }

        // User doesn't have required permission
        if ($request->expectsJson()) {
            return response()->json(['error' => 'Unauthorized. Insufficient permissions.'], 403);
        }

        // If already trying to access dashboard and don't have permission, show 403 error
        if ($request->routeIs('admin.dashboard')) {
            abort(403, 'You do not have permission to access the dashboard. Please contact an administrator.');
        }

        // Try to redirect to dashboard, but if user doesn't have dashboard permission, go to profile
        if ($user->hasPermission('dashboard.view')) {
            return redirect()->route('admin.dashboard')->with('error', 'You do not have permission to access this resource.');
        }
        
        // Fallback to profile page which all authenticated users can access
        return redirect()->route('admin.profile')->with('error', 'You do not have permission to access this resource.');
    }
}
