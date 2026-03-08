<?php

namespace App\Models;

use App\Services\TranslatorService;
use Illuminate\Database\Eloquent\Model;

class LandInvestment extends Model
{
    protected $fillable = [
        'title',
        'title_sw',
        'description',
        'description_sw',
        'location',
        'location_sw',
        'size_acres',
        'investment_types',
        'investment_types_sw',
        'features',
        'features_sw',
        'images',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'investment_types' => 'array',
        'investment_types_sw' => 'array',
        'features' => 'array',
        'features_sw' => 'array',
        'images' => 'array',
        'is_active' => 'boolean',
        'size_acres' => 'decimal:2',
    ];

    /**
     * Auto-translate content when saving
     */
    public static function translateAndSave(array $data, string $sourceLang = 'en'): array
    {
        $targetLang = $sourceLang === 'en' ? 'sw' : 'en';
        
        // Translate title
        if (!empty($data['title'])) {
            $translated = TranslatorService::translate($data['title'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['title_sw'] = $translated;
            } else {
                $data['title_sw'] = $data['title'];
                $data['title'] = $translated;
            }
        }
        
        // Translate description
        if (!empty($data['description'])) {
            $translated = TranslatorService::translate($data['description'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['description_sw'] = $translated;
            } else {
                $data['description_sw'] = $data['description'];
                $data['description'] = $translated;
            }
        }
        
        // Translate location
        if (!empty($data['location'])) {
            $translated = TranslatorService::translate($data['location'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['location_sw'] = $translated;
            } else {
                $data['location_sw'] = $data['location'];
                $data['location'] = $translated;
            }
        }
        
        // Translate investment types array
        if (!empty($data['investment_types']) && is_array($data['investment_types'])) {
            $translated = TranslatorService::translateArray($data['investment_types'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['investment_types_sw'] = $translated;
            } else {
                $data['investment_types_sw'] = $data['investment_types'];
                $data['investment_types'] = $translated;
            }
        }
        
        // Translate features array
        if (!empty($data['features']) && is_array($data['features'])) {
            $translated = TranslatorService::translateArray($data['features'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['features_sw'] = $translated;
            } else {
                $data['features_sw'] = $data['features'];
                $data['features'] = $translated;
            }
        }
        
        return $data;
    }
}
