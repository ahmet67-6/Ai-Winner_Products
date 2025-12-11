// js/utils.js
class ProductComparisonUtils {
    static generateProductImageUrl(url) {
        // Generate favicon or generic image based on domain
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        } catch {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM2NjdlZWEiLz4KPHRleHQgeD0iNDAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5QPC90ZXh0Pgo8L3N2Zz4K';
        }
    }

    static extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'unknown';
        }
    }

    static formatUrl(url) {
        return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }

    static showSection(targetSection) {
        document.querySelectorAll('.input-section, .loading-section, .results-section, .error-section')
            .forEach(section => section.classList.add('hidden'));
        targetSection.classList.remove('hidden');
    }

    static showLoading() {
        this.showSection(document.querySelector('.loading-section'));
        const progressFill = document.querySelector('.progress-fill');
        let width = 0;
        const interval = setInterval(() => {
            width = Math.min(width + Math.random() * 15, 90);
            progressFill.style.width = width + '%';
        }, 200);
        setTimeout(() => clearInterval(interval), 30000);
    }

    static showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.showSection(document.querySelector('.error-section'));
    }

    static updateProgress(width) {
        document.querySelector('.progress-fill').style.width = width + '%';
    }

    static truncateText(text, maxLength = 120) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}
