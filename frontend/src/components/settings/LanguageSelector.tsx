'use client';

import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import { languages } from '@/lib/i18n';

/**
 * Language Selector Component
 * Allows users to switch between available languages
 * WCAG 2.1 AA compliant
 */
export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Persist preference
    localStorage.setItem('preferredLanguage', langCode);
  };

  return (
    <div className="flex items-center gap-3">
      <Label 
        htmlFor="language-select" 
        className="flex items-center gap-2 text-[var(--text-secondary)]"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        {t('settings.language', 'Language')}
      </Label>
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger 
          id="language-select" 
          className="w-[180px]"
          aria-label={t('settings.selectLanguage', 'Select language')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.nativeName}</span>
                {lang.code !== i18n.language && (
                  <span className="text-[var(--text-tertiary)] text-xs">
                    ({lang.name})
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
