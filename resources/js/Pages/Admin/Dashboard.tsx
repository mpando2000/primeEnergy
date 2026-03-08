import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
    id: number;
    title: string;
    category: string;
    status: string;
    created_at: string;
}

interface Category {
    name: string;
    count: number;
    percent: number;
}

interface Activity {
    icon: string;
    color: string;
    text: string;
    time: string;
}

interface Stats {
    totalProjects: number;
    publishedProjects: number;
    newMessages: number;
    pageViews: number;
    teamMembers: number;
}

interface Props {
    stats: Stats;
    recentProjects: Project[];
    categories: Category[];
    activities: Activity[];
}

const categoryColors = [
    'var(--admin-primary)',
    '#2196F3',
    'var(--admin-accent-yellow)',
    'var(--admin-accent-red)',
    '#9C27B0',
    '#00BCD4',
    '#FF5722',
];

export default function Dashboard({ 
    stats: initialStats, 
    recentProjects: initialProjects, 
    categories: initialCategories, 
    activities: initialActivities 
}: Props) {
    const [stats, setStats] = useState<Stats>(initialStats);
    const [recentProjects, setRecentProjects] = useState<Project[]>(initialProjects);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Poll for updates every 30 seconds
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await axios.get('/admin/dashboard/stats');
                const data = response.data;
                
                setStats(data.stats);
                setRecentProjects(data.recentProjects);
                setCategories(data.categories);
                setActivities(data.activities);
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(pollInterval);
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const statCards = [
        { icon: 'fa-project-diagram', value: formatNumber(stats.totalProjects), label: 'Total Projects', color: 'green' },
        { icon: 'fa-envelope', value: formatNumber(stats.newMessages), label: 'New Messages', color: 'yellow' },
        { icon: 'fa-eye', value: formatNumber(stats.pageViews), label: 'Page Views', color: 'blue' },
        { icon: 'fa-users', value: formatNumber(stats.teamMembers), label: 'Team Members', color: 'red' },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="stat-card">
                        <div className={`stat-icon ${stat.color}`}>
                            <i className={`fas ${stat.icon}`}></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Recent Projects */}
                <div className="card">
                    <div className="card-header">
                        <h3>Recent Projects</h3>
                        <Link href="/admin/projects" className="btn-link">View All</Link>
                    </div>
                    <div className="card-body">
                        {recentProjects.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                <i className="fas fa-folder-open" style={{ fontSize: '32px', marginBottom: '10px' }}></i>
                                <p>No projects yet</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Project Name</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentProjects.map((project) => (
                                        <tr key={project.id}>
                                            <td>{project.title}</td>
                                            <td>{project.category}</td>
                                            <td>
                                                <span className={`status-badge ${project.status.toLowerCase()}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                    {/* Projects by Category */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Projects by Category</h3>
                        </div>
                        <div className="card-body">
                            {categories.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    <p>No categories yet</p>
                                </div>
                            ) : (
                                <div className="category-stats">
                                    {categories.map((cat, idx) => (
                                        <div key={idx} className="category-item">
                                            <div className="category-info">
                                                <span className="category-name">{cat.name}</span>
                                                <span className="category-count">{cat.count}</span>
                                            </div>
                                            <div className="category-bar">
                                                <div 
                                                    className="category-progress" 
                                                    style={{ width: `${cat.percent}%`, background: categoryColors[idx % categoryColors.length] }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Recent Activity</h3>
                        </div>
                        <div className="card-body">
                            {activities.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    <p>No recent activity</p>
                                </div>
                            ) : (
                                <ul className="activity-list">
                                    {activities.map((activity, idx) => (
                                        <li key={idx} className="activity-item">
                                            <div className={`activity-icon ${activity.color}`}>
                                                <i className={`fas ${activity.icon}`}></i>
                                            </div>
                                            <div className="activity-content">
                                                <p>{activity.text}</p>
                                                <span>{activity.time}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
