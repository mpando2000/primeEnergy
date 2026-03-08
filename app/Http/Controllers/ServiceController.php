<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Service;
use App\Models\SubService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    // Public: Get all published services with sub-services
    public function index()
    {
        $services = Service::published()
            ->with(['subServices' => function ($query) {
                $query->published()->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Services', [
            'services' => $services
        ]);
    }

    // Admin: Get all services with sub-services
    public function adminIndex()
    {
        $services = Service::with(['subServices' => function ($query) {
            $query->orderBy('sort_order');
        }])
        ->orderBy('sort_order')
        ->get();

        return Inertia::render('Admin/Services', [
            'services' => $services
        ]);
    }

    // Admin: Store new service
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'content' => 'nullable|string',
            'images' => 'nullable|array',
            'icon' => 'nullable|string|max:50',
            'status' => 'nullable|in:Draft,Published',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        $validated['icon'] = $validated['icon'] ?? 'fa-bolt';
        $validated['status'] = $validated['status'] ?? 'Published';
        $validated['sort_order'] = Service::max('sort_order') + 1;

        // Auto-translate content
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = Service::translateAndSave($validated, $sourceLang);

        $service = Service::create($validated);
        
        // Create notification
        Notification::notify('service', 'New service added: ' . $service->name, [
            'body' => $service->description ? \Illuminate\Support\Str::limit($service->description, 50) : 'No description',
            'link' => '/admin/services',
            'actor_id' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', 'Service added successfully');
    }

    // Admin: Update service
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'content' => 'nullable|string',
            'images' => 'nullable|array',
            'icon' => 'nullable|string|max:50',
            'status' => 'nullable|in:Draft,Published',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        // Auto-translate content
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = Service::translateAndSave($validated, $sourceLang);

        $service->update($validated);

        return redirect()->back()->with('success', 'Service updated successfully');
    }

    // Admin: Delete service (cascades to sub-services)
    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return redirect()->back()->with('success', 'Service deleted successfully');
    }

    // Admin: Add sub-service
    public function storeSubService(Request $request, $serviceId)
    {
        $service = Service::findOrFail($serviceId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'nullable|in:Draft,Published',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        $validated['status'] = $validated['status'] ?? 'Published';
        $validated['sort_order'] = $service->subServices()->max('sort_order') + 1;

        // Auto-translate
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = SubService::translateAndSave($validated, $sourceLang);

        $service->subServices()->create($validated);

        return redirect()->back()->with('success', 'Sub-service added successfully');
    }

    // Admin: Update sub-service
    public function updateSubService(Request $request, $serviceId, $subId)
    {
        $subService = SubService::where('service_id', $serviceId)->findOrFail($subId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'nullable|in:Draft,Published',
            'source_lang' => 'nullable|in:en,sw',
        ]);

        // Auto-translate
        $sourceLang = $validated['source_lang'] ?? 'en';
        $validated = SubService::translateAndSave($validated, $sourceLang);

        $subService->update($validated);

        return redirect()->back()->with('success', 'Sub-service updated successfully');
    }

    // Admin: Delete sub-service
    public function destroySubService($serviceId, $subId)
    {
        $subService = SubService::where('service_id', $serviceId)->findOrFail($subId);
        $subService->delete();

        return redirect()->back()->with('success', 'Sub-service deleted successfully');
    }
}
