<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category');
            $table->string('status')->default('Draft'); // Draft, Published
            $table->string('client')->nullable();
            $table->string('year')->nullable();
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->json('scope_of_work')->nullable(); // Array of scope items
            $table->text('highlights')->nullable();
            $table->json('images')->nullable(); // Array of image URLs
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
