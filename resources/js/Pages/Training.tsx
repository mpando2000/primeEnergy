import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageBanner {
    id: number;
    page_key: string;
    page_name: string;
    image_url: string | null;
}

interface TrainingPhoto {
    id: number;
    caption: string;
    caption_sw: string | null;
    location: string | null;
    location_sw: string | null;
    year: string | null;
    image: string;
}

interface Props {
    trainings: TrainingPhoto[];
}

export default function Training({ trainings = [] }: Props) {
    const { t, language } = useLanguage();
    const props = usePage().props as unknown as { pageBanners: Record<string, PageBanner> };
    const { pageBanners } = props;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const bannerImage = pageBanners?.training?.image_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=300&fit=crop';

    // Helper to get translated content
    const getCaption = (photo: TrainingPhoto) => {
        return language === 'sw' && photo.caption_sw ? photo.caption_sw : photo.caption;
    };

    const getLocation = (photo: TrainingPhoto) => {
        return language === 'sw' && photo.location_sw ? photo.location_sw : photo.location;
    };

    // No fallback - only show images from database
    const trainingImages = trainings;

    const infoCards = [
        { icon: 'fa-globe', titleKey: 'training.cards.international.title', descKey: 'training.cards.international.description' },
        { icon: 'fa-hard-hat', titleKey: 'training.cards.safety.title', descKey: 'training.cards.safety.description' },
        { icon: 'fa-certificate', titleKey: 'training.cards.certified.title', descKey: 'training.cards.certified.description' },
    ];

    const openLightbox = (index: number) => {
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
        if (newIndex >= trainingImages.length) newIndex = 0;
        if (newIndex < 0) newIndex = trainingImages.length - 1;
        setCurrentIndex(newIndex);
    };

    // Get high-res version of image for lightbox
    const getHighResImage = (url: string) => {
        if (url.includes('unsplash.com')) {
            return url.replace('w=400&h=300', 'w=1200&h=900');
        }
        return url;
    };

    return (
        <MainLayout currentPage="Staff Training">
            <Head title={t('training.pageTitle')} />

            {/* Page Banner */}
            <section className="page-banner">
                <img 
                    src={bannerImage} 
                    alt={t('training.pageTitle')}
                />
                <div className="banner-overlay"></div>
            </section>

            {/* Main Content */}
            <section style={{ padding: '40px 0 60px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <h3 className="theme-heading text-theme-primary" style={{ fontSize: '28px', marginBottom: '20px', display: 'inline-block' }}>
                        {t('training.title')}
                    </h3>
                    <p style={{ color: '#555', marginBottom: '40px', maxWidth: '800px' }}>
                        {t('training.intro')}
                    </p>

                    {/* Training Gallery */}
                    {trainingImages.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '50px' }} className="training-gallery">
                            {trainingImages.map((image, index) => (
                                <div 
                                    key={image.id}
                                    style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
                                    className="gallery-item"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img 
                                        src={image.image} 
                                        alt={getCaption(image)}
                                        style={{ width: '100%', height: '180px', objectFit: 'cover', transition: 'transform 0.3s' }}
                                        className="gallery-img"
                                    />
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            right: '0',
                                            background: 'linear-gradient(transparent, rgba(27, 94, 32, 0.9))',
                                            padding: '15px 10px 10px',
                                            opacity: '0',
                                            transition: 'opacity 0.3s'
                                        }}
                                        className="gallery-overlay"
                                    >
                                        <p style={{ color: '#ffffff', fontSize: '12px', textAlign: 'center', margin: 0 }}>{getCaption(image)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '50px' }}>
                            <i className="fas fa-images text-theme-primary" style={{ fontSize: '48px', marginBottom: '15px', display: 'block', opacity: 0.5 }}></i>
                            <p style={{ color: '#666', fontSize: '16px' }}>{t('training.noPhotos') || 'Training photos coming soon...'}</p>
                        </div>
                    )}

                    {/* Training Info Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }} className="info-cards">
                        {infoCards.map((card, index) => (
                            <div 
                                key={index} 
                                className="border-theme-primary"
                                style={{ 
                                    background: '#f5f5f5', 
                                    padding: '30px', 
                                    borderRadius: '8px', 
                                    textAlign: 'center',
                                    borderTop: '4px solid'
                                }}
                            >
                                <i className={`fas ${card.icon} text-theme-primary`} style={{ fontSize: '40px', marginBottom: '15px', display: 'block' }}></i>
                                <h4 className="text-theme-primary" style={{ marginBottom: '10px' }}>{t(card.titleKey)}</h4>
                                <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>{t(card.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.9)',
                        zIndex: 2000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onClick={(e) => e.target === e.currentTarget && closeLightbox()}
                >
                    <span 
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '30px',
                            color: '#ffffff',
                            fontSize: '40px',
                            cursor: 'pointer',
                            zIndex: 2001
                        }}
                        className="lightbox-close"
                        onClick={closeLightbox}
                    >
                        &times;
                    </span>
                    <span 
                        style={{
                            position: 'absolute',
                            left: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#ffffff',
                            fontSize: '50px',
                            cursor: 'pointer',
                            padding: '20px'
                        }}
                        className="lightbox-nav"
                        onClick={() => changeSlide(-1)}
                    >
                        &#10094;
                    </span>
                    <div style={{ maxWidth: '90%', maxHeight: '90%', textAlign: 'center' }}>
                        <img 
                            src={getHighResImage(trainingImages[currentIndex].image)}
                            alt={getCaption(trainingImages[currentIndex])}
                            style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 5px 30px rgba(0,0,0,0.5)' }}
                        />
                        <p style={{ color: '#ffffff', textAlign: 'center', padding: '15px', fontSize: '16px' }}>{getCaption(trainingImages[currentIndex])}</p>
                    </div>
                    <span 
                        style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#ffffff',
                            fontSize: '50px',
                            cursor: 'pointer',
                            padding: '20px'
                        }}
                        className="lightbox-nav"
                        onClick={() => changeSlide(1)}
                    >
                        &#10095;
                    </span>
                </div>
            )}

            <style>{`
                .training-gallery {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 15px;
                }
                .gallery-item:hover .gallery-img {
                    transform: scale(1.1);
                }
                .gallery-item:hover .gallery-overlay {
                    opacity: 1 !important;
                }
                .lightbox-close:hover,
                .lightbox-nav:hover {
                    color: var(--color-accent-yellow) !important;
                }
                @media (max-width: 992px) {
                    .training-gallery {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }
                    .info-cards {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 768px) {
                    .training-gallery {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .info-cards {
                        grid-template-columns: 1fr !important;
                    }
                    .lightbox-nav {
                        font-size: 30px !important;
                        padding: 10px !important;
                    }
                }
                @media (max-width: 480px) {
                    .training-gallery {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </MainLayout>
    );
}
