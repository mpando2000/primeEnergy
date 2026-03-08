<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // home, about, chairman, contact, etc.
            $table->string('title');
            $table->string('title_sw')->nullable(); // Swahili title
            $table->text('meta_description')->nullable();
            $table->text('meta_description_sw')->nullable();
            $table->string('banner_image')->nullable();
            $table->longText('content')->nullable(); // JSON content blocks
            $table->longText('content_sw')->nullable(); // Swahili content
            $table->json('sections')->nullable(); // Flexible sections data
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default pages
        DB::table('pages')->insert([
            [
                'slug' => 'home',
                'title' => 'Home',
                'title_sw' => 'Nyumbani',
                'meta_description' => 'Sumajkt Electric Co. Ltd - Leading electrical contractor in Tanzania',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'about',
                'title' => 'About Us',
                'title_sw' => 'Kuhusu Sisi',
                'meta_description' => 'Learn about Sumajkt Electric Co. Ltd history and mission',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'chairman',
                'title' => 'Chairman Message',
                'title_sw' => 'Ujumbe wa Mwenyekiti',
                'meta_description' => 'Message from the Chairman of Sumajkt Electric Co. Ltd',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'services',
                'title' => 'Our Services',
                'title_sw' => 'Huduma Zetu',
                'meta_description' => 'Electrical services offered by Sumajkt Electric Co. Ltd',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'projects',
                'title' => 'Our Projects',
                'title_sw' => 'Miradi Yetu',
                'meta_description' => 'Projects completed by Sumajkt Electric Co. Ltd',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'training',
                'title' => 'Training Programs',
                'title_sw' => 'Programu za Mafunzo',
                'meta_description' => 'Professional training programs by Sumajkt Electric',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'contact',
                'title' => 'Contact Us',
                'title_sw' => 'Wasiliana Nasi',
                'meta_description' => 'Contact Sumajkt Electric Co. Ltd',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
