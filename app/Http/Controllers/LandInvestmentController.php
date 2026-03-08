<?php

namespace App\Http\Controllers;

use App\Models\LandInvestment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandInvestmentController extends Controller
{
    public function index()
    {
        $lands = LandInvestment::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($land) {
                return [
                    'id' => $land->id,
                    'title' => $land->title,
                    'title_sw' => $land->title_sw,
                    'description' => $land->description,
                    'description_sw' => $land->description_sw,
                    'location' => $land->location,
                    'location_sw' => $land->location_sw,
                    'size_acres' => $land->size_acres,
                    'investment_types' => is_string($land->investment_types) ? json_decode($land->investment_types, true) : $land->investment_types,
                    'investment_types_sw' => is_string($land->investment_types_sw) ? json_decode($land->investment_types_sw, true) : $land->investment_types_sw,
                    'features' => is_string($land->features) ? json_decode($land->features, true) : $land->features,
                    'features_sw' => is_string($land->features_sw) ? json_decode($land->features_sw, true) : $land->features_sw,
                    'images' => is_string($land->images) ? json_decode($land->images, true) : $land->images,
                ];
            });

        return Inertia::render('Investments', [
            'lands' => $lands,
        ]);
    }

    public function adminIndex()
    {
        $lands = LandInvestment::orderBy('sort_order')
            ->get()
            ->map(function ($land) {
                return [
                    'id' => $land->id,
                    'title' => $land->title,
                    'title_sw' => $land->title_sw,
                    'description' => $land->description,
                    'description_sw' => $land->description_sw,
                    'location' => $land->location,
                    'location_sw' => $land->location_sw,
                    'size_acres' => $land->size_acres,
                    'investment_types' => is_string($land->investment_types) ? json_decode($land->investment_types, true) : $land->investment_types,
                    'investment_types_sw' => is_string($land->investment_types_sw) ? json_decode($land->investment_types_sw, true) : $land->investment_types_sw,
                    'features' => is_string($land->features) ? json_decode($land->features, true) : $land->features,
                    'features_sw' => is_string($land->features_sw) ? json_decode($land->features_sw, true) : $land->features_sw,
                    'images' => is_string($land->images) ? json_decode($land->images, true) : $land->images,
                    'is_active' => $land->is_active,
                ];
            });
        return Inertia::render('Admin/Investments', ['lands' => $lands]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_sw' => 'nullable|string|max:255',
            'description' => 'required|string',
            'description_sw' => 'nullable|string',
            'location' => 'required|string|max:255',
            'location_sw' => 'nullable|string|max:255',
            'size_acres' => 'required|numeric|min:0',
            'investment_types' => 'required|array',
            'investment_types_sw' => 'nullable|array',
            'features' => 'required|array',
            'features_sw' => 'nullable|array',
            'images' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        LandInvestment::create($validated);

        return redirect()->back()->with('success', 'Land investment created successfully');
    }

    public function update(Request $request, $id)
    {
        $land = LandInvestment::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_sw' => 'nullable|string|max:255',
            'description' => 'required|string',
            'description_sw' => 'nullable|string',
            'location' => 'required|string|max:255',
            'location_sw' => 'nullable|string|max:255',
            'size_acres' => 'required|numeric|min:0',
            'investment_types' => 'required|array',
            'investment_types_sw' => 'nullable|array',
            'features' => 'required|array',
            'features_sw' => 'nullable|array',
            'images' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $land->update($validated);

        return redirect()->back()->with('success', 'Land investment updated successfully');
    }

    public function destroy($id)
    {
        $land = LandInvestment::findOrFail($id);
        $land->delete();

        return redirect()->back()->with('success', 'Land investment deleted successfully');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:8192',
        ]);

        $path = $request->file('image')->store('land-investments', 'public');

        return response()->json([
            'url' => '/storage/' . $path,
        ]);
    }
}
