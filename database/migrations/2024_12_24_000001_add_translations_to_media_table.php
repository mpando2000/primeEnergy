<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->string('title_sw')->nullable()->after('title');
            $table->text('description_sw')->nullable()->after('description');
            $table->string('link_text_sw')->nullable()->after('link_text');
            $table->string('source_lang', 2)->default('en')->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn(['title_sw', 'description_sw', 'link_text_sw', 'source_lang']);
        });
    }
};
