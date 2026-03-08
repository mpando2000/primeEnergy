import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    group: string;
    description: string | null;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
}

interface Props {
    permissions: Record<string, Permission[]>;
    rolePermissions: Record<string, string[]>;
    roles: Role[];
}

export default function Roles({ permissions, rolePermissions, roles }: Props) {
    const { auth } = usePage().props as unknown as { auth: { permissions: string[] } };
    const canEdit = auth.permissions?.includes('roles.manage') ?? false;
    const canCreate = auth.permissions?.includes('roles.manage') ?? false;
    const canDelete = auth.permissions?.includes('roles.manage') ?? false;
    
    const [activeRole, setActiveRole] = useState<string>(roles[0]?.name || 'admin');
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, number[]>>(() => {
        const initial: Record<string, number[]> = {};
        Object.entries(rolePermissions).forEach(([role, perms]) => {
            const permIds: number[] = [];
            Object.values(permissions).flat().forEach(p => {
                if (perms.includes(p.name)) {
                    permIds.push(p.id);
                }
            });
            initial[role] = permIds;
        });
        return initial;
    });
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', display_name: '', description: '' });

    const currentRole = roles.find(r => r.name === activeRole);
    const isLocked = currentRole?.name === 'admin';
    const isSystem = currentRole?.is_system || false;

    const groupLabels: Record<string, string> = {
        dashboard: 'Dashboard',
        messages: 'Messages',
        content: 'Content Management',
        projects: 'Projects',
        services: 'Services',
        training: 'Training',
        gallery: 'Gallery & Media',
        settings: 'Site Settings',
        users: 'User Management',
        roles: 'Roles & Permissions',
    };

    const togglePermission = (permId: number) => {
        if (isLocked) return;
        
        setSelectedPermissions(prev => {
            const current = prev[activeRole] || [];
            const updated = current.includes(permId)
                ? current.filter(id => id !== permId)
                : [...current, permId];
            return { ...prev, [activeRole]: updated };
        });
        setHasChanges(true);
    };

    const toggleGroup = (groupPerms: Permission[]) => {
        if (isLocked) return;
        
        const groupIds = groupPerms.map(p => p.id);
        const current = selectedPermissions[activeRole] || [];
        const allSelected = groupIds.every(id => current.includes(id));
        
        setSelectedPermissions(prev => {
            const updated = allSelected
                ? current.filter(id => !groupIds.includes(id))
                : [...new Set([...current, ...groupIds])];
            return { ...prev, [activeRole]: updated };
        });
        setHasChanges(true);
    };

    const handleSave = () => {
        if (isLocked || saving) return;
        setSaving(true);

        router.put(`/admin/roles/${activeRole}`, {
            permissions: selectedPermissions[activeRole] || [],
        }, {
            onSuccess: () => {
                setSaving(false);
                setHasChanges(false);
            },
            onError: () => setSaving(false),
        });
    };

    const handleAddRole = () => {
        if (!newRole.name || !newRole.display_name) return;
        
        router.post('/admin/roles', {
            name: newRole.name.toLowerCase().replace(/\s+/g, '_'),
            display_name: newRole.display_name,
            description: newRole.description,
            permissions: [],
        }, {
            onSuccess: () => {
                setShowAddModal(false);
                setNewRole({ name: '', display_name: '', description: '' });
            },
        });
    };

    const handleDeleteRole = () => {
        if (!currentRole || isSystem) return;
        
        router.delete(`/admin/roles/${activeRole}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setActiveRole(roles[0]?.name || 'admin');
            },
        });
    };

    const isPermissionSelected = (permId: number) => {
        return (selectedPermissions[activeRole] || []).includes(permId);
    };

    const isGroupFullySelected = (groupPerms: Permission[]) => {
        const current = selectedPermissions[activeRole] || [];
        return groupPerms.every(p => current.includes(p.id));
    };

    const isGroupPartiallySelected = (groupPerms: Permission[]) => {
        const current = selectedPermissions[activeRole] || [];
        const selected = groupPerms.filter(p => current.includes(p.id));
        return selected.length > 0 && selected.length < groupPerms.length;
    };

    return (
        <AdminLayout title="Roles & Permissions">
            <div className="roles-page">
                {/* Role Selector */}
                <div className="roles-list-panel">
                    <div className="roles-list-header">
                        <h3>Roles</h3>
                        {canCreate && <button className="add-role-btn" onClick={() => setShowAddModal(true)} title="Add New Role">
                            <i className="fas fa-plus"></i>
                        </button>}
                    </div>
                    {roles.map(role => (
                        <button
                            key={role.name}
                            className={`role-btn ${activeRole === role.name ? 'active' : ''} ${role.name === 'admin' ? 'locked' : ''}`}
                            onClick={() => {
                                setActiveRole(role.name);
                                setHasChanges(false);
                            }}
                        >
                            <div className="role-info">
                                <span className="role-name">{role.display_name}</span>
                                <span className="role-desc">{role.description}</span>
                                <span className="role-users">{role.users_count} user{role.users_count !== 1 ? 's' : ''}</span>
                            </div>
                            {role.name === 'admin' && <i className="fas fa-lock"></i>}
                            {role.is_system && role.name !== 'admin' && <i className="fas fa-shield-alt" title="System Role"></i>}
                        </button>
                    ))}
                </div>

                {/* Permissions Grid */}
                <div className="permissions-panel">
                    <div className="permissions-header">
                        <div>
                            <h2>{currentRole?.display_name} Permissions</h2>
                            <p>{currentRole?.description}</p>
                        </div>
                        <div className="header-actions">
                            {!isSystem && currentRole && canDelete && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowDeleteModal(true)}
                                    title="Delete Role"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            )}
                            {!isLocked && canEdit && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={saving || !hasChanges}
                                >
                                    {saving ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                                    ) : (
                                        <><i className="fas fa-save"></i> Save Changes</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {isLocked && (
                        <div className="locked-notice">
                            <i className="fas fa-info-circle"></i>
                            Administrator permissions cannot be modified. Admins have full access to all features.
                        </div>
                    )}

                    <div className="permissions-grid">
                        {Object.entries(permissions).map(([group, groupPerms]) => (
                            <div key={group} className="permission-group">
                                <div className="group-header">
                                    <label className={`group-checkbox ${isLocked || !canEdit ? 'disabled' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={isGroupFullySelected(groupPerms)}
                                            ref={el => {
                                                if (el) el.indeterminate = isGroupPartiallySelected(groupPerms);
                                            }}
                                            onChange={() => toggleGroup(groupPerms)}
                                            disabled={isLocked || !canEdit}
                                        />
                                        <span className="checkmark"></span>
                                        <span className="group-name">{groupLabels[group] || group}</span>
                                    </label>
                                </div>
                                <div className="group-permissions">
                                    {groupPerms.map(perm => (
                                        <label 
                                            key={perm.id} 
                                            className={`permission-item ${isLocked || !canEdit ? 'disabled' : ''}`}
                                            title={perm.description || ''}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isPermissionSelected(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                disabled={isLocked || !canEdit}
                                            />
                                            <span className="checkmark"></span>
                                            <span className="perm-name">{perm.display_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Role Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Role</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Role Name (internal)</label>
                                <input
                                    type="text"
                                    value={newRole.name}
                                    onChange={e => setNewRole({ ...newRole, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    placeholder="e.g., content_manager"
                                />
                                <small>Lowercase letters, numbers, and underscores only</small>
                            </div>
                            <div className="form-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={newRole.display_name}
                                    onChange={e => setNewRole({ ...newRole, display_name: e.target.value })}
                                    placeholder="e.g., Content Manager"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={newRole.description}
                                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                                    placeholder="e.g., Can manage website content"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleAddRole}
                                disabled={!newRole.name || !newRole.display_name}
                            >
                                <i className="fas fa-plus"></i> Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Role Modal */}
            {showDeleteModal && currentRole && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Role</h3>
                            <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete the role <strong>{currentRole.display_name}</strong>?</p>
                            {currentRole.users_count > 0 && (
                                <div className="warning-notice">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    This role has {currentRole.users_count} user(s) assigned. You must reassign them to another role before deleting.
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="btn btn-danger" 
                                onClick={handleDeleteRole}
                                disabled={currentRole.users_count > 0}
                            >
                                <i className="fas fa-trash"></i> Delete Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .roles-page {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 25px;
                    min-height: calc(100vh - 180px);
                }

                .roles-list-panel {
                    background: #fff;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    height: fit-content;
                }

                .roles-list-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .roles-list-header h3 {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .add-role-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: var(--admin-primary);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                .add-role-btn:hover {
                    background: var(--admin-primary-dark);
                    transform: scale(1.05);
                }

                .role-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 15px;
                    background: #f9f9f9;
                    border: 2px solid transparent;
                    border-radius: 10px;
                    cursor: pointer;
                    margin-bottom: 10px;
                    text-align: left;
                    transition: all 0.3s;
                }

                .role-btn:hover {
                    background: #f0f0f0;
                }

                .role-btn.active {
                    background: #e8f5e9;
                    border-color: var(--admin-primary);
                }

                .role-btn.locked {
                    opacity: 0.8;
                }

                .role-btn .fa-lock,
                .role-btn .fa-shield-alt {
                    color: #999;
                    font-size: 12px;
                }

                .role-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .role-name {
                    font-weight: 600;
                    color: #333;
                }

                .role-desc {
                    font-size: 12px;
                    color: #666;
                }

                .role-users {
                    font-size: 11px;
                    color: #999;
                    margin-top: 2px;
                }

                .permissions-panel {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    overflow: hidden;
                }

                .permissions-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 25px;
                    background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
                    color: #fff;
                }

                .permissions-header h2 {
                    margin: 0 0 5px 0;
                    font-size: 22px;
                }

                .permissions-header p {
                    margin: 0;
                    opacity: 0.8;
                    font-size: 14px;
                }

                .header-actions {
                    display: flex;
                    gap: 10px;
                }

                .header-actions .btn {
                    background: #fff;
                    color: var(--admin-primary);
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                }

                .header-actions .btn-danger {
                    background: #ffebee;
                    color: #c62828;
                }

                .header-actions .btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .header-actions .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .locked-notice {
                    background: #fff3e0;
                    color: #e65100;
                    padding: 15px 25px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                }

                .permissions-grid {
                    padding: 25px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                .permission-group {
                    background: #f9f9f9;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .group-header {
                    background: #f0f0f0;
                    padding: 12px 15px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .group-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    color: #333;
                }

                .group-checkbox.disabled {
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .group-permissions {
                    padding: 10px 15px;
                }

                .permission-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    border-bottom: 1px solid #eee;
                }

                .permission-item:last-child {
                    border-bottom: none;
                }

                .permission-item.disabled {
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .permission-item input,
                .group-checkbox input {
                    display: none;
                }

                .checkmark {
                    width: 18px;
                    height: 18px;
                    border: 2px solid #ccc;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .permission-item input:checked + .checkmark,
                .group-checkbox input:checked + .checkmark {
                    background: var(--admin-primary);
                    border-color: var(--admin-primary);
                }

                .permission-item input:checked + .checkmark::after,
                .group-checkbox input:checked + .checkmark::after {
                    content: '✓';
                    color: #fff;
                    font-size: 12px;
                    font-weight: bold;
                }

                .group-checkbox input:indeterminate + .checkmark {
                    background: var(--admin-primary);
                    border-color: var(--admin-primary);
                }

                .group-checkbox input:indeterminate + .checkmark::after {
                    content: '−';
                    color: #fff;
                    font-size: 14px;
                    font-weight: bold;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal {
                    background: #fff;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 450px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: #999;
                    cursor: pointer;
                }

                .modal-body {
                    padding: 20px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: #333;
                }

                .form-group input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--admin-primary);
                }

                .form-group small {
                    display: block;
                    margin-top: 5px;
                    color: #999;
                    font-size: 12px;
                }

                .warning-notice {
                    background: #fff3e0;
                    color: #e65100;
                    padding: 12px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 15px;
                    font-size: 14px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 20px;
                    border-top: 1px solid #eee;
                }

                .modal-footer .btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                    transition: all 0.3s;
                }

                .modal-footer .btn-secondary {
                    background: #f0f0f0;
                    color: #666;
                }

                .modal-footer .btn-primary {
                    background: var(--admin-primary);
                    color: #fff;
                }

                .modal-footer .btn-danger {
                    background: #c62828;
                    color: #fff;
                }

                .modal-footer .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Dark mode */
                .dark-mode .roles-list-panel,
                .dark-mode .permissions-panel {
                    background: #16213e;
                }

                .dark-mode .role-btn {
                    background: #1a1a2e;
                }

                .dark-mode .role-btn:hover {
                    background: #2a3f5f;
                }

                .dark-mode .role-btn.active {
                    background: #1b3a1b;
                    border-color: var(--admin-primary);
                }

                .dark-mode .role-name {
                    color: #e0e0e0;
                }

                .dark-mode .permission-group {
                    background: #1a1a2e;
                }

                .dark-mode .group-header {
                    background: #2a3f5f;
                    border-color: #3a4f6f;
                }

                .dark-mode .group-checkbox {
                    color: #e0e0e0;
                }

                .dark-mode .permission-item {
                    color: #ccc;
                    border-color: #2a3f5f;
                }

                .dark-mode .modal {
                    background: #16213e;
                }

                .dark-mode .modal-header,
                .dark-mode .modal-footer {
                    border-color: #2a3f5f;
                }

                .dark-mode .modal-header h3 {
                    color: #e0e0e0;
                }

                .dark-mode .form-group label {
                    color: #ccc;
                }

                .dark-mode .form-group input {
                    background: #1a1a2e;
                    border-color: #2a3f5f;
                    color: #e0e0e0;
                }

                @media (max-width: 900px) {
                    .roles-page {
                        grid-template-columns: 1fr;
                    }

                    .roles-list-panel {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                    }

                    .roles-list-header {
                        width: 100%;
                    }

                    .role-btn {
                        flex: 1;
                        min-width: 150px;
                        margin-bottom: 0;
                    }

                    .permissions-header {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
