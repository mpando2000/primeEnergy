import { Head, usePage, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FormEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageBanner {
    id: number;
    page_key: string;
    page_name: string;
    image_url: string | null;
}

interface SiteSettings {
    company_name?: string;
    phone?: string;
    fax?: string;
    email?: string;
    address?: string;
    po_box?: string;
    weekday_hours?: string;
    weekend_hours?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    google_maps_url?: string;
}

export default function Contact() {
    const { t } = useLanguage();
    const props = usePage().props as unknown as { pageBanners: Record<string, PageBanner>; siteSettings?: SiteSettings; flash?: { success?: string; error?: string } };
    const { pageBanners } = props;
    const settings = props.siteSettings || {};
    const flash = props.flash || {};
    
    const bannerImage = pageBanners?.contact?.image_url || 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&h=300&fit=crop';
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        body: '',
        recipient_email: settings.email || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset();
            },
        });
    };

    // Default map URL if not set in settings
    const mapUrl = settings.google_maps_url || 
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.45932537!2d39.07283!3d-6.7924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4bae169bd6f1%3A0x940f6b26a086a1dd!2sDar%20es%20Salaam%2C%20Tanzania!5e0!3m2!1sen!2sus!4v1234567890";

    return (
        <MainLayout currentPage={t('nav.contact')}>
            <Head title={t('contact.pageTitle')} />

            {/* Page Banner */}
            <section className="page-banner">
                <img 
                    src={bannerImage} 
                    alt="Contact Banner"
                />
                <div className="banner-overlay"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
                    <h1 className="text-[42px] font-bold drop-shadow-lg">{t('contact.bannerTitle')}</h1>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="max-w-[1200px] mx-auto px-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <h3 className="theme-heading text-[28px] font-bold mb-8">
                                {t('contact.form.title')}
                            </h3>
                            
                            {flash.success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    {flash.success}
                                </div>
                            )}
                            
                            {flash.error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                    <i className="fas fa-exclamation-circle mr-2"></i>
                                    {flash.error}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <label className="block mb-2 font-semibold text-gray-800">
                                        {t('contact.form.name')} <span className="text-theme-highlight">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        className={`w-full p-3 border-2 rounded-md text-[15px] transition-colors focus:border-primary focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 font-semibold text-gray-800">
                                        {t('contact.form.email')} <span className="text-theme-highlight">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        className={`w-full p-3 border-2 rounded-md text-[15px] transition-colors focus:border-primary focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 font-semibold text-gray-800">{t('contact.form.phone')}</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full p-3 border-2 border-gray-300 rounded-md text-[15px] transition-colors focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 font-semibold text-gray-800">
                                        {t('contact.form.subject')} <span className="text-theme-highlight">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        required
                                        className={`w-full p-3 border-2 rounded-md text-[15px] transition-colors focus:border-primary focus:outline-none ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                                </div>
                                <div className="mb-5">
                                    <label className="block mb-2 font-semibold text-gray-800">
                                        {t('contact.form.message')} <span className="text-theme-highlight">*</span>
                                    </label>
                                    <textarea
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        required
                                        rows={6}
                                        className={`w-full p-3 border-2 rounded-md text-[15px] transition-colors focus:border-primary focus:outline-none resize-y ${errors.body ? 'border-red-500' : 'border-gray-300'}`}
                                    ></textarea>
                                    {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-theme-primary text-white border-none py-4 px-9 text-base font-semibold rounded-md cursor-pointer transition-all hover:bg-theme-dark hover:-translate-y-0.5 hover:shadow-lg inline-flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane"></i> {t('contact.form.submit')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-[#f5f5f5] p-8 rounded-xl">
                                <h3 className="text-theme-primary text-[22px] mb-6 pb-4 border-b-2 border-accent-yellow">
                                    {settings.company_name || t('contact.info.title')}
                                </h3>
                                <div className="flex gap-4 mb-5">
                                    <div className="w-10 h-10 bg-theme-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 m-0">{settings.address || t('contact.info.address')}</p>
                                        {settings.po_box && <p className="text-gray-600 m-0">{settings.po_box}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className="w-10 h-10 bg-theme-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 m-0">Tel: {settings.phone || t('contact.info.tel')}</p>
                                        {settings.fax && <p className="text-gray-600 m-0">Fax: {settings.fax}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className="w-10 h-10 bg-theme-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div>
                                        {settings.email ? (
                                            <a href={`mailto:${settings.email}`} className="theme-link">
                                                {settings.email}
                                            </a>
                                        ) : (
                                            <span className="text-gray-600">{t('contact.info.email')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-theme-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 m-0">{settings.weekday_hours || t('contact.info.hours1')}</p>
                                        <p className="text-gray-600 m-0">{settings.weekend_hours || t('contact.info.hours2')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-theme-primary text-white p-6 rounded-xl text-center">
                                <h4 className="mb-4 text-theme-accent">{t('contact.social.title')}</h4>
                                <div className="flex justify-center gap-4">
                                    {settings.facebook && (
                                        <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                            <i className="fab fa-facebook-f"></i>
                                        </a>
                                    )}
                                    {settings.twitter && (
                                        <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                            <i className="fa-brands fa-x-twitter"></i>
                                        </a>
                                    )}
                                    {settings.instagram && (
                                        <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                            <i className="fab fa-instagram"></i>
                                        </a>
                                    )}
                                    {settings.linkedin && (
                                        <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                            <i className="fab fa-linkedin-in"></i>
                                        </a>
                                    )}
                                    {settings.youtube && (
                                        <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                            <i className="fab fa-youtube"></i>
                                        </a>
                                    )}
                                    {/* Show placeholder icons if no social links are set */}
                                    {!settings.facebook && !settings.twitter && !settings.instagram && !settings.linkedin && !settings.youtube && (
                                        <>
                                            <a href="#" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                                <i className="fab fa-facebook-f"></i>
                                            </a>
                                            <a href="#" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                                <i className="fa-brands fa-x-twitter"></i>
                                            </a>
                                            <a href="#" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                                <i className="fab fa-instagram"></i>
                                            </a>
                                            <a href="#" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                                <i className="fab fa-linkedin-in"></i>
                                            </a>
                                            <a href="#" className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-accent-yellow hover:text-primary-dark hover:-translate-y-1">
                                                <i className="fab fa-youtube"></i>
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#f5f5f5] p-6 rounded-xl">
                                <h4 className="text-theme-primary mb-4">{t('contact.registrations.title')}</h4>
                                <p className="mb-2.5 text-gray-600"><i className="fas fa-check-circle text-theme-primary mr-2.5"></i> {t('contact.registrations.crb')}</p>
                                <p className="m-0 text-gray-600"><i className="fas fa-check-circle text-theme-primary mr-2.5"></i> {t('contact.registrations.acct')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="w-full">
                <iframe 
                    src={mapUrl}
                    width="100%" 
                    height="400" 
                    className="border-0 block"
                    allowFullScreen
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </section>
        </MainLayout>
    );
}
