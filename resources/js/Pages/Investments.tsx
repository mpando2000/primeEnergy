import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface LandInvestment {
    id: number;
    title: string;
    title_sw: string | null;
    description: string;
    description_sw: string | null;
    location: string;
    location_sw: string | null;
    size_acres: number;
    investment_types: string[];
    investment_types_sw: string[] | null;
    features: string[];
    features_sw: string[] | null;
    images: string[] | null;
}

interface Props {
    lands: LandInvestment[];
}

export default function Investments({ lands }: Props) {
    const { t, language } = useLanguage();

    const getContent = (land: LandInvestment) => ({
        title: language === 'sw' && land.title_sw ? land.title_sw : land.title,
        description: language === 'sw' && land.description_sw ? land.description_sw : land.description,
        location: language === 'sw' && land.location_sw ? land.location_sw : land.location,
        investmentTypes: language === 'sw' && land.investment_types_sw ? land.investment_types_sw : land.investment_types || [],
        features: language === 'sw' && land.features_sw ? land.features_sw : land.features || [],
    });

    return (
        <MainLayout currentPage="Investments">
            <Head title={t('nav.investments')} />

            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-primary mb-4">
                            {t('investments.title')}
                        </h1>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            {t('investments.subtitle')}
                        </p>
                    </div>

                    <div className="space-y-12">
                        {lands.map((land) => {
                            const content = getContent(land);
                            const mainImage = land.images && land.images.length > 0 ? land.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800';

                            return (
                                <div key={land.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="h-80 lg:h-auto">
                                            <img 
                                                src={mainImage} 
                                                alt={content.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-8">
                                            <h2 className="text-2xl font-bold text-primary mb-4">
                                                {content.title}
                                            </h2>
                                            <div className="flex items-center text-gray-600 mb-4">
                                                <i className="fas fa-map-marker-alt mr-2"></i>
                                                <span>{content.location}</span>
                                                <span className="mx-3">•</span>
                                                <i className="fas fa-ruler-combined mr-2"></i>
                                                <span>{land.size_acres} {t('investments.acres')}</span>
                                            </div>
                                            <p className="text-gray-600 mb-6">
                                                {content.description}
                                            </p>
                                            <div className="mb-6">
                                                <h3 className="font-semibold text-primary mb-3">
                                                    {t('investments.investmentTypes')}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {content.investmentTypes.map((type, idx) => (
                                                        <span 
                                                            key={idx}
                                                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                                        >
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-6">
                                                <h3 className="font-semibold text-primary mb-3">
                                                    {t('investments.keyFeatures')}
                                                </h3>
                                                <ul className="space-y-2">
                                                    {content.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start">
                                                            <i className="fas fa-check text-accent-yellow mr-2 mt-1"></i>
                                                            <span className="text-gray-600">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <Link 
                                                href="/contact"
                                                className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                                            >
                                                {t('investments.inquire')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {lands.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">{t('investments.noOpportunities')}</p>
                        </div>
                    )}
                </div>
            </section>
        </MainLayout>
    );
}
