<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Permission extends Model
{
    protected $fillable = ['name', 'display_name', 'group', 'description'];

    /**
     * Get all permissions grouped by category
     */
    public static function getAllGrouped(): array
    {
        return static::orderBy('group')->orderBy('display_name')->get()->groupBy('group')->toArray();
    }

    /**
     * Get permissions for a specific role
     */
    public static function getForRole(string $role): array
    {
        // Admin has all permissions
        if ($role === 'admin') {
            return Cache::remember("permissions.admin", 3600, function () {
                return static::pluck('name')->toArray();
            });
        }

        return Cache::remember("permissions.{$role}", 3600, function () use ($role) {
            return DB::table('role_permissions')
                ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                ->where('role_permissions.role', $role)
                ->pluck('permissions.name')
                ->toArray();
        });
    }

    /**
     * Check if a role has a specific permission
     */
    public static function roleHas(string $role, string $permission): bool
    {
        // Admin always has all permissions
        if ($role === 'admin') {
            return true;
        }

        $permissions = static::getForRole($role);
        return in_array($permission, $permissions);
    }

    /**
     * Sync permissions for a role
     */
    public static function syncForRole(string $role, array $permissionIds): void
    {
        // Don't allow modifying admin permissions
        if ($role === 'admin') {
            return;
        }

        DB::table('role_permissions')->where('role', $role)->delete();

        $now = now();
        foreach ($permissionIds as $permId) {
            DB::table('role_permissions')->insert([
                'role' => $role,
                'permission_id' => $permId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Clear cache
        Cache::forget("permissions.{$role}");
    }

    /**
     * Get all role permissions as a map
     */
    public static function getRolePermissionsMap(): array
    {
        $roles = \App\Models\Role::getAllRoles();
        $result = [];
        foreach ($roles as $role) {
            $result[$role['name']] = static::getForRole($role['name']);
        }
        return $result;
    }

    /**
     * Clear all permission caches
     */
    public static function clearCache(?string $role = null): void
    {
        if ($role) {
            Cache::forget("permissions.{$role}");
        } else {
            // Clear for all known roles
            $roles = \App\Models\Role::getAllRoles();
            foreach ($roles as $r) {
                Cache::forget("permissions.{$r['name']}");
            }
        }
    }
}
