<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'title_sw',
        'meta_description',
        'meta_description_sw',
        'banner_image',
        'content',
        'content_sw',
        'sections',
        'is_active',
    ];

    protected $casts = [
        'sections' => 'array',
        'is_active' => 'boolean',
    ];

    public function getTitle(string $locale = 'en'): string
    {
        if ($locale === 'sw' && $this->title_sw) {
            return $this->title_sw;
        }
        return $this->title;
    }

    public function getMetaDescription(string $locale = 'en'): ?string
    {
        if ($locale === 'sw' && $this->meta_description_sw) {
            return $this->meta_description_sw;
        }
        return $this->meta_description;
    }

    public function getContent(string $locale = 'en'): ?string
    {
        if ($locale === 'sw' && $this->content_sw) {
            return $this->content_sw;
        }
        return $this->content;
    }
}
