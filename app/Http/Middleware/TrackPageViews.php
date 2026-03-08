<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageViews
{
    public function handle(Request $request, Closure $next): Response
    {
        // Only track GET requests to web pages (not API, admin, or assets)
        if ($request->isMethod('get') && 
            !$request->is('admin/*') && 
            !$request->is('api/*') &&
            !$request->ajax() &&
            !str_contains($request->path(), '.')) {
            
            PageView::track($request->path() ?: '/');
        }

        return $next($request);
    }
}
