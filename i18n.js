(() => {
    'use strict';

    function t(key) {
        return chrome.i18n.getMessage(key) || key;
    }

    function localizeDocument() {
        const language = chrome.i18n.getUILanguage();
        document.documentElement.lang = language;
        document.documentElement.dir = /^ar\b/i.test(language) ? 'rtl' : 'ltr';

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            element.textContent = t(element.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-title]').forEach((element) => {
            element.title = t(element.dataset.i18nTitle);
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
            element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
        });
    }

    window.yeedioI18n = { t, localizeDocument };
    document.addEventListener('DOMContentLoaded', localizeDocument);
})();
