/**
 * Language Switcher
 * Automatic language detection, switching, and persistence
 * Sharka Coffee - i18n Implementation
 */

(function() {
  'use strict';
  
  const STORAGE_KEY = 'sharkacoffee_lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED_LANGS = ['en', 'zh'];
  
  // Language Switcher Class
  class LanguageSwitcher {
    constructor() {
      this.currentLang = this.detectLanguage();
      this.init();
    }
    
    /**
     * Detect language from: localStorage > browser > default
     */
    detectLanguage() {
      // 1. Check localStorage
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
        return savedLang;
      }
      
      // 2. Check browser language
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang) {
        const langCode = browserLang.toLowerCase().split('-')[0];
        if (langCode === 'zh') {
          return 'zh';
        }
      }
      
      // 3. Default to English
      return DEFAULT_LANG;
    }
    
    /**
     * Initialize the language switcher
     */
    init() {
      // Apply translations on page load
      this.applyTranslations(this.currentLang);
      
      // Setup language toggle button
      this.setupLanguageToggle();
      
      // Update HTML lang attribute
      document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
    }
    
    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations(lang) {
      const elements = document.querySelectorAll('[data-i18n]');
      
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = i18n.getTranslation(lang, key);
        
        // Check if element has a specific attribute to update
        const attr = element.getAttribute('data-i18n-attr');
        if (attr) {
          element.setAttribute(attr, translation);
        } else {
          // Update text content by default
          element.textContent = translation;
        }
      });
    }
    
    /**
     * Setup language toggle button
     */
    setupLanguageToggle() {
      const toggleBtn = document.querySelector('[data-lang-toggle]');
      
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.switchLanguage();
        });
      }
      
      // Also handle legacy language switch links
      const legacyLinks = document.querySelectorAll('a[href*="index_cn.html"], a[href*="index.html"]');
      legacyLinks.forEach(link => {
        // Only handle links that are language switchers (not navigation)
        if (link.textContent.includes('中文') || link.textContent.includes('English')) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchLanguage();
          });
        }
      });
    }
    
    /**
     * Switch between languages
     */
    switchLanguage() {
      // Toggle between en and zh
      this.currentLang = this.currentLang === 'en' ? 'zh' : 'en';
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, this.currentLang);
      
      // Apply new translations
      this.applyTranslations(this.currentLang);
      
      // Update HTML lang attribute
      document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
      
      // Optional: Trigger custom event for other scripts
      const event = new CustomEvent('languageChanged', {
        detail: { language: this.currentLang }
      });
      document.dispatchEvent(event);
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
      return this.currentLang;
    }
    
    /**
     * Set language programmatically
     */
    setLanguage(lang) {
      if (SUPPORTED_LANGS.includes(lang)) {
        this.currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        this.applyTranslations(lang);
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      }
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.langSwitcher = new LanguageSwitcher();
    });
  } else {
    window.langSwitcher = new LanguageSwitcher();
  }
  
  // Expose to window for external access
  window.LanguageSwitcher = LanguageSwitcher;
  
})();
