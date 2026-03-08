<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Training;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TrainingController extends Controller
{
    // Public: Get all published training photos
    public function index()
    {
        $trainings = Training::published()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Training', [
            'trainings' => $trainings
        ]);
    }

    // Admin: Get all training photos
    public function adminIndex()
    {
        $trainings = Training::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Training', [
            'trainings' => $trainings
        ]);
    }

    // Admin: Store new training photo
    public function store(Request $request)
    {
        $validated = $request->validate([
            'caption' => 'required|string|max:500',
            'location' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:10',
            'image' => 'required|string',
            'status' => 'nullable|in:Draft,Published',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        $validated['status'] = $validated['status'] ?? 'Published';
        
        // Auto-translate
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = Training::translateAndSave($validated, $sourceLang);

        $training = Training::create($validated);
        
        // Create notification
        Notification::notify('training', 'New training photo added', [
            'body' => Str::limit($training->caption, 50),
            'link' => '/admin/training',
            'actor_id' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', 'Training photo added successfully');
    }

    // Admin: Update training photo
    public function update(Request $request, $id)
    {
        $training = Training::findOrFail($id);

        $validated = $request->validate([
            'caption' => 'required|string|max:500',
            'location' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:10',
            'image' => 'required|string',
            'status' => 'nullable|in:Draft,Published',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        // Auto-translate
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = Training::translateAndSave($validated, $sourceLang);

        $training->update($validated);

        return redirect()->back()->with('success', 'Training photo updated successfully');
    }

    // Admin: Delete training photo
    public function destroy($id)
    {
        $training = Training::findOrFail($id);
        
        // Delete image from storage if it's a local file
        if (str_starts_with($training->image, '/storage/')) {
            $path = str_replace('/storage/', '', $training->image);
            Storage::disk('public')->delete($path);
        }
        
        $training->delete();

        return redirect()->back()->with('success', 'Training photo deleted successfully');
    }

    // Admin: Upload training image
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|file|mimes:jpeg,png,jpg,gif,webp|max:8192',
            ]);

            $file = $request->file('image');
            
            if (!$file) {
                return response()->json([
                    'message' => 'No file received'
                ], 422);
            }
            
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = 'trainings/' . Str::uuid() . '.' . $extension;
            
            $file->move(storage_path('app/public/trainings'), basename($filename));
            
            return response()->json([
                'url' => '/storage/' . $filename
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
