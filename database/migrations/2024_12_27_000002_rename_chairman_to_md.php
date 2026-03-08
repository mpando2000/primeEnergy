<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update media type from chairperson to md
        DB::table('media')->where('type', 'chairperson')->update(['type' => 'md']);
        
        // Update page_banners from chairman to md
        DB::table('page_banners')->where('page_key', 'chairman')->update([
            'page_key' => 'md',
            'page_name' => 'Managing Director',
        ]);
        
        // Update pages table if exists
        if (DB::getSchemaBuilder()->hasTable('pages')) {
            DB::table('pages')->where('slug', 'chairman')->update([
                'slug' => 'managing-director',
                'title' => 'Managing Director Message',
                'title_sw' => 'Ujumbe wa Mkurugenzi Mkuu',
                'meta_description' => 'Message from the Managing Director of Sumajkt Electric Co. Ltd',
            ]);
        }
        
        // Update translations table if exists
        if (DB::getSchemaBuilder()->hasTable('translations')) {
            DB::table('translations')->where('group', 'chairman')->update(['group' => 'md']);
            DB::table('translations')->where('group', 'home')
                ->where('key', 'like', 'chairman.%')
                ->get()
                ->each(function ($row) {
                    DB::table('translations')
                        ->where('id', $row->id)
                        ->update(['key' => str_replace('chairman.', 'md.', $row->key)]);
                });
        }
    }

    public function down(): void
    {
        // Revert media type
        DB::table('media')->where('type', 'md')->update(['type' => 'chairperson']);
        
        // Revert page_banners
        DB::table('page_banners')->where('page_key', 'md')->update([
            'page_key' => 'chairman',
            'page_name' => 'Chairman Message',
        ]);
        
        // Revert pages table
        if (DB::getSchemaBuilder()->hasTable('pages')) {
            DB::table('pages')->where('slug', 'managing-director')->update([
                'slug' => 'chairman',
                'title' => 'Chairman Message',
                'title_sw' => 'Ujumbe wa Mwenyekiti',
                'meta_description' => 'Message from the Chairman of Sumajkt Electric Co. Ltd',
            ]);
        }
        
        // Revert translations
        if (DB::getSchemaBuilder()->hasTable('translations')) {
            DB::table('translations')->where('group', 'md')->update(['group' => 'chairman']);
        }
    }
};
