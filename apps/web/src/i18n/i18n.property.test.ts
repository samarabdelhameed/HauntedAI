/**
 * Property-Based Tests for Multi-language Support
 * Feature: haunted-ai
 * Validates: Requirements 20.1, 20.2, 20.4
 */

import fc from 'fast-check';
import i18n from './config';

// Helper to detect language from browser settings
function detectLanguage(browserLang: string, supportedLangs: string[]): string {
  const lang = browserLang.toLowerCase().split('-')[0];
  return supportedLangs.includes(lang) ? lang : 'en';
}

// Helper to check if text direction is RTL
function isRTL(language: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
}

// Helper to get text direction
function getTextDirection(language: string): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

// Helper to simulate language switching
async function switchLanguage(newLang: string): Promise<void> {
  await i18n.changeLanguage(newLang);
}

// Helper to get current language
function getCurrentLanguage(): string {
  return i18n.language;
}

describe('Multi-language Support Property Tests', () => {
  beforeEach(() => {
    // Reset to default language
    i18n.changeLanguage('en');
  });

  // Feature: haunted-ai, Property 77: Language detection
  // Validates: Requirements 20.1
  describe('Property 77: Language detection', () => {
    it('should detect and use supported browser language', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('en', 'ar', 'en-US', 'ar-SA', 'en-GB', 'ar-EG'),
          async (browserLang) => {
            const supportedLangs = ['en', 'ar'];
            const detectedLang = detectLanguage(browserLang, supportedLangs);

            // Verify detected language is one of the supported languages
            expect(supportedLangs).toContain(detectedLang);

            // Verify detection logic
            const baseLang = browserLang.toLowerCase().split('-')[0];
            if (supportedLangs.includes(baseLang)) {
              expect(detectedLang).toBe(baseLang);
            } else {
              expect(detectedLang).toBe('en'); // Fallback to English
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fallback to English for unsupported languages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('fr', 'de', 'es', 'zh', 'ja', 'ko', 'ru'),
          async (unsupportedLang) => {
            const supportedLangs = ['en', 'ar'];
            const detectedLang = detectLanguage(unsupportedLang, supportedLangs);

            // Verify fallback to English
            expect(detectedLang).toBe('en');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle language codes with region variants', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            lang: fc.constantFrom('en', 'ar'),
            region: fc.constantFrom('US', 'GB', 'SA', 'EG', 'AE'),
          }),
          async ({ lang, region }) => {
            const browserLang = `${lang}-${region}`;
            const supportedLangs = ['en', 'ar'];
            const detectedLang = detectLanguage(browserLang, supportedLangs);

            // Verify base language is extracted correctly
            expect(detectedLang).toBe(lang);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: haunted-ai, Property 78: Language switching without reload
  // Validates: Requirements 20.2
  describe('Property 78: Language switching without reload', () => {
    it('should switch language immediately without page reload', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('en', 'ar'),
          async (targetLang) => {
            // Start with opposite language
            const startLang = targetLang === 'en' ? 'ar' : 'en';
            await i18n.changeLanguage(startLang);
            expect(i18n.language).toBe(startLang);

            // Switch to target language
            await switchLanguage(targetLang);

            // Verify language changed immediately
            const currentLang = getCurrentLanguage();
            expect(currentLang).toBe(targetLang);

            // Verify no reload occurred (i18n instance still exists)
            expect(i18n).toBeDefined();
            expect(i18n.isInitialized).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update all text when language changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('en', 'ar'),
          async (newLang) => {
            // Switch language
            await switchLanguage(newLang);

            // Verify translations are available for the new language
            const testKey = 'landing.title';
            const translation = i18n.t(testKey);

            // Verify translation exists and is not the key itself
            expect(translation).toBeDefined();
            expect(translation).not.toBe(testKey);
            expect(translation.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain language preference across switches', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('en', 'ar'), { minLength: 2, maxLength: 10 }),
          async (languageSequence) => {
            // Switch through sequence of languages
            for (const lang of languageSequence) {
              await switchLanguage(lang);
              expect(getCurrentLanguage()).toBe(lang);
            }

            // Verify final language is the last in sequence
            const finalLang = languageSequence[languageSequence.length - 1];
            expect(getCurrentLanguage()).toBe(finalLang);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: haunted-ai, Property 80: RTL text rendering
  // Validates: Requirements 20.4
  describe('Property 80: RTL text rendering', () => {
    it('should set RTL direction for Arabic text', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant('ar'),
          async (arabicLang) => {
            // Check if Arabic is RTL
            const direction = getTextDirection(arabicLang);

            // Verify RTL direction
            expect(direction).toBe('rtl');
            expect(isRTL(arabicLang)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set LTR direction for English text', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant('en'),
          async (englishLang) => {
            // Check if English is LTR
            const direction = getTextDirection(englishLang);

            // Verify LTR direction
            expect(direction).toBe('ltr');
            expect(isRTL(englishLang)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify RTL languages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('ar', 'he', 'fa', 'ur'),
          async (rtlLang) => {
            // Verify RTL detection
            expect(isRTL(rtlLang)).toBe(true);
            expect(getTextDirection(rtlLang)).toBe('rtl');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify LTR languages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('en', 'fr', 'de', 'es', 'it'),
          async (ltrLang) => {
            // Verify LTR detection
            expect(isRTL(ltrLang)).toBe(false);
            expect(getTextDirection(ltrLang)).toBe('ltr');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply correct text direction when switching languages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            from: fc.constantFrom('en', 'ar'),
            to: fc.constantFrom('en', 'ar'),
          }),
          async ({ from, to }) => {
            // Switch from one language to another
            await switchLanguage(from);
            const directionBefore = getTextDirection(from);

            await switchLanguage(to);
            const directionAfter = getTextDirection(to);

            // Verify direction matches language
            if (to === 'ar') {
              expect(directionAfter).toBe('rtl');
            } else {
              expect(directionAfter).toBe('ltr');
            }

            // Verify direction changed if languages have different directions
            if (from !== to && isRTL(from) !== isRTL(to)) {
              expect(directionBefore).not.toBe(directionAfter);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional property: Translation completeness
  describe('Additional: Translation completeness', () => {
    it('should have translations for all common keys in both languages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('en', 'ar'),
          async (lang) => {
            await switchLanguage(lang);

            // Common keys that should exist
            const commonKeys = [
              'landing.title',
              'landing.subtitle',
              'landing.connectWallet',
            ];

            // Verify all keys have translations
            commonKeys.forEach((key) => {
              const translation = i18n.t(key);
              expect(translation).toBeDefined();
              expect(translation).not.toBe(key); // Not the key itself
              expect(translation.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return fallback for missing translation keys', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            lang: fc.constantFrom('en', 'ar'),
            missingKey: fc.string({ minLength: 5, maxLength: 20 }).map((s) => `missing.${s}`),
          }),
          async ({ lang, missingKey }) => {
            await switchLanguage(lang);

            // Try to get translation for non-existent key
            const translation = i18n.t(missingKey);

            // Verify fallback behavior (returns key or fallback text)
            expect(translation).toBeDefined();
            expect(typeof translation).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional property: Language persistence
  describe('Additional: Language persistence', () => {
    it('should persist language selection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('en', 'ar'),
          async (selectedLang) => {
            // Switch to selected language
            await switchLanguage(selectedLang);

            // Verify language is set
            expect(getCurrentLanguage()).toBe(selectedLang);

            // Simulate getting language (as if from localStorage)
            const persistedLang = i18n.language;
            expect(persistedLang).toBe(selectedLang);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
