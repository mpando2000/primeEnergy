import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface Page {
    id: number;
    slug: string;
    title: string;
    title_sw: string | null;
    meta_description: string | null;
    meta_description_sw: string | null;
    banner_image: string | null;
    content: string | null;
    content_sw: string | null;
    sections: Record<string, unknown> | null;
    is_active: boolean;
}

interface Props {
    pages: Page[];
}

export default function Pages({ pages }: Props) {
    const [activePage, setActivePage] = useState(pages[0]?.slug || 'home');
    const [activeTab, setActiveTab] = useState<'en' | 'sw'>('en');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const data: Record<string, any> = {};
        pages.forEach(page => {
            data[page.slug] = {
                title: page.title,
                title_sw: page.title_sw || '',
                meta_description: page.meta_description || '',
                meta_description_sw: page.meta_description_sw || '',
                banner_image: page.banner_image || '',
                content: page.content || '',
                content_sw: page.content_sw || '',
                is_active: page.is_active,
            };
        });
        return data;
    });

    const pageIcons: Record<string, string> = {
        home: 'fa-home',
        about: 'fa-info-circle',
        chairman: 'fa-user-tie',
        services: 'fa-cogs',
        projects: 'fa-project-diagram',
        training: 'fa-graduation-cap',
        contact: 'fa-envelope',
    };

    const currentPage = pages.find(p => p.slug === activePage);
    const currentData = formData[activePage] || {};

    const handleChange = (field: string, value: string | boolean) => {
        setFormData({
            ...formData,
            [activePage]: {
                ...formData[activePage],
                [field]: value,
            },
        });
        setSaved(false);
    };

    const handleSave = () => {
        if (!currentPage || saving) return;
        setSaving(true);
        
        router.put(`/admin/pages/${currentPage.id}`, formData[activePage], {
            onSuccess: () => {
                setSaved(true);
                setSaving(false);
            },
            onError: () => setSaving(false),
        });
    };

    const handleReset = () => {
        if (!currentPage) return;
        setFormData({
            ...formData,
            [activePage]: {
                title: currentPage.title,
                title_sw: currentPage.title_sw || '',
                meta_description: currentPage.meta_description || '',
                meta_description_sw: currentPage.meta_description_sw || '',
                banner_image: currentPage.banner_image || '',
                content: currentPage.content || '',
                content_sw: currentPage.content_sw || '',
                is_active: currentPage.is_active,
            },
        });
        setSaved(false);
    };

    const toggleStatus = () => {
        if (!currentPage) return;
        router.patch(`/admin/pages/${currentPage.id}/toggle-status`, {}, {
            onSuccess: () => {
                handleChange('is_active', !currentData.is_active);
            },
        });
    };

    return (
        <AdminLayout title="Page Management">
            <div className="settings-grid">
                {/* Pages Navigation */}
                <div className="settings-nav">
                    {pages.map(page => (
                        <a 
                            key={page.slug}
                            href={`#${page.slug}`}
                            className={`settings-nav-item ${activePage === page.slug ? 'active' : ''} ${!formData[page.slug]?.is_active ? 'inactive' : ''}`}
                            onClick={(e) => { e.preventDefault(); setActivePage(page.slug); setSaved(false); setActiveTab('en'); }}
                        >
                            <i className={`fas ${pageIcons[page.slug] || 'fa-file'}`}></i> 
                            {page.title}
                            {!formData[page.slug]?.is_active && <span className="nav-badge inactive">Off</span>}
                        </a>
                    ))}
                </div>

                {/* Page Content */}
                <div className="settings-content">
                    {currentPage && (
                        <>
                            {/* Page Header */}
                            <div className="page-edit-header">
                                <div className="page-edit-info">
                                    <h3>
                                        <i className={`fas ${pageIcons[activePage] || 'fa-file'}`}></i>
                                        {currentData.title || currentPage.title}
                                    </h3>
                                    <span className="page-url">
                                        <i className="fas fa-link"></i>
                                        /{activePage === 'home' ? '' : activePage}
                                    </span>
                                </div>
                                <div className="page-edit-actions">
                                    <a 
                                        href={`/${activePage === 'home' ? '' : activePage}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline"
                                    >
                                        <i className="fas fa-external-link-alt"></i> Preview
                                    </a>
                                    <button 
                                        className={`btn ${currentData.is_active ? 'btn-success' : 'btn-secondary'}`}
                                        onClick={toggleStatus}
                                    >
                                        <i className={`fas ${currentData.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                                        {currentData.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            </div>

                            {/* Language Tabs */}
                            <div className="language-tabs">
                                <button 
                                    className={`lang-tab ${activeTab === 'en' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('en')}
                                >
                                    <span className="flag">🇬🇧</span> English
                                </button>
                                <button 
                                    className={`lang-tab ${activeTab === 'sw' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('sw')}
                                >
                                    <span className="flag">🇹🇿</span> Swahili
                                </button>
                            </div>

                            {/* Content Section */}
                            <div className="settings-section">
                                <h3>{activeTab === 'en' ? 'English Content' : 'Swahili Content'}</h3>
                                <p>{activeTab === 'en' ? 'Page content in English' : 'Maudhui ya ukurasa kwa Kiswahili'}</p>

                                <div className="form-group">
                                    <label>{activeTab === 'en' ? 'Page Title' : 'Kichwa cha Ukurasa'} *</label>
                                    <input 
                                        type="text" 
                                        value={activeTab === 'en' ? currentData.title : currentData.title_sw}
                                        onChange={(e) => handleChange(activeTab === 'en' ? 'title' : 'title_sw', e.target.value)}
                                        placeholder={activeTab === 'en' ? 'Enter page title' : 'Ingiza kichwa cha ukurasa'}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{activeTab === 'en' ? 'Meta Description (SEO)' : 'Maelezo ya Meta (SEO)'}</label>
                                    <textarea 
                                        value={activeTab === 'en' ? currentData.meta_description : currentData.meta_description_sw}
                                        onChange={(e) => handleChange(activeTab === 'en' ? 'meta_description' : 'meta_description_sw', e.target.value)}
                                        placeholder={activeTab === 'en' ? 'Brief description for search engines (recommended: 150-160 characters)' : 'Maelezo mafupi kwa injini za utafutaji'}
                                        rows={3}
                                    />
                                    <small className="char-count">
                                        {(activeTab === 'en' ? currentData.meta_description : currentData.meta_description_sw)?.length || 0}/160 characters
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>{activeTab === 'en' ? 'Page Content' : 'Maudhui ya Ukurasa'}</label>
                                    <textarea 
                                        value={activeTab === 'en' ? currentData.content : currentData.content_sw}
                                        onChange={(e) => handleChange(activeTab === 'en' ? 'content' : 'content_sw', e.target.value)}
                                        placeholder={activeTab === 'en' ? 'Main content for this page (supports Markdown formatting)' : 'Maudhui makuu ya ukurasa huu'}
                                        rows={10}
                                        className="content-textarea"
                                    />
                                    <small>Supports Markdown: **bold**, *italic*, ## Heading, - bullet list</small>
                                </div>
                            </div>

                            {/* Banner Section */}
                            <div className="settings-section">
                                <h3>Banner Image</h3>
                                <p>Header image displayed at the top of the page</p>

                                <div className="form-group">
                                    <label>Banner Image URL</label>
                                    <input 
                                        type="text" 
                                        value={currentData.banner_image}
                                        onChange={(e) => handleChange('banner_image', e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>

                                {currentData.banner_image && (
                                    <div className="banner-preview-large">
                                        <img src={currentData.banner_image} alt="Banner preview" />
                                        <button 
                                            className="remove-banner"
                                            onClick={() => handleChange('banner_image', '')}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Save Bar */}
                            <div className="save-bar">
                                {saved && <span className="save-success"><i className="fas fa-check"></i> Saved!</span>}
                                <button className="btn btn-secondary" onClick={handleReset} disabled={saving}>
                                    <i className="fas fa-undo"></i> Reset
                                </button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving || !currentData.title?.trim()}>
                                    {saving ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                                    ) : (
                                        <><i className="fas fa-save"></i> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .settings-nav-item.inactive {
                    opacity: 0.6;
                }

                .nav-badge {
                    margin-left: auto;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 8px;
                    background: #999;
                    color: #fff;
                }

                .nav-badge.inactive {
                    background: #e53935;
                }

                .page-edit-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 25px;
                    background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
                    border-radius: 12px;
                    margin-bottom: 20px;
                    color: #fff;
                }

                .page-edit-info h3 {
                    margin: 0 0 5px 0;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .page-url {
                    font-size: 13px;
                    opacity: 0.8;
                    font-family: monospace;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .page-edit-actions {
                    display: flex;
                    gap: 10px;
                }

                .page-edit-actions .btn-outline {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: #fff;
                }

                .page-edit-actions .btn-outline:hover {
                    background: rgba(255,255,255,0.2);
                }

                .page-edit-actions .btn-success {
                    background: rgba(76, 175, 80, 0.9);
                }

                .language-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .lang-tab {
                    flex: 1;
                    padding: 12px 20px;
                    background: #f5f5f5;
                    border: 2px solid transparent;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #666;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s;
                }

                .lang-tab:hover {
                    background: #eee;
                }

                .lang-tab.active {
                    background: #fff;
                    border-color: var(--admin-primary);
                    color: var(--admin-primary);
                }

                .lang-tab .flag {
                    font-size: 18px;
                }

                .content-textarea {
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .char-count {
                    color: #999;
                    font-size: 12px;
                    margin-top: 5px;
                    display: block;
                }

                .banner-preview-large {
                    position: relative;
                    margin-top: 15px;
                    border-radius: 10px;
                    overflow: hidden;
                    max-height: 200px;
                }

                .banner-preview-large img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }

                .remove-banner {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 32px;
                    height: 32px;
                    background: rgba(0,0,0,0.6);
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                .remove-banner:hover {
                    background: #e53935;
                }

                /* Dark mode */
                .dark-mode .page-edit-header {
                    background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
                }

                .dark-mode .lang-tab {
                    background: #1e3a5f;
                    color: #aaa;
                }

                .dark-mode .lang-tab:hover {
                    background: #2a4a6f;
                }

                .dark-mode .lang-tab.active {
                    background: #16213e;
                    border-color: var(--admin-primary);
                    color: #fff;
                }

                .dark-mode .content-textarea {
                    background: #1e3a5f;
                    color: #e0e0e0;
                }

                @media (max-width: 768px) {
                    .page-edit-header {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }

                    .page-edit-actions {
                        width: 100%;
                        justify-content: center;
                    }

                    .language-tabs {
                        flex-direction: column;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
