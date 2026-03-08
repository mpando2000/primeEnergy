<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('name_sw')->nullable()->after('name');
            $table->text('description_sw')->nullable()->after('description');
            $table->text('content_sw')->nullable()->after('content');
            $table->string('source_lang', 2)->default('en')->after('status');
        });

        Schema::table('sub_services', function (Blueprint $table) {
            $table->string('name_sw')->nullable()->after('name');
            $table->string('source_lang', 2)->default('en')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['name_sw', 'description_sw', 'content_sw', 'source_lang']);
        });

        Schema::table('sub_services', function (Blueprint $table) {
            $table->dropColumn(['name_sw', 'source_lang']);
        });
    }
};
