// js/ai-service.js
class AIService {
    constructor() {
        this.pollinationsUrl = 'https://pollinations.ai/prompt';
        this.apiTimeout = 60000; // 60 seconds
    }

    async compareProducts(url1, url2) {
        const prompt = this.generateComparisonPrompt(url1, url2);
        return this.callPollinationsAI(prompt);
    }

    generateComparisonPrompt(url1, url2) {
        return `You are an expert product comparison AI. Compare these two products from shopping websites:

Product 1: ${url1}
Product 2: ${url2}

Please provide a DETAILED comparison in JSON format with this EXACT structure:

{
  "overview": {
    "product1": {
      "name": "Extracted product name or title",
      "key_features": ["3-5 key bullet points"],
      "price_range": "estimated price range or 'unknown'"
    },
    "product2": {
      "name": "Extracted product name or title", 
      "key_features": ["3-5 key bullet points"],
      "price_range": "estimated price range or 'unknown'"
    }
  },
  "pros_cons": {
    "product1": {
      "pros": ["3-5 specific advantages"],
      "cons": ["3-5 specific disadvantages"]
    },
    "product2": {
      "pros": ["3-5 specific advantages"],
      "cons": ["3-5 specific disadvantages"]
    }
  },
  "analysis": "2-3 paragraph detailed comparison analysis highlighting differences, similarities, target audience, value proposition",
  "recommendation": {
    "winner": "product1 OR product2 OR 'tie'",
    "reason": "Clear reason why one is better or why it's a tie",
    "confidence": 65-95
  },
  "customer_sentiment": {
    "product1": "Summary of expected customer reviews",
    "product2": "Summary of expected customer reviews"
  }
}

Focus on:
- Technical specifications and features
- Build quality and materials  
- Price-to-performance ratio
- Target audience suitability
- Long-term value
- Common customer complaints/praise patterns

Be objective, detailed, and specific.`;
    }

    async callPollinationsAI(prompt) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);

        try {
            const response = await fetch(this.pollinationsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'flux',
                    prompt: prompt,
                    width: 1024,
                    height: 1024,
                    n: 1,
                    seed: Math.floor(Math.random() * 1000000),
                    response_format: 'text'
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`AI service error: ${response.status}`);
            }

            const aiResponse = await response.text();
            return this.parseAIResponse(aiResponse);

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('AI analysis timed out. Please try again.');
            }
            throw new Error(`AI service unavailable: ${error.message}`);
        }
    }

    parseAIResponse(rawResponse) {
        try {
            // Extract JSON from potentially messy AI response
            const jsonMatch = rawResponse.match(/{[sS]*}/);
            if (!jsonMatch) {
                throw new Error('Invalid AI response format');
            }

            const data = JSON.parse(jsonMatch[0]);
            
            // Validate and sanitize data
            return this.sanitizeComparisonData(data);
            
        } catch (error) {
            console.error('AI Parse Error:', error, rawResponse);
            throw new Error('Failed to parse AI analysis. Please try again.');
        }
    }

    sanitizeComparisonData(data) {
        const defaultData = {
            overview: {
                product1: { name: 'Product 1', key_features: [], price_range: 'Unknown' },
                product2: { name: 'Product 2', key_features: [], price_range: 'Unknown' }
            },
            pros_cons: {
                product1: { pros: [], cons: [] },
                product2: { pros: [], cons: [] }
            },
            analysis: 'AI analysis not available. Please check product URLs and try again.',
            recommendation: { winner: 'tie', reason: 'Insufficient data for comparison', confidence: 50 },
            customer_sentiment: {
                product1: 'No review data available',
                product2: 'No review data available'
            }
        };

        // Merge with defaults to ensure structure exists
        return {
            overview: { ...defaultData.overview, ...data.overview },
            pros_cons: { ...defaultData.pros_cons, ...data.pros_cons },
            analysis: data.analysis || defaultData.analysis,
            recommendation: { 
                ...defaultData.recommendation, 
                ...data.recommendation,
                confidence: Math.max(50, Math.min(95, data.recommendation?.confidence || 50))
            },
            customer_sentiment: { ...defaultData.customer_sentiment, ...data.customer_sentiment }
        };
    }
}
