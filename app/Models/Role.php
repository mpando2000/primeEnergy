<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Role extends Model
{
    protected $fillable = ['name', 'display_name', 'description', 'is_system'];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    /**
     * Get all roles
     */
    public static function getAllRoles(): array
    {
        return Cache::remember('roles.all', 3600, function () {
            return static::orderByRaw("FIELD(name, 'admin', 'editor', 'viewer') DESC")
                ->orderBy('display_name')
                ->get()
                ->toArray();
        });
    }

    /**
     * Get role by name
     */
    public static function getByName(string $name): ?self
    {
        return static::where('name', $name)->first();
    }

    /**
     * Check if role exists
     */
    public static function exists(string $name): bool
    {
        return static::where('name', $name)->exists();
    }

    /**
     * Get role names for validation
     */
    public static function getValidRoleNames(): array
    {
        return static::pluck('name')->toArray();
    }

    /**
     * Clear roles cache
     */
    public static function clearCache(): void
    {
        Cache::forget('roles.all');
    }

    /**
     * Users with this role
     */
    public function users()
    {
        return User::where('role', $this->name)->get();
    }

    /**
     * Count users with this role
     */
    public function usersCount(): int
    {
        return User::where('role', $this->name)->count();
    }
}
