<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainings', function (Blueprint $table) {
            $table->text('caption_sw')->nullable()->after('caption');
            $table->string('location_sw')->nullable()->after('location');
            $table->string('source_lang', 2)->default('en')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('trainings', function (Blueprint $table) {
            $table->dropColumn(['caption_sw', 'location_sw', 'source_lang']);
        });
    }
};
