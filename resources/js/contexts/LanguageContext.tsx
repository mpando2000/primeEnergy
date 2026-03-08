import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import enFallback from '../translations/en.json';
import swFallback from '../translations/sw.json';

type Language = 'en' | 'sw';

type TranslationData = Record<string, unknown>;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    tArray: (key: string) => string[];
    isLoading: boolean;
}

const fallbackTranslations: Record<Language, TranslationData> = { 
    en: enFallback, 
    sw: swFallback 
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [translations, setTranslations] = useState<Record<Language, TranslationData>>({
        en: enFallback,
        sw: swFallback,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch translations from database
    const fetchTranslations = useCallback(async (locale: Language) => {
        try {
            // Add timestamp to prevent browser caching
            const response = await fetch(`/api/translations/${locale}?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                // Only update if we got data
                if (data && Object.keys(data).length > 0) {
                    setTranslations(prev => ({
                        ...prev,
                        [locale]: data,
                    }));
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch ${locale} translations, using fallback`);
        }
    }, []);

    // Load saved language and fetch translations on mount
    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        const initialLang = (saved === 'en' || saved === 'sw') ? saved : 'en';
        setLanguageState(initialLang);
        
        // Fetch both languages
        setIsLoading(true);
        Promise.all([
            fetchTranslations('en'),
            fetchTranslations('sw'),
        ]).finally(() => setIsLoading(false));
    }, [fetchTranslations]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: unknown = translations[language];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                // Fallback to English if key not found in current language
                value = translations['en'];
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = (value as Record<string, unknown>)[fallbackKey];
                    } else {
                        // Final fallback to static JSON
                        value = fallbackTranslations[language];
                        for (const staticKey of keys) {
                            if (value && typeof value === 'object' && staticKey in value) {
                                value = (value as Record<string, unknown>)[staticKey];
                            } else {
                                return key; // Return key if not found anywhere
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
        
        return typeof value === 'string' ? value : key;
    };

    const tArray = (key: string): string[] => {
        const keys = key.split('.');
        let value: unknown = translations[language];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                // Fallback to English if key not found
                value = translations['en'];
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = (value as Record<string, unknown>)[fallbackKey];
                    } else {
                        return []; // Return empty array if not found
                    }
                }
                break;
            }
        }
        
        return Array.isArray(value) ? value : [];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tArray, isLoading }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
