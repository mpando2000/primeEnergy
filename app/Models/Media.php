<?php

namespace App\Models;

use App\Services\TranslatorService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = [
        'title',
        'title_sw',
        'type',
        'image_path',
        'description',
        'description_sw',
        'link_url',
        'link_text',
        'link_text_sw',
        'position',
        'position_sw',
        'sort_order',
        'is_active',
        'source_lang',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Scopes for different types
    public function scopeSlides($query)
    {
        return $query->where('type', 'slide')->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeMd($query)
    {
        return $query->where('type', 'md')->where('is_active', true)->first();
    }

    public function scopeServiceImages($query)
    {
        return $query->where('type', 'service')->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeTeamMembers($query)
    {
        return $query->where('type', 'team')->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeGeneral($query)
    {
        return $query->where('type', 'general')->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type)->orderBy('sort_order');
    }

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
        
        // Translate link_text
        if (!empty($data['link_text'])) {
            $translated = TranslatorService::translate($data['link_text'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['link_text_sw'] = $translated;
            } else {
                $data['link_text_sw'] = $data['link_text'];
                $data['link_text'] = $translated;
            }
        }
        
        // Translate position (for team members)
        if (!empty($data['position'])) {
            $translated = TranslatorService::translate($data['position'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['position_sw'] = $translated;
            } else {
                $data['position_sw'] = $data['position'];
                $data['position'] = $translated;
            }
        }
        
        $data['source_lang'] = $sourceLang;
        
        return $data;
    }
}
