<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $permissions = [
            ['name' => 'certificates.view', 'display_name' => 'View Certificates', 'description' => 'View company certificates'],
            ['name' => 'certificates.create', 'display_name' => 'Upload Certificates', 'description' => 'Upload company certificates'],
            ['name' => 'certificates.edit', 'display_name' => 'Edit Certificates', 'description' => 'Edit and publish company certificates'],
            ['name' => 'certificates.delete', 'display_name' => 'Delete Certificates', 'description' => 'Delete company certificates'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $permission['name']],
                [
                    'display_name' => $permission['display_name'],
                    'group' => 'certificates',
                    'description' => $permission['description'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('name', array_column($permissions, 'name'))
            ->pluck('id', 'name');

        foreach ($permissionIds as $name => $permissionId) {
            $roles = ['admin'];

            if ($name !== 'certificates.delete') {
                $roles[] = 'editor';
            }

            if ($name === 'certificates.view') {
                $roles[] = 'viewer';
            }

            foreach ($roles as $role) {
                DB::table('role_permissions')->updateOrInsert(
                    ['role' => $role, 'permission_id' => $permissionId],
                    ['created_at' => $now, 'updated_at' => $now]
                );
            }
        }

        foreach (['admin', 'editor', 'viewer'] as $role) {
            Cache::forget("permissions.{$role}");
        }
    }

    public function down(): void
    {
        $permissionIds = DB::table('permissions')
            ->whereIn('name', [
                'certificates.view',
                'certificates.create',
                'certificates.edit',
                'certificates.delete',
            ])
            ->pluck('id');

        DB::table('role_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();

        foreach (['admin', 'editor', 'viewer'] as $role) {
            Cache::forget("permissions.{$role}");
        }
    }
};
