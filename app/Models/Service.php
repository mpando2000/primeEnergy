<?php

namespace App\Models;

use App\Services\TranslatorService;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name',
        'name_sw',
        'description',
        'description_sw',
        'content',
        'content_sw',
        'images',
        'icon',
        'status',
        'source_lang',
        'sort_order',
    ];

    protected $casts = [
        'images' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['translations'];

    public function subServices()
    {
        return $this->hasMany(SubService::class)->orderBy('sort_order');
    }

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
                'name' => $this->name,
                'description' => $this->description,
                'content' => $this->content,
            ],
            'sw' => [
                'name' => $this->name_sw ?: $this->name,
                'description' => $this->description_sw ?: $this->description,
                'content' => $this->content_sw ?: $this->content,
            ],
        ];
    }

    /**
     * Auto-translate content when saving
     */
    public static function translateAndSave(array $data, string $sourceLang = 'en'): array
    {
        $targetLang = $sourceLang === 'en' ? 'sw' : 'en';
        
        // Translate name
        if (!empty($data['name'])) {
            $translated = TranslatorService::translate($data['name'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['name_sw'] = $translated;
            } else {
                $data['name_sw'] = $data['name'];
                $data['name'] = $translated;
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
        
        // Translate content (rich text)
        if (!empty($data['content'])) {
            $translated = TranslatorService::translate($data['content'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['content_sw'] = $translated;
            } else {
                $data['content_sw'] = $data['content'];
                $data['content'] = $translated;
            }
        }
        
        $data['source_lang'] = $sourceLang;
        
        return $data;
    }
}
