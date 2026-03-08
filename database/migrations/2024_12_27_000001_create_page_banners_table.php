<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_banners', function (Blueprint $table) {
            $table->id();
            $table->string('page_key')->unique(); // about, services, projects, training, contact, chairman
            $table->string('page_name');
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        // Seed default pages
        $pages = [
            ['page_key' => 'about', 'page_name' => 'About Us', 'image_url' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=300&fit=crop'],
            ['page_key' => 'services', 'page_name' => 'Our Services', 'image_url' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&h=300&fit=crop'],
            ['page_key' => 'projects', 'page_name' => 'Our Projects', 'image_url' => 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=300&fit=crop'],
            ['page_key' => 'training', 'page_name' => 'Staff Training', 'image_url' => 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=300&fit=crop'],
            ['page_key' => 'contact', 'page_name' => 'Contact Us', 'image_url' => 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&h=300&fit=crop'],
            ['page_key' => 'chairman', 'page_name' => 'Chairman Message', 'image_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=300&fit=crop'],
        ];

        foreach ($pages as $page) {
            DB::table('page_banners')->insert(array_merge($page, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('page_banners');
    }
};
