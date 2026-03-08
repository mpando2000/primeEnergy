<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
    // Public: Get all published projects
    public function index()
    {
        $projects = Project::published()
            ->orderBy('created_at', 'desc')
            ->get();

        $services = Service::published()
            ->orderBy('sort_order')
            ->get(['id', 'name']);

        return Inertia::render('Projects', [
            'projects' => $projects,
            'services' => $services,
        ]);
    }

    // Public: Get single project detail
    public function show($id)
    {
        $project = Project::findOrFail($id);
        
        $otherProjects = Project::published()
            ->where('id', '!=', $id)
            ->limit(3)
            ->get();

        return Inertia::render('ProjectDetail', [
            'project' => $project,
            'otherProjects' => $otherProjects
        ]);
    }

    // Admin: Get all projects (including drafts)
    public function adminIndex()
    {
        $projects = Project::orderBy('created_at', 'desc')->get();
        
        // Get services with their subservices
        $services = Service::with(['subServices' => function ($query) {
            $query->orderBy('sort_order');
        }])->orderBy('sort_order')->get();

        return Inertia::render('Admin/Projects', [
            'projects' => $projects,
            'services' => $services,
        ]);
    }

    // Process images - convert base64 to files, keep URLs as-is
    private function processImages(array $images): array
    {
        $processedImages = [];

        foreach ($images as $image) {
            // Check if it's a base64 image
            if (preg_match('/^data:image\/(\w+);base64,/', $image, $matches)) {
                $extension = $matches[1];
                $base64Data = substr($image, strpos($image, ',') + 1);
                $imageData = base64_decode($base64Data);
                
                if ($imageData === false) {
                    continue; // Skip invalid base64
                }

                // Generate unique filename
                $filename = 'projects/' . Str::uuid() . '.' . $extension;
                
                // Store the file
                Storage::disk('public')->put($filename, $imageData);
                
                // Add the public URL
                $processedImages[] = '/storage/' . $filename;
            } else {
                // It's a URL, keep as-is
                $processedImages[] = $image;
            }
        }

        return $processedImages;
    }

    // Admin: Store new project
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'subcategory' => 'nullable|string|max:100',
            'status' => 'required|in:Draft,Published',
            'client' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:10',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'scope_of_work' => 'nullable|array',
            'highlights' => 'nullable|string',
            'images' => 'nullable|array',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        // Process images (convert base64 to files)
        if (!empty($validated['images'])) {
            $validated['images'] = $this->processImages($validated['images']);
        }

        // Auto-translate content
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = Project::translateAndSave($validated, $sourceLang);

        $project = Project::create($validated);
        
        // Create notification for new project
        Notification::notify('project', 'New project added: ' . $project->title, [
            'body' => $project->category . ' - ' . ($project->client ?? 'No client'),
            'link' => '/admin/projects',
            'actor_id' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', 'Project created successfully');
    }

    // Admin: Update project
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'subcategory' => 'nullable|string|max:100',
            'status' => 'required|in:Draft,Published',
            'client' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:10',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'scope_of_work' => 'nullable|array',
            'highlights' => 'nullable|string',
            'images' => 'nullable|array',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        // Process images (convert base64 to files)
        if (!empty($validated['images'])) {
            $validated['images'] = $this->processImages($validated['images']);
        }

        // Auto-translate content
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = Project::translateAndSave($validated, $sourceLang);

        $project->update($validated);

        return redirect()->back()->with('success', 'Project updated successfully');
    }

    // Admin: Delete project
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        
        // Delete associated images from storage
        if ($project->images) {
            foreach ($project->images as $image) {
                if (str_starts_with($image, '/storage/')) {
                    $path = str_replace('/storage/', '', $image);
                    Storage::disk('public')->delete($path);
                }
            }
        }
        
        $project->delete();

        return redirect()->back()->with('success', 'Project deleted successfully');
    }

    // Admin: Upload single image file
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|file|mimes:jpeg,png,jpg,gif,webp|max:8192', // 8MB max
            ]);

            $file = $request->file('image');
            
            if (!$file) {
                \Log::error('Upload: No file received');
                return response()->json([
                    'message' => 'No file received. Check if file size exceeds PHP limit (current: ' . ini_get('upload_max_filesize') . ')'
                ], 422);
            }
            
            \Log::info('Upload: File received', ['name' => $file->getClientOriginalName(), 'size' => $file->getSize()]);
            
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = 'projects/' . Str::uuid() . '.' . $extension;
            
            // Use move instead of storeAs for more direct control
            $file->move(storage_path('app/public/projects'), basename($filename));
            
            \Log::info('Upload: File saved', ['path' => $filename]);
            
            return response()->json([
                'url' => '/storage/' . $filename
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Upload validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Upload failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
