<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Translation extends Model
{
    protected $fillable = ['locale', 'group', 'key', 'value'];

    /**
     * Get all translations for a locale, with caching
     */
    public static function getForLocale(string $locale): array
    {
        return Cache::remember("translations.{$locale}", 86400, function () use ($locale) {
            $translations = self::where('locale', $locale)->get();
            
            $result = [];
            foreach ($translations as $t) {
                $keys = explode('.', $t->key);
                $current = &$result[$t->group];
                
                foreach ($keys as $i => $key) {
                    if ($i === count($keys) - 1) {
                        $current[$key] = $t->value;
                    } else {
                        if (!isset($current[$key])) {
                            $current[$key] = [];
                        }
                        $current = &$current[$key];
                    }
                }
            }
            
            return $result;
        });
    }

    /**
     * Clear translation cache for a locale
     */
    public static function clearCache(?string $locale = null): void
    {
        if ($locale) {
            Cache::forget("translations.{$locale}");
        } else {
            Cache::forget('translations.en');
            Cache::forget('translations.sw');
        }
    }

    /**
     * Update or create a translation
     */
    public static function setValue(string $locale, string $group, string $key, ?string $value): void
    {
        self::updateOrCreate(
            ['locale' => $locale, 'group' => $group, 'key' => $key],
            ['value' => $value]
        );
        
        self::clearCache($locale);
    }

    /**
     * Import translations from JSON file
     */
    public static function importFromJson(string $locale, string $jsonPath): int
    {
        if (!file_exists($jsonPath)) {
            return 0;
        }

        $data = json_decode(file_get_contents($jsonPath), true);
        $count = 0;

        foreach ($data as $group => $values) {
            $count += self::importGroup($locale, $group, $values);
        }

        self::clearCache($locale);
        return $count;
    }

    /**
     * Recursively import a group of translations
     */
    private static function importGroup(string $locale, string $group, array $values, string $prefix = ''): int
    {
        $count = 0;

        foreach ($values as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;

            if (is_array($value)) {
                $count += self::importGroup($locale, $group, $value, $fullKey);
            } else {
                self::updateOrCreate(
                    ['locale' => $locale, 'group' => $group, 'key' => $fullKey],
                    ['value' => $value]
                );
                $count++;
            }
        }

        return $count;
    }
}
