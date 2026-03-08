import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';

interface MediaItem {
    id: number;
    title: string;
    title_sw: string | null;
    type: 'slide' | 'md' | 'team';
    image_path: string;
    description: string | null;
    description_sw: string | null;
    link_url: string | null;
    link_text: string | null;
    link_text_sw: string | null;
    position: string | null;
    sort_order: number;
    is_active: boolean;
    source_lang: string;
}

interface PageBanner {
    id: number;
    page_key: string;
    page_name: string;
    image_url: string | null;
}

interface Props {
    media: MediaItem[];
    banners: PageBanner[];
    counts: {
        slide: number;
        md: number;
        team: number;
    };
}

type MediaType = 'slide' | 'md' | 'team';
type SectionType = MediaType | 'banner';

const typeConfig = {
    slide: { label: 'Home Slides', icon: 'fa-images', color: '#4671b0', description: 'Hero carousel images' },
    md: { label: 'Managing Director', icon: 'fa-user-tie', color: '#1565C0', description: 'Profile image' },
    team: { label: 'Our Team', icon: 'fa-users', color: '#7B1FA2', description: 'Team photos' },
    banner: { label: 'Page Banners', icon: 'fa-panorama', color: '#455A64', description: 'Page header images' },
};

const pageIcons: Record<string, string> = {
    about: 'fa-info-circle',
    services: 'fa-cogs',
    projects: 'fa-project-diagram',
    training: 'fa-graduation-cap',
    contact: 'fa-envelope',
    md: 'fa-user-tie',
};

export default function Gallery({ media = [], banners = [], counts = { slide: 0, md: 0, team: 0 } }: Props) {
    const { auth } = usePage().props as unknown as { auth: { permissions: string[] } };
    const canCreate = auth.permissions?.includes('gallery.upload') ?? false;
    const canEdit = auth.permissions?.includes('gallery.edit') ?? false;
    const canDelete = auth.permissions?.includes('gallery.delete') ?? false;
    
    const [activeSection, setActiveSection] = useState<SectionType>('slide');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [editingBanner, setEditingBanner] = useState<PageBanner | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'slide' as MediaType,
        description: '',
        link_url: '',
        link_text: '',
        position: '',
        is_active: true,
        sourceLang: 'en' as 'en' | 'sw',
    });
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [imageTab, setImageTab] = useState<'url' | 'file'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

    const filteredMedia = media.filter(item => item.type === activeSection);

    const openAddModal = () => {
        setEditingItem(null);
        setEditingBanner(null);
        setFormData({
            title: '',
            type: activeSection as MediaType,
            description: '',
            link_url: '',
            link_text: '',
            position: '',
            is_active: true,
            sourceLang: 'en',
        });
        setImageUrl('');
        setImagePreview('');
        setImageTab('url');
        setShowModal(true);
    };

    const openEditModal = (item: MediaItem) => {
        setEditingItem(item);
        setEditingBanner(null);
        const lang = (item.source_lang === 'sw' ? 'sw' : 'en') as 'en' | 'sw';
        setFormData({
            title: lang === 'en' ? item.title : (item.title_sw || item.title),
            type: item.type,
            description: lang === 'en' ? (item.description || '') : (item.description_sw || item.description || ''),
            link_url: item.link_url || '',
            link_text: lang === 'en' ? (item.link_text || '') : (item.link_text_sw || item.link_text || ''),
            position: item.position || '',
            is_active: item.is_active,
            sourceLang: lang,
        });
        setImageUrl(item.image_path);
        setImagePreview(item.image_path);
        setImageTab('url');
        setShowModal(true);
    };

    const openBannerModal = (banner: PageBanner) => {
        setEditingBanner(banner);
        setEditingItem(null);
        setImageUrl(banner.image_url || '');
        setImagePreview(banner.image_url || '');
        setImageTab('url');
        setShowModal(true);
    };

    const handleLanguageSwitch = (lang: 'en' | 'sw') => {
        if (editingItem) {
            setFormData({
                ...formData,
                title: lang === 'en' ? editingItem.title : (editingItem.title_sw || editingItem.title),
                description: lang === 'en' ? (editingItem.description || '') : (editingItem.description_sw || editingItem.description || ''),
                link_text: lang === 'en' ? (editingItem.link_text || '') : (editingItem.link_text_sw || editingItem.link_text || ''),
                sourceLang: lang,
            });
        } else {
            setFormData({ ...formData, sourceLang: lang });
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setEditingBanner(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsUploading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('image', file);

            const response = await window.axios.post('/admin/upload-image', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.url) {
                setImageUrl(response.data.url);
                setImagePreview(response.data.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        }
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = () => {
        // Handle banner save
        if (editingBanner) {
            if (!imageUrl.trim()) {
                alert('Please provide an image URL');
                return;
            }
            setIsSubmitting(true);
            router.put(`/admin/banners/${editingBanner.id}`, { image_url: imageUrl }, {
                onSuccess: () => closeModal(),
                onFinish: () => setIsSubmitting(false),
            });
            return;
        }

        // Handle media save
        if (!formData.title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (!imageUrl && !editingItem) {
            alert('Please add an image');
            return;
        }

        setIsSubmitting(true);
        const data = {
            ...formData,
            image_url: imageUrl,
            source_lang: formData.sourceLang,
        };

        const url = editingItem ? `/admin/gallery/${editingItem.id}` : '/admin/gallery';
        
        router.post(url, data, {
            onSuccess: () => {
                closeModal();
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const openDeleteDialog = (item: MediaItem) => {
        setDeleteTarget(item);
        setDeleteConfirmText('');
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleteConfirmText !== deleteTarget.title) return;
        setIsSubmitting(true);
        router.delete(`/admin/gallery/${deleteTarget.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setDeleteTarget(null);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const toggleActive = (item: MediaItem) => {
        router.patch(`/admin/gallery/${item.id}/toggle`);
    };

    return (
        <AdminLayout title="Media Manager">
            {/* Stats Bar */}
            <div className="stats-bar">
                {(['slide', 'md', 'team'] as MediaType[]).map((type) => (
                    <div key={type} className="stat-item">
                        {typeConfig[type].label}: <strong>{counts[type]}</strong>
                    </div>
                ))}
                <div className="stat-item">
                    {typeConfig.banner.label}: <strong>{banners.length}</strong>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="media-tabs-inline">
                        {(['slide', 'md', 'team', 'banner'] as SectionType[]).map((type) => (
                            <button
                                key={type}
                                className={`tab-btn-inline ${activeSection === type ? 'active' : ''}`}
                                onClick={() => setActiveSection(type)}
                            >
                                <i className={`fas ${typeConfig[type].icon}`}></i>
                                <span>{typeConfig[type].label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {activeSection !== 'banner' && canCreate && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <i className="fas fa-plus"></i> Add {typeConfig[activeSection].label.replace(/s$/, '')}
                    </button>
                )}
            </div>

            {/* Page Banners Grid */}
            {activeSection === 'banner' ? (
                <div className="banners-grid">
                    {banners.map((banner) => (
                        <div key={banner.id} className="banner-card">
                            <div className="banner-preview">
                                {banner.image_url ? (
                                    <img src={banner.image_url} alt={banner.page_name} />
                                ) : (
                                    <div className="no-image">
                                        <i className="fas fa-image"></i>
                                        <span>No image set</span>
                                    </div>
                                )}
                                <div className="banner-overlay">
                                    {canEdit && <button className="edit-btn" onClick={() => openBannerModal(banner)}>
                                        <i className="fas fa-edit"></i> Change Image
                                    </button>}
                                </div>
                            </div>
                            <div className="banner-info">
                                <h4>
                                    <i className={`fas ${pageIcons[banner.page_key] || 'fa-file'}`}></i>
                                    {banner.page_name}
                                </h4>
                                <span className="page-path">/{banner.page_key}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Media Grid */
                <div className="gallery-grid-new">
                    {filteredMedia.length === 0 ? (
                        <div className="empty-state">
                            <i className={`fas ${typeConfig[activeSection].icon}`}></i>
                            <p>No {typeConfig[activeSection].label.toLowerCase()} added yet</p>
                            <button className="btn btn-primary" onClick={openAddModal}>
                                <i className="fas fa-plus"></i> Add First {typeConfig[activeSection].label.replace(/s$/, '')}
                            </button>
                        </div>
                    ) : (
                        filteredMedia.map((item) => (
                            <div key={item.id} className={`gallery-card ${!item.is_active ? 'inactive' : ''}`}>
                                <div className="gallery-image" onClick={() => setLightboxItem(item)}>
                                    <img src={item.image_path} alt={item.title} />
                                    <div className="gallery-overlay">
                                        <button className="overlay-btn view" onClick={(e) => { e.stopPropagation(); setLightboxItem(item); }}>
                                            <i className="fas fa-expand"></i>
                                        </button>
                                        {canEdit && <button className="overlay-btn edit" onClick={(e) => { e.stopPropagation(); openEditModal(item); }}>
                                            <i className="fas fa-edit"></i>
                                        </button>}
                                        {canDelete && <button className="overlay-btn delete" onClick={(e) => { e.stopPropagation(); openDeleteDialog(item); }}>
                                            <i className="fas fa-trash"></i>
                                        </button>}
                                    </div>
                                    {!item.is_active && <span className="gallery-category-badge" style={{ background: '#E53935' }}>Inactive</span>}
                                    <span className="gallery-category-badge" style={{ right: '10px', left: 'auto' }}>#{item.sort_order}</span>
                                </div>
                                <div className="gallery-card-info">
                                    <h4>{item.title}</h4>
                                    {item.position && <span className="gallery-date" style={{ color: '#4671b0' }}>{item.position}</span>}
                                    {item.description && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                        <span className="gallery-date"><i className={`fas ${typeConfig[item.type].icon}`}></i> {typeConfig[item.type].label}</span>
                                        <button 
                                            onClick={() => toggleActive(item)}
                                            style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', background: item.is_active ? '#e3f2fd' : '#fff', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            <i className={`fas ${item.is_active ? 'fa-eye' : 'fa-eye-slash'}`} style={{ color: item.is_active ? '#4671b0' : '#999' }}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay active">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>
                                {editingBanner 
                                    ? `Edit Banner - ${editingBanner.page_name}`
                                    : `${editingItem ? 'Edit' : 'Add'} ${typeConfig[formData.type].label.replace(/s$/, '')}`
                                }
                            </h3>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {editingBanner ? (
                                /* Banner Edit Form */
                                <div className="form-group">
                                    <label>Banner Image</label>
                                    <div className="image-upload-tabs">
                                        <button type="button" className={`tab-btn ${imageTab === 'url' ? 'active' : ''}`} onClick={() => setImageTab('url')}>URL</button>
                                        <button type="button" className={`tab-btn ${imageTab === 'file' ? 'active' : ''}`} onClick={() => setImageTab('file')}>Upload File</button>
                                    </div>
                                    {imageTab === 'url' ? (
                                        <input type="text" placeholder="https://images.unsplash.com/..." value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }} />
                                    ) : (
                                        <>
                                            <div className={`file-upload-area ${isUploading ? 'uploading' : ''}`} onClick={() => !isUploading && fileInputRef.current?.click()} style={{ padding: '20px' }}>
                                                {isUploading ? (<><i className="fas fa-spinner fa-spin"></i><p>Uploading...</p></>) : (<><i className="fas fa-cloud-upload-alt"></i><p>Click to browse</p><span>Recommended: 1600x300px</span></>)}
                                            </div>
                                            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                                        </>
                                    )}
                                    {imagePreview && (
                                        <div className="image-preview" style={{ marginTop: '15px' }}>
                                            <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Media Edit Form */
                                <>
                                    {formData.type === 'team' ? (
                                        <>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Full Name *</label>
                                                    <input type="text" placeholder="Enter full name" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Position / Role</label>
                                                    <input type="text" placeholder="e.g., Managing Director" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Content Language</label>
                                                <div className="language-selector" style={{ display: 'flex', gap: '10px' }}>
                                                    <button type="button" onClick={() => handleLanguageSwitch('en')} style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'en' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'en' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}>🇬🇧 English</button>
                                                    <button type="button" onClick={() => handleLanguageSwitch('sw')} style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'sw' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'sw' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}>🇹🇿 Swahili</button>
                                                </div>
                                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                                    {editingItem ? (<><i className="fas fa-language"></i> Switch to view/edit {formData.sourceLang === 'en' ? 'English' : 'Swahili'} content</>) : (<><i className="fas fa-magic"></i> Position will be auto-translated to {formData.sourceLang === 'en' ? 'Swahili' : 'English'} on save</>)}
                                                </small>
                                            </div>
                                        </>
                                    ) : formData.type === 'md' ? (
                                        <>
                                            <div className="form-group">
                                                <label>Managing Director Name *</label>
                                                <input type="text" placeholder="Enter managing director's full name" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Content Language</label>
                                                <div className="language-selector" style={{ display: 'flex', gap: '10px' }}>
                                                    <button type="button" onClick={() => handleLanguageSwitch('en')} style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'en' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'en' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}>🇬🇧 English</button>
                                                    <button type="button" onClick={() => handleLanguageSwitch('sw')} style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'sw' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'sw' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}>🇹🇿 Swahili</button>
                                                </div>
                                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                                    {editingItem ? (<><i className="fas fa-language"></i> Switch to view/edit {formData.sourceLang === 'en' ? 'English' : 'Swahili'} content</>) : (<><i className="fas fa-magic"></i> Content will be auto-translated to {formData.sourceLang === 'en' ? 'Swahili' : 'English'} on save</>)}
                                                </small>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="form-group">
                                            <label>Title *</label>
                                            <input type="text" placeholder="Enter title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                    )}

                                    {formData.type === 'slide' && (
                                        <div className="form-group">
                                            <label>Content Language</label>
                                            <div className="language-selector" style={{ display: 'flex', gap: '10px' }}>
                                                <button type="button" onClick={() => handleLanguageSwitch('en')} style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'en' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'en' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}>🇬🇧 English</button>
                                                <button type="button" onClick={() => handleLanguageSwitch('sw')} style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'sw' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'sw' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}>🇹🇿 Swahili</button>
                                            </div>
                                            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                                {editingItem ? (<><i className="fas fa-language"></i> Switch to view/edit {formData.sourceLang === 'en' ? 'English' : 'Swahili'} content</>) : (<><i className="fas fa-magic"></i> Content will be auto-translated to {formData.sourceLang === 'en' ? 'Swahili' : 'English'} on save</>)}
                                            </small>
                                        </div>
                                    )}

                                    {formData.type === 'slide' && (
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea placeholder="Slide subtitle text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                                        </div>
                                    )}

                                    {formData.type === 'slide' && (
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Button Text</label>
                                                <input type="text" placeholder="e.g., Learn More" value={formData.link_text} onChange={(e) => setFormData({ ...formData, link_text: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label>Button Link</label>
                                                <input type="text" placeholder="/services" value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Image *</label>
                                        <div className="image-upload-tabs">
                                            <button type="button" className={`tab-btn ${imageTab === 'url' ? 'active' : ''}`} onClick={() => setImageTab('url')}>Add URL</button>
                                            <button type="button" className={`tab-btn ${imageTab === 'file' ? 'active' : ''}`} onClick={() => setImageTab('file')}>Upload File</button>
                                        </div>
                                        
                                        {imageTab === 'url' ? (
                                            <input type="text" placeholder="https://images.unsplash.com/..." value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }} />
                                        ) : (
                                            <>
                                                <div className={`file-upload-area ${isUploading ? 'uploading' : ''}`} onClick={() => !isUploading && fileInputRef.current?.click()} style={{ padding: '20px' }}>
                                                    {isUploading ? (<><i className="fas fa-spinner fa-spin"></i><p>Uploading...</p></>) : (<><i className="fas fa-cloud-upload-alt"></i><p>Click to browse</p><span>JPG, PNG, WebP (Max 8MB)</span></>)}
                                                </div>
                                                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                                            </>
                                        )}
                                        
                                        {imagePreview && (
                                            <div className="image-preview" style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px' }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                                            Active (visible on website)
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal} disabled={isSubmitting || isUploading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={isSubmitting || isUploading}>
                                {isSubmitting ? (<><i className="fas fa-spinner fa-spin"></i> Saving...</>) : (<><i className="fas fa-save"></i> Save</>)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxItem && (
                <div className="lightbox-overlay" onClick={() => setLightboxItem(null)}>
                    <button className="lightbox-close" onClick={() => setLightboxItem(null)}>
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img src={lightboxItem.image_path} alt={lightboxItem.title} />
                        <div className="lightbox-info">
                            <h3>{lightboxItem.title}</h3>
                            {lightboxItem.position && <span style={{ color: '#FBC02D' }}>{lightboxItem.position}</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            {showDeleteDialog && deleteTarget && (
                <div className="modal-overlay active">
                    <div className="modal modal-delete">
                        <div className="modal-header">
                            <h3>Delete {typeConfig[deleteTarget.type].label.replace(/s$/, '')}</h3>
                            <button className="modal-close" onClick={() => setShowDeleteDialog(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-warning">
                                This action <strong>cannot be undone</strong>. This will permanently delete this item.
                            </p>
                            <p className="delete-confirm-label">
                                Please type <strong>{deleteTarget.title}</strong> to confirm.
                            </p>
                            <input 
                                type="text"
                                className="delete-confirm-input"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder={deleteTarget.title}
                            />
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-danger btn-block"
                                disabled={deleteConfirmText !== deleteTarget.title || isSubmitting}
                                onClick={confirmDelete}
                            >
                                {isSubmitting ? 'Deleting...' : 'I understand, delete this item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .media-tabs-inline { display: flex; gap: 4px; flex-wrap: wrap; }
                .tab-btn-inline {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 12px; border: 1px solid #ddd; background: #fff;
                    border-radius: 6px; cursor: pointer; font-size: 13px; color: #666;
                    transition: all 0.2s;
                }
                .tab-btn-inline:hover { border-color: #4671b0; color: #4671b0; }
                .tab-btn-inline.active { background: #4671b0; color: #fff; border-color: #4671b0; }
                .tab-btn-inline i { font-size: 12px; }
                .gallery-card.inactive { opacity: 0.6; }
                
                /* Banner styles */
                .banners-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .banner-card {
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                }
                .banner-preview {
                    position: relative;
                    height: 120px;
                    background: #f5f5f5;
                }
                .banner-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .banner-preview .no-image {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #999;
                }
                .banner-preview .no-image i {
                    font-size: 32px;
                    margin-bottom: 8px;
                }
                .banner-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .banner-card:hover .banner-overlay {
                    opacity: 1;
                }
                .banner-overlay .edit-btn {
                    padding: 10px 20px;
                    background: #fff;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .banner-overlay .edit-btn:hover {
                    background: #4671b0;
                    color: #fff;
                }
                .banner-info {
                    padding: 15px;
                }
                .banner-info h4 {
                    margin: 0 0 5px;
                    font-size: 16px;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .banner-info h4 i {
                    color: #4671b0;
                }
                .page-path {
                    font-size: 12px;
                    color: #999;
                }
                
                @media (max-width: 768px) {
                    .tab-btn-inline span { display: none; }
                    .tab-btn-inline { padding: 8px 10px; }
                    .banners-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </AdminLayout>
    );
}
