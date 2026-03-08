import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Slide {
    id: number;
    title: string;
    title_sw: string | null;
    description: string | null;
    description_sw: string | null;
    image_path: string;
    link_text: string | null;
    link_text_sw: string | null;
    link_url: string | null;
}

interface MDProfile {
    id: number;
    title: string;
    image_path: string;
    description: string | null;
}

interface Service {
    id: number;
    name: string;
    name_sw: string | null;
    description: string | null;
    description_sw: string | null;
    icon: string;
}

interface Props {
    slides: Slide[];
    mdProfile: MDProfile | null;
    services: Service[];
}

export default function Home({ slides = [], mdProfile, services: dbServices = [] }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { t, language } = useLanguage();

    // Fallback slides if none in database
    const defaultSlides: Slide[] = [
        {
            id: 0,
            title: t('home.slides.slide1.title'),
            title_sw: null,
            description: t('home.slides.slide1.subtitle'),
            description_sw: null,
            image_path: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600',
            link_text: null,
            link_text_sw: null,
            link_url: null,
        },
    ];

    const activeSlides = slides.length > 0 ? slides : defaultSlides;

    // Fallback services if none in database
    const fallbackServices = [
        { icon: 'fa-bolt', titleKey: 'home.services.electrical.title', descKey: 'home.services.electrical.description' },
        { icon: 'fa-wind', titleKey: 'home.services.hvac.title', descKey: 'home.services.hvac.description' },
        { icon: 'fa-network-wired', titleKey: 'home.services.ict.title', descKey: 'home.services.ict.description' },
        { icon: 'fa-plug', titleKey: 'home.services.distribution.title', descKey: 'home.services.distribution.description' },
        { icon: 'fa-video', titleKey: 'home.services.security.title', descKey: 'home.services.security.description' },
    ];

    // Helper to get translated service content
    const getServiceContent = (service: Service) => ({
        name: language === 'sw' && service.name_sw ? service.name_sw : service.name,
        description: language === 'sw' && service.description_sw ? service.description_sw : service.description,
    });

    useEffect(() => {
        if (activeSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeSlides.length]);

    const mdImage = mdProfile?.image_path || 'https://plus.unsplash.com/premium_photo-1663040111191-c585a609fd9c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGJsYWNrJTIwcGVyc29uJTIwbWFuYWdlcnxlbnwwfHwwfHx8MA%3D%3D';

    return (
        <MainLayout currentPage="Home" transparentHeader={true}>
            <Head title={t('nav.home')} />

            {/* Hero Slider - extends behind header */}
            <section className="relative h-screen min-h-[700px] overflow-hidden -mt-[180px] pt-[180px]">
                {activeSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={slide.image_path} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20"></div>
                        <div className="absolute inset-0 flex items-end justify-center pb-24">
                            <div className="text-center text-white px-4">
                                <h1 className="text-4xl md:text-5xl font-bold mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {language === 'sw' && slide.title_sw ? slide.title_sw : slide.title}
                                </h1>
                                {(slide.description || slide.description_sw) && (
                                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                        {language === 'sw' && slide.description_sw ? slide.description_sw : slide.description}
                                    </p>
                                )}
                                {slide.link_url && (slide.link_text || slide.link_text_sw) && (
                                    <Link 
                                        href={slide.link_url} 
                                        className="inline-block px-8 py-3 bg-accent-yellow text-primary-dark font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                                    >
                                        {language === 'sw' && slide.link_text_sw ? slide.link_text_sw : slide.link_text}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {activeSlides.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                        {activeSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-accent-yellow' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Services Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-primary inline-block relative">
                            {t('home.services.title')}
                            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-accent-yellow"></span>
                        </h2>
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${dbServices.length > 0 ? `lg:grid-cols-${Math.min(dbServices.length, 5)}` : 'lg:grid-cols-5'}`}>
                        {dbServices.length > 0 ? (
                            dbServices.map((service) => {
                                const content = getServiceContent(service);
                                return (
                                    <Link key={service.id} href="/services" className="text-center group block">
                                        <div className="w-20 h-20 mx-auto mb-5 border-[3px] border-primary rounded-full flex items-center justify-center text-primary text-3xl transition-all group-hover:bg-primary group-hover:text-white">
                                            <i className={`fas ${service.icon}`}></i>
                                        </div>
                                        <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                                            {content.name}
                                        </h3>
                                        {content.description && (
                                            <p className="text-sm text-gray-600">{content.description}</p>
                                        )}
                                    </Link>
                                );
                            })
                        ) : (
                            fallbackServices.map((service, index) => (
                                <div key={index} className="text-center group">
                                    <div className="w-20 h-20 mx-auto mb-5 border-[3px] border-primary rounded-full flex items-center justify-center text-primary text-3xl transition-all group-hover:bg-primary group-hover:text-white">
                                        <i className={`fas ${service.icon}`}></i>
                                    </div>
                                    <h3 className="font-semibold text-sm mb-2">
                                        <a href="#" className="hover:text-primary transition-colors">{t(service.titleKey)}</a>
                                    </h3>
                                    <p className="text-sm text-gray-600">{t(service.descKey)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Land Investment Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-primary inline-block relative">
                            {t('home.investments.title')}
                            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-accent-yellow"></span>
                        </h2>
                        <p className="text-gray-600 mt-6 max-w-3xl mx-auto">
                            {t('home.investments.subtitle')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="group overflow-hidden rounded-lg shadow-lg">
                            <div className="h-48 overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" 
                                    alt="Hotels & Resorts"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6 bg-white">
                                <h3 className="font-semibold text-lg mb-2">{t('home.investments.hotels')}</h3>
                                <p className="text-gray-600 text-sm">{t('home.investments.hotelsDesc')}</p>
                            </div>
                        </div>
                        <div className="group overflow-hidden rounded-lg shadow-lg">
                            <div className="h-48 overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop" 
                                    alt="Tourist Camps"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6 bg-white">
                                <h3 className="font-semibold text-lg mb-2">{t('home.investments.camps')}</h3>
                                <p className="text-gray-600 text-sm">{t('home.investments.campsDesc')}</p>
                            </div>
                        </div>
                        <div className="group overflow-hidden rounded-lg shadow-lg">
                            <div className="h-48 overflow-hidden">
                                <img 
                                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop" 
                                    alt="Commercial Development"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6 bg-white">
                                <h3 className="font-semibold text-lg mb-2">{t('home.investments.commercial')}</h3>
                                <p className="text-gray-600 text-sm">{t('home.investments.commercialDesc')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <Link 
                            href="/investments" 
                            className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            {t('home.investments.viewOpportunities')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold text-primary mb-5 relative inline-block">
                                {t('home.welcome.title')}
                                <span className="absolute -bottom-2 left-0 w-10 h-1 bg-accent-yellow"></span>
                            </h3>
                            <p className="text-gray-600 mb-4">{t('home.welcome.p1')}</p>
                            <p className="text-gray-600 mb-4">{t('home.welcome.p2')}</p>
                            <p className="text-gray-600">{t('home.welcome.p3')}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-primary mb-5 relative inline-block">
                                {t('home.md.title')}
                                <span className="absolute -bottom-2 left-0 w-10 h-1 bg-accent-yellow"></span>
                            </h3>
                            <div className="flex gap-5">
                                <div className="w-36 h-48 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={mdImage} alt="Managing Director" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-gray-600 mb-4">{t('md.p1')}</p>
                                    <Link href="/managing-director" className="text-primary font-semibold hover:text-accent-yellow transition-colors">
                                        {t('home.md.readMore')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
