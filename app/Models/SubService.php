<?php

namespace App\Models;

use App\Services\TranslatorService;
use Illuminate\Database\Eloquent\Model;

class SubService extends Model
{
    protected $fillable = [
        'service_id',
        'name',
        'name_sw',
        'status',
        'source_lang',
        'sort_order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['translations'];

    public function service()
    {
        return $this->belongsTo(Service::class);
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
            'en' => ['name' => $this->name],
            'sw' => ['name' => $this->name_sw ?: $this->name],
        ];
    }

    /**
     * Auto-translate content when saving
     */
    public static function translateAndSave(array $data, string $sourceLang = 'en'): array
    {
        $targetLang = $sourceLang === 'en' ? 'sw' : 'en';
        
        if (!empty($data['name'])) {
            $translated = TranslatorService::translate($data['name'], $sourceLang, $targetLang);
            if ($sourceLang === 'en') {
                $data['name_sw'] = $translated;
            } else {
                $data['name_sw'] = $data['name'];
                $data['name'] = $translated;
            }
        }
        
        $data['source_lang'] = $sourceLang;
        
        return $data;
    }
}
