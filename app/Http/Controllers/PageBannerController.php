<?php

namespace App\Http\Controllers;

use App\Models\PageBanner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageBannerController extends Controller
{
    public function index()
    {
        $banners = PageBanner::all();

        return Inertia::render('Admin/Banners', [
            'banners' => $banners,
        ]);
    }

    public function update(Request $request, PageBanner $banner)
    {
        $validated = $request->validate([
            'image_url' => 'required|string|max:500',
        ]);

        $banner->update($validated);
        PageBanner::clearCache($banner->page_key);

        return redirect()->back()->with('success', 'Banner updated successfully');
    }
}
