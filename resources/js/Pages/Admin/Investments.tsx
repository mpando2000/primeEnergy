import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

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

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        title_sw: '',
        description: '',
        description_sw: '',
        location: '',
        location_sw: '',
        size_acres: 0,
        investment_types: [] as string[],
        investment_types_sw: [] as string[],
        features: [] as string[],
        features_sw: [] as string[],
        images: [] as string[],
        is_active: true,
    });

    const openModal = (land?: LandInvestment) => {
        if (land) {
            setEditingLand(land);
            setData({
                title: land.title,
                title_sw: land.title_sw || '',
                description: land.description,
                description_sw: land.description_sw || '',
                location: land.location,
                location_sw: land.location_sw || '',
                size_acres: land.size_acres,
                investment_types: land.investment_types,
                investment_types_sw: land.investment_types_sw || [],
                features: land.features,
                features_sw: land.features_sw || [],
                images: land.images || [],
                is_active: land.is_active,
            });
        } else {
            setEditingLand(null);
            reset();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLand(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

    const addItem = (field: 'investment_types' | 'investment_types_sw' | 'features' | 'features_sw', value: string) => {
        if (value.trim()) {
            setData(field, [...data[field], value.trim()]);
        }
    };

    const removeItem = (field: 'investment_types' | 'investment_types_sw' | 'features' | 'features_sw', index: number) => {
        setData(field, data[field].filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
            setData('images', [...data.images, result.url]);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    return (
        <AdminLayout>
            <Head title="Land Investments" />

            <div className="p-6">
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`px-3 py-1 rounded ${language === 'en' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                                    >
                                        EN
                                    </button>
                                    <button
                                        onClick={() => setLanguage('sw')}
                                        className={`px-3 py-1 rounded ${language === 'sw' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                                    >
                                        SW
                                    </button>
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
                                {language === 'en' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description</label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Title (Swahili)</label>
                                            <input
                                                type="text"
                                                value={data.title_sw}
                                                onChange={(e) => setData('title_sw', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description (Swahili)</label>
                                            <textarea
                                                value={data.description_sw}
                                                onChange={(e) => setData('description_sw', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                                rows={4}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Location (Swahili)</label>
                                            <input
                                                type="text"
                                                value={data.location_sw}
                                                onChange={(e) => setData('location_sw', e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1">Size (Acres)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.size_acres}
                                        onChange={(e) => setData('size_acres', parseFloat(e.target.value))}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Investment Types {language === 'sw' && '(Swahili)'}
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            id={`investment-type-${language}`}
                                            className="flex-1 border rounded-lg px-3 py-2"
                                            placeholder="Add type and press Enter"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    addItem(language === 'en' ? 'investment_types' : 'investment_types_sw', input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(language === 'en' ? data.investment_types : data.investment_types_sw).map((type, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                                                {type}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(language === 'en' ? 'investment_types' : 'investment_types_sw', idx)}
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
                                        Features {language === 'sw' && '(Swahili)'}
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            id={`feature-${language}`}
                                            className="flex-1 border rounded-lg px-3 py-2"
                                            placeholder="Add feature and press Enter"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    addItem(language === 'en' ? 'features' : 'features_sw', input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        {(language === 'en' ? data.features : data.features_sw).map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <span className="flex-1">{feature}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(language === 'en' ? 'features' : 'features_sw', idx)}
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
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {data.images.map((img, idx) => (
                                            <div key={idx} className="relative">
                                                <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                                                <button
                                                    type="button"
                                                    onClick={() => setData('images', data.images.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
