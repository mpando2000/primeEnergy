<?php

namespace App\Models;

use App\Services\TranslatorService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_sw',
        'category',
        'status',
        'source_lang',
        'client',
        'year',
        'location',
        'description',
        'description_sw',
        'scope_of_work',
        'scope_of_work_sw',
        'highlights',
        'highlights_sw',
        'images',
    ];

    protected $casts = [
        'scope_of_work' => 'array',
        'scope_of_work_sw' => 'array',
        'images' => 'array',
    ];

    protected $appends = ['translations'];

    public function scopePublished($query)
    {
        return $query->where('status', 'Published');
    }

    /**
     * Get translations attribute for frontend
     */
    public function getTranslationsAttribute(): array
    {
        return [
            'en' => [
                'title' => $this->title,
                'description' => $this->description,
                'scope_of_work' => $this->scope_of_work,
                'highlights' => $this->highlights,
            ],
            'sw' => [
                'title' => $this->title_sw ?: $this->title,
                'description' => $this->description_sw ?: $this->description,
                'scope_of_work' => $this->scope_of_work_sw ?: $this->scope_of_work,
                'highlights' => $this->highlights_sw ?: $this->highlights,
            ],
        ];
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
        
        // Translate highlights
        if (!empty($data['highlights'])) {
            $translated = TranslatorService::translate($data['highlights'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['highlights_sw'] = $translated;
            } else {
                $data['highlights_sw'] = $data['highlights'];
                $data['highlights'] = $translated;
            }
        }
        
        // Translate scope of work array
        if (!empty($data['scope_of_work']) && is_array($data['scope_of_work'])) {
            $translated = TranslatorService::translateArray($data['scope_of_work'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['scope_of_work_sw'] = $translated;
            } else {
                $data['scope_of_work_sw'] = $data['scope_of_work'];
                $data['scope_of_work'] = $translated;
            }
        }
        
        $data['source_lang'] = $sourceLang;
        
        return $data;
    }
}
