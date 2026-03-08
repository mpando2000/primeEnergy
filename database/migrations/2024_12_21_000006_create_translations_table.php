<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('locale', 5)->default('en'); // en, sw
            $table->string('group', 50); // home, about, chairman, contact, etc.
            $table->string('key'); // welcome.title, welcome.p1, etc.
            $table->text('value')->nullable();
            $table->timestamps();
            
            $table->unique(['locale', 'group', 'key']);
            $table->index(['locale', 'group']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
