import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageBanner {
    id: number;
    page_key: string;
    page_name: string;
    image_url: string | null;
}

interface Project {
    id: number;
    title: string;
    category: string;
    images: string[] | null;
    translations?: {
        en: { title: string };
        sw: { title: string };
    };
}

interface Service {
    id: number;
    name: string;
}

interface Props {
    projects: Project[];
    services: Service[];
}

export default function Projects({ projects: dbProjects, services = [] }: Props) {
    const { t, language } = useLanguage();
    const props = usePage().props as unknown as { pageBanners: Record<string, PageBanner> };
    const { pageBanners } = props;
    const [activeFilter, setActiveFilter] = useState('all');
    
    const bannerImage = pageBanners?.projects?.image_url || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=300&fit=crop';

    // Helper to get translated project title
    const getProjectTitle = (project: Project) => {
        if (project.translations && project.translations[language]) {
            return project.translations[language].title || project.title;
        }
        return project.title;
    };

    // Generate category keys from services
    const categoryToKey = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

    // Calculate counts from actual data
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: dbProjects.length };
        dbProjects.forEach(p => {
            const key = categoryToKey(p.category);
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [dbProjects]);

    // Build filters from services
    const filters = useMemo(() => {
        const baseFilters = [{ key: 'all', label: t('projects.filters.all'), count: categoryCounts.all || 0 }];
        const serviceFilters = services.map(s => ({
            key: categoryToKey(s.name),
            label: s.name,
            count: categoryCounts[categoryToKey(s.name)] || 0,
        }));
        return [...baseFilters, ...serviceFilters];
    }, [services, categoryCounts, t]);

    const filteredProjects = activeFilter === 'all' 
        ? dbProjects 
        : dbProjects.filter(p => categoryToKey(p.category) === activeFilter);

    return (
        <MainLayout currentPage="Our Projects">
            <Head title={t('projects.pageTitle')} />

            {/* Page Banner */}
            <section className="page-banner">
                <img 
                    src={bannerImage} 
                    alt={t('projects.pageTitle')}
                />
                <div className="banner-overlay"></div>
            </section>

            {/* Main Content */}
            <section style={{ padding: '40px 0 60px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }} className="projects-grid">
                        {/* Sidebar */}
                        <aside style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', height: 'fit-content' }} className="projects-sidebar">
                            <h3 className="theme-sidebar-title">{t('projects.sidebar.title')}</h3>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                {services.map((service) => (
                                    <li key={service.id} style={{ marginBottom: '10px' }}>
                                        <a 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); setActiveFilter(categoryToKey(service.name)); }}
                                            style={{ 
                                                color: activeFilter === categoryToKey(service.name) ? '#fff' : '#212121', 
                                                background: activeFilter === categoryToKey(service.name) ? 'var(--color-primary)' : 'transparent',
                                                textDecoration: 'none', 
                                                display: 'block', 
                                                padding: '8px 12px', 
                                                borderRadius: '4px', 
                                                transition: 'all 0.3s' 
                                            }}
                                            className="project-menu-link"
                                        >
                                            {service.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        {/* Main Content Area */}
                        <div>
                            <h3 className="theme-heading text-theme-primary" style={{ fontSize: '24px', marginBottom: '20px' }}>
                                {t('projects.content.title')}
                            </h3>

                            {/* Filter Tabs */}
                            <div style={{ margin: '30px 0 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px' }}>
                                {filters.map((filter, index) => (
                                    <span key={filter.key} style={{ display: 'flex', alignItems: 'center' }}>
                                        <button
                                            onClick={() => setActiveFilter(filter.key)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: activeFilter === filter.key ? 'var(--color-primary)' : '#212121',
                                                padding: '5px 10px',
                                                transition: 'color 0.3s',
                                                fontFamily: 'inherit',
                                                fontWeight: activeFilter === filter.key ? '600' : '400'
                                            }}
                                            className="filter-btn"
                                        >
                                            {filter.label} <span style={{ fontSize: '12px', color: '#999' }}>{filter.count}</span>
                                        </button>
                                        {index < filters.length - 1 && <span style={{ color: '#ccc' }}>/</span>}
                                    </span>
                                ))}
                            </div>

                            {/* Projects Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginTop: '20px' }} className="projects-cards-grid">
                                {filteredProjects.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                                        <i className="fas fa-folder-open" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                                        <p>No projects found</p>
                                    </div>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={`/projects/${project.id}`}
                                            style={{
                                                display: 'block',
                                                textDecoration: 'none',
                                                background: '#ffffff',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                transition: 'transform 0.3s, box-shadow 0.3s'
                                            }}
                                            className="project-card"
                                        >
                                            <div style={{ height: '200px', overflow: 'hidden' }}>
                                                <img 
                                                    src={(project.images || [])[0] || 'https://via.placeholder.com/600x400?text=No+Image'} 
                                                    alt={project.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                                    className="project-card-img"
                                                />
                                            </div>
                                            <div style={{ padding: '20px', background: '#ffffff', position: 'relative' }}>
                                                <div className="bg-theme-accent" style={{
                                                    position: 'absolute',
                                                    top: '0',
                                                    left: '20px',
                                                    right: '20px',
                                                    height: '3px',
                                                    transform: 'translateY(-50%)'
                                                }}></div>
                                                <h4 style={{ fontSize: '15px', color: '#212121', lineHeight: '1.4', transition: 'color 0.3s', margin: 0 }} className="project-card-title">
                                                    {getProjectTitle(project)}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .projects-grid {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    gap: 30px;
                }
                .project-menu-link:hover {
                    background: var(--color-primary) !important;
                    color: #ffffff !important;
                }
                .filter-btn:hover {
                    color: var(--color-primary) !important;
                }
                .project-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 20px rgba(0,0,0,0.15) !important;
                }
                .project-card:hover .project-card-img {
                    transform: scale(1.05);
                }
                .project-card:hover .project-card-title {
                    color: var(--color-primary) !important;
                }
                @media (max-width: 992px) {
                    .projects-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .projects-sidebar {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .projects-cards-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </MainLayout>
    );
}
