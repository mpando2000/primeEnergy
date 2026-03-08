<?php

namespace App\Http\Middleware;

use App\Models\Message;
use App\Models\Notification;
use App\Models\PageBanner;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $unreadMessagesCount = 0;
        $notificationsCount = 0;
        $recentNotifications = [];

        if ($user) {
            // Unread messages count for sidebar badge
            $msgQuery = Message::notArchived()->unread();
            if ($user->role !== 'admin') {
                $msgQuery->where('recipient_email', $user->email);
            }
            $unreadMessagesCount = $msgQuery->count();
            
            // Notifications from notifications table
            $isAdmin = $user->role === 'admin';
            $notificationsCount = Notification::forUser($user->id, $isAdmin)->unread()->count();
            
            $recentNotifications = Notification::forUser($user->id, $isAdmin)
                ->unread()
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($notif) {
                    return [
                        'id' => $notif->id,
                        'type' => $notif->type,
                        'title' => $notif->title,
                        'body' => $notif->body,
                        'icon' => $notif->icon,
                        'icon_bg' => $notif->icon_bg,
                        'link' => $notif->link,
                        'time' => $notif->created_at->diffForHumans(),
                    ];
                });
        }

        // Get published services for footer
        $footerServices = Service::where('status', 'Published')
            ->orderBy('sort_order')
            ->limit(5)
            ->get(['id', 'name', 'name_sw', 'icon']);

        // Get page banners
        $pageBanners = PageBanner::getAllBanners();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $user ? $user->getPermissions() : [],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'siteSettings' => Setting::getAllSettings(),
            'footerServices' => $footerServices,
            'pageBanners' => $pageBanners,
            'unreadMessagesCount' => $unreadMessagesCount,
            'notificationsCount' => $notificationsCount,
            'recentNotifications' => $recentNotifications,
        ];
    }
}
