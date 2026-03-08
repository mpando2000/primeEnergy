import { PropsWithChildren, useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SiteSettings {
    company_name: string;
    tagline: string;
    description: string;
    phone: string;
    fax: string;
    email: string;
    careers_email: string;
    address: string;
    po_box: string;
    weekday_hours: string;
    weekend_hours: string;
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    whatsapp: string;
    webmail_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    highlight_color: string;
    tawk_enabled: string;
    tawk_id: string;
    google_analytics: string;
    google_maps_url: string;
}

interface FooterService {
    id: number;
    name: string;
    name_sw: string | null;
    icon: string | null;
}



interface MainLayoutProps extends PropsWithChildren {
    currentPage?: string;
    transparentHeader?: boolean;
}

export default function MainLayout({ children, currentPage = '', transparentHeader = false }: MainLayoutProps) {
    const props = usePage().props as unknown as { siteSettings?: SiteSettings; footerServices?: FooterService[] };
    const siteSettings = props.siteSettings;
    const footerServices = props.footerServices || [];
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Apply dynamic colors from settings
    useEffect(() => {
        if (siteSettings) {
            const root = document.documentElement;
            if (siteSettings.primary_color) {
                root.style.setProperty('--primary-green', siteSettings.primary_color);
                root.style.setProperty('--color-primary', siteSettings.primary_color);
            }
            if (siteSettings.secondary_color) {
                root.style.setProperty('--dark-green', siteSettings.secondary_color);
                root.style.setProperty('--color-primary-dark', siteSettings.secondary_color);
            }
            if (siteSettings.accent_color) {
                root.style.setProperty('--accent-yellow', siteSettings.accent_color);
                root.style.setProperty('--color-accent-yellow', siteSettings.accent_color);
            }
            if (siteSettings.highlight_color) {
                root.style.setProperty('--highlight-red', siteSettings.highlight_color);
                root.style.setProperty('--color-highlight-red', siteSettings.highlight_color);
            }
        }
    }, [siteSettings]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navLinks = [
        { name: 'Home', translationKey: 'nav.home', href: '/' },
        { name: 'About Us', translationKey: 'nav.about', href: '/about' },
        { name: 'Our Services', translationKey: 'nav.services', href: '/services' },
        { name: 'Investments', translationKey: 'nav.investments', href: '/investments' },
        { name: 'Our Projects', translationKey: 'nav.projects', href: '/projects' },
        { name: 'Staff Training', translationKey: 'nav.training', href: '/training' },
        { name: 'Contact Us', translationKey: 'nav.contact', href: '/contact' },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Fixed Navigation Container */}
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}>
                {/* Top Bar */}
                <div className={`py-1 text-xs transition-all duration-300 bg-primary-dark text-white`}>
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    {/* Left: Phone & Email */}
                    <div className="hidden md:flex gap-5">
                        <span><i className="fas fa-phone mr-2"></i>{siteSettings?.phone || t('topBar.phone')}</span>
                        <span><i className="fas fa-envelope mr-2"></i>{siteSettings?.email || t('topBar.email')}</span>
                    </div>
                    
                    {/* Right: Social Media + Language Switcher */}
                    <div className="flex items-center gap-5">
                        {/* Social Media */}
                        <div className="flex gap-4">
                            {siteSettings?.instagram && (
                                <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
                                    <i className="fab fa-instagram"></i>
                                </a>
                            )}
                            {siteSettings?.facebook && (
                                <a href={siteSettings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
                                    <i className="fab fa-facebook"></i>
                                </a>
                            )}
                            {siteSettings?.twitter && (
                                <a href={siteSettings.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
                                    <i className="fa-brands fa-x-twitter"></i>
                                </a>
                            )}
                            {siteSettings?.linkedin && (
                                <a href={siteSettings.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
                                    <i className="fab fa-linkedin"></i>
                                </a>
                            )}
                            {siteSettings?.youtube && (
                                <a href={siteSettings.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
                                    <i className="fab fa-youtube"></i>
                                </a>
                            )}
                            {!siteSettings?.instagram && !siteSettings?.facebook && !siteSettings?.twitter && !siteSettings?.linkedin && !siteSettings?.youtube && (
                                <>
                                    <a href="#" className="hover:text-accent-yellow transition-colors"><i className="fab fa-instagram"></i></a>
                                    <a href="#" className="hover:text-accent-yellow transition-colors"><i className="fab fa-facebook"></i></a>
                                    <a href="#" className="hover:text-accent-yellow transition-colors"><i className="fa-brands fa-x-twitter"></i></a>
                                    <a href="#" className="hover:text-accent-yellow transition-colors"><i className="fab fa-linkedin"></i></a>
                                    <a href="#" className="hover:text-accent-yellow transition-colors"><i className="fab fa-youtube"></i></a>
                                </>
                            )}
                        </div>
                        
                        {/* Language Switcher */}
                        <div className="flex items-center gap-0.5 border border-white/30 rounded px-1.5 py-0.5">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-1.5 py-0 rounded text-[10px] font-semibold transition-all ${
                                    language === 'en' 
                                        ? 'bg-accent-yellow text-primary-dark' 
                                        : 'hover:text-accent-yellow'
                                }`}
                            >
                                EN
                            </button>
                            <span className="text-white/50 text-[10px]">|</span>
                            <button
                                onClick={() => setLanguage('sw')}
                                className={`px-1.5 py-0 rounded text-[10px] font-semibold transition-all ${
                                    language === 'sw' 
                                        ? 'bg-accent-yellow text-primary-dark' 
                                        : 'hover:text-accent-yellow'
                                }`}
                            >
                                SW
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className={`transition-all duration-300 ${transparentHeader ? 'bg-white shadow-md' : 'bg-white shadow-md'}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center py-2">
                        <Link href="/" className="flex items-center gap-3">
                            <img 
                                src="/prime-logo.png" 
                                alt="PrimeVolt Logo" 
                                className="h-14 w-auto"
                            />
                            <span className={`font-bold text-lg uppercase transition-colors text-primary`}>
                                {siteSettings?.company_name || 'PrimeVolt ELECTRIC CO. LTD'}
                            </span>
                        </Link>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`font-semibold text-sm py-2 relative transition-colors hover:text-primary
                                        ${currentPage === link.name ? 'text-primary' : 'text-gray-800'}
                                        after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[3px] after:bg-accent-yellow after:transition-all
                                        hover:after:w-full ${currentPage === link.name ? 'after:w-full' : ''}`}
                                >
                                    {t(link.translationKey)}
                                </Link>
                            ))}
                            
                            {/* Login Button */}
                            <Link
                                href="/admin/login"
                                className="ml-4 px-4 py-1.5 rounded-lg font-semibold text-xs transition-all hover:-translate-y-0.5 hover:shadow-lg bg-primary text-white hover:bg-primary-dark"
                            >
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                {t('nav.login')}
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <nav className="lg:hidden pb-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`block py-2 px-4 font-semibold ${currentPage === link.name ? 'text-primary bg-gray-100' : 'text-gray-800'}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t(link.translationKey)}
                                </Link>
                            ))}
                            <Link
                                href="/admin/login"
                                className="block py-2 px-4 font-semibold text-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                {t('nav.login')}
                            </Link>
                        </nav>
                    )}
                </div>
            </header>
            </div>

            {/* Spacer for fixed navbar */}
            <div className="h-[104px] md:h-[108px]"></div>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-primary-dark text-white pt-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-accent-yellow text-lg font-semibold mb-5">{t('footer.company.title')}</h4>
                            <ul className="space-y-2">
                                <li><Link href="/" className="hover:text-accent-yellow transition-colors">{t('footer.company.home')}</Link></li>
                                <li><Link href="/about" className="hover:text-accent-yellow transition-colors">{t('footer.company.about')}</Link></li>
                                <li><Link href="/services" className="hover:text-accent-yellow transition-colors">{t('footer.company.services')}</Link></li>
                                <li><Link href="/projects" className="hover:text-accent-yellow transition-colors">{t('footer.company.projects')}</Link></li>
                                <li><Link href="/contact" className="hover:text-accent-yellow transition-colors">{t('footer.company.contact')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-accent-yellow text-lg font-semibold mb-5">{t('footer.services.title')}</h4>
                            <ul className="space-y-2">
                                {footerServices.length > 0 ? (
                                    footerServices.map((service) => (
                                        <li key={service.id}>
                                            <Link href="/services" className="hover:text-accent-yellow transition-colors">
                                                {language === 'sw' && service.name_sw ? service.name_sw : service.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        <li><a href="#" className="hover:text-accent-yellow transition-colors">{t('footer.services.electrical')}</a></li>
                                        <li><a href="#" className="hover:text-accent-yellow transition-colors">{t('footer.services.hvac')}</a></li>
                                        <li><a href="#" className="hover:text-accent-yellow transition-colors">{t('footer.services.ict')}</a></li>
                                        <li><a href="#" className="hover:text-accent-yellow transition-colors">{t('footer.services.security')}</a></li>
                                        <li><a href="#" className="hover:text-accent-yellow transition-colors">{t('footer.services.distribution')}</a></li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-accent-yellow text-lg font-semibold mb-5">{t('footer.quickLinks.title')}</h4>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="hover:text-accent-yellow transition-colors">{t('footer.quickLinks.about')}</Link></li>
                                <li><Link href="/projects" className="hover:text-accent-yellow transition-colors">{t('footer.quickLinks.projects')}</Link></li>
                                <li><Link href="/training" className="hover:text-accent-yellow transition-colors">{t('footer.quickLinks.training')}</Link></li>
                                <li><a href="#" className="hover:text-accent-yellow transition-colors">{t('footer.quickLinks.careers')}</a></li>
                                {siteSettings?.webmail_url && (
                                    <li>
                                        <a href={siteSettings.webmail_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-yellow transition-colors">
                                            <i className="fas fa-envelope mr-2"></i>{t('footer.quickLinks.webmail')}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-accent-yellow text-lg font-semibold mb-5">{t('footer.contact.title')}</h4>
                            <p className="text-sm leading-relaxed">
                                {siteSettings?.company_name || t('footer.contact.company')}<br />
                                {siteSettings?.address || t('footer.contact.location')}<br /><br />
                                Tel: {siteSettings?.phone || t('footer.contact.tel')}<br />
                                <a href={`mailto:${siteSettings?.email || 'info@primevolt.co.tz'}`} className="hover:text-accent-yellow transition-colors">
                                    {siteSettings?.email || 'info@primevolt.co.tz'}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-black/20 mt-10 py-5 text-center text-sm">
                    {t('footer.copyright')
                        .replace('{{year}}', new Date().getFullYear().toString())
                        .replace('{{company}}', siteSettings?.company_name || 'PrimeVolt Electric Co. Ltd')}
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg transition-all z-50 hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1
                    ${showBackToTop ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
                <i className="fas fa-chevron-up"></i>
            </button>
        </div>
    );
}
