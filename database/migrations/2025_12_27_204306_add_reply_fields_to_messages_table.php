<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->boolean('replied')->default(false)->after('archived');
            $table->timestamp('replied_at')->nullable()->after('replied');
            $table->string('replied_by')->nullable()->after('replied_at');
            $table->text('reply_content')->nullable()->after('replied_by');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['replied', 'replied_at', 'replied_by', 'reply_content']);
        });
    }
};
