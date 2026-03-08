<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'projects.view', 'projects.create'
            $table->string('display_name'); // e.g., 'View Projects'
            $table->string('group'); // e.g., 'projects', 'services', 'settings'
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Create role_permissions pivot table
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role'); // 'admin', 'editor', 'viewer'
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['role', 'permission_id']);
        });

        // Seed default permissions
        $this->seedPermissions();
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
    }

    private function seedPermissions(): void
    {
        $permissions = [
            // Dashboard
            ['name' => 'dashboard.view', 'display_name' => 'View Dashboard', 'group' => 'dashboard', 'description' => 'Access the admin dashboard'],
            
            // Messages
            ['name' => 'messages.view', 'display_name' => 'View Messages', 'group' => 'messages', 'description' => 'View contact messages'],
            ['name' => 'messages.manage', 'display_name' => 'Manage Messages', 'group' => 'messages', 'description' => 'Mark as read, star, archive messages'],
            ['name' => 'messages.delete', 'display_name' => 'Delete Messages', 'group' => 'messages', 'description' => 'Delete messages permanently'],
            
            // Content/Translations
            ['name' => 'content.view', 'display_name' => 'View Content', 'group' => 'content', 'description' => 'View website content'],
            ['name' => 'content.edit', 'display_name' => 'Edit Content', 'group' => 'content', 'description' => 'Edit website content and translations'],
            
            // Projects
            ['name' => 'projects.view', 'display_name' => 'View Projects', 'group' => 'projects', 'description' => 'View projects list'],
            ['name' => 'projects.create', 'display_name' => 'Create Projects', 'group' => 'projects', 'description' => 'Add new projects'],
            ['name' => 'projects.edit', 'display_name' => 'Edit Projects', 'group' => 'projects', 'description' => 'Edit existing projects'],
            ['name' => 'projects.delete', 'display_name' => 'Delete Projects', 'group' => 'projects', 'description' => 'Delete projects'],
            
            // Services
            ['name' => 'services.view', 'display_name' => 'View Services', 'group' => 'services', 'description' => 'View services list'],
            ['name' => 'services.create', 'display_name' => 'Create Services', 'group' => 'services', 'description' => 'Add new services'],
            ['name' => 'services.edit', 'display_name' => 'Edit Services', 'group' => 'services', 'description' => 'Edit existing services'],
            ['name' => 'services.delete', 'display_name' => 'Delete Services', 'group' => 'services', 'description' => 'Delete services'],
            
            // Training
            ['name' => 'training.view', 'display_name' => 'View Training', 'group' => 'training', 'description' => 'View training records'],
            ['name' => 'training.create', 'display_name' => 'Create Training', 'group' => 'training', 'description' => 'Add new training records'],
            ['name' => 'training.edit', 'display_name' => 'Edit Training', 'group' => 'training', 'description' => 'Edit training records'],
            ['name' => 'training.delete', 'display_name' => 'Delete Training', 'group' => 'training', 'description' => 'Delete training records'],
            
            // Gallery/Media
            ['name' => 'gallery.view', 'display_name' => 'View Gallery', 'group' => 'gallery', 'description' => 'View media gallery'],
            ['name' => 'gallery.upload', 'display_name' => 'Upload Media', 'group' => 'gallery', 'description' => 'Upload new media files'],
            ['name' => 'gallery.edit', 'display_name' => 'Edit Media', 'group' => 'gallery', 'description' => 'Edit media details'],
            ['name' => 'gallery.delete', 'display_name' => 'Delete Media', 'group' => 'gallery', 'description' => 'Delete media files'],
            
            // Settings
            ['name' => 'settings.view', 'display_name' => 'View Settings', 'group' => 'settings', 'description' => 'View site settings'],
            ['name' => 'settings.edit', 'display_name' => 'Edit Settings', 'group' => 'settings', 'description' => 'Modify site settings'],
            
            // Users
            ['name' => 'users.view', 'display_name' => 'View Users', 'group' => 'users', 'description' => 'View user list'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'group' => 'users', 'description' => 'Add new users'],
            ['name' => 'users.edit', 'display_name' => 'Edit Users', 'group' => 'users', 'description' => 'Edit user details'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'group' => 'users', 'description' => 'Delete users'],
            
            // Roles & Permissions
            ['name' => 'roles.manage', 'display_name' => 'Manage Roles', 'group' => 'roles', 'description' => 'Assign permissions to roles'],
        ];

        $now = now();
        foreach ($permissions as $perm) {
            DB::table('permissions')->insert([
                ...$perm,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Assign all permissions to admin
        $allPermIds = DB::table('permissions')->pluck('id');
        foreach ($allPermIds as $permId) {
            DB::table('role_permissions')->insert([
                'role' => 'admin',
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Assign default permissions to editor
        $editorPerms = [
            'dashboard.view', 'messages.view', 'messages.manage',
            'content.view', 'content.edit',
            'projects.view', 'projects.create', 'projects.edit',
            'services.view', 'services.create', 'services.edit',
            'training.view', 'training.create', 'training.edit',
            'gallery.view', 'gallery.upload', 'gallery.edit',
        ];
        $editorPermIds = DB::table('permissions')->whereIn('name', $editorPerms)->pluck('id');
        foreach ($editorPermIds as $permId) {
            DB::table('role_permissions')->insert([
                'role' => 'editor',
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Assign default permissions to viewer
        $viewerPerms = [
            'dashboard.view', 'messages.view',
            'projects.view', 'services.view', 'training.view', 'gallery.view',
        ];
        $viewerPermIds = DB::table('permissions')->whereIn('name', $viewerPerms)->pluck('id');
        foreach ($viewerPermIds as $permId) {
            DB::table('role_permissions')->insert([
                'role' => 'viewer',
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
};
