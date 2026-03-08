import { useState, useEffect, ReactNode } from 'react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import '../../css/admin.css';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    body: string | null;
    icon: string;
    icon_bg: string;
    link: string | null;
    time: string;
}

// Initialize sidebar state before render to prevent flash
const getInitialSidebarState = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('adminSidebarCollapsed') === 'true';
    }
    return false;
};

const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('adminTheme') === 'dark';
    }
    return false;
};

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarState);
    const [darkMode, setDarkMode] = useState(getInitialTheme);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url, props } = usePage();
    const auth = props.auth as { 
        user?: { name: string; email: string; role?: string; role_display_name?: string; avatar?: string | null };
        permissions?: string[];
    };
    const unreadMessagesCount = (props.unreadMessagesCount as number) || 0;
    const notificationsCount = (props.notificationsCount as number) || 0;
    const recentNotifications = (props.recentNotifications as NotificationItem[]) || [];
    const user = auth?.user;
    const permissions = auth?.permissions || [];
    
    // Helper to check if user has permission
    const can = (permission: string) => {
        if (user?.role === 'admin') return true;
        return permissions.includes(permission);
    };
    
    const getUserInitials = () => {
        if (!user?.name) return 'AU';
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };
    
    const getRoleLabel = (role?: string, displayName?: string) => {
        if (displayName) return displayName;
        // Fallback for predefined roles
        switch (role) {
            case 'admin': return 'Administrator';
            case 'editor': return 'Editor';
            case 'viewer': return 'Viewer';
            default: return role ? ucFirst(role) : 'User';
        }
    };

    const ucFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('adminSidebarCollapsed', String(newState));
    };

    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem('adminTheme', newTheme ? 'dark' : 'light');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const isActive = (path: string) => url.startsWith(path);
    const isAdmin = user?.role === 'admin';

    // Build menu items based on permissions
    const mainItems = [
        can('dashboard.view') && { href: '/admin/dashboard', icon: 'fa-home', label: 'Dashboard' },
        can('messages.view') && { href: '/admin/messages', icon: 'fa-envelope', label: 'Messages', badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
        { href: '/admin/video-conference', icon: 'fa-video', label: 'Video Conference' },
    ].filter(Boolean);

    const contentItems = [
        can('content.view') && { href: '/admin/content', icon: 'fa-edit', label: 'Content' },
        can('projects.view') && { href: '/admin/projects', icon: 'fa-project-diagram', label: 'Projects' },
        can('services.view') && { href: '/admin/services', icon: 'fa-cogs', label: 'Services' },
        can('projects.view') && { href: '/admin/investments', icon: 'fa-map-marked-alt', label: 'Land Investments' },
        can('training.view') && { href: '/admin/training', icon: 'fa-graduation-cap', label: 'Training' },
        can('gallery.view') && { href: '/admin/gallery', icon: 'fa-images', label: 'Gallery' },
    ].filter(Boolean);

    const settingsItems = [
        can('settings.view') && { href: '/admin/settings', icon: 'fa-sliders-h', label: 'Site Settings' },
        can('users.view') && { href: '/admin/users', icon: 'fa-users', label: 'Users' },
        can('roles.manage') && { href: '/admin/roles', icon: 'fa-user-shield', label: 'Roles & Permissions' },
    ].filter(Boolean);

    const menuItems = [
        mainItems.length > 0 && { section: 'Main', items: mainItems },
        contentItems.length > 0 && { section: 'Content Management', items: contentItems },
        settingsItems.length > 0 && { section: 'Settings', items: settingsItems },
    ].filter(Boolean) as { section: string; items: { href: string; icon: string; label: string; badge?: number }[] }[];

    return (
        <>
        <Head title={title} />
        <div className={`admin-wrapper ${darkMode ? 'dark-mode' : ''}`}>
            {/* Sidebar Overlay for mobile */}
            {mobileMenuOpen && (
                <div className="sidebar-overlay show" onClick={toggleMobileMenu} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/prime-logo.png" alt="Logo" className="sidebar-logo" />
                    <h2>PrimeVolt ELECTRIC</h2>
                    <p>Admin Panel</p>
                </div>
                
                <nav className="sidebar-menu">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="menu-section">
                            <div className="menu-section-title">{section.section}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`menu-item ${isActive(item.href) ? 'active' : ''}`}
                                    data-title={item.label}
                                >
                                    <span className="menu-icon-wrapper">
                                        <i className={`fas ${item.icon}`}></i>
                                        {item.badge && <span className="badge-dot">{item.badge}</span>}
                                    </span>
                                    <span>{item.label}</span>
                                    {item.badge && <span className="badge">{item.badge}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="collapse-btn" onClick={toggleSidebar}>
                    <i className="fas fa-chevron-left"></i>
                    <span>Collapse</span>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
                {/* Header */}
                <header className="admin-header">
                    <div className="header-left">
                        <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
                            <i className="fas fa-bars"></i>
                        </button>
                        <h1>{title}</h1>
                    </div>
                    
                    <div className="header-right">
                        <div className="header-icon notification-wrapper" onClick={() => { setNotificationOpen(!notificationOpen); setUserDropdownOpen(false); }}>
                            <i className="fas fa-bell"></i>
                            {notificationsCount > 0 && <span className="notification-badge">{notificationsCount > 9 ? '9+' : notificationsCount}</span>}
                            {notificationOpen && (
                                <div className="notification-dropdown show" onClick={(e) => e.stopPropagation()}>
                                    <div className="notification-header">
                                        <h4>Notifications</h4>
                                        {notificationsCount > 0 && (
                                            <button 
                                                className="mark-all-read"
                                                onClick={() => router.post('/admin/notifications/mark-all-read')}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="notification-list">
                                        {recentNotifications.length === 0 ? (
                                            <div className="notification-empty">
                                                <i className="fas fa-bell-slash"></i>
                                                <p>No new notifications</p>
                                            </div>
                                        ) : (
                                            recentNotifications.map((notif) => (
                                                <Link 
                                                    key={notif.id} 
                                                    href={notif.link || '/admin/dashboard'} 
                                                    className="notification-item"
                                                    onClick={() => router.patch(`/admin/notifications/${notif.id}/read`)}
                                                >
                                                    <div className="notif-icon" style={{ background: notif.icon_bg }}>
                                                        <i className={`fas ${notif.icon}`}></i>
                                                    </div>
                                                    <div className="notif-content">
                                                        <div className="notif-title">{notif.title}</div>
                                                        {notif.body && <div className="notif-body">{notif.body}</div>}
                                                        <div className="notif-time">{notif.time}</div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                    {notificationsCount > 5 && (
                                        <div className="notification-footer">
                                            {notificationsCount - 5} more notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="header-icon" onClick={toggleTheme}>
                            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                        </div>
                        <div className="user-profile" onClick={() => { setUserDropdownOpen(!userDropdownOpen); setNotificationOpen(false); }}>
                            <div className="user-info">
                                <div className="name">{user?.name || 'Admin User'}</div>
                                <div className="role">{getRoleLabel(user?.role, user?.role_display_name)}</div>
                            </div>
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="user-avatar-img" />
                                ) : (
                                    getUserInitials()
                                )}
                            </div>
                            {userDropdownOpen && (
                                <div className="user-dropdown show">
                                    <Link href="/admin/profile" className="dropdown-item">
                                        <i className="fas fa-user"></i> My Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link href="/admin/settings" className="dropdown-item">
                                            <i className="fas fa-cog"></i> Settings
                                        </Link>
                                    )}
                                    <div className="dropdown-divider"></div>
                                    <Link href="/logout" method="post" as="button" className="dropdown-item logout">
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
        </>
    );
}
