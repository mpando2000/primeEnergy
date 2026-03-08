<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'admin', 'editor', 'viewer'
            $table->string('display_name'); // e.g., 'Administrator'
            $table->string('description')->nullable();
            $table->boolean('is_system')->default(false); // System roles cannot be deleted
            $table->timestamps();
        });

        // Seed default roles
        $now = now();
        DB::table('roles')->insert([
            ['name' => 'admin', 'display_name' => 'Administrator', 'description' => 'Full access to all features', 'is_system' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'editor', 'display_name' => 'Editor', 'description' => 'Can manage content but not settings', 'is_system' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'viewer', 'display_name' => 'Viewer', 'description' => 'Read-only access to dashboard', 'is_system' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Change users.role from enum to string to support custom roles
        // First, we need to modify the column
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 50)->default('viewer')->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
        
        // Revert users.role back to enum (optional, may lose custom role data)
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'editor', 'viewer'])->default('viewer')->change();
        });
    }
};
