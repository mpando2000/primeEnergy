import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

interface Field {
    label: string;
    type: 'text' | 'textarea';
    hint?: string;
}

interface Section {
    label: string;
    fields: Record<string, Field>;
}

interface PageGroup {
    label: string;
    icon: string;
    sections: Record<string, Section>;
}

interface Props {
    structure: Record<string, PageGroup>;
    values: {
        en: Record<string, string>;
        sw: Record<string, string>;
    };
}

export default function Content({ structure, values: initialValues }: Props) {
    const { flash, auth } = usePage().props as unknown as { flash?: { success?: string }, auth: { permissions: string[] } };
    const canEdit = auth.permissions?.includes('content.edit') ?? false;
    
    const [activeGroup, setActiveGroup] = useState(Object.keys(structure)[0]);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState<'en' | 'sw'>('en');
    const [values, setValues] = useState(initialValues);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Update values when initialValues change (after save/reload)
    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    // Show flash message
    useEffect(() => {
        if (flash?.success) {
            setSaveMessage(flash.success);
            setTimeout(() => setSaveMessage(null), 5000);
        }
    }, [flash]);

    const currentGroup = structure[activeGroup];
    const sections = currentGroup?.sections || {};

    // Set first section as active if none selected
    if (!activeSection && Object.keys(sections).length > 0) {
        setActiveSection(Object.keys(sections)[0]);
    }

    const currentSection = activeSection ? sections[activeSection] : null;

    const handleChange = (fullKey: string, value: string) => {
        setValues({
            ...values,
            [activeLocale]: {
                ...values[activeLocale],
                [fullKey]: value,
            },
        });
        setHasChanges(true);
        setSaveMessage(null);
    };

    const handleSave = () => {
        if (!currentSection || saving) return;
        setSaving(true);

        const translations = Object.keys(currentSection.fields).map(fieldKey => ({
            group: activeGroup,
            key: fieldKey,
            value: values[activeLocale][`${activeGroup}.${fieldKey}`] || '',
        }));

        router.post('/admin/content/bulk-update', {
            locale: activeLocale,
            translations,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setHasChanges(false);
                setSaving(false);
            },
            onError: () => {
                setSaving(false);
                setSaveMessage('Failed to save. Please try again.');
            },
        });
    };

    const handleImport = () => {
        if (confirm('This will import translations from JSON files. Existing values will be updated. Continue?')) {
            router.post('/admin/content/import');
        }
    };

    return (
        <AdminLayout title="Content Management">
            <div className="content-editor-layout">
                {/* Page Navigation */}
                <div className="content-nav">
                    <div className="nav-header">
                        <h4>Pages</h4>
                        <button className="import-btn" onClick={handleImport} title="Import from JSON files">
                            <i className="fas fa-file-import"></i>
                        </button>
                    </div>
                    {Object.entries(structure).map(([key, group]) => (
                        <a
                            key={key}
                            href="#"
                            className={`content-nav-item ${activeGroup === key ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveGroup(key);
                                setActiveSection(Object.keys(group.sections)[0] || null);
                            }}
                        >
                            <i className={`fas ${group.icon}`}></i>
                            {group.label}
                        </a>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="content-main">
                    {/* Header */}
                    <div className="content-header">
                        <div className="header-info">
                            <h2>
                                <i className={`fas ${currentGroup?.icon}`}></i>
                                {currentGroup?.label}
                            </h2>
                            <p>Edit the content displayed on this page</p>
                        </div>
                        <div className="locale-switcher">
                            <button
                                className={`locale-btn ${activeLocale === 'en' ? 'active' : ''}`}
                                onClick={() => setActiveLocale('en')}
                            >
                                🇬🇧 English
                            </button>
                            <button
                                className={`locale-btn ${activeLocale === 'sw' ? 'active' : ''}`}
                                onClick={() => setActiveLocale('sw')}
                            >
                                🇹🇿 Swahili
                            </button>
                        </div>
                    </div>

                    {/* Section Tabs */}
                    <div className="section-tabs">
                        {Object.entries(sections).map(([key, section]) => (
                            <button
                                key={key}
                                className={`section-tab ${activeSection === key ? 'active' : ''}`}
                                onClick={() => setActiveSection(key)}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>

                    {/* Fields */}
                    {currentSection && (
                        <div className="content-fields">
                            {Object.entries(currentSection.fields).map(([fieldKey, field]) => {
                                const fullKey = `${activeGroup}.${fieldKey}`;
                                const value = values[activeLocale][fullKey] || '';

                                return (
                                    <div key={fieldKey} className="field-group">
                                        <label>{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={value}
                                                onChange={(e) => handleChange(fullKey, e.target.value)}
                                                rows={4}
                                                placeholder={activeLocale === 'sw' ? 'Ingiza maandishi...' : 'Enter text...'}
                                                disabled={!canEdit}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleChange(fullKey, e.target.value)}
                                                placeholder={activeLocale === 'sw' ? 'Ingiza maandishi...' : 'Enter text...'}
                                                disabled={!canEdit}
                                            />
                                        )}
                                        {field.hint && <small className="field-hint">{field.hint}</small>}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Save Bar */}
                    <div className="save-bar">
                        {saveMessage && (
                            <span className={`save-message ${saveMessage.includes('Failed') ? 'error' : 'success'}`}>
                                <i className={`fas ${saveMessage.includes('Failed') ? 'fa-times-circle' : 'fa-check-circle'}`}></i> 
                                {saveMessage}
                            </span>
                        )}
                        {hasChanges && !saveMessage && (
                            <span className="unsaved-warning">
                                <i className="fas fa-exclamation-circle"></i> Unsaved changes
                            </span>
                        )}
                        {canEdit && <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                        >
                            {saving ? (
                                <><i className="fas fa-spinner fa-spin"></i> Saving & Translating...</>
                            ) : (
                                <><i className="fas fa-save"></i> Save & Auto-Translate</>
                            )}
                        </button>}
                    </div>
                </div>
            </div>

            <style>{`
                .content-editor-layout {
                    display: grid;
                    grid-template-columns: 220px 1fr;
                    gap: 25px;
                    min-height: calc(100vh - 180px);
                }

                .content-nav {
                    background: #fff;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    height: fit-content;
                    position: sticky;
                    top: 80px;
                }

                .nav-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }

                .nav-header h4 {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .import-btn {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 4px;
                    transition: all 0.3s;
                }

                .import-btn:hover {
                    background: #f0f0f0;
                    color: var(--admin-primary);
                }

                .content-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 15px;
                    color: #333;
                    text-decoration: none;
                    border-radius: 8px;
                    margin-bottom: 5px;
                    transition: all 0.3s;
                    font-size: 14px;
                }

                .content-nav-item i {
                    width: 18px;
                    text-align: center;
                    color: #666;
                }

                .content-nav-item:hover {
                    background: #f5f5f5;
                }

                .content-nav-item.active {
                    background: var(--admin-primary);
                    color: #fff;
                }

                .content-nav-item.active i {
                    color: #fff;
                }

                .content-main {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    overflow: hidden;
                }

                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 25px;
                    background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%);
                    color: #fff;
                }

                .header-info h2 {
                    margin: 0 0 5px 0;
                    font-size: 22px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .header-info p {
                    margin: 0;
                    opacity: 0.8;
                    font-size: 14px;
                }

                .locale-switcher {
                    display: flex;
                    gap: 8px;
                }

                .locale-btn {
                    padding: 10px 18px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                }

                .locale-btn:hover {
                    background: rgba(255,255,255,0.2);
                }

                .locale-btn.active {
                    background: #fff;
                    color: var(--admin-primary);
                    border-color: #fff;
                }

                .section-tabs {
                    display: flex;
                    gap: 5px;
                    padding: 15px 25px;
                    background: #f9f9f9;
                    border-bottom: 1px solid #eee;
                    overflow-x: auto;
                }

                .section-tab {
                    padding: 10px 20px;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #666;
                    white-space: nowrap;
                    transition: all 0.3s;
                }

                .section-tab:hover {
                    border-color: var(--admin-primary);
                    color: var(--admin-primary);
                }

                .section-tab.active {
                    background: var(--admin-primary);
                    border-color: var(--admin-primary);
                    color: #fff;
                }

                .content-fields {
                    padding: 25px;
                    max-height: calc(100vh - 400px);
                    overflow-y: auto;
                }

                .field-group {
                    margin-bottom: 20px;
                }

                .field-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #333;
                    font-size: 14px;
                }

                .field-group input,
                .field-group textarea {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: all 0.3s;
                    font-family: inherit;
                }

                .field-group input:focus,
                .field-group textarea:focus {
                    outline: none;
                    border-color: var(--admin-primary);
                }

                .field-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .field-hint {
                    display: block;
                    margin-top: 5px;
                    color: #999;
                    font-size: 12px;
                }

                .save-bar {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 15px;
                    padding: 20px 25px;
                    background: #f9f9f9;
                    border-top: 1px solid #eee;
                }

                .unsaved-warning {
                    color: #f57c00;
                    font-size: 13px;
                }

                .save-message {
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .save-message.success {
                    color: #2e7d32;
                }

                .save-message.error {
                    color: #d32f2f;
                }

                /* Dark mode */
                .dark-mode .content-nav,
                .dark-mode .content-main {
                    background: #16213e;
                }

                .dark-mode .content-nav-item {
                    color: #ccc;
                }

                .dark-mode .content-nav-item i {
                    color: #888;
                }

                .dark-mode .content-nav-item:hover {
                    background: #1a1a2e;
                }

                .dark-mode .section-tabs {
                    background: #1a1a2e;
                    border-color: #2a3f5f;
                }

                .dark-mode .section-tab {
                    background: #16213e;
                    border-color: #2a3f5f;
                    color: #aaa;
                }

                .dark-mode .content-fields {
                    background: #16213e;
                }

                .dark-mode .field-group label {
                    color: #ccc;
                }

                .dark-mode .field-group input,
                .dark-mode .field-group textarea {
                    background: #1a1a2e;
                    border-color: #2a3f5f;
                    color: #e0e0e0;
                }

                .dark-mode .save-bar {
                    background: #1a1a2e;
                    border-color: #2a3f5f;
                }

                @media (max-width: 900px) {
                    .content-editor-layout {
                        grid-template-columns: 1fr;
                    }

                    .content-nav {
                        position: static;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        padding: 15px;
                    }

                    .nav-header {
                        width: 100%;
                    }

                    .content-nav-item {
                        flex: 1;
                        min-width: 120px;
                        justify-content: center;
                        margin-bottom: 0;
                    }

                    .content-header {
                        flex-direction: column;
                        gap: 15px;
                        text-align: center;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
