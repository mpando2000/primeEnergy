<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\PageBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::orderBy('type')->orderBy('sort_order')->get();
        $banners = PageBanner::all();
        
        return Inertia::render('Admin/Gallery', [
            'media' => $media,
            'banners' => $banners,
            'counts' => [
                'slide' => Media::where('type', 'slide')->count(),
                'md' => Media::where('type', 'md')->count(),
                'team' => Media::where('type', 'team')->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:slide,md,team',
            'description' => 'nullable|string',
            'link_url' => 'nullable|string|max:255',
            'link_text' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        // Handle is_active (comes as '1' or '0' string)
        $validated['is_active'] = $request->input('is_active') === '1' || $request->input('is_active') === true;

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('media', 'public');
            $validated['image_path'] = '/storage/' . $path;
        } elseif ($request->image_url) {
            $validated['image_path'] = $request->image_url;
        }

        // Set sort order
        $validated['sort_order'] = Media::where('type', $validated['type'])->max('sort_order') + 1;

        // Auto-translate for slides, chairperson, and team
        if (in_array($validated['type'], ['slide', 'md', 'team'])) {
            $sourceLang = $validated['source_lang'] ?? 'en';
            $validated = Media::translateAndSave($validated, $sourceLang);
        }

        Media::create($validated);

        return redirect()->back()->with('success', 'Media added successfully');
    }

    public function update(Request $request, Media $media)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:slide,md,team',
            'description' => 'nullable|string',
            'link_url' => 'nullable|string|max:255',
            'link_text' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        // Handle is_active
        $validated['is_active'] = $request->input('is_active') === '1' || $request->input('is_active') === true;

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if it's a stored file
            if ($media->image_path && str_starts_with($media->image_path, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $media->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('media', 'public');
            $validated['image_path'] = '/storage/' . $path;
        } elseif ($request->image_url && $request->image_url !== $media->image_path) {
            $validated['image_path'] = $request->image_url;
        }

        // Auto-translate for slides, chairperson, and team
        if (in_array($validated['type'], ['slide', 'md', 'team'])) {
            $sourceLang = $validated['source_lang'] ?? 'en';
            $validated = Media::translateAndSave($validated, $sourceLang);
        }

        $media->update($validated);

        return redirect()->back()->with('success', 'Media updated successfully');
    }

    public function destroy(Media $media)
    {
        // Delete stored image file
        if ($media->image_path && str_starts_with($media->image_path, '/storage/')) {
            $path = str_replace('/storage/', '', $media->image_path);
            Storage::disk('public')->delete($path);
        }

        $media->delete();

        return redirect()->back()->with('success', 'Media deleted successfully');
    }

    public function updateOrder(Request $request)
    {
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:media,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($items['items'] as $item) {
            Media::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['success' => true]);
    }

    public function toggleActive(Media $media)
    {
        $media->update(['is_active' => !$media->is_active]);
        return redirect()->back();
    }
}
