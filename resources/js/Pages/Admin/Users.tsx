import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    last_login_at: string | null;
    created_at: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    is_system: boolean;
}

interface Props {
    users: User[];
    roles: Role[];
}

export default function Users({ users: initialUsers, roles }: Props) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    const permissions = auth?.permissions || [];
    const canCreate = permissions.includes('users.create');
    const canEdit = permissions.includes('users.edit');
    const canDelete = permissions.includes('users.delete');

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'viewer', status: 'active' as User['status'], password: '' });
    const [saving, setSaving] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const filteredUsers = initialUsers.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || u.role === roleFilter;
        const matchesStatus = !statusFilter || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalCount = initialUsers.length;
    const activeCount = initialUsers.filter(u => u.status === 'active').length;
    const adminCount = initialUsers.filter(u => u.role === 'admin').length;

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'role-admin';
            case 'editor': return 'role-editor';
            case 'viewer': return 'role-viewer';
            default: return 'role-custom';
        }
    };
    
    const getRoleDisplayName = (roleName: string) => {
        const role = roles.find(r => r.name === roleName);
        return role?.display_name || roleName.charAt(0).toUpperCase() + roleName.slice(1);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString();
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'viewer', status: 'active', password: '' });
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, status: user.status, password: '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.email.trim() || saving) return;
        if (!editingUser && !formData.password.trim()) return;
        setSaving(true);

        if (editingUser) {
            router.put(`/admin/users/${editingUser.id}`, formData, {
                onSuccess: () => { closeModal(); setSaving(false); },
                onError: () => setSaving(false)
            });
        } else {
            router.post('/admin/users', formData, {
                onSuccess: () => { closeModal(); setSaving(false); },
                onError: () => setSaving(false)
            });
        }
    };

    const openDeleteDialog = (user: User) => {
        setDeleteTarget(user);
        setDeleteConfirmText('');
        setShowDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        setDeleteConfirmText('');
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleteConfirmText !== deleteTarget.email || saving) return;
        setSaving(true);
        router.delete(`/admin/users/${deleteTarget.id}`, {
            onSuccess: () => { closeDeleteDialog(); setSaving(false); },
            onError: () => setSaving(false)
        });
    };

    const toggleStatus = (userId: number) => {
        router.patch(`/admin/users/${userId}/toggle-status`);
    };

    return (
        <AdminLayout title="Manage Users">
            <div className="stats-bar">
                <div className="stat-item">Total Users: <strong>{totalCount}</strong></div>
                <div className="stat-item">Active: <strong>{activeCount}</strong></div>
                <div className="stat-item">Admins: <strong>{adminCount}</strong></div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role.name} value={role.name}>{role.display_name}</option>
                        ))}
                    </select>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                {canCreate && <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i> Add User
                </button>}
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No users found</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-sm">{getInitials(user.name)}</div>
                                                <div className="user-details">
                                                    <span className="user-name">{user.name} {user.id === currentUserId && <span style={{ color: '#666', fontSize: '12px' }}>(You)</span>}</span>
                                                    <span className="user-email">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`role-badge ${getRoleColor(user.role)}`}>{getRoleDisplayName(user.role)}</span></td>
                                        <td>
                                            <label className="status-toggle">
                                                <input type="checkbox" checked={user.status === 'active'} onChange={() => toggleStatus(user.id)} disabled={user.id === currentUserId} />
                                                <span className="toggle-track"></span>
                                                <span className={`toggle-label ${user.status === 'active' ? 'active' : 'inactive'}`}>{user.status === 'active' ? 'Active' : 'Inactive'}</span>
                                            </label>
                                        </td>
                                        <td>{formatDate(user.last_login_at)}</td>
                                        <td>
                                            <div className="action-btns">
                                                {canEdit && <button className="action-btn edit" onClick={() => openEditModal(user)} title="Edit"><i className="fas fa-edit"></i></button>}
                                                {canDelete && <button className="action-btn delete" onClick={() => openDeleteDialog(user)} title="Delete" disabled={user.id === currentUserId || (user.role === 'admin' && adminCount <= 1)}><i className="fas fa-trash"></i></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay active">
                    <div className="modal modal-service">
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                                <input type="password" placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    {roles.map(role => (
                                        <option key={role.name} value={role.name}>{role.display_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                <i className="fas fa-save"></i> {saving ? 'Saving...' : (editingUser ? 'Update' : 'Create')} User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteDialog && deleteTarget && (
                <div className="modal-overlay active">
                    <div className="modal modal-delete">
                        <div className="modal-header">
                            <h3>Delete User</h3>
                            <button className="modal-close" onClick={closeDeleteDialog}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-warning">This action <strong>cannot be undone</strong>. This will permanently delete the user account.</p>
                            <p className="delete-confirm-label">Please type <strong>{deleteTarget.email}</strong> to confirm.</p>
                            <input type="text" className="delete-confirm-input" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder={deleteTarget.email} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger btn-block" disabled={deleteConfirmText !== deleteTarget.email || saving} onClick={confirmDelete}>
                                {saving ? 'Deleting...' : 'I understand, delete this user'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
