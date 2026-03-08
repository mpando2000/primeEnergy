import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubService {
    id: number;
    name: string;
    translations?: {
        en: { name: string };
        sw: { name: string };
    };
}

interface Service {
    id: number;
    name: string;
    description: string;
    content: string | null;
    images: string[] | null;
    icon: string;
    sub_services: SubService[];
    translations?: {
        en: { name: string; description: string | null; content: string | null };
        sw: { name: string; description: string | null; content: string | null };
    };
}

interface PageBanner {
    id: number;
    page_key: string;
    page_name: string;
    image_url: string | null;
}

interface Props {
    services: Service[];
}

export default function Services({ services }: Props) {
    const { t, language } = useLanguage();
    const props = usePage().props as unknown as { pageBanners: Record<string, PageBanner> };
    const { pageBanners } = props;
    const [activeTab, setActiveTab] = useState<number | 'overview'>('overview');
    
    const bannerImage = pageBanners?.services?.image_url || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&h=300&fit=crop';
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);

    // Helper to get translated service content
    const getServiceContent = (service: Service) => {
        if (service.translations && service.translations[language]) {
            return {
                name: service.translations[language].name || service.name,
                description: service.translations[language].description || service.description,
                content: service.translations[language].content || service.content,
            };
        }
        return { name: service.name, description: service.description, content: service.content };
    };

    // Helper to get translated sub-service name
    const getSubServiceName = (sub: SubService) => {
        if (sub.translations && sub.translations[language]) {
            return sub.translations[language].name || sub.name;
        }
        return sub.name;
    };

    const openLightbox = (images: string[], index: number) => {
        setLightboxImages(images);
        setCurrentIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const changeSlide = (direction: number) => {
        let newIndex = currentIndex + direction;
        if (newIndex >= lightboxImages.length) newIndex = 0;
        if (newIndex < 0) newIndex = lightboxImages.length - 1;
        setCurrentIndex(newIndex);
    };

    const activeService = activeTab !== 'overview' ? services.find(s => s.id === activeTab) : null;

    // Collect all images from all services for overview gallery
    const allServiceImages = services.flatMap(s => 
        (s.images || []).map(img => ({ src: img, serviceName: getServiceContent(s).name, serviceId: s.id }))
    ).slice(0, 6);

    const renderMarkdown = (content: string) => {
        // Process line by line for better control
        const lines = content.split('\n');
        let html = '';
        let inList = false;
        let listType = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Headings
            if (line.startsWith('## ')) {
                if (inList) { html += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
                html += `<h2 class="md-heading">${line.slice(3)}</h2>`;
                continue;
            }
            if (line.startsWith('### ')) {
                if (inList) { html += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
                html += `<h3 class="md-subheading">${line.slice(4)}</h3>`;
                continue;
            }
            
            // Bullet list
            if (line.startsWith('- ')) {
                if (!inList || listType !== 'ul') {
                    if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
                    html += '<ul class="md-list">';
                    inList = true;
                    listType = 'ul';
                }
                html += `<li>${line.slice(2)}</li>`;
                continue;
            }
            
            // Numbered list
            const numMatch = line.match(/^(\d+)\. (.+)$/);
            if (numMatch) {
                if (!inList || listType !== 'ol') {
                    if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
                    html += '<ol class="md-list">';
                    inList = true;
                    listType = 'ol';
                }
                html += `<li>${numMatch[2]}</li>`;
                continue;
            }
            
            // Close list if we hit a non-list line
            if (inList && line.trim() !== '') {
                html += listType === 'ul' ? '</ul>' : '</ol>';
                inList = false;
            }
            
            // Empty line = paragraph break
            if (line.trim() === '') {
                if (inList) { html += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
                continue;
            }
            
            // Regular paragraph
            html += `<p>${line}</p>`;
        }
        
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        
        // Apply inline formatting
        html = html
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        return html;
    };

    const renderContent = () => {
        if (activeTab === 'overview') {
            return (
                <>
                    <h3 className="theme-heading text-theme-primary" style={{ fontSize: '24px', marginBottom: '20px' }}>{t('services.content.title')}</h3>
                    <p style={{ marginBottom: '15px', color: '#555' }}>{t('services.content.p1')}</p>
                    <p style={{ marginBottom: '15px', color: '#555' }}>{t('services.content.p2')}</p>

                    {/* Service Cards Grid */}
                    <div className="service-cards-grid">
                        {services.map((service) => {
                            const content = getServiceContent(service);
                            return (
                            <div 
                                key={service.id} 
                                className="service-preview-card"
                                onClick={() => setActiveTab(service.id)}
                            >
                                {service.images && service.images.length > 0 ? (
                                    <div className="card-image">
                                        <img src={service.images[0]} alt={content.name} />
                                        {service.images.length > 1 && (
                                            <span className="image-count">
                                                <i className="fas fa-images"></i> {service.images.length}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="card-image card-image-placeholder">
                                        <i className={`fas ${service.icon}`}></i>
                                    </div>
                                )}
                                <div className="card-content">
                                    <h4><i className={`fas ${service.icon}`}></i> {content.name}</h4>
                                    {content.description && <p>{content.description}</p>}
                                    <span className="view-more">View Details <i className="fas fa-arrow-right"></i></span>
                                </div>
                            </div>
                        )})}
                    </div>
                </>
            );
        }

        if (activeService) {
            const content = getServiceContent(activeService);
            return (
                <>
                    {/* Hero Image */}
                    {activeService.images && activeService.images.length > 0 && (
                        <div className="service-hero-image" onClick={() => openLightbox(activeService.images!, 0)}>
                            <img src={activeService.images[0]} alt={content.name} />
                            <div className="hero-overlay">
                                <i className="fas fa-expand"></i>
                            </div>
                        </div>
                    )}

                    <h3 className="theme-heading text-theme-primary" style={{ fontSize: '28px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className={`fas ${activeService.icon}`}></i>
                        {content.name}
                    </h3>
                    
                    {content.description && (
                        <p style={{ marginBottom: '25px', color: '#666', fontSize: '17px', lineHeight: '1.7', fontStyle: 'italic' }}>{content.description}</p>
                    )}

                    {/* Rich Content */}
                    {content.content && (
                        <div 
                            className="service-content-body"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.content) }}
                        />
                    )}

                    {/* Image Gallery */}
                    {activeService.images && activeService.images.length > 1 && (
                        <div className="service-gallery-section">
                            <h4><i className="fas fa-images"></i> {t('services.gallery')}</h4>
                            <div className="service-gallery-grid">
                                {activeService.images.map((img, index) => (
                                    <div 
                                        key={index} 
                                        className="gallery-thumb"
                                        onClick={() => openLightbox(activeService.images!, index)}
                                    >
                                        <img src={img} alt={`${content.name} ${index + 1}`} />
                                        <div className="thumb-overlay">
                                            <i className="fas fa-search-plus"></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sub-services */}
                    {activeService.sub_services && activeService.sub_services.length > 0 && (
                        <div className="sub-services-section">
                            <h4><i className="fas fa-check-double"></i> {t('services.whatWeOffer')}</h4>
                            <div className="sub-services-grid">
                                {activeService.sub_services.map((sub) => (
                                    <div key={sub.id} className="sub-service-item">
                                        <i className="fas fa-check-circle"></i>
                                        <span>{getSubServiceName(sub)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA Box */}
                    <div className="service-cta-box">
                        <h4>
                            <i className="fas fa-phone-alt"></i>
                            {t('services.cta.title')}
                        </h4>
                        <p>
                            {t('services.cta.text').replace('{service}', content.name.toLowerCase())}
                        </p>
                        <Link href="/contact" className="cta-button">
                            <i className="fas fa-envelope"></i>
                            {t('services.cta.button')}
                        </Link>
                    </div>
                </>
            );
        }

        return null;
    };

    return (
        <MainLayout currentPage="Our Services">
            <Head title={t('services.pageTitle')} />

            <section className="page-banner">
                <img src={bannerImage} alt={t('services.pageTitle')} />
                <div className="banner-overlay"></div>
            </section>

            <section style={{ padding: '40px 0 60px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    {/* Mobile Tab Selector */}
                    <div className="mobile-service-select">
                        <select 
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value === 'overview' ? 'overview' : Number(e.target.value))}
                        >
                            <option value="overview">{t('services.sidebar.title')}</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>{getServiceContent(service).name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="services-grid">
                        {/* Sidebar */}
                        <aside className="services-sidebar">
                            <h3 className="theme-sidebar-title">{t('services.sidebar.title')}</h3>
                            <ul>
                                {services.map((service) => {
                                    const content = getServiceContent(service);
                                    return (
                                    <li key={service.id}>
                                        <a 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); setActiveTab(service.id); }}
                                            className={`service-menu-link ${activeTab === service.id ? 'active' : ''}`}
                                        >
                                            <i className={`fas ${service.icon}`}></i>
                                            {content.name}
                                            {service.images && service.images.length > 0 && (
                                                <span className="sidebar-image-badge">{service.images.length}</span>
                                            )}
                                        </a>
                                    </li>
                                )})}
                            </ul>
                        </aside>

                        {/* Main Content */}
                        <div className="content-main">
                            {renderContent()}
                        </div>

                        {/* Projects Sidebar */}
                        <aside className="projects-sidebar">
                            <div className="bg-theme-primary projects-box">
                                <i className="fas fa-building text-theme-accent"></i>
                                <h4>
                                    <Link href="/projects" className="projects-link">{t('services.projectsBox.title')}</Link>
                                </h4>
                                <p>{t('services.projectsBox.text')}</p>
                                <div className="bg-theme-accent projects-icon-circle">
                                    <i className="fas fa-bolt text-theme-dark"></i>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxOpen && lightboxImages.length > 0 && (
                <div className="lightbox-overlay" onClick={(e) => e.target === e.currentTarget && closeLightbox()}>
                    <span className="lightbox-close" onClick={closeLightbox}>&times;</span>
                    <span className="lightbox-nav lightbox-prev" onClick={() => changeSlide(-1)}>&#10094;</span>
                    <div className="lightbox-content">
                        <img src={lightboxImages[currentIndex]} alt="Gallery" />
                        <div className="lightbox-counter">{currentIndex + 1} / {lightboxImages.length}</div>
                    </div>
                    <span className="lightbox-nav lightbox-next" onClick={() => changeSlide(1)}>&#10095;</span>
                </div>
            )}

            <style>{`
                /* Services Grid Layout */
                .services-grid { display: grid; grid-template-columns: 280px 1fr 280px; gap: 30px; }
                
                /* Sidebar Styles */
                .services-sidebar { background: #f8f9fa; padding: 25px; border-radius: 12px; height: fit-content; position: sticky; top: 100px; }
                .services-sidebar ul { list-style: none; margin: 0; padding: 0; }
                .services-sidebar li { margin-bottom: 8px; }
                .service-menu-link { color: #333; text-decoration: none; display: flex; align-items: center; gap: 12px; padding: 12px 15px; border-radius: 8px; transition: all 0.3s; font-size: 14px; }
                .service-menu-link i { width: 20px; text-align: center; }
                .service-menu-link:hover, .service-menu-link.active { background: var(--color-primary); color: #fff; }
                .sidebar-image-badge { margin-left: auto; background: rgba(251,192,45,0.2); color: var(--color-primary); padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
                .service-menu-link.active .sidebar-image-badge { background: rgba(255,255,255,0.2); color: #fff; }
                
                /* Service Cards Grid (Overview) */
                .service-cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 30px; }
                .service-preview-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 15px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.3s; }
                .service-preview-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
                .card-image { height: 160px; overflow: hidden; position: relative; }
                .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
                .service-preview-card:hover .card-image img { transform: scale(1.1); }
                .card-image-placeholder { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-dark) 100%); display: flex; align-items: center; justify-content: center; }
                .card-image-placeholder i { font-size: 48px; color: rgba(255,255,255,0.3); }
                .image-count { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 10px; border-radius: 15px; font-size: 12px; }
                .card-content { padding: 18px; }
                .card-content h4 { font-size: 16px; color: var(--color-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
                .card-content p { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .view-more { font-size: 13px; color: var(--color-accent-yellow); font-weight: 600; display: flex; align-items: center; gap: 5px; }
                .view-more i { transition: transform 0.3s; }
                .service-preview-card:hover .view-more i { transform: translateX(5px); }
                
                /* Service Detail View */
                .service-hero-image { border-radius: 12px; overflow: hidden; margin-bottom: 25px; position: relative; cursor: pointer; max-height: 350px; }
                .service-hero-image img { width: 100%; height: 100%; object-fit: cover; }
                .hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .hero-overlay i { color: #fff; font-size: 32px; opacity: 0; transform: scale(0.8); transition: all 0.3s; }
                .service-hero-image:hover .hero-overlay { background: rgba(0,0,0,0.4); }
                .service-hero-image:hover .hero-overlay i { opacity: 1; transform: scale(1); }
                
                /* Rich Content Styles */
                .service-content-body { color: #444; line-height: 1.7; margin-bottom: 30px; }
                .service-content-body .md-heading { font-size: 20px; color: var(--color-primary); margin: 20px 0 10px; font-weight: 600; }
                .service-content-body .md-subheading { font-size: 17px; color: #333; margin: 18px 0 10px; font-weight: 600; }
                .service-content-body .md-list { margin: 10px 0 15px 20px; padding: 0; }
                .service-content-body .md-list li { margin-bottom: 6px; color: #555; padding-left: 5px; }
                .service-content-body ul.md-list { list-style-type: disc; }
                .service-content-body ol.md-list { list-style-type: decimal; }
                .service-content-body p { margin-bottom: 12px; }
                
                /* Gallery Section */
                .service-gallery-section { margin: 35px 0; padding-top: 25px; border-top: 1px solid #eee; }
                .service-gallery-section h4 { font-size: 18px; color: #333; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
                .service-gallery-section h4 i { color: var(--color-primary); }
                .service-gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
                .gallery-thumb { border-radius: 10px; overflow: hidden; cursor: pointer; position: relative; aspect-ratio: 1; }
                .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
                .thumb-overlay { position: absolute; inset: 0; background: rgba(46,125,50,0); display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .thumb-overlay i { color: #fff; font-size: 20px; opacity: 0; }
                .gallery-thumb:hover img { transform: scale(1.1); }
                .gallery-thumb:hover .thumb-overlay { background: rgba(46,125,50,0.6); }
                .gallery-thumb:hover .thumb-overlay i { opacity: 1; }
                
                /* Sub-services Section */
                .sub-services-section { margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 12px; }
                .sub-services-section h4 { font-size: 18px; color: #333; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
                .sub-services-section h4 i { color: var(--color-primary); }
                .sub-services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .sub-service-item { display: flex; align-items: center; gap: 10px; padding: 12px 15px; background: #fff; border-radius: 8px; border-left: 3px solid var(--color-primary); }
                .sub-service-item i { color: var(--color-primary); font-size: 14px; }
                .sub-service-item span { color: #444; font-size: 14px; }
                
                /* CTA Box */
                .service-cta-box { margin-top: 30px; padding: 25px; background: linear-gradient(135deg, rgba(46,125,50,0.1) 0%, rgba(251,192,45,0.1) 100%); border-radius: 12px; border: 1px solid rgba(46,125,50,0.2); }
                .service-cta-box h4 { font-size: 18px; color: var(--color-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                .service-cta-box p { color: #555; font-size: 14px; margin-bottom: 15px; line-height: 1.6; }
                .cta-button { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: var(--color-primary); color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: all 0.3s; }
                .cta-button:hover { background: var(--color-dark); transform: translateY(-2px); }
                
                /* Projects Sidebar */
                .projects-box { color: #fff; padding: 25px; border-radius: 12px; text-align: center; }
                .projects-box > i { font-size: 32px; margin-bottom: 15px; display: block; }
                .projects-box h4 { margin-bottom: 10px; }
                .projects-box p { font-size: 14px; margin-bottom: 20px; opacity: 0.9; }
                .projects-link { color: #fff; text-decoration: none; transition: color 0.3s; }
                .projects-link:hover { color: var(--color-accent-yellow); }
                .projects-icon-circle { width: 100px; height: 100px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
                .projects-icon-circle i { font-size: 40px; }
                
                /* Lightbox */
                .lightbox-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 2000; display: flex; justify-content: center; align-items: center; }
                .lightbox-close { position: absolute; top: 20px; right: 30px; color: #fff; font-size: 40px; cursor: pointer; z-index: 2001; transition: color 0.3s; }
                .lightbox-close:hover { color: var(--color-accent-yellow); }
                .lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); color: #fff; font-size: 50px; cursor: pointer; padding: 20px; transition: color 0.3s; user-select: none; }
                .lightbox-nav:hover { color: var(--color-accent-yellow); }
                .lightbox-prev { left: 20px; }
                .lightbox-next { right: 20px; }
                .lightbox-content { max-width: 90%; max-height: 90%; text-align: center; }
                .lightbox-content img { max-width: 100%; max-height: 85vh; border-radius: 8px; box-shadow: 0 5px 30px rgba(0,0,0,0.5); }
                .lightbox-counter { color: #fff; margin-top: 15px; font-size: 14px; opacity: 0.8; }
                
                /* Mobile Styles */
                .mobile-service-select { display: none; margin-bottom: 20px; }
                .mobile-service-select select { width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; color: #333; background: #fff; }
                
                @media (max-width: 1100px) { 
                    .services-grid { grid-template-columns: 250px 1fr !important; } 
                    .projects-sidebar { display: none !important; } 
                }
                @media (max-width: 768px) { 
                    .services-grid { grid-template-columns: 1fr !important; } 
                    .services-sidebar { display: none !important; } 
                    .mobile-service-select { display: block !important; }
                    .service-cards-grid { grid-template-columns: 1fr !important; }
                    .service-gallery-grid { grid-template-columns: repeat(3, 1fr) !important; }
                    .sub-services-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 480px) {
                    .service-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </MainLayout>
    );
}
