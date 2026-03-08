<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Swahili translations
            $table->string('title_sw')->nullable()->after('title');
            $table->text('description_sw')->nullable()->after('description');
            $table->json('scope_of_work_sw')->nullable()->after('scope_of_work');
            $table->text('highlights_sw')->nullable()->after('highlights');
            
            // Track source language
            $table->string('source_lang', 2)->default('en')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['title_sw', 'description_sw', 'scope_of_work_sw', 'highlights_sw', 'source_lang']);
        });
    }
};
