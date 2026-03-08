<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    // Admin: Get settings page
    public function index()
    {
        $settings = Setting::getAllSettings();

        return Inertia::render('Admin/Settings', [
            'settings' => $settings
        ]);
    }

    // Admin: Update settings
    public function update(Request $request)
    {
        $data = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'fax' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'careers_email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'po_box' => 'nullable|string|max:100',
            'weekday_hours' => 'nullable|string|max:255',
            'weekend_hours' => 'nullable|string|max:255',
            'facebook' => 'nullable|url|max:500',
            'twitter' => 'nullable|url|max:500',
            'instagram' => 'nullable|url|max:500',
            'linkedin' => 'nullable|url|max:500',
            'youtube' => 'nullable|url|max:500',
            'whatsapp' => 'nullable|string|max:50',
            'webmail_url' => 'nullable|url|max:500',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'accent_color' => 'nullable|string|max:20',
            'highlight_color' => 'nullable|string|max:20',
            'tawk_enabled' => 'nullable|boolean',
            'tawk_id' => 'nullable|string|max:255',
            'google_analytics' => 'nullable|string|max:50',
            'google_maps_url' => 'nullable|string|max:1000',
        ]);

        Setting::setMany($data);

        return redirect()->back()->with('success', 'Settings updated successfully');
    }
}
