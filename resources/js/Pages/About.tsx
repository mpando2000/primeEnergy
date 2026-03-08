import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

type TabKey = 'about' | 'team' | 'philosophy' | 'careers' | 'policies';

interface TeamMember {
    id: number;
    title: string;
    title_sw: string | null;
    position: string | null;
    position_sw: string | null;
    image_path: string;
}

interface PageBanner {
    id: number;
    page_key: string;
    page_name: string;
    image_url: string | null;
}

interface SiteSettings {
    careers_email: string;
}

interface Props {
    teamMembers?: TeamMember[];
}

export default function About({ teamMembers = [] }: Props) {
    const { t, language } = useLanguage();
    const props = usePage().props as unknown as { pageBanners: Record<string, PageBanner>; siteSettings: SiteSettings };
    const { pageBanners, siteSettings } = props;
    const [activeTab, setActiveTab] = useState<TabKey>('about');

    const bannerImage = pageBanners?.about?.image_url || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=300&fit=crop';

    const coreValues = [
        { titleKey: 'about.coreValues.safety.title', descKey: 'about.coreValues.safety.description' },
        { titleKey: 'about.coreValues.integrity.title', descKey: 'about.coreValues.integrity.description' },
        { titleKey: 'about.coreValues.accountability.title', descKey: 'about.coreValues.accountability.description' },
        { titleKey: 'about.coreValues.people.title', descKey: 'about.coreValues.people.description' },
        { titleKey: 'about.coreValues.environment.title', descKey: 'about.coreValues.environment.description' },
    ];

    // Fallback team members if none in database
    const defaultTeamMembers: TeamMember[] = [
        { id: 1, title: 'Eng. John Mwakasege', title_sw: null, position: 'Managing Director', position_sw: 'Mkurugenzi Mkuu', image_path: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop' },
        { id: 2, title: 'Eng. Sarah Kimaro', title_sw: null, position: 'Technical Director', position_sw: 'Mkurugenzi wa Kiufundi', image_path: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop' },
        { id: 3, title: 'Eng. Peter Mushi', title_sw: null, position: 'Operations Manager', position_sw: 'Meneja wa Uendeshaji', image_path: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
        { id: 4, title: 'Grace Mwamba', title_sw: null, position: 'Finance Manager', position_sw: 'Meneja wa Fedha', image_path: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop' },
    ];

    const displayTeamMembers = teamMembers.length > 0 ? teamMembers : defaultTeamMembers;

    const tabs = [
        { key: 'about' as TabKey, label: t('about.sidebar.aboutUs') },
        { key: 'team' as TabKey, label: t('about.sidebar.ourTeam') },
        { key: 'philosophy' as TabKey, label: t('about.sidebar.philosophy') },
        { key: 'careers' as TabKey, label: t('about.sidebar.careers') },
        { key: 'policies' as TabKey, label: t('about.sidebar.policies') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'about':
                return (
                    <div>
                        <h3 className="section-title text-[22px] font-bold mb-6">{t('about.content.title')}</h3>
                        <p className="text-[#555] mb-4 mt-8">{t('about.content.p1')}</p>
                        <p className="text-[#555] mb-4">{t('about.content.p2')}</p>
                        <p className="text-[#555] mb-4">{t('about.content.p3')}</p>
                        <p className="text-[#555] mb-4">{t('about.content.p4')}</p>
                        <ul className="list-disc ml-5 text-[#555] mb-6 space-y-2">
                            <li>{t('about.content.categories.electrical')}</li>
                            <li>{t('about.content.categories.hvac')}</li>
                            <li>{t('about.content.categories.ict')}</li>
                        </ul>
                        <div className="text-center my-8">
                            <div className="inline-block bg-theme-primary text-white py-4 px-8 rounded-lg font-bold">
                                PrimeVolt ELECTRIC CO. LTD
                            </div>
                        </div>
                        <h3 className="section-title text-[22px] font-bold mb-6 mt-8">{t('about.vision.title')}</h3>
                        <p className="quote-block mt-8 text-theme-primary">{t('about.vision.text')}</p>
                        <h3 className="section-title text-[22px] font-bold mb-6 mt-8">{t('about.mission.title')}</h3>
                        <p className="text-[#555] mb-8 mt-8">{t('about.mission.text')}</p>
                        <h3 className="section-title text-[22px] font-bold mb-6 mt-8">{t('about.coreValues.title')}</h3>
                        <div className="mt-8 space-y-4">
                            {coreValues.map((value, index) => (
                                <div key={index} className="value-item">
                                    <strong>{t(value.titleKey)}.</strong> {t(value.descKey)}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            case 'team':
                return (
                    <div>
                        <h3 className="section-title text-[22px] font-bold mb-6">{t('about.team.title')}</h3>
                        <p className="text-[#555] mb-8">{t('about.team.description')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayTeamMembers.map((member) => (
                                <div key={member.id} className="bg-[#f9f9f9] rounded-lg p-6 flex items-center gap-4">
                                    <img 
                                        src={member.image_path} 
                                        alt={member.title}
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800">{member.title}</h4>
                                        <p className="text-theme-primary font-medium">
                                            {language === 'sw' && member.position_sw ? member.position_sw : member.position}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 bg-theme-primary/10 p-6 rounded-lg">
                            <h4 className="font-bold text-lg text-theme-primary mb-3">{t('about.team.joinTitle')}</h4>
                            <p className="text-[#555]">{t('about.team.joinText')}</p>
                        </div>
                    </div>
                );
            
            case 'philosophy':
                return (
                    <div>
                        <h3 className="section-title text-[22px] font-bold mb-6">{t('about.philosophy.title')}</h3>
                        <p className="text-[#555] mb-6">{t('about.philosophy.description')}</p>
                        
                        <div className="space-y-6">
                            <div className="border-l-4 border-theme-primary pl-4">
                                <h4 className="font-bold text-lg text-gray-800 mb-2">{t('about.philosophy.quality.title')}</h4>
                                <p className="text-[#555]">{t('about.philosophy.quality.text')}</p>
                            </div>
                            
                            <div className="border-l-4 border-theme-accent pl-4">
                                <h4 className="font-bold text-lg text-gray-800 mb-2">{t('about.philosophy.partnership.title')}</h4>
                                <p className="text-[#555]">{t('about.philosophy.partnership.text')}</p>
                            </div>
                            
                            <div className="border-l-4 border-theme-highlight pl-4">
                                <h4 className="font-bold text-lg text-gray-800 mb-2">{t('about.philosophy.innovation.title')}</h4>
                                <p className="text-[#555]">{t('about.philosophy.innovation.text')}</p>
                            </div>
                            
                            <div className="border-l-4 border-theme-dark pl-4">
                                <h4 className="font-bold text-lg text-gray-800 mb-2">{t('about.philosophy.sustainable.title')}</h4>
                                <p className="text-[#555]">{t('about.philosophy.sustainable.text')}</p>
                            </div>
                        </div>
                    </div>
                );
            
            case 'careers':
                return (
                    <div>
                        <h3 className="section-title text-[22px] font-bold mb-6">{t('about.careers.title')}</h3>
                        <p className="text-[#555] mb-8">{t('about.careers.description')}</p>
                        
                        <h4 className="font-bold text-lg text-gray-800 mb-4">{t('about.careers.openings')}</h4>
                        <div className="space-y-4 mb-8">
                            <div className="bg-[#f9f9f9] p-5 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-gray-800">{t('about.careers.job1.title')}</h5>
                                    <span className="bg-theme-primary text-white text-xs px-3 py-1 rounded">{t('about.careers.fulltime')}</span>
                                </div>
                                <p className="text-[#555] text-sm mb-3">{t('about.careers.job1.description')}</p>
                                <p className="text-theme-primary text-sm font-medium">{t('about.careers.job1.location')}</p>
                            </div>
                            
                            <div className="bg-[#f9f9f9] p-5 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-gray-800">{t('about.careers.job2.title')}</h5>
                                    <span className="bg-theme-primary text-white text-xs px-3 py-1 rounded">{t('about.careers.fulltime')}</span>
                                </div>
                                <p className="text-[#555] text-sm mb-3">{t('about.careers.job2.description')}</p>
                                <p className="text-theme-primary text-sm font-medium">{t('about.careers.job2.location')}</p>
                            </div>
                            
                            <div className="bg-[#f9f9f9] p-5 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-gray-800">{t('about.careers.job3.title')}</h5>
                                    <span className="bg-theme-accent text-theme-dark text-xs px-3 py-1 rounded">{t('about.careers.multiple')}</span>
                                </div>
                                <p className="text-[#555] text-sm mb-3">{t('about.careers.job3.description')}</p>
                                <p className="text-theme-primary text-sm font-medium">{t('about.careers.job3.location')}</p>
                            </div>
                        </div>
                        
                        <div className="bg-theme-primary/10 p-6 rounded-lg">
                            <h4 className="font-bold text-lg text-theme-primary mb-3">{t('about.careers.howToApply')}</h4>
                            <p className="text-[#555] mb-4">
                                {t('about.careers.applyText')} <a href={`mailto:${siteSettings?.careers_email || 'careers@primevolt.co.tz'}`} className="text-theme-primary font-medium">{siteSettings?.careers_email || 'careers@primevolt.co.tz'}</a>
                            </p>
                            <p className="text-[#555] text-sm">{t('about.careers.applyNote')}</p>
                        </div>
                    </div>
                );
            
            case 'policies':
                return (
                    <div>
                        <h3 className="section-title text-[22px] font-bold mb-6">{t('about.policies.title')}</h3>
                        <p className="text-[#555] mb-8">{t('about.policies.description')}</p>
                        
                        <div className="space-y-6">
                            <div className="bg-[#f9f9f9] p-6 rounded-lg">
                                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                    <i className="fas fa-hard-hat text-theme-primary"></i>
                                    {t('about.policies.safety.title')}
                                </h4>
                                <p className="text-[#555] mb-3">{t('about.policies.safety.text')}</p>
                                <ul className="list-disc ml-5 text-[#555] text-sm space-y-1">
                                    <li>{t('about.policies.safety.item1')}</li>
                                    <li>{t('about.policies.safety.item2')}</li>
                                    <li>{t('about.policies.safety.item3')}</li>
                                    <li>{t('about.policies.safety.item4')}</li>
                                </ul>
                            </div>
                            
                            <div className="bg-[#f9f9f9] p-6 rounded-lg">
                                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                    <i className="fas fa-leaf text-theme-primary"></i>
                                    {t('about.policies.environment.title')}
                                </h4>
                                <p className="text-[#555] mb-3">{t('about.policies.environment.text')}</p>
                                <ul className="list-disc ml-5 text-[#555] text-sm space-y-1">
                                    <li>{t('about.policies.environment.item1')}</li>
                                    <li>{t('about.policies.environment.item2')}</li>
                                    <li>{t('about.policies.environment.item3')}</li>
                                    <li>{t('about.policies.environment.item4')}</li>
                                </ul>
                            </div>
                            
                            <div className="bg-[#f9f9f9] p-6 rounded-lg">
                                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                    <i className="fas fa-balance-scale text-theme-primary"></i>
                                    {t('about.policies.ethics.title')}
                                </h4>
                                <p className="text-[#555] mb-3">{t('about.policies.ethics.text')}</p>
                                <ul className="list-disc ml-5 text-[#555] text-sm space-y-1">
                                    <li>{t('about.policies.ethics.item1')}</li>
                                    <li>{t('about.policies.ethics.item2')}</li>
                                    <li>{t('about.policies.ethics.item3')}</li>
                                    <li>{t('about.policies.ethics.item4')}</li>
                                </ul>
                            </div>
                            
                            <div className="bg-[#f9f9f9] p-6 rounded-lg">
                                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                    <i className="fas fa-certificate text-theme-primary"></i>
                                    {t('about.policies.quality.title')}
                                </h4>
                                <p className="text-[#555] mb-3">{t('about.policies.quality.text')}</p>
                                <ul className="list-disc ml-5 text-[#555] text-sm space-y-1">
                                    <li>{t('about.policies.quality.item1')}</li>
                                    <li>{t('about.policies.quality.item2')}</li>
                                    <li>{t('about.policies.quality.item3')}</li>
                                    <li>{t('about.policies.quality.item4')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <MainLayout currentPage="About Us">
            <Head title={t('about.pageTitle')} />

            {/* Page Banner */}
            <section className="page-banner">
                <img 
                    src={bannerImage} 
                    alt="About Us Banner"
                />
                <div className="banner-overlay"></div>
            </section>

            {/* Main Content */}
            <section className="py-10 px-5">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_250px] gap-8">
                        {/* Sidebar */}
                        <aside className="bg-[#f5f5f5] p-5 rounded-lg h-fit hidden lg:block">
                            <h3 className="theme-sidebar-title">{t('about.sidebar.title')}</h3>
                            <ul className="sidebar-menu space-y-2">
                                {tabs.map((tab) => (
                                    <li key={tab.key}>
                                        <a 
                                            href="#" 
                                            className={activeTab === tab.key ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab(tab.key); }}
                                        >
                                            {tab.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        {/* Mobile Tab Selector */}
                        <div className="lg:hidden mb-4">
                            <select 
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value as TabKey)}
                                className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium"
                            >
                                {tabs.map((tab) => (
                                    <option key={tab.key} value={tab.key}>{tab.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-1">
                            {renderContent()}
                        </div>

                        {/* Membership Sidebar */}
                        <aside className="h-fit hidden lg:block">
                            <div className="bg-theme-primary text-white p-6 rounded-lg text-center">
                                <i className="fas fa-certificate text-4xl text-theme-accent mb-4 block"></i>
                                <h4 className="font-semibold text-lg mb-4">{t('about.membership.title')}</h4>
                                <p className="text-sm mb-5">
                                    {t('about.membership.text')}
                                </p>
                                <div className="flex justify-center gap-4">
                                    <span className="bg-theme-accent text-theme-dark py-2 px-5 rounded font-bold text-sm">CRB</span>
                                    <span className="bg-theme-accent text-theme-dark py-2 px-5 rounded font-bold text-sm">ACCT</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
