import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

interface Project {
    id: number;
    title: string;
    title_sw: string | null;
    category: string;
    subcategory: string | null;
    status: string;
    source_lang: string;
    client: string | null;
    year: string | null;
    location: string | null;
    description: string | null;
    description_sw: string | null;
    scope_of_work: string[] | null;
    scope_of_work_sw: string[] | null;
    highlights: string | null;
    highlights_sw: string | null;
    images: string[] | null;
}

interface SubService {
    id: number;
    name: string;
    service_id: number;
}

interface Service {
    id: number;
    name: string;
    sub_services: SubService[];
}

interface Props {
    projects: Project[];
    services: Service[];
}

export default function Projects({ projects = [], services = [] }: Props) {
    const { auth } = usePage().props as unknown as { auth: { permissions: string[] } };
    const canCreate = auth.permissions?.includes('projects.create') ?? false;
    const canEdit = auth.permissions?.includes('projects.edit') ?? false;
    const canDeletePerm = auth.permissions?.includes('projects.delete') ?? false;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subcategory: '',
        status: 'Draft',
        client: '',
        year: '',
        location: '',
        description: '',
        scopeOfWork: '',
        highlights: '',
        sourceLang: 'en' as 'en' | 'sw',
    });
    const [images, setImages] = useState<string[]>([]);
    const [imageTab, setImageTab] = useState<'url' | 'file'>('url');
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use services from database as categories
    const categories = services.map(s => s.name);

    // Get subcategories for selected category
    const getSubcategories = (categoryName: string): string[] => {
        const service = services.find(s => s.name === categoryName);
        return service?.sub_services?.map(sub => sub.name) || [];
    };

    const subcategories = getSubcategories(formData.category);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (p.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (p.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || p.category === categoryFilter;
        const matchesStatus = !statusFilter || p.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalCount = projects.length;
    const publishedCount = projects.filter(p => p.status === 'Published').length;
    const draftCount = projects.filter(p => p.status === 'Draft').length;

    const resetForm = () => {
        setFormData({
            title: '',
            category: '',
            subcategory: '',
            status: 'Draft',
            client: '',
            year: '',
            location: '',
            description: '',
            scopeOfWork: '',
            highlights: '',
            sourceLang: 'en',
        });
        setImages([]);
        setImageUrl('');
        setImageTab('url');
    };

    const openAddModal = () => {
        setEditingProject(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        // Default to source language or English
        const lang = (project.source_lang === 'sw' ? 'sw' : 'en') as 'en' | 'sw';
        setFormData({
            title: lang === 'en' ? project.title : (project.title_sw || project.title),
            category: project.category,
            subcategory: project.subcategory || '',
            status: project.status,
            client: project.client || '',
            year: project.year || '',
            location: project.location || '',
            description: lang === 'en' ? (project.description || '') : (project.description_sw || project.description || ''),
            scopeOfWork: lang === 'en' 
                ? (project.scope_of_work || []).join('\n')
                : (project.scope_of_work_sw || project.scope_of_work || []).join('\n'),
            highlights: lang === 'en' ? (project.highlights || '') : (project.highlights_sw || project.highlights || ''),
            sourceLang: lang,
        });
        setImages(project.images || []);
        setImageUrl('');
        setImageTab('url');
        setShowModal(true);
    };

    // Handle language switch in edit mode
    const handleLanguageSwitch = (lang: 'en' | 'sw') => {
        if (editingProject) {
            // Switch content based on selected language
            setFormData({
                ...formData,
                title: lang === 'en' ? editingProject.title : (editingProject.title_sw || editingProject.title),
                description: lang === 'en' 
                    ? (editingProject.description || '') 
                    : (editingProject.description_sw || editingProject.description || ''),
                scopeOfWork: lang === 'en' 
                    ? (editingProject.scope_of_work || []).join('\n')
                    : (editingProject.scope_of_work_sw || editingProject.scope_of_work || []).join('\n'),
                highlights: lang === 'en' 
                    ? (editingProject.highlights || '') 
                    : (editingProject.highlights_sw || editingProject.highlights || ''),
                sourceLang: lang,
            });
        } else {
            // For new projects, just switch the language
            setFormData({ ...formData, sourceLang: lang });
        }
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const openDeleteModal = (id: number) => {
        setDeletingId(id);
        setDeleteConfirmText('');
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingId(null);
        setDeleteConfirmText('');
    };

    const confirmDelete = () => {
        if (deletingId) {
            setIsSubmitting(true);
            router.delete(`/admin/projects/${deletingId}`, {
                onSuccess: () => {
                    closeDeleteModal();
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        }
    };

    const getDeletingProject = () => projects.find(p => p.id === deletingId);
    const canDelete = getDeletingProject()?.title === deleteConfirmText;

    const addImageFromUrl = () => {
        if (imageUrl.trim()) {
            setImages([...images, imageUrl.trim()]);
            setImageUrl('');
        }
    };

    const getCsrfToken = (): string => {
        const token = document.head.querySelector('meta[name="csrf-token"]');
        return token ? (token as HTMLMetaElement).content : '';
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) {
                alert('Please select image files only');
                continue;
            }

            try {
                const uploadData = new FormData();
                uploadData.append('image', file);

                const response = await axios.post('/admin/upload-image', uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    withCredentials: true,
                });

                if (response.data.url) {
                    setImages(prev => [...prev, response.data.url]);
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
                alert(`Failed to upload ${file.name}: ${message}`);
            }
        }

        setIsUploading(false);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSaveProject = () => {
        if (!formData.title || !formData.category) {
            alert('Please fill in required fields');
            return;
        }

        const projectImages = images.length > 0 
            ? images 
            : ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop'];

        const scopeOfWorkArray = formData.scopeOfWork
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        const projectData = {
            title: formData.title,
            category: formData.category,
            subcategory: formData.subcategory || null,
            status: formData.status,
            client: formData.client || null,
            year: formData.year || null,
            location: formData.location || null,
            description: formData.description || null,
            scope_of_work: scopeOfWorkArray,
            highlights: formData.highlights || null,
            images: projectImages,
            source_lang: formData.sourceLang,
        };

        setIsSubmitting(true);

        if (editingProject) {
            router.put(`/admin/projects/${editingProject.id}`, projectData, {
                onSuccess: () => closeModal(),
                onFinish: () => setIsSubmitting(false)
            });
        } else {
            router.post('/admin/projects', projectData, {
                onSuccess: () => closeModal(),
                onFinish: () => setIsSubmitting(false)
            });
        }
    };

    return (
        <AdminLayout title="Manage Projects">
            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-item">Total: <strong>{totalCount}</strong></div>
                <div className="stat-item">Published: <strong>{publishedCount}</strong></div>
                <div className="stat-item">Draft: <strong>{draftCount}</strong></div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="filter-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select 
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
                {canCreate && <button className="btn btn-primary" onClick={openAddModal}>
                    <i className="fas fa-plus"></i> Add New Project
                </button>}
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
                {filteredProjects.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-folder-open"></i>
                        <p>No projects found</p>
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <i className="fas fa-plus"></i> Add First Project
                        </button>
                    </div>
                ) : (
                    filteredProjects.map(project => (
                        <div key={project.id} className="project-card">
                            <div className="project-image">
                                <img src={(project.images || [])[0] || 'https://via.placeholder.com/400x300'} alt={project.title} />
                                <span className={`project-status ${project.status.toLowerCase()}`}>
                                    {project.status}
                                </span>
                                <span className="project-category">{project.category}</span>
                                {(project.images || []).length > 1 && (
                                    <span className="image-count">
                                        <i className="fas fa-images"></i> {(project.images || []).length}
                                    </span>
                                )}
                            </div>
                            <div className="project-info">
                                <h4>{project.title}</h4>
                                <div className="project-meta">
                                    <span><i className="fas fa-calendar"></i> {project.year || '-'}</span>
                                    <span><i className="fas fa-map-marker-alt"></i> {project.location || '-'}</span>
                                </div>
                                <div className="project-actions">
                                    {canEdit && <button className="edit-btn" onClick={() => openEditModal(project)}>
                                        <i className="fas fa-edit"></i> Edit
                                    </button>}
                                    {canDeletePerm && <button className="delete-btn" onClick={() => openDeleteModal(project.id)}>
                                        <i className="fas fa-trash"></i> Delete
                                    </button>}
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
                            <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Project Title *</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter project title" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Content Language</label>
                                <div className="language-selector">
                                    <button
                                        type="button"
                                        className={`lang-btn ${formData.sourceLang === 'en' ? 'active' : ''}`}
                                        onClick={() => handleLanguageSwitch('en')}
                                    >
                                        🇬🇧 English
                                    </button>
                                    <button
                                        type="button"
                                        className={`lang-btn ${formData.sourceLang === 'sw' ? 'active' : ''}`}
                                        onClick={() => handleLanguageSwitch('sw')}
                                    >
                                        🇹🇿 Swahili
                                    </button>
                                </div>
                                <small className="form-hint">
                                    {editingProject ? (
                                        <><i className="fas fa-language"></i> Switch to view/edit {formData.sourceLang === 'en' ? 'English' : 'Swahili'} content</>
                                    ) : (
                                        <><i className="fas fa-magic"></i> Content will be auto-translated to {formData.sourceLang === 'en' ? 'Swahili' : 'English'} on save</>
                                    )}
                                </small>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Subcategory</label>
                                    <select 
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        disabled={!formData.category || subcategories.length === 0}
                                    >
                                        <option value="">{subcategories.length === 0 ? 'No subcategories' : 'Select subcategory'}</option>
                                        {subcategories.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                    </select>
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
                                <label>Client Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter client name" 
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Dar es Salaam, Tanzania" 
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    placeholder="Enter project description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Scope of Work</label>
                                <textarea 
                                    placeholder="Enter scope of work items (one per line)"
                                    value={formData.scopeOfWork}
                                    onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
                                    rows={5}
                                ></textarea>
                                <small className="form-hint">Enter each item on a new line</small>
                            </div>
                            <div className="form-group">
                                <label>Project Highlights</label>
                                <textarea 
                                    placeholder="Enter project highlights and achievements..."
                                    value={formData.highlights}
                                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                    rows={3}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Images ({images.length} added)</label>
                                <div className="image-upload-tabs">
                                    <button 
                                        type="button" 
                                        className={`tab-btn ${imageTab === 'url' ? 'active' : ''}`}
                                        onClick={() => setImageTab('url')}
                                    >
                                        Add URL
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`tab-btn ${imageTab === 'file' ? 'active' : ''}`}
                                        onClick={() => setImageTab('file')}
                                    >
                                        Upload Files
                                    </button>
                                </div>
                                
                                {imageTab === 'url' ? (
                                    <div className="url-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="https://images.unsplash.com/..." 
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-primary"
                                            onClick={addImageFromUrl}
                                        >
                                            <i className="fas fa-plus"></i> Add
                                        </button>
                                    </div>
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
                                                    <span>Supports: JPG, PNG, GIF, WebP (Max 8MB per file)</span>
                                                </>
                                            )}
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            accept="image/*"
                                            multiple
                                            style={{ display: 'none' }}
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                    </>
                                )}
                                
                                {images.length > 0 && (
                                    <div className="images-gallery">
                                        {images.map((img, index) => (
                                            <div key={index} className="gallery-thumb">
                                                <img src={img} alt={`Preview ${index + 1}`} />
                                                <button 
                                                    type="button"
                                                    className="remove-image"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                                {index === 0 && <span className="primary-badge">Cover</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {images.length === 0 && (
                                    <div className="image-preview">
                                        <i className="fas fa-images"></i>
                                        <p>No images added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal} disabled={isSubmitting || isUploading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveProject} disabled={isSubmitting || isUploading}>
                                {isSubmitting ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                                ) : (
                                    <><i className="fas fa-save"></i> Save Project</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && getDeletingProject() && (
                <div className="modal-overlay active">
                    <div className="modal modal-delete">
                        <div className="modal-header">
                            <h3>Delete Project</h3>
                            <button className="modal-close" onClick={closeDeleteModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-warning">
                                This action <strong>cannot be undone</strong>. This will permanently delete the project and all associated data.
                            </p>
                            <p className="delete-confirm-label">
                                Please type <strong>{getDeletingProject()?.title}</strong> to confirm.
                            </p>
                            <input 
                                type="text"
                                className="delete-confirm-input"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder={getDeletingProject()?.title}
                            />
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-danger btn-block" 
                                onClick={confirmDelete}
                                disabled={!canDelete || isSubmitting}
                            >
                                {isSubmitting ? 'Deleting...' : 'I understand, delete this project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
