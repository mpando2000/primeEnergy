<?php

namespace App\Models;

use App\Services\TranslatorService;
use Illuminate\Database\Eloquent\Model;

class Training extends Model
{
    protected $table = 'trainings';

    protected $fillable = [
        'caption',
        'caption_sw',
        'location',
        'location_sw',
        'year',
        'image',
        'status',
        'source_lang',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopePublished($query)
    {
        return $query->where('status', 'Published');
    }

    /**
     * Auto-translate content when saving
     */
    public static function translateAndSave(array $data, string $sourceLang = 'en'): array
    {
        $targetLang = $sourceLang === 'en' ? 'sw' : 'en';
        
        // Translate caption
        if (!empty($data['caption'])) {
            $translated = TranslatorService::translate($data['caption'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['caption_sw'] = $translated;
            } else {
                $data['caption_sw'] = $data['caption'];
                $data['caption'] = $translated;
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
        
        $data['source_lang'] = $sourceLang;
        
        return $data;
    }
}
