<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type'); // slide, chairperson, service, team, general
            $table->string('image_path');
            $table->text('description')->nullable();
            $table->string('link_url')->nullable(); // For slides - button link
            $table->string('link_text')->nullable(); // For slides - button text
            $table->string('position')->nullable(); // For team - job title
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
