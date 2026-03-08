import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

interface TrainingPhoto {
    id: number;
    caption: string;
    caption_sw: string | null;
    location: string | null;
    location_sw: string | null;
    year: string | null;
    image: string;
    status: string;
    source_lang: string;
}

interface Props {
    trainings: TrainingPhoto[];
}

export default function Training({ trainings = [] }: Props) {
    const { auth } = usePage().props as unknown as { auth: { permissions: string[] } };
    const canCreate = auth.permissions?.includes('training.create') ?? false;
    const canEdit = auth.permissions?.includes('training.edit') ?? false;
    const canDelete = auth.permissions?.includes('training.delete') ?? false;
    
    const [showModal, setShowModal] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState<TrainingPhoto | null>(null);
    const [formData, setFormData] = useState({ caption: '', location: '', year: '', image: '', status: 'Published', sourceLang: 'en' as 'en' | 'sw' });
    const [imageTab, setImageTab] = useState<'url' | 'file'>('url');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<TrainingPhoto | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const publishedCount = trainings.filter(t => t.status === 'Published').length;
    const draftCount = trainings.filter(t => t.status === 'Draft').length;

    const openAddModal = () => {
        setEditingPhoto(null);
        setFormData({ caption: '', location: '', year: '', image: '', status: 'Published', sourceLang: 'en' });
        setImageTab('url');
        setShowModal(true);
    };

    const openEditModal = (photo: TrainingPhoto) => {
        setEditingPhoto(photo);
        const lang = (photo.source_lang === 'sw' ? 'sw' : 'en') as 'en' | 'sw';
        setFormData({ 
            caption: lang === 'en' ? photo.caption : (photo.caption_sw || photo.caption), 
            location: lang === 'en' ? (photo.location || '') : (photo.location_sw || photo.location || ''), 
            year: photo.year || '', 
            image: photo.image,
            status: photo.status,
            sourceLang: lang
        });
        setImageTab('url');
        setShowModal(true);
    };

    const handleLanguageSwitch = (lang: 'en' | 'sw') => {
        if (editingPhoto) {
            setFormData({
                ...formData,
                caption: lang === 'en' ? editingPhoto.caption : (editingPhoto.caption_sw || editingPhoto.caption),
                location: lang === 'en' ? (editingPhoto.location || '') : (editingPhoto.location_sw || editingPhoto.location || ''),
                sourceLang: lang,
            });
        } else {
            setFormData({ ...formData, sourceLang: lang });
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPhoto(null);
    };

    const getCsrfToken = (): string => {
        const token = document.head.querySelector('meta[name="csrf-token"]');
        return token ? (token as HTMLMetaElement).content : '';
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

            const response = await axios.post('/admin/training/upload-image', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                withCredentials: true,
            });

            if (response.data.url) {
                setFormData({ ...formData, image: response.data.url });
            }
        } catch (error: unknown) {
            console.error('Upload failed:', error);
            const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            let message = 'Unknown error';
            if (axiosError.response?.data?.errors?.image) {
                message = axiosError.response.data.errors.image[0];
            } else if (axiosError.response?.data?.message) {
                message = axiosError.response.data.message;
            }
            alert(`Failed to upload: ${message}`);
        }

        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = () => {
        if (!formData.caption.trim() || !formData.image.trim()) {
            alert('Please fill in required fields (Caption and Image)');
            return;
        }

        setIsSubmitting(true);

        const data = {
            caption: formData.caption,
            location: formData.location || null,
            year: formData.year || null,
            image: formData.image,
            status: formData.status,
            source_lang: formData.sourceLang,
        };

        if (editingPhoto) {
            router.put(`/admin/training/${editingPhoto.id}`, data, {
                onSuccess: () => closeModal(),
                onFinish: () => setIsSubmitting(false)
            });
        } else {
            router.post('/admin/training', data, {
                onSuccess: () => closeModal(),
                onFinish: () => setIsSubmitting(false)
            });
        }
    };

    const openDeleteDialog = (photo: TrainingPhoto) => {
        setDeleteTarget(photo);
        setDeleteConfirmText('');
        setShowDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
        setDeleteConfirmText('');
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleteConfirmText !== deleteTarget.caption) return;
        
        setIsSubmitting(true);
        router.delete(`/admin/training/${deleteTarget.id}`, {
            onSuccess: () => closeDeleteDialog(),
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <AdminLayout title="Staff Training Gallery">
            <div className="page-toolbar">
                <div></div>
                {canCreate && <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i> Add Training Photo
                </button>}
            </div>

            <div className="stats-bar">
                <div className="stat-item">Total: <strong>{trainings.length}</strong></div>
                <div className="stat-item">Published: <strong>{publishedCount}</strong></div>
                <div className="stat-item">Draft: <strong>{draftCount}</strong></div>
            </div>

            <div className="training-grid">
                {trainings.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-images"></i>
                        <p>No training photos yet</p>
                        {canCreate && <button className="btn btn-primary" onClick={openAddModal}>
                            <i className="fas fa-plus"></i> Add First Photo
                        </button>}
                    </div>
                ) : (
                    trainings.map(photo => (
                        <div key={photo.id} className="training-card">
                            <div className="training-image">
                                <img src={photo.image} alt={photo.caption} />
                                <span className={`training-status ${photo.status.toLowerCase()}`}>
                                    {photo.status}
                                </span>
                                <div className="training-overlay">
                                    {canEdit && <button className="edit-btn" onClick={() => openEditModal(photo)}>
                                        <i className="fas fa-edit"></i>
                                    </button>}
                                    {canDelete && <button className="delete-btn" onClick={() => openDeleteDialog(photo)}>
                                        <i className="fas fa-trash"></i>
                                    </button>}
                                </div>
                            </div>
                            <div className="training-info">
                                <p>{photo.caption}</p>
                                <div className="training-meta">
                                    <span><i className="fas fa-map-marker-alt"></i> {photo.location || 'N/A'}</span>
                                    <span><i className="fas fa-calendar"></i> {photo.year || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay active">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingPhoto ? 'Edit Training Photo' : 'Add Training Photo'}</h3>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Content Language</label>
                                <div className="language-selector" style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => handleLanguageSwitch('en')}
                                        style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'en' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'en' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}
                                    >
                                        🇬🇧 English
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleLanguageSwitch('sw')}
                                        style={{ flex: 1, padding: '8px', border: '2px solid', borderColor: formData.sourceLang === 'sw' ? '#4671b0' : '#ddd', borderRadius: '6px', background: formData.sourceLang === 'sw' ? '#e3f2fd' : '#fff', cursor: 'pointer' }}
                                    >
                                        🇹🇿 Swahili
                                    </button>
                                </div>
                                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                                    {editingPhoto ? (
                                        <><i className="fas fa-language"></i> Switch to view/edit {formData.sourceLang === 'en' ? 'English' : 'Swahili'} content</>
                                    ) : (
                                        <><i className="fas fa-magic"></i> Content will be auto-translated to {formData.sourceLang === 'en' ? 'Swahili' : 'English'} on save</>
                                    )}
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Caption *</label>
                                <textarea 
                                    placeholder="e.g., Factory Acceptance Tests Training - Milano, Italy"
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Milano, Italy"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Year</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., 2023"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Image *</label>
                                <div className="image-upload-tabs">
                                    <button 
                                        type="button" 
                                        className={`tab-btn ${imageTab === 'url' ? 'active' : ''}`}
                                        onClick={() => setImageTab('url')}
                                    >
                                        URL
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`tab-btn ${imageTab === 'file' ? 'active' : ''}`}
                                        onClick={() => setImageTab('file')}
                                    >
                                        Upload File
                                    </button>
                                </div>
                                
                                {imageTab === 'url' ? (
                                    <input 
                                        type="text" 
                                        placeholder="https://images.unsplash.com/..."
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
                                ) : (
                                    <>
                                        <div 
                                            className={`file-upload-area ${isUploading ? 'uploading' : ''}`}
                                            onClick={() => !isUploading && fileInputRef.current?.click()}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    <p>Uploading...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-cloud-upload-alt"></i>
                                                    <p>Click to browse or drag & drop</p>
                                                    <span>Supports: JPG, PNG, GIF, WebP (Max 8MB)</span>
                                                </>
                                            )}
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                    </>
                                )}
                                
                                {formData.image && (
                                    <div className="image-preview" style={{ marginTop: '15px' }}>
                                        <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal} disabled={isSubmitting || isUploading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={isSubmitting || isUploading}>
                                {isSubmitting ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                                ) : (
                                    <><i className="fas fa-save"></i> Save</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GitHub-style Delete Dialog */}
            {showDeleteDialog && deleteTarget && (
                <div className="modal-overlay active">
                    <div className="modal modal-delete">
                        <div className="modal-header">
                            <h3>Delete Training Photo</h3>
                            <button className="modal-close" onClick={closeDeleteDialog}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-warning">
                                This action <strong>cannot be undone</strong>. This will permanently delete this training photo.
                            </p>
                            <p className="delete-confirm-label">
                                Please type <strong>{deleteTarget.caption}</strong> to confirm.
                            </p>
                            <input 
                                type="text"
                                className="delete-confirm-input"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder={deleteTarget.caption}
                            />
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-danger btn-block"
                                disabled={deleteConfirmText !== deleteTarget.caption || isSubmitting}
                                onClick={confirmDelete}
                            >
                                {isSubmitting ? 'Deleting...' : 'I understand, delete this photo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
