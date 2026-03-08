<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $permissions = Permission::getAllGrouped();
        $roles = Role::getAllRoles();
        
        // Build role permissions map
        $rolePermissions = [];
        foreach ($roles as $role) {
            $rolePermissions[$role['name']] = Permission::getForRole($role['name']);
        }

        // Add user counts to roles
        $rolesWithCounts = array_map(function ($role) {
            $role['users_count'] = User::where('role', $role['name'])->count();
            return $role;
        }, $roles);

        return Inertia::render('Admin/Roles', [
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
            'roles' => $rolesWithCounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-z][a-z0-9_]*$/',
                'unique:roles,name',
            ],
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'integer|exists:permissions,id',
        ], [
            'name.regex' => 'Role name must start with a letter and contain only lowercase letters, numbers, and underscores.',
        ]);

        // Create the role
        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
            'is_system' => false,
        ]);

        // Assign permissions
        if (!empty($validated['permissions'])) {
            Permission::syncForRole($role->name, $validated['permissions']);
        }

        Role::clearCache();

        return redirect()->back()->with('success', "Role '{$role->display_name}' created successfully.");
    }

    public function update(Request $request, string $roleName)
    {
        $role = Role::getByName($roleName);
        
        if (!$role) {
            return redirect()->back()->with('error', 'Role not found.');
        }

        // Cannot modify admin role permissions
        if ($roleName === 'admin') {
            return redirect()->back()->with('error', 'Administrator permissions cannot be modified.');
        }

        $validated = $request->validate([
            'display_name' => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        // Update role details if provided (only for non-system roles)
        if (!$role->is_system) {
            if (isset($validated['display_name'])) {
                $role->display_name = $validated['display_name'];
            }
            if (array_key_exists('description', $validated)) {
                $role->description = $validated['description'];
            }
            $role->save();
        }

        // Update permissions
        Permission::syncForRole($roleName, $validated['permissions'] ?? []);

        Role::clearCache();
        Permission::clearCache($roleName);

        return redirect()->back()->with('success', "Role '{$role->display_name}' updated successfully.");
    }

    public function destroy(Request $request, string $roleName)
    {
        $role = Role::getByName($roleName);
        
        if (!$role) {
            return redirect()->back()->with('error', 'Role not found.');
        }

        // Cannot delete system roles
        if ($role->is_system) {
            return redirect()->back()->with('error', 'System roles cannot be deleted.');
        }

        // Check if any users have this role
        $usersCount = User::where('role', $roleName)->count();
        if ($usersCount > 0) {
            return redirect()->back()->with('error', "Cannot delete role. {$usersCount} user(s) are assigned to this role. Please reassign them first.");
        }

        // Delete role permissions
        \DB::table('role_permissions')->where('role', $roleName)->delete();
        
        // Delete the role
        $role->delete();

        Role::clearCache();
        Permission::clearCache();

        return redirect()->back()->with('success', "Role '{$role->display_name}' deleted successfully.");
    }
}
