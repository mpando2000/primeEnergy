import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

interface SubService { id: number; name: string; name_sw: string | null; status: string; source_lang: string; }
interface Service { id: number; name: string; name_sw: string | null; description: string | null; description_sw: string | null; content: string | null; content_sw: string | null; images: string[] | null; icon: string; status: string; source_lang: string; sub_services: SubService[]; }
interface Props { services: Service[]; }

export default function Services({ services: initialServices }: Props) {
    const { auth } = usePage().props as unknown as { auth: { permissions: string[] } };
    const canCreate = auth.permissions?.includes('services.create') ?? false;
    const canEdit = auth.permissions?.includes('services.edit') ?? false;
    const canDelete = auth.permissions?.includes('services.delete') ?? false;
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', content: '', icon: 'fa-bolt', sourceLang: 'en' as 'en' | 'sw' });
    const [images, setImages] = useState<string[]>([]);
    const [imageTab, setImageTab] = useState<'url' | 'file'>('url');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newSubService, setNewSubService] = useState<{[key: number]: string}>({});
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{type: 'service' | 'subservice', serviceId: number, subId?: number, name: string} | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showEditSubModal, setShowEditSubModal] = useState(false);
    const [editingSubService, setEditingSubService] = useState<{serviceId: number, subId: number} | null>(null);
    const [editSubName, setEditSubName] = useState('');
    const [editSubLang, setEditSubLang] = useState<'en' | 'sw'>('en');
    const [currentEditingSub, setCurrentEditingSub] = useState<SubService | null>(null);
    const icons = [
        'fa-bolt', 'fa-fan', 'fa-network-wired', 'fa-shield-alt', 'fa-plug', 'fa-solar-panel', 'fa-tools', 'fa-broadcast-tower',
        'fa-video', 'fa-camera', 'fa-fire-extinguisher', 'fa-fire', 'fa-bell', 'fa-exclamation-triangle',
        'fa-lock', 'fa-key', 'fa-door-open', 'fa-door-closed', 'fa-eye', 'fa-search',
        'fa-lightbulb', 'fa-power-off', 'fa-battery-full', 'fa-charging-station', 'fa-satellite-dish',
        'fa-wifi', 'fa-ethernet', 'fa-server', 'fa-microchip', 'fa-mobile-alt',
        'fa-thermometer-half', 'fa-snowflake', 'fa-wind', 'fa-compress-arrows-alt', 'fa-expand-arrows-alt',
        'fa-wrench', 'fa-screwdriver', 'fa-hammer', 'fa-cogs', 'fa-gear'
    ];

    const openAddModal = () => { setEditingService(null); setFormData({ name: '', description: '', content: '', icon: 'fa-bolt', sourceLang: 'en' }); setImages([]); setImageUrl(''); setShowModal(true); };
    const openEditModal = (service: Service) => { 
        setEditingService(service); 
        const lang = (service.source_lang === 'sw' ? 'sw' : 'en') as 'en' | 'sw';
        setFormData({ 
            name: lang === 'en' ? service.name : (service.name_sw || service.name), 
            description: lang === 'en' ? (service.description || '') : (service.description_sw || service.description || ''), 
            content: lang === 'en' ? (service.content || '') : (service.content_sw || service.content || ''), 
            icon: service.icon,
            sourceLang: lang
        }); 
        setImages(service.images || []); 
        setImageUrl(''); 
        setShowModal(true); 
    };
    const handleLanguageSwitch = (lang: 'en' | 'sw') => {
        if (editingService) {
            setFormData({
                ...formData,
                name: lang === 'en' ? editingService.name : (editingService.name_sw || editingService.name),
                description: lang === 'en' ? (editingService.description || '') : (editingService.description_sw || editingService.description || ''),
                content: lang === 'en' ? (editingService.content || '') : (editingService.content_sw || editingService.content || ''),
                sourceLang: lang,
            });
        } else {
            setFormData({ ...formData, sourceLang: lang });
        }
    };
    const closeModal = () => { setShowModal(false); setEditingService(null); };
    const getCsrfToken = (): string => { const token = document.head.querySelector('meta[name="csrf-token"]'); return token ? (token as HTMLMetaElement).content : ''; };
    const addImageFromUrl = () => { if (imageUrl.trim()) { setImages([...images, imageUrl.trim()]); setImageUrl(''); } };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) { alert('Please select image files only'); continue; }
            try {
                const uploadData = new FormData();
                uploadData.append('image', file);
                const response = await axios.post('/admin/upload-image', uploadData, { headers: { 'Content-Type': 'multipart/form-data', 'X-CSRF-TOKEN': getCsrfToken() }, withCredentials: true });
                if (response.data.url) { setImages(prev => [...prev, response.data.url]); }
            } catch (error) { console.error('Upload failed:', error); alert('Failed to upload file'); }
        }
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const removeImage = (index: number) => { setImages(images.filter((_, i) => i !== index)); };
    const applyFormat = (format: string) => {
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
        if (!textarea) return;
        const start = textarea.selectionStart, end = textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end);
        let newText = '', cursorOffset = 0;
        if (format === 'bold') { newText = '**' + selectedText + '**'; cursorOffset = 2; }
        else if (format === 'italic') { newText = '*' + selectedText + '*'; cursorOffset = 1; }
        else if (format === 'heading') { newText = '\n## ' + selectedText; cursorOffset = 4; }
        else if (format === 'paragraph') { newText = '\n\n' + selectedText; cursorOffset = 2; }
        else if (format === 'bullet') { newText = '\n- ' + selectedText; cursorOffset = 3; }
        else if (format === 'number') { newText = '\n1. ' + selectedText; cursorOffset = 4; }
        else return;
        setFormData({ ...formData, content: formData.content.substring(0, start) + newText + formData.content.substring(end) });
        setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + cursorOffset, start + cursorOffset + selectedText.length); }, 0);
    };
    const handleSave = () => {
        if (!formData.name.trim() || saving) return;
        setSaving(true);
        const data = { ...formData, images: images.length > 0 ? images : null, source_lang: formData.sourceLang };
        if (editingService) { router.put('/admin/services/' + editingService.id, data, { onSuccess: () => { closeModal(); setSaving(false); }, onError: () => setSaving(false) }); }
        else { router.post('/admin/services', data, { onSuccess: () => { closeModal(); setSaving(false); }, onError: () => setSaving(false) }); }
    };
    const openDeleteDialog = (type: 'service' | 'subservice', serviceId: number, name: string, subId?: number) => { setDeleteTarget({ type, serviceId, subId, name }); setDeleteConfirmText(''); setShowDeleteDialog(true); };
    const closeDeleteDialog = () => { setShowDeleteDialog(false); setDeleteTarget(null); setDeleteConfirmText(''); };
    const confirmDelete = () => {
        if (!deleteTarget || deleteConfirmText !== deleteTarget.name) return;
        setSaving(true);
        if (deleteTarget.type === 'service') { router.delete('/admin/services/' + deleteTarget.serviceId, { onSuccess: () => { closeDeleteDialog(); setSaving(false); }, onError: () => setSaving(false) }); }
        else if (deleteTarget.subId) { router.delete('/admin/services/' + deleteTarget.serviceId + '/sub/' + deleteTarget.subId, { onSuccess: () => { closeDeleteDialog(); setSaving(false); }, onError: () => setSaving(false) }); }
    };
    const openEditSubModal = (serviceId: number, sub: SubService) => { 
        setEditingSubService({ serviceId, subId: sub.id }); 
        setCurrentEditingSub(sub);
        const lang = (sub.source_lang === 'sw' ? 'sw' : 'en') as 'en' | 'sw';
        setEditSubName(lang === 'en' ? sub.name : (sub.name_sw || sub.name)); 
        setEditSubLang(lang);
        setShowEditSubModal(true); 
    };
    const handleSubLanguageSwitch = (lang: 'en' | 'sw') => {
        if (currentEditingSub) {
            setEditSubName(lang === 'en' ? currentEditingSub.name : (currentEditingSub.name_sw || currentEditingSub.name));
            setEditSubLang(lang);
        }
    };
    const closeEditSubModal = () => { setShowEditSubModal(false); setEditingSubService(null); setEditSubName(''); setCurrentEditingSub(null); };
    const saveSubService = () => { if (!editingSubService || !editSubName.trim()) return; setSaving(true); router.put('/admin/services/' + editingSubService.serviceId + '/sub/' + editingSubService.subId, { name: editSubName.trim(), source_lang: editSubLang }, { onSuccess: () => { closeEditSubModal(); setSaving(false); }, onError: () => setSaving(false) }); };
    const addSubService = (serviceId: number) => { const name = newSubService[serviceId]?.trim(); if (!name || saving) return; setSaving(true); router.post('/admin/services/' + serviceId + '/sub', { name, source_lang: 'en' }, { onSuccess: () => { setNewSubService({ ...newSubService, [serviceId]: '' }); setSaving(false); }, onError: () => setSaving(false) }); };
    const toolbarBtnStyle: React.CSSProperties = { background: '#fff', border: '1px solid #ddd', borderRadius: '4px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' };

    return (
        <AdminLayout title="Manage Services">
            <div className="page-toolbar"><div></div>{canCreate && <button className="btn btn-primary" onClick={openAddModal}><i className="fas fa-plus"></i> Add Service Category</button>}</div>
            <div className="services-list">
                {initialServices.length === 0 ? (<div className="empty-state"><i className="fas fa-cogs"></i><p>No services added yet</p></div>) : (
                    initialServices.map(service => (
                        <div key={service.id} className="service-card service-card-with-images">
                            {/* Cover Image Section */}
                            {service.images && service.images.length > 0 ? (
                                <div className="service-cover-image">
                                    <img src={service.images[0]} alt={service.name} />
                                    <div className="service-cover-overlay">
                                        <span className="service-icon-overlay"><i className={'fas ' + service.icon}></i></span>
                                    </div>
                                    {service.images.length > 1 && (
                                        <span className="image-count-badge"><i className="fas fa-images"></i> {service.images.length}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="service-cover-placeholder">
                                    <i className={'fas ' + service.icon}></i>
                                </div>
                            )}
                            
                            {/* Content Section */}
                            <div className="service-card-content">
                                <div className="service-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, flex: 1 }}>
                                        <span className="service-name">{service.name}</span>
                                        {service.status === 'Draft' && <span className="status-badge draft">Draft</span>}
                                    </h3>
                                    <div className="service-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        {canEdit && <button 
                                            onClick={() => openEditModal(service)} 
                                            title="Edit"
                                            style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>}
                                        {canDelete && <button 
                                            onClick={() => openDeleteDialog('service', service.id, service.name)} 
                                            title="Delete"
                                            style={{ background: '#ffebee', color: '#d32f2f', border: 'none', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>}
                                    </div>
                                </div>
                                
                                {service.description && <p className="service-description">{service.description}</p>}
                                
                                {/* Image Thumbnails */}
                                {service.images && service.images.length > 1 && (
                                    <div className="service-thumbnails">
                                        {service.images.slice(1, 5).map((img, idx) => (
                                            <div key={idx} className="thumb-item">
                                                <img src={img} alt={`${service.name} ${idx + 2}`} />
                                            </div>
                                        ))}
                                        {service.images.length > 5 && (
                                            <div className="thumb-item thumb-more">
                                                <span>+{service.images.length - 5}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Sub-services */}
                                <div className="sub-services-list">
                                    {service.sub_services && service.sub_services.length > 0 ? (
                                        service.sub_services.map(sub => (
                                            <div key={sub.id} className="sub-service">
                                                <span><i className="fas fa-angle-right"></i>{sub.name}{sub.status === 'Draft' && <span className="status-badge draft">Draft</span>}</span>
                                                <div style={{ display: 'flex', gap: '2px', opacity: 0.5 }}>
                                                    {canEdit && <button onClick={() => openEditSubModal(service.id, sub)} title="Edit Sub-service" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '2px', fontSize: '10px' }}><i className="fas fa-pen"></i></button>}
                                                    {canDelete && <button onClick={() => openDeleteDialog('subservice', service.id, sub.name, sub.id)} title="Remove Sub-service" style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: '2px', fontSize: '10px' }}><i className="fas fa-times"></i></button>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-sub">No sub-services added yet</div>
                                    )}
                                </div>
                                
                                {canCreate && <div className="add-sub-service">
                                    <input type="text" placeholder="Add sub-service..." value={newSubService[service.id] || ''} onChange={(e) => setNewSubService({ ...newSubService, [service.id]: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addSubService(service.id)} />
                                    <button onClick={() => addSubService(service.id)} disabled={saving}><i className="fas fa-plus"></i></button>
                                </div>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay active">
                    <div className="modal" style={{ maxWidth: '800px' }}>
                        <div className="modal-header"><h3>{editingService ? 'Edit Service Category' : 'Add Service Category'}</h3><button className="modal-close" onClick={closeModal}>&times;</button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Category Name *</label><input type="text" placeholder="e.g., Power Distribution" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="form-group">
                                <label>Content Language</label>
                                <div className="language-selector">
                                    <button type="button" className={`lang-btn ${formData.sourceLang === 'en' ? 'active' : ''}`} onClick={() => handleLanguageSwitch('en')}>🇬🇧 English</button>
                                    <button type="button" className={`lang-btn ${formData.sourceLang === 'sw' ? 'active' : ''}`} onClick={() => handleLanguageSwitch('sw')}>🇹🇿 Swahili</button>
                                </div>
                                <small className="form-hint">{editingService ? (<><i className="fas fa-language"></i> Switch to view/edit {formData.sourceLang === 'en' ? 'English' : 'Swahili'} content</>) : (<><i className="fas fa-magic"></i> Content will be auto-translated to {formData.sourceLang === 'en' ? 'Swahili' : 'English'} on save</>)}</small>
                            </div>
                            <div className="form-group"><label>Short Description</label><input type="text" placeholder="Brief description shown in service cards" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                            <div className="form-group"><label>Icon</label><div className="icon-picker" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{icons.map(icon => (<div key={icon} className={'icon-option ' + (formData.icon === icon ? 'selected' : '')} onClick={() => setFormData({ ...formData, icon })} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid ' + (formData.icon === icon ? '#4671b0' : '#ddd'), borderRadius: '8px', cursor: 'pointer', background: formData.icon === icon ? '#4671b0' : '#fff', color: formData.icon === icon ? '#fff' : '#333', fontSize: '16px' }}><i className={'fas ' + icon}></i></div>))}</div></div>
                            <div className="form-group">
                                <label>Page Content (Rich Text)</label>
                                <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ background: '#f5f5f5', padding: '8px 12px', borderBottom: '1px solid #ddd', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                        <button type="button" onClick={() => applyFormat('bold')} style={toolbarBtnStyle} title="Bold"><i className="fas fa-bold"></i></button>
                                        <button type="button" onClick={() => applyFormat('italic')} style={toolbarBtnStyle} title="Italic"><i className="fas fa-italic"></i></button>
                                        <span style={{ borderLeft: '1px solid #ccc', margin: '0 5px' }}></span>
                                        <button type="button" onClick={() => applyFormat('heading')} style={toolbarBtnStyle} title="Heading"><i className="fas fa-heading"></i></button>
                                        <button type="button" onClick={() => applyFormat('paragraph')} style={toolbarBtnStyle} title="Paragraph"><i className="fas fa-paragraph"></i></button>
                                        <span style={{ borderLeft: '1px solid #ccc', margin: '0 5px' }}></span>
                                        <button type="button" onClick={() => applyFormat('bullet')} style={toolbarBtnStyle} title="Bullet List"><i className="fas fa-list-ul"></i></button>
                                        <button type="button" onClick={() => applyFormat('number')} style={toolbarBtnStyle} title="Numbered List"><i className="fas fa-list-ol"></i></button>
                                    </div>
                                    <textarea id="content-editor" placeholder="Write detailed content for the service page..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} style={{ width: '100%', border: 'none', padding: '12px', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6' }} />
                                </div>
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Supports Markdown formatting.</small>
                            </div>

                            <div className="form-group">
                                <label>Images ({images.length} added)</label>
                                <div className="image-upload-tabs"><button type="button" className={'tab-btn ' + (imageTab === 'url' ? 'active' : '')} onClick={() => setImageTab('url')}>Add URL</button><button type="button" className={'tab-btn ' + (imageTab === 'file' ? 'active' : '')} onClick={() => setImageTab('file')}>Upload Files</button></div>
                                {imageTab === 'url' ? (<div className="url-input-group"><input type="text" placeholder="https://images.unsplash.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()} /><button type="button" className="btn btn-primary" onClick={addImageFromUrl}><i className="fas fa-plus"></i> Add</button></div>) : (<><div className={'file-upload-area ' + (isUploading ? 'uploading' : '')} onClick={() => !isUploading && fileInputRef.current?.click()} style={{ padding: '20px', cursor: 'pointer' }}>{isUploading ? (<><i className="fas fa-spinner fa-spin"></i><p>Uploading...</p></>) : (<><i className="fas fa-cloud-upload-alt"></i><p>Click to browse</p><span>JPG, PNG, WebP (Max 8MB)</span></>)}</div><input type="file" ref={fileInputRef} accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} /></>)}
                                {images.length > 0 && (<div className="images-gallery">{images.map((img, index) => (<div key={index} className="gallery-thumb"><img src={img} alt={'Preview ' + (index + 1)} /><button type="button" className="remove-image" onClick={() => removeImage(index)}><i className="fas fa-times"></i></button>{index === 0 && <span className="primary-badge">Cover</span>}</div>))}</div>)}
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-secondary" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving || isUploading}><i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save'}</button></div>
                    </div>
                </div>
            )}
            {showEditSubModal && editingSubService && (<div className="modal-overlay active"><div className="modal modal-service"><div className="modal-header"><h3>Edit Sub-Service</h3><button className="modal-close" onClick={closeEditSubModal}>&times;</button></div><div className="modal-body"><div className="form-group"><label>Sub-Service Name *</label><input type="text" placeholder="Enter sub-service name" value={editSubName} onChange={(e) => setEditSubName(e.target.value)} /></div><div className="form-group"><label>Content Language</label><div className="language-selector"><button type="button" className={`lang-btn ${editSubLang === 'en' ? 'active' : ''}`} onClick={() => handleSubLanguageSwitch('en')}>🇬🇧 English</button><button type="button" className={`lang-btn ${editSubLang === 'sw' ? 'active' : ''}`} onClick={() => handleSubLanguageSwitch('sw')}>🇹🇿 Swahili</button></div><small className="form-hint"><i className="fas fa-language"></i> Switch to view/edit {editSubLang === 'en' ? 'English' : 'Swahili'} content</small></div></div><div className="modal-footer"><button className="btn btn-secondary" onClick={closeEditSubModal}>Cancel</button><button className="btn btn-primary" onClick={saveSubService} disabled={saving}><i className="fas fa-save"></i> {saving ? 'Saving...' : 'Save'}</button></div></div></div>)}
            {showDeleteDialog && deleteTarget && (<div className="modal-overlay active"><div className="modal modal-delete"><div className="modal-header"><h3>Delete {deleteTarget.type === 'service' ? 'Service Category' : 'Sub-Service'}</h3><button className="modal-close" onClick={closeDeleteDialog}>&times;</button></div><div className="modal-body"><p className="delete-warning">This action <strong>cannot be undone</strong>. This will permanently delete the {deleteTarget.type === 'service' ? 'service category and all its sub-services' : 'sub-service'}.</p><p className="delete-confirm-label">Please type <strong>{deleteTarget.name}</strong> to confirm.</p><input type="text" className="delete-confirm-input" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder={deleteTarget.name} /></div><div className="modal-footer"><button className="btn btn-danger btn-block" onClick={confirmDelete} disabled={deleteConfirmText !== deleteTarget.name || saving}>{saving ? 'Deleting...' : 'Delete this ' + (deleteTarget.type === 'service' ? 'service' : 'sub-service')}</button></div></div></div>)}
        </AdminLayout>
    );
}
