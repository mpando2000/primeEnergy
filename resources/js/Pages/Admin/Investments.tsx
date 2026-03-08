import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';

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
    is_active: boolean;
}

interface Props {
    lands: LandInvestment[];
}

export default function Investments({ lands }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingLand, setEditingLand] = useState<LandInvestment | null>(null);
    const [language, setLanguage] = useState<'en' | 'sw'>('en');
    const [successMessage, setSuccessMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const { flash } = usePage().props as any;

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        description: '',
        location: '',
        size_acres: 0,
        investment_types: [] as string[],
        features: [] as string[],
        images: [] as string[],
        is_active: true,
        source_lang: 'en' as 'en' | 'sw',
    });

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    }, [flash]);

    const openModal = (land?: LandInvestment) => {
        if (land) {
            setEditingLand(land);
            setData({
                title: land.title || '',
                description: land.description || '',
                location: land.location || '',
                size_acres: land.size_acres || 0,
                investment_types: Array.isArray(land.investment_types) ? land.investment_types : [],
                features: Array.isArray(land.features) ? land.features : [],
                images: Array.isArray(land.images) ? land.images : [],
                is_active: land.is_active ?? true,
                source_lang: 'en',
            });
        } else {
            setEditingLand(null);
            reset();
        }
        setShowModal(true);
        setLanguage('en');
    };

    const handleLanguageSwitch = (lang: 'en' | 'sw') => {
        console.log('Switching to:', lang);
        console.log('Editing land:', editingLand);
        
        if (editingLand) {
            // When editing, switch between saved English and Swahili content
            const newData = {
                title: lang === 'en' ? editingLand.title : (editingLand.title_sw || editingLand.title),
                description: lang === 'en' ? editingLand.description : (editingLand.description_sw || editingLand.description),
                location: lang === 'en' ? editingLand.location : (editingLand.location_sw || editingLand.location),
                size_acres: editingLand.size_acres,
                investment_types: lang === 'en' 
                    ? (Array.isArray(editingLand.investment_types) ? editingLand.investment_types : [])
                    : (Array.isArray(editingLand.investment_types_sw) ? editingLand.investment_types_sw : []),
                features: lang === 'en'
                    ? (Array.isArray(editingLand.features) ? editingLand.features : [])
                    : (Array.isArray(editingLand.features_sw) ? editingLand.features_sw : []),
                images: Array.isArray(editingLand.images) ? editingLand.images : [],
                is_active: editingLand.is_active,
                source_lang: lang,
            };
            
            console.log('New data:', newData);
            setData(newData);
        } else {
            // When creating new, just update source language
            setData('source_lang', lang);
        }
        setLanguage(lang);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLand(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Set source language before submitting
        setData('source_lang', language);
        
        console.log('Submitting data:', { ...data, source_lang: language });
        
        if (editingLand) {
            put(route('admin.investments.update', editingLand.id), {
                onSuccess: () => {
                    closeModal();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                },
            });
        } else {
            post(route('admin.investments.store'), {
                onSuccess: () => {
                    closeModal();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this land investment?')) {
            destroy(route('admin.investments.destroy', id));
        }
    };

    const addItem = (field: 'investment_types' | 'features', value: string) => {
        if (value.trim()) {
            setData(field, [...data[field], value.trim()]);
        }
    };

    const removeItem = (field: 'investment_types' | 'features', index: number) => {
        setData(field, data[field].filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(route('admin.investments.upload-image'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const result = await response.json();
            if (result.url) {
                setData('images', [...data.images, result.url]);
                setSuccessMessage('Image uploaded successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <AdminLayout>
            <Head title="Land Investments" />

            <div className="p-6">
                {successMessage && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex justify-between items-center">
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage('')} className="text-green-700 font-bold">×</button>
                    </div>
                )}
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Land Investments</h1>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                        Add New Land
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size (Acres)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {lands.map((land) => (
                                <tr key={land.id}>
                                    <td className="px-6 py-4">{land.title}</td>
                                    <td className="px-6 py-4">{land.location}</td>
                                    <td className="px-6 py-4">{land.size_acres}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs ${land.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {land.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => openModal(land)} className="text-blue-600 hover:text-blue-800">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(land.id)} className="text-red-600 hover:text-red-800">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">{editingLand ? 'Edit' : 'Add'} Land Investment</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">
                                        {editingLand ? 'View/edit translations' : 'Choose input language'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleLanguageSwitch('en')}
                                            className={`px-3 py-1 rounded ${language === 'en' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                                        >
                                            EN
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleLanguageSwitch('sw')}
                                            className={`px-3 py-1 rounded ${language === 'sw' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                                        >
                                            SW
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {Object.keys(errors).length > 0 && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        <p className="font-medium">Please fix the following errors:</p>
                                        <ul className="list-disc list-inside mt-2">
                                            {Object.entries(errors).map(([key, value]) => (
                                                <li key={key}>{value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
                                    <strong>Auto-Translation:</strong> Fill in {language === 'en' ? 'English' : 'Swahili'} and it will automatically translate to {language === 'en' ? 'Swahili' : 'English'} when you save.
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Title ({language === 'en' ? 'English' : 'Swahili'})</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description ({language === 'en' ? 'English' : 'Swahili'})</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2"
                                        rows={4}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Location ({language === 'en' ? 'English' : 'Swahili'})</label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Size (Acres)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.size_acres || ''}
                                        onChange={(e) => setData('size_acres', parseFloat(e.target.value) || 0)}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Investment Types ({language === 'en' ? 'English' : 'Swahili'})
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            id="investment-type"
                                            className="flex-1 border rounded-lg px-3 py-2"
                                            placeholder="Add type and press Enter"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    addItem('investment_types', input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.investment_types.map((type, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                                                {type}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('investment_types', idx)}
                                                    className="text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Features ({language === 'en' ? 'English' : 'Swahili'})
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            id="feature"
                                            className="flex-1 border rounded-lg px-3 py-2"
                                            placeholder="Add feature and press Enter"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    addItem('features', input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        {data.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <span className="flex-1">{feature}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('features', idx)}
                                                    className="text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Images</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                    {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                                    {data.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {data.images.map((img, idx) => (
                                                <div key={idx} className="relative">
                                                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('images', data.images.filter((_, i) => i !== idx))}
                                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        id="is_active"
                                    />
                                    <label htmlFor="is_active" className="text-sm">Active</label>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        {processing ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
