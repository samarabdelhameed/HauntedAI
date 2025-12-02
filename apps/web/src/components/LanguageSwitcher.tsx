// Language Switcher Component
// Managed by Kiro

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { soundManager } from '../utils/soundManager';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    soundManager.play('click');
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    
    // Update document direction for RTL
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      onMouseEnter={() => soundManager.play('hover')}
      className="glass px-4 py-2 rounded-lg flex items-center gap-2 hover:border-[#FF6B00] transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Globe className="w-5 h-5" />
      <span className="font-semibold">
        {i18n.language === 'en' ? 'العربية' : 'English'}
      </span>
    </motion.button>
  );
}
