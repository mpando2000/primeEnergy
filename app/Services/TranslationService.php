<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    /**
     * Translate text using free Google Translate API
     */
    public function translate(string $text, string $sourceLang, string $targetLang): ?string
    {
        if (empty(trim($text))) {
            return $text;
        }

        // Map locale codes to Google Translate codes
        $langMap = [
            'en' => 'en',
            'sw' => 'sw', // Swahili
        ];

        $source = $langMap[$sourceLang] ?? $sourceLang;
        $target = $langMap[$targetLang] ?? $targetLang;

        try {
            // Using the free Google Translate API endpoint
            $url = 'https://translate.googleapis.com/translate_a/single';
            
            $response = Http::timeout(10)->get($url, [
                'client' => 'gtx',
                'sl' => $source,
                'tl' => $target,
                'dt' => 't',
                'q' => $text,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Extract translated text from response
                // Response format: [[["translated text","original text",null,null,10]],null,"en",...]
                if (is_array($data) && isset($data[0])) {
                    $translated = '';
                    foreach ($data[0] as $segment) {
                        if (isset($segment[0])) {
                            $translated .= $segment[0];
                        }
                    }
                    return $translated;
                }
            }

            Log::warning('Translation API returned unexpected response', [
                'text' => substr($text, 0, 100),
                'source' => $source,
                'target' => $target,
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Translation failed', [
                'error' => $e->getMessage(),
                'text' => substr($text, 0, 100),
            ]);
            return null;
        }
    }

    /**
     * Get the opposite locale
     */
    public function getOppositeLocale(string $locale): string
    {
        return $locale === 'en' ? 'sw' : 'en';
    }
}
