// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    const utils = ProductComparisonUtils;
    const aiService = new AIService();
    
    const compareBtn = document.getElementById('compareBtn');
    const newComparisonBtn = document.getElementById('newComparisonBtn');
    const retryBtn = document.getElementById('retryBtn');
    const url1Input = document.getElementById('url1');
    const url2Input = document.getElementById('url2');

    // Event Listeners
    compareBtn.addEventListener('click', handleCompare);
    newComparisonBtn.addEventListener('click', resetForm);
    retryBtn.addEventListener('click', resetForm);

    // Enter key support
    [url1Input, url2Input].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleCompare();
        });
    });

    async function handleCompare() {
        const url1 = url1Input.value.trim();
        const url2 = url2Input.value.trim();

        // Validation
        if (!url1 || !url2) {
            utils.showError('Please enter both product URLs.');
            return;
        }

        if (!isValidUrl(url1) || !isValidUrl(url2)) {
            utils.showError('Please enter valid URLs (starting with http/https).');
            return;
        }

        compareBtn.disabled = true;
        compareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        try {
            utils.showLoading();
            
            // Simulate initial processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const comparisonData = await aiService.compareProducts(url1, url2);
            displayResults(url1, url2, comparisonData);
            
        } catch (error) {
            console.error('Comparison Error:', error);
            utils.showError(error.message || 'Comparison failed. Please try again.');
        } finally {
            compareBtn.disabled = false;
            compareBtn.innerHTML = '<i class="fas fa-magic"></i> Compare with AI';
        }
    }

    function displayResults(url1, url2, data) {
        utils.showSection(document.querySelector('.results-section'));

        // Update product cards
        updateProductCard('1', url1, data.overview.product1);
        updateProductCard('2', url2, data.overview.product2);

        // AI Analysis
        document.getElementById('aiAnalysis').textContent = utils.truncateText(data.analysis, 800);

        // Pros & Cons
        updateProsCons('1', data.pros_cons.product1);
        updateProsCons('2', data.pros_cons.product2);

        // Recommendation
        updateRecommendation(data.recommendation, data.customer_sentiment);

        // Set confidence score with animation
        setTimeout(() => {
            const confidence = data.recommendation.confidence;
            document.getElementById('confidenceFill').style.width = confidence + '%';
            document.getElementById('confidenceText').textContent = confidence + '%';
        }, 500);
    }

    function updateProductCard(productNum, url, productData) {
        const cardId = `product${productNum}Card`;
        const titleId = `product${productNum}Title`;
        const urlId = `product${productNum}Url`;
        const imageId = `product${productNum}Image`;

        document.getElementById(titleId).textContent = productData.name || utils.extractDomain(url);
        document.getElementById(urlId).textContent = utils.formatUrl(url);
        document.getElementById(imageId).style.backgroundImage = `url(${utils.generateProductImageUrl(url)})`;
    }

    function updateProsCons(productNum, prosCons) {
        const prosId = `product${productNum}Pros`;
        const consId = `product${productNum}Cons`;

        const prosList = document.getElementById(prosId);
        const consList = document.getElementById(consId);

        prosList.innerHTML = '';
        consList.innerHTML = '';

        (prosCons.pros || []).slice(0, 5).forEach(pro => {
            const li = document.createElement('li');
            li.textContent = utils.truncateText(pro, 80);
            prosList.appendChild(li);
        });

        (prosCons.cons || []).slice(0, 5).forEach(con => {
            const li = document.createElement('li');
            li.textContent = utils.truncateText(con, 80);
            consList.appendChild(li);
        });
    }

    function updateRecommendation(recommendation, sentiment) {
        const winner = recommendation.winner === 'product1' ? 'Product 1' : 
                      recommendation.winner === 'product2' ? 'Product 2' : 'Tie';
        
        const content = document.getElementById('recommendationContent');
        content.innerHTML = `
            <div><strong>🥇 Winner:</strong> ${winner}</div>
            <div style="margin-top: 10px;"><strong>Reason:</strong> ${utils.truncateText(recommendation.reason, 200)}</div>
            <div style="margin-top: 15px; font-size: 0.95rem; opacity: 0.9;">
                <strong>Customer Sentiment:</strong><br>
                Product 1: ${utils.truncateText(sentiment.product1, 100)}<br>
                Product 2: ${utils.truncateText(sentiment.product2, 100)}
            </div>
        `;
    }

    function resetForm() {
        document.getElementById('url1').value = '';
        document.getElementById('url2').value = '';
        utils.showSection(document.querySelector('.input-section'));
        compareBtn.disabled = false;
        compareBtn.innerHTML = '<i class="fas fa-magic"></i> Compare with AI';
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return string.startsWith('http://') || string.startsWith('https://');
        } catch (_) {
            return false;
        }
    }
});
