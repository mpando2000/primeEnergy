import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
    id: number;
    title: string;
    category: string;
    status: string;
    client: string | null;
    year: string | null;
    location: string | null;
    description: string | null;
    scope_of_work: string[] | null;
    highlights: string | null;
    images: string[] | null;
    translations?: {
        en: {
            title: string;
            description: string | null;
            scope_of_work: string[] | null;
            highlights: string | null;
        };
        sw: {
            title: string;
            description: string | null;
            scope_of_work: string[] | null;
            highlights: string | null;
        };
    };
}

interface Props {
    project: Project;
    otherProjects: Project[];
}

export default function ProjectDetail({ project, otherProjects }: Props) {
    const { t, language } = useLanguage();
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

    // Helper to get translated content
    const getTranslatedContent = () => {
        if (project.translations && project.translations[language]) {
            return {
                title: project.translations[language].title || project.title,
                description: project.translations[language].description || project.description,
                scope_of_work: project.translations[language].scope_of_work || project.scope_of_work,
                highlights: project.translations[language].highlights || project.highlights,
            };
        }
        return {
            title: project.title,
            description: project.description,
            scope_of_work: project.scope_of_work,
            highlights: project.highlights,
        };
    };

    const content = getTranslatedContent();
    const images = project.images || ['https://via.placeholder.com/1200x600?text=No+Image'];
    const scopeOfWork = content.scope_of_work || [];

    // Helper function to translate status
    const getTranslatedStatus = (status: string) => {
        const statusMap: Record<string, string> = {
            'Published': t('projectDetail.statuses.completed'),
            'Draft': t('projectDetail.statuses.pending')
        };
        return statusMap[status] || status;
    };

    // Helper function to translate category
    const getTranslatedCategory = (category: string) => {
        const categoryMap: Record<string, string> = {
            'Electrical': t('projectDetail.categories.electrical'),
            'HVAC': t('projectDetail.categories.hvac'),
            'ICT Services': t('projectDetail.categories.ict'),
            'Security': t('projectDetail.categories.security'),
            'Distribution': t('projectDetail.categories.distribution')
        };
        return categoryMap[category] || category;
    };

    return (
        <MainLayout currentPage={t('nav.projects')}>
            <Head title={project.title} />

            {/* Page Banner */}
            <section style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <img 
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=300&fit=crop" 
                    alt="Project Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="banner-overlay"></div>
            </section>

            {/* Breadcrumb */}
            <div style={{ background: '#f5f5f5', padding: '15px 0', fontSize: '14px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <Link href="/" className="breadcrumb-link text-theme-primary" style={{ textDecoration: 'none' }}>{t('projectDetail.breadcrumb.home')}</Link>
                    {' / '}
                    <Link href="/projects" className="breadcrumb-link text-theme-primary" style={{ textDecoration: 'none' }}>{t('projectDetail.breadcrumb.projects')}</Link>
                    {' / '}
                    <span style={{ color: '#212121' }}>{project.title}</span>
                </div>
            </div>

            {/* Main Content */}
            <section style={{ padding: '40px 0 60px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }} className="project-detail-grid">
                        {/* Main Content Area */}
                        <div>
                            <h2 className="text-theme-primary" style={{ fontSize: '28px', marginBottom: '25px' }}>{content.title}</h2>

                            {/* Project Main Image */}
                            <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
                                <img 
                                    src={images[activeGalleryIndex]}
                                    alt={project.title}
                                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Project Gallery */}
                            {images.length > 1 && (
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                    {images.map((img, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => setActiveGalleryIndex(index)}
                                            style={{
                                                width: '100px',
                                                height: '70px',
                                                borderRadius: '6px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: `3px solid ${activeGalleryIndex === index ? 'var(--color-accent-yellow)' : 'transparent'}`,
                                                transition: 'border-color 0.3s'
                                            }}
                                            className="gallery-thumb"
                                        >
                                            <img 
                                                src={img}
                                                alt={`Gallery ${index + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Project Description */}
                            <div>
                                {content.description && (
                                    <>
                                        <h3 className="theme-heading text-theme-primary" style={{ fontSize: '20px', margin: '25px 0 15px' }}>
                                            {t('projectDetail.overview')}
                                        </h3>
                                        <p style={{ marginBottom: '15px', color: '#555', lineHeight: '1.8' }}>{content.description}</p>
                                    </>
                                )}

                                {scopeOfWork.length > 0 && (
                                    <>
                                        <h3 className="theme-heading text-theme-primary" style={{ fontSize: '20px', margin: '25px 0 15px' }}>
                                            {t('projectDetail.scope')}
                                        </h3>
                                        <ul style={{ margin: '15px 0 15px 25px', color: '#555' }}>
                                            {scopeOfWork.map((item, index) => (
                                                <li key={index} style={{ marginBottom: '8px' }}>{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {content.highlights && (
                                    <>
                                        <h3 className="theme-heading text-theme-primary" style={{ fontSize: '20px', margin: '25px 0 15px' }}>
                                            {t('projectDetail.highlights')}
                                        </h3>
                                        <p style={{ marginBottom: '15px', color: '#555', lineHeight: '1.8' }}>{content.highlights}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ background: '#f5f5f5', padding: '25px', borderRadius: '8px' }}>
                                <h3 className="theme-sidebar-title">{t('projectDetail.details.title')}</h3>
                                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                    {project.client && (
                                        <li style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                                            <span style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}><i className="fas fa-user text-theme-primary" style={{ marginRight: '8px' }}></i>{t('projectDetail.details.client')}</span>
                                            <span style={{ fontWeight: '600', color: '#212121' }}>{project.client}</span>
                                        </li>
                                    )}
                                    {project.location && (
                                        <li style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                                            <span style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}><i className="fas fa-map-marker-alt text-theme-primary" style={{ marginRight: '8px' }}></i>{t('projectDetail.details.location')}</span>
                                            <span style={{ fontWeight: '600', color: '#212121' }}>{project.location}</span>
                                        </li>
                                    )}
                                    <li style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                                        <span style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}><i className="fas fa-folder text-theme-primary" style={{ marginRight: '8px' }}></i>{t('projectDetail.details.category')}</span>
                                        <span style={{ fontWeight: '600', color: '#212121' }}>{getTranslatedCategory(project.category)}</span>
                                    </li>
                                    {project.year && (
                                        <li style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                                            <span style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}><i className="fas fa-calendar text-theme-primary" style={{ marginRight: '8px' }}></i>{t('projectDetail.details.year')}</span>
                                            <span style={{ fontWeight: '600', color: '#212121' }}>{project.year}</span>
                                        </li>
                                    )}
                                    <li style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}><i className="fas fa-check-circle text-theme-primary" style={{ marginRight: '8px' }}></i>{t('projectDetail.details.status')}</span>
                                        <span className="text-theme-primary" style={{ fontWeight: '600' }}>{getTranslatedStatus(project.status)}</span>
                                    </li>
                                </ul>
                            </div>

                            {otherProjects.length > 0 && (
                                <div style={{ background: '#f5f5f5', padding: '25px', borderRadius: '8px' }}>
                                    <h3 className="theme-sidebar-title">{t('projectDetail.otherProjects')}</h3>
                                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                        {otherProjects.map((p, index) => (
                                            <li key={p.id} style={{ marginBottom: index < otherProjects.length - 1 ? '15px' : 0 }}>
                                                <Link 
                                                    href={`/projects/${p.id}`}
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '12px', 
                                                        textDecoration: 'none', 
                                                        color: '#212121',
                                                        transition: 'color 0.3s'
                                                    }}
                                                    className="other-project-link"
                                                >
                                                    <img 
                                                        src={(p.images || [])[0] || 'https://via.placeholder.com/100x70'}
                                                        alt={p.title}
                                                        style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                    <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{p.title}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <Link 
                                href="/projects"
                                className="back-btn bg-theme-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#ffffff',
                                    padding: '12px 25px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    transition: 'background 0.3s'
                                }}
                            >
                                <i className="fas fa-arrow-left"></i> {t('projectDetail.backToProjects')}
                            </Link>
                        </aside>
                    </div>
                </div>
            </section>

            <style>{`
                .project-detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 40px;
                }
                .breadcrumb-link:hover {
                    color: var(--color-accent-yellow) !important;
                }
                .gallery-thumb:hover {
                    border-color: var(--color-primary) !important;
                }
                .other-project-link:hover {
                    color: var(--color-primary) !important;
                }
                .back-btn:hover {
                    background: var(--color-primary-dark) !important;
                }
                @media (max-width: 992px) {
                    .project-detail-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 768px) {
                    .project-detail-grid img {
                        height: 250px !important;
                    }
                }
            `}</style>
        </MainLayout>
    );
}
