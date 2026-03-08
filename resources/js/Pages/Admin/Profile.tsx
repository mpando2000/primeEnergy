import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    status: string;
    created_at: string;
    last_login_at: string | null;
}

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [activeSection, setActiveSection] = useState('personal');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Personal info form
    const [personalData, setPersonalData] = useState({
        name: user.name,
        email: user.email,
    });

    // Password form
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const sections = [
        { key: 'personal', label: 'Personal Information', icon: 'fa-user' },
        { key: 'password', label: 'Change Password', icon: 'fa-lock' },
        { key: 'activity', label: 'Account Activity', icon: 'fa-history' },
    ];

    const handlePersonalSave = () => {
        setSaving(true);
        router.patch('/admin/profile', personalData, {
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            },
            onFinish: () => setSaving(false),
        });
    };

    const handlePasswordSave = () => {
        setSaving(true);
        router.put('/admin/profile/password', passwordData, {
            onSuccess: () => {
                setSaved(true);
                setPasswordData({ current_password: '', password: '', password_confirmation: '' });
                setTimeout(() => setSaved(false), 3000);
            },
            onFinish: () => setSaving(false),
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            alert('Image must be less than 8MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        router.post('/admin/profile/avatar', formData, {
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            },
            onFinish: () => setUploading(false),
        });
    };

    const handleRemoveAvatar = () => {
        if (confirm('Remove your profile picture?')) {
            router.delete('/admin/profile/avatar');
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <AdminLayout title="My Profile">
            <div className="profile-layout">
                {/* Sidebar Navigation */}
                <div className="profile-nav">
                    <div className="profile-avatar-section">
                        <div 
                            className="profile-avatar-wrapper"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar">{getInitials(user.name)}</div>
                            )}
                            <div className="avatar-overlay">
                                <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </div>
                    <div className="nav-items">
                        {sections.map((section) => (
                            <a
                                key={section.key}
                                href="#"
                                className={`nav-item ${activeSection === section.key ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); setActiveSection(section.key); }}
                            >
                                <i className={`fas ${section.icon}`}></i>
                                {section.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="profile-content">
                    {/* Personal Information */}
                    {activeSection === 'personal' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2><i className="fas fa-user"></i> Personal Information</h2>
                                <p>Update your personal details</p>
                            </div>
                            <div className="section-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={personalData.name}
                                        onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && <span className="error-text">{errors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={personalData.email}
                                        onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input type="text" value={user.role} disabled className="disabled-input" />
                                    <small>Contact administrator to change your role</small>
                                </div>
                                <div className="form-actions">
                                    {saved && <span className="save-success"><i className="fas fa-check"></i> Saved!</span>}
                                    <button className="btn btn-primary" onClick={handlePersonalSave} disabled={saving}>
                                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Change Password */}
                    {activeSection === 'password' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2><i className="fas fa-lock"></i> Change Password</h2>
                                <p>Ensure your account is using a secure password</p>
                            </div>
                            <div className="section-body">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                    {errors.current_password && <span className="error-text">{errors.current_password}</span>}
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        placeholder="Enter new password"
                                    />
                                    {errors.password && <span className="error-text">{errors.password}</span>}
                                    <small>Minimum 8 characters</small>
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className="form-actions">
                                    {saved && <span className="save-success"><i className="fas fa-check"></i> Password Updated!</span>}
                                    <button className="btn btn-primary" onClick={handlePasswordSave} disabled={saving}>
                                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : <><i className="fas fa-key"></i> Update Password</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Activity */}
                    {activeSection === 'activity' && (
                        <div className="content-section">
                            <div className="section-header">
                                <h2><i className="fas fa-history"></i> Account Activity</h2>
                                <p>View your account information and activity</p>
                            </div>
                            <div className="section-body">
                                <div className="activity-grid">
                                    <div className="activity-card">
                                        <div className="activity-icon"><i className="fas fa-calendar-plus"></i></div>
                                        <div className="activity-info">
                                            <span className="activity-label">Account Created</span>
                                            <span className="activity-value">{formatDate(user.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="activity-card">
                                        <div className="activity-icon"><i className="fas fa-sign-in-alt"></i></div>
                                        <div className="activity-info">
                                            <span className="activity-label">Last Login</span>
                                            <span className="activity-value">{formatDate(user.last_login_at)}</span>
                                        </div>
                                    </div>
                                    <div className="activity-card">
                                        <div className="activity-icon"><i className="fas fa-shield-alt"></i></div>
                                        <div className="activity-info">
                                            <span className="activity-label">Account Status</span>
                                            <span className={`activity-value status-${user.status}`}>
                                                {user.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="activity-card">
                                        <div className="activity-icon"><i className="fas fa-user-tag"></i></div>
                                        <div className="activity-info">
                                            <span className="activity-label">Role</span>
                                            <span className="activity-value">{user.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .profile-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 25px;
                }

                .profile-nav {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    overflow: hidden;
                    height: fit-content;
                    position: sticky;
                    top: 80px;
                }

                .profile-avatar-section {
                    background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
                    padding: 30px 20px;
                    text-align: center;
                    color: #fff;
                }

                .profile-avatar-wrapper {
                    width: 90px;
                    height: 90px;
                    margin: 0 auto 15px;
                    position: relative;
                    cursor: pointer;
                }

                .profile-avatar-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid rgba(255,255,255,0.3);
                }

                .profile-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 700;
                    border: 3px solid rgba(255,255,255,0.3);
                }

                .avatar-overlay {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .profile-avatar-wrapper:hover .avatar-overlay {
                    opacity: 1;
                }

                .avatar-overlay i {
                    color: #fff;
                    font-size: 20px;
                }

                .profile-avatar-section h3 {
                    margin: 0 0 5px;
                    font-size: 18px;
                }

                .profile-avatar-section p {
                    margin: 0 0 10px;
                    font-size: 13px;
                    opacity: 0.8;
                }

                .role-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    background: rgba(255,255,255,0.2);
                }

                .nav-items {
                    padding: 15px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 15px;
                    color: #333;
                    text-decoration: none;
                    border-radius: 8px;
                    margin-bottom: 5px;
                    transition: all 0.3s;
                    font-size: 14px;
                }

                .nav-item i {
                    width: 18px;
                    text-align: center;
                    color: #666;
                }

                .nav-item:hover {
                    background: #f5f5f5;
                }

                .nav-item.active {
                    background: var(--admin-primary);
                    color: #fff;
                }

                .nav-item.active i {
                    color: #fff;
                }

                .profile-content {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    overflow: hidden;
                    height: fit-content;
                }

                .section-header {
                    padding: 25px;
                    background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
                    color: #fff;
                }

                .section-header h2 {
                    margin: 0 0 5px;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .section-header p {
                    margin: 0;
                    opacity: 0.8;
                    font-size: 14px;
                }

                .section-body {
                    padding: 25px;
                }

                /* Avatar Upload */
                .avatar-upload-group {
                    margin-bottom: 25px;
                    padding-bottom: 25px;
                    border-bottom: 1px solid #eee;
                }

                .avatar-upload-area {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                }

                .avatar-preview {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    position: relative;
                    cursor: pointer;
                    flex-shrink: 0;
                }

                .avatar-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 700;
                    color: #fff;
                }

                .avatar-edit-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .avatar-preview:hover .avatar-edit-overlay {
                    opacity: 1;
                }

                .avatar-edit-overlay i {
                    color: #fff;
                    font-size: 24px;
                }

                .avatar-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .avatar-actions small {
                    color: #888;
                    font-size: 12px;
                }

                .btn-outline {
                    background: transparent;
                    border: 2px solid var(--admin-primary);
                    color: var(--admin-primary);
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.3s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn-outline:hover {
                    background: var(--admin-primary);
                    color: #fff;
                }

                .btn-outline-danger {
                    background: transparent;
                    border: 2px solid #e53935;
                    color: #e53935;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.3s;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn-outline-danger:hover {
                    background: #e53935;
                    color: #fff;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                    font-size: 14px;
                }

                .form-group input {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.3s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: var(--admin-primary);
                }

                .form-group input.disabled-input {
                    background: #f5f5f5;
                    color: #888;
                    cursor: not-allowed;
                }

                .form-group small {
                    display: block;
                    margin-top: 5px;
                    color: #888;
                    font-size: 12px;
                }

                .error-text {
                    display: block;
                    margin-top: 5px;
                    color: #e53935;
                    font-size: 12px;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 15px;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }

                .save-success {
                    color: var(--admin-primary);
                    font-size: 14px;
                    font-weight: 500;
                }

                .activity-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .activity-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border-left: 4px solid var(--admin-primary);
                }

                .activity-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    background: var(--admin-primary);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .activity-info {
                    display: flex;
                    flex-direction: column;
                }

                .activity-label {
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 3px;
                }

                .activity-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }

                .activity-value.status-active {
                    color: var(--admin-primary);
                }

                .activity-value.status-inactive {
                    color: #e53935;
                }

                /* Dark mode */
                .dark-mode .profile-nav,
                .dark-mode .profile-content {
                    background: #16213e;
                }

                .dark-mode .nav-item {
                    color: #ccc;
                }

                .dark-mode .nav-item i {
                    color: #888;
                }

                .dark-mode .nav-item:hover {
                    background: #1a1a2e;
                }

                .dark-mode .form-group label {
                    color: #ccc;
                }

                .dark-mode .form-group input {
                    background: #1a1a2e;
                    border-color: #2a3f5f;
                    color: #e0e0e0;
                }

                .dark-mode .form-group input.disabled-input {
                    background: #0f0f1a;
                }

                .dark-mode .activity-card {
                    background: #1a1a2e;
                }

                .dark-mode .activity-value {
                    color: #e0e0e0;
                }

                .dark-mode .avatar-upload-group {
                    border-color: #2a3f5f;
                }

                @media (max-width: 900px) {
                    .profile-layout {
                        grid-template-columns: 1fr;
                    }

                    .profile-nav {
                        position: static;
                    }

                    .activity-grid {
                        grid-template-columns: 1fr;
                    }

                    .avatar-upload-area {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
