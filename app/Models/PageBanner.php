<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PageBanner extends Model
{
    protected $fillable = ['page_key', 'page_name', 'image_url'];

    /**
     * Get banner URL for a page with caching
     */
    public static function getForPage(string $pageKey): ?string
    {
        return Cache::remember("page_banner.{$pageKey}", 86400, function () use ($pageKey) {
            $banner = self::where('page_key', $pageKey)->first();
            return $banner?->image_url;
        });
    }

    /**
     * Clear cache when banner is updated
     */
    public static function clearCache(?string $pageKey = null): void
    {
        if ($pageKey) {
            Cache::forget("page_banner.{$pageKey}");
        } else {
            $pages = ['about', 'services', 'projects', 'training', 'contact', 'md'];
            foreach ($pages as $page) {
                Cache::forget("page_banner.{$page}");
            }
        }
        Cache::forget('page_banners_all');
    }

    /**
     * Get all banners for admin
     */
    public static function getAllBanners(): array
    {
        return Cache::remember('page_banners_all', 86400, function () {
            return self::all()->keyBy('page_key')->toArray();
        });
    }
}
