<?php

namespace App\Models;

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
}
