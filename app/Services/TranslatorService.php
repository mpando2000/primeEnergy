<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslatorService
{
    /**
     * Translate text from one language to another using Google Translate
     * Uses the free unofficial API endpoint
     */
    public static function translate(string $text, string $from = 'en', string $to = 'sw'): string
    {
        if (empty(trim($text))) {
            return $text;
        }

        try {
            $response = Http::timeout(10)->get('https://translate.googleapis.com/translate_a/single', [
                'client' => 'gtx',
                'sl' => $from,
                'tl' => $to,
                'dt' => 't',
                'q' => $text,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                // Extract translated text from response
                $translated = '';
                if (isset($result[0]) && is_array($result[0])) {
                    foreach ($result[0] as $segment) {
                        if (isset($segment[0])) {
                            $translated .= $segment[0];
                        }
                    }
                }
                
                return $translated ?: $text;
            }
        } catch (\Exception $e) {
            Log::warning('Translation failed: ' . $e->getMessage());
        }

        return $text; // Return original if translation fails
    }

    /**
     * Translate an array of strings
     */
    public static function translateArray(array $items, string $from = 'en', string $to = 'sw'): array
    {
        return array_map(function ($item) use ($from, $to) {
            return self::translate($item, $from, $to);
        }, $items);
    }

    /**
     * Detect the language of text
     */
    public static function detectLanguage(string $text): string
    {
        // Simple detection based on common Swahili words
        $swahiliWords = ['na', 'ya', 'wa', 'kwa', 'ni', 'katika', 'au', 'hii', 'hiyo', 'yake', 'wao', 'sisi', 'wewe', 'mimi'];
        $words = preg_split('/\s+/', strtolower($text));
        
        $swahiliCount = 0;
        foreach ($words as $word) {
            if (in_array($word, $swahiliWords)) {
                $swahiliCount++;
            }
        }
        
        // If more than 15% of words are common Swahili words, assume Swahili
        return ($swahiliCount / max(count($words), 1)) > 0.15 ? 'sw' : 'en';
    }

    /**
     * Auto-translate content and return both versions
     * Detects source language and translates to the other
     */
    public static function autoTranslate(string $text): array
    {
        $sourceLang = self::detectLanguage($text);
        $targetLang = $sourceLang === 'en' ? 'sw' : 'en';
        
        $translated = self::translate($text, $sourceLang, $targetLang);
        
        return [
            'en' => $sourceLang === 'en' ? $text : $translated,
            'sw' => $sourceLang === 'sw' ? $text : $translated,
            'source_lang' => $sourceLang,
        ];
    }
}
