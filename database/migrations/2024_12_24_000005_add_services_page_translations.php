<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $translations = [
            ['key' => 'whatWeOffer', 'en' => 'What We Offer', 'sw' => 'Tunachotoa'],
            ['key' => 'gallery', 'en' => 'Gallery', 'sw' => 'Picha'],
            ['key' => 'cta.title', 'en' => 'Need This Service?', 'sw' => 'Unahitaji Huduma Hii?'],
            ['key' => 'cta.text', 'en' => 'Contact us today for a free consultation and quote. Our expert team is ready to help with your {service} needs.', 'sw' => 'Wasiliana nasi leo kwa ushauri na bei bila malipo. Timu yetu ya wataalamu iko tayari kusaidia na mahitaji yako ya {service}.'],
            ['key' => 'cta.button', 'en' => 'Contact Us', 'sw' => 'Wasiliana Nasi'],
        ];

        foreach ($translations as $t) {
            // Insert English version
            $existsEn = DB::table('translations')
                ->where('locale', 'en')
                ->where('group', 'services')
                ->where('key', $t['key'])
                ->exists();
            if (!$existsEn) {
                DB::table('translations')->insert([
                    'locale' => 'en',
                    'group' => 'services',
                    'key' => $t['key'],
                    'value' => $t['en'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Insert Swahili version
            $existsSw = DB::table('translations')
                ->where('locale', 'sw')
                ->where('group', 'services')
                ->where('key', $t['key'])
                ->exists();
            if (!$existsSw) {
                DB::table('translations')->insert([
                    'locale' => 'sw',
                    'group' => 'services',
                    'key' => $t['key'],
                    'value' => $t['sw'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        $keys = ['whatWeOffer', 'gallery', 'cta.title', 'cta.text', 'cta.button'];
        DB::table('translations')
            ->where('group', 'services')
            ->whereIn('key', $keys)
            ->delete();
    }
};
