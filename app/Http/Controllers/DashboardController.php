<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Notification;
use App\Models\PageView;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $data = $this->getDashboardData();

        return Inertia::render('Admin/Dashboard', $data);
    }

    /**
     * API endpoint for real-time stats polling
     */
    public function stats()
    {
        return response()->json($this->getDashboardData());
    }

    private function getDashboardData(): array
    {
        // Stats
        $stats = [
            'totalProjects' => Project::count(),
            'publishedProjects' => Project::where('status', 'Published')->count(),
            'newMessages' => Message::where('read', false)->count(),
            'pageViews' => PageView::getTotalCount(),
            'pageViewsToday' => PageView::getTodayCount(),
            'pageViewsWeek' => PageView::getThisWeekCount(),
            'pageViewsMonth' => PageView::getThisMonthCount(),
            'teamMembers' => User::count(),
        ];

        // Recent projects
        $recentProjects = Project::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'category', 'status', 'created_at']);

        // Projects by category
        $projectsByCategory = DB::table('projects')
            ->select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $totalProjects = $stats['totalProjects'] ?: 1;
        $categories = $projectsByCategory->map(function ($item) use ($totalProjects) {
            return [
                'name' => $item->category,
                'count' => $item->count,
                'percent' => round(($item->count / $totalProjects) * 100),
            ];
        });

        // Recent activities from notifications
        $activities = Notification::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($notification) {
                $icon = match ($notification->type) {
                    'project' => 'fa-project-diagram',
                    'message' => 'fa-envelope',
                    'user' => 'fa-user',
                    default => 'fa-bell',
                };
                $color = match ($notification->type) {
                    'project' => 'green',
                    'message' => 'yellow',
                    'user' => 'blue',
                    default => 'gray',
                };
                return [
                    'icon' => $icon,
                    'color' => $color,
                    'text' => $notification->title,
                    'time' => $notification->created_at->diffForHumans(),
                ];
            });

        return [
            'stats' => $stats,
            'recentProjects' => $recentProjects,
            'categories' => $categories,
            'activities' => $activities,
        ];
    }
}
