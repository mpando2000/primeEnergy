<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Service;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Get active slides ordered by sort_order
        $slides = Media::where('type', 'slide')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Get managing director image
        $mdProfile = Media::where('type', 'md')
            ->where('is_active', true)
            ->first();

        // Get published services for homepage
        $services = Service::published()
            ->orderBy('sort_order')
            ->limit(5)
            ->get(['id', 'name', 'name_sw', 'description', 'description_sw', 'icon']);

        return Inertia::render('Home', [
            'slides' => $slides,
            'mdProfile' => $mdProfile,
            'services' => $services,
        ]);
    }
}
