<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PageView extends Model
{
    protected $fillable = [
        'page',
        'ip_address',
        'user_agent',
        'referrer',
        'viewed_date',
        'visitor_id',
        'fingerprint',
        'session_id',
    ];

    protected $casts = [
        'viewed_date' => 'date',
    ];

    /**
     * Track a visit using session-based approach
     * - Uses fingerprint (IP + User Agent) to identify visitors
     * - Creates new session if 30+ minutes since last activity from same fingerprint
     * - NOT per-page - tracks site visits as a whole
     */
    public static function track(string $page): void
    {
        $fingerprint = self::generateFingerprint();
        $sessionTimeout = 30; // minutes

        // Check if there's an active session for this fingerprint (any page)
        $lastVisit = self::where('fingerprint', $fingerprint)
            ->orderBy('created_at', 'desc')
            ->first();

        // If no previous visit, or last visit was more than 30 min ago = new session
        $isNewSession = !$lastVisit || 
            $lastVisit->created_at->diffInMinutes(now()) >= $sessionTimeout;

        if ($isNewSession) {
            self::create([
                'page' => $page,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'referrer' => request()->header('referer'),
                'viewed_date' => now()->toDateString(),
                'visitor_id' => $fingerprint, // Use fingerprint as visitor ID
                'fingerprint' => $fingerprint,
                'session_id' => Str::uuid()->toString(),
            ]);
        }
    }

    /**
     * Generate fingerprint from IP + User Agent
     * Helps distinguish different users on same network
     */
    private static function generateFingerprint(): string
    {
        $ip = request()->ip();
        $userAgent = request()->userAgent() ?? '';
        
        return hash('sha256', $ip . '|' . $userAgent);
    }

    // Count sessions (unique visits)
    public static function getTodayCount(): int
    {
        return self::whereDate('viewed_date', today())->count();
    }

    public static function getThisWeekCount(): int
    {
        return self::whereBetween('viewed_date', [now()->startOfWeek(), now()->endOfWeek()])->count();
    }

    public static function getThisMonthCount(): int
    {
        return self::whereMonth('viewed_date', now()->month)
            ->whereYear('viewed_date', now()->year)
            ->count();
    }

    public static function getTotalCount(): int
    {
        return self::count();
    }

    // Get unique visitors (distinct fingerprints)
    public static function getUniqueVisitorsToday(): int
    {
        return self::whereDate('viewed_date', today())
            ->distinct('fingerprint')
            ->count('fingerprint');
    }

    public static function getUniqueVisitorsThisMonth(): int
    {
        return self::whereMonth('viewed_date', now()->month)
            ->whereYear('viewed_date', now()->year)
            ->distinct('fingerprint')
            ->count('fingerprint');
    }
}
