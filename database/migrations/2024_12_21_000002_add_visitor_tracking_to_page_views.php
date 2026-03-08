<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->string('visitor_id')->nullable()->index()->after('referrer');
            $table->string('fingerprint')->nullable()->index()->after('visitor_id');
            $table->string('session_id')->nullable()->after('fingerprint');
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropColumn(['visitor_id', 'fingerprint', 'session_id']);
        });
    }
};
