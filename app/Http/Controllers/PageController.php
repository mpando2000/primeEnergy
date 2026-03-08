<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::orderBy('title')->get();
        
        return Inertia::render('Admin/Pages', [
            'pages' => $pages,
        ]);
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_sw' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_description_sw' => 'nullable|string|max:500',
            'banner_image' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'content_sw' => 'nullable|string',
            'sections' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $page->update($validated);

        return back()->with('success', 'Page updated successfully');
    }

    public function toggleStatus(Page $page)
    {
        $page->update(['is_active' => !$page->is_active]);
        
        return back()->with('success', 'Page status updated');
    }
}
