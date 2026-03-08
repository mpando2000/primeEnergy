<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    // Get a setting value by key
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    // Set a setting value
    public static function set(string $key, $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        Cache::forget('site_settings');
    }

    // Get all settings as key-value array
    public static function getAllSettings(): array
    {
        return Cache::remember('site_settings', 3600, function () {
            $settings = static::all()->pluck('value', 'key')->toArray();
            return array_merge(static::getDefaults(), $settings);
        });
    }

    // Set multiple settings at once
    public static function setMany(array $settings): void
    {
        foreach ($settings as $key => $value) {
            static::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? '1' : '0') : $value]
            );
        }
        Cache::forget('site_settings');
    }

    // Default settings
    public static function getDefaults(): array
    {
        return [
            'company_name' => 'PrimeVolt Energy',
            'tagline' => 'Powering Tomorrow with Sustainable Energy Solutions',
            'description' => 'PrimeVolt Energy is a leading renewable energy company in Tanzania, committed to providing sustainable and innovative energy solutions for businesses and communities.',
            'phone' => '+255 XXX XXX XXX',
            'fax' => '+255 XXX XXX XXX',
            'email' => 'info@PrimeVoltenergy.co.tz',
            'careers_email' => 'careers@PrimeVoltenergy.co.tz',
            'address' => 'Dar es Salaam, Tanzania',
            'po_box' => 'P.O. Box XXXX',
            'weekday_hours' => 'Monday - Friday: 8:00 AM - 5:00 PM',
            'weekend_hours' => 'Saturday: 8:00 AM - 1:00 PM',
            'facebook' => '',
            'instagram' => '',
            'linkedin' => '',
            'youtube' => '',
            'whatsapp' => '',
            'primary_color' => '#4671b0',
            'secondary_color' => '#2b4c7e',
            'accent_color' => '#FBC02D',
            'highlight_color' => '#E53935',
            'tawk_enabled' => '1',
            'tawk_id' => '',
            'google_analytics' => '',
            'google_maps_url' => '',
        ];
    }
}
