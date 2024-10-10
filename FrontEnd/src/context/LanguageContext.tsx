import React, { createContext, useState, useEffect, ReactNode } from 'react';
import en from '../locales/en.json';
import es from '../locales/es.json';
import ca from '../locales/ca.json';

export type Language = 'en' | 'es' | 'ca';

interface LanguageContextProps {
  language: Language;
  translations: Record<string, string>;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string; // Función para traducir textos
}

export const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  translations: en,
  changeLanguage: () => {},
  t: () => '', 
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>(en);

  useEffect(() => {
    // Obtener el idioma guardado en localStorage al iniciar la aplicación
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang); // Guardar la preferencia de idioma

    switch (lang) {
      case 'en':
        setTranslations(en);
        break;
      case 'es':
        setTranslations(es);
        break;
      case 'ca':
        setTranslations(ca);
        break;
      default:
        setTranslations(en);
    }
  };

  // Función para obtener la traducción basada en la clave
  const t = (key: string) => {
    return translations[key] || key; // Si no existe la traducción, devuelve la clave
  };

  return (
    <LanguageContext.Provider value={{ language, translations, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
