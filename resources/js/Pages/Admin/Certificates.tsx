import PdfCanvas from '@/Components/PdfCanvas';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, usePage } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';

interface Certificate {
    id: number;
    name: string;
    name_sw: string;
    file_path: string;
    file_type: 'pdf' | 'image';
    original_name: string | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    certificates: Certificate[];
}

const emptyForm = { name: '', name_sw: '', is_active: true };

export default function Certificates({ certificates = [] }: Props) {
    const { auth, errors } = usePage().props as unknown as {
        auth: { user?: { role?: string }; permissions?: string[] };
        errors: Record<string, string>;
    };
    const isAdmin = auth.user?.role === 'admin';
    const canCreate = isAdmin || auth.permissions?.includes('certificates.create');
    const canEdit = isAdmin || auth.permissions?.includes('certificates.edit');
    const canDelete = isAdmin || auth.permissions?.includes('certificates.delete');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Certificate | null>(null);
    const [preview, setPreview] = useState<Certificate | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFile(null);
        setShowForm(true);
    };

    const openEdit = (certificate: Certificate) => {
        setEditing(certificate);
        setForm({
            name: certificate.name,
            name_sw: certificate.name_sw,
            is_active: certificate.is_active,
        });
        setFile(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!editing && !file) return;

        const data = new FormData();
        data.append('name', form.name);
        data.append('name_sw', form.name_sw);
        data.append('is_active', form.is_active ? '1' : '0');
        if (file) data.append('file', file);

        setSubmitting(true);
        router.post(editing ? `/admin/certificates/${editing.id}` : '/admin/certificates', data, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeForm,
            onFinish: () => setSubmitting(false),
        });
    };

    const remove = (certificate: Certificate) => {
        if (!window.confirm(`Delete “${certificate.name}”? This cannot be undone.`)) return;
        router.delete(`/admin/certificates/${certificate.id}`, { preserveScroll: true });
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= certificates.length) return;

        const reordered = [...certificates];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        router.post('/admin/certificates/reorder', {
            items: reordered.map((certificate, sort_order) => ({ id: certificate.id, sort_order })),
        }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Company Certificates">
            <div className="page-toolbar">
                <p className="text-sm text-gray-500">Upload PDF or image certificates and publish them on the About page.</p>
                {canCreate && (
                    <button className="btn btn-primary" onClick={openCreate}>
                        <i className="fas fa-plus"></i> Upload Certificate
                    </button>
                )}
            </div>

            <div className="stats-bar">
                <div className="stat-item">Total: <strong>{certificates.length}</strong></div>
                <div className="stat-item">Published: <strong>{certificates.filter((item) => item.is_active).length}</strong></div>
                <div className="stat-item">Hidden: <strong>{certificates.filter((item) => !item.is_active).length}</strong></div>
            </div>

            {certificates.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                    <i className="fas fa-certificate mb-4 text-5xl text-gray-300"></i>
                    <h2 className="mb-2 text-xl font-semibold text-gray-800">No certificates uploaded</h2>
                    <p className="mb-5 text-gray-500">Your published certificates will appear on the About page.</p>
                    {canCreate && <button className="btn btn-primary" onClick={openCreate}>Upload First Certificate</button>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {certificates.map((certificate, index) => (
                        <article key={certificate.id} className={`overflow-hidden rounded-xl bg-white shadow-sm ${!certificate.is_active ? 'opacity-60' : ''}`}>
                            <button type="button" className="block h-64 w-full overflow-hidden bg-gray-100" onClick={() => setPreview(certificate)}>
                                {certificate.file_type === 'pdf' ? (
                                    <PdfCanvas src={certificate.file_path} maxWidth={520} className="h-full w-full" />
                                ) : (
                                    <img src={certificate.file_path} alt={certificate.name} className="h-full w-full object-contain" />
                                )}
                            </button>
                            <div className="p-5">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{certificate.name}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{certificate.name_sw}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${certificate.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {certificate.is_active ? 'Published' : 'Hidden'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 border-t pt-4">
                                    {canEdit && (
                                        <>
                                            <button className="btn btn-secondary" onClick={() => move(index, -1)} disabled={index === 0} title="Move up"><i className="fas fa-arrow-up"></i></button>
                                            <button className="btn btn-secondary" onClick={() => move(index, 1)} disabled={index === certificates.length - 1} title="Move down"><i className="fas fa-arrow-down"></i></button>
                                            <button className="btn btn-secondary" onClick={() => router.patch(`/admin/certificates/${certificate.id}/toggle`, {}, { preserveScroll: true })}>
                                                <i className={`fas ${certificate.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => openEdit(certificate)}><i className="fas fa-edit"></i> Edit</button>
                                        </>
                                    )}
                                    {canDelete && <button className="btn btn-danger" onClick={() => remove(certificate)}><i className="fas fa-trash"></i></button>}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="modal-overlay active">
                    <form className="modal" onSubmit={submit}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Certificate' : 'Upload Certificate'}</h3>
                            <button type="button" className="modal-close" onClick={closeForm}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="certificate-name">Certificate Name (English) *</label>
                                <input id="certificate-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                                {errors.name && <small className="text-red-600">{errors.name}</small>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="certificate-name-sw">Certificate Name (Swahili) *</label>
                                <input id="certificate-name-sw" value={form.name_sw} onChange={(event) => setForm({ ...form, name_sw: event.target.value })} required />
                                {errors.name_sw && <small className="text-red-600">{errors.name_sw}</small>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="certificate-file">Certificate File {editing ? '(leave empty to keep current file)' : '*'}</label>
                                <input
                                    id="certificate-file"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf,image/jpeg,image/png,image/webp"
                                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                                    required={!editing}
                                />
                                <small className="text-gray-500">PDF, JPG, PNG or WebP. Maximum size: 2 MB.</small>
                                {file && <p className="mt-2 text-sm font-medium text-blue-700"><i className="fas fa-paperclip mr-2"></i>{file.name}</p>}
                                {errors.file && <small className="block text-red-600">{errors.file}</small>}
                            </div>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
                                <span>Publish this certificate on the website</span>
                            </label>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={submitting || (!editing && !file)}>
                                {submitting ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-upload"></i> {editing ? 'Save Changes' : 'Upload'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {preview && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}>
                    <div className="relative max-h-[94vh] w-full max-w-5xl overflow-auto rounded-xl bg-white p-4" onClick={(event) => event.stopPropagation()}>
                        <button className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-xl text-white" onClick={() => setPreview(null)}>&times;</button>
                        <h3 className="mb-4 pr-12 text-xl font-semibold">{preview.name}</h3>
                        {preview.file_type === 'pdf' ? <PdfCanvas src={preview.file_path} maxWidth={1100} className="w-full" /> : <img src={preview.file_path} alt={preview.name} className="mx-auto max-h-[80vh] max-w-full" />}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
