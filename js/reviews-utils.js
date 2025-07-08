// Modern Reviews Module Utilities
// Compatible with Material Design UI and Google Reviews API format

/**
 * Reviews Management System
 * Handles fetching, processing, and displaying Google Reviews data
 */

class ReviewsManager {
    constructor() {
        this.reviews = [];
        this.locations = [];
        this.cache = new Map();
        this.observers = new Set();
    }

    // Event system for reactive updates
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    notify(event, data) {
        this.observers.forEach(callback => callback(event, data));
    }

    // Fetch reviews data from API or fallback to mock data
    async fetchReviews(forceRefresh = false) {
        const cacheKey = 'reviews_data';
        
        if (!forceRefresh && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch('../data/mock-reviews.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform Google Reviews API format to our internal format
            const transformedData = this.transformGoogleReviewsData(data);
            
            this.cache.set(cacheKey, transformedData);
            this.reviews = transformedData.reviews;
            this.locations = transformedData.locations || [];
            
            this.notify('reviewsUpdated', transformedData);
            return transformedData;
            
        } catch (error) {
            console.warn('Failed to fetch reviews from API, using fallback data:', error);
            const fallbackData = this.getFallbackData();
            this.reviews = fallbackData.reviews;
            this.locations = fallbackData.locations;
            return fallbackData;
        }
    }

    // Transform Google Reviews API format to internal format
    transformGoogleReviewsData(data) {
        const reviews = data.reviews?.map(review => ({
            id: this.generateId(),
            author_name: review.author_name || 'Anonymous',
            author_url: review.author_url || '',
            profile_photo_url: review.profile_photo_url || '',
            rating: review.rating || 0,
            text: review.text || '',
            time: review.time || Date.now() / 1000,
            relative_time_description: review.relative_time_description || 'Recently',
            platform: this.detectPlatform(review.author_url) || 'Google',
            response: this.findBusinessResponse(data.reviews, review),
            sentiment: this.analyzeSentiment(review.text || ''),
            topics: this.extractTopics(review.text || ''),
            language: review.language || 'en',
            translated: review.translated || false
        })) || [];

        return {
            reviews,
            locations: this.generateMockLocations(),
            summary: this.calculateSummary(reviews)
        };
    }

    // Find business responses (they have rating: 0 and no author_url)
    findBusinessResponse(reviews, originalReview) {
        const responses = reviews.filter(r => 
            r.rating === 0 && 
            !r.author_url && 
            Math.abs(r.time - originalReview.time) < 86400 // Within 24 hours
        );
        
        return responses.length > 0 ? responses[0].text : null;
    }

    // Detect platform from author URL
    detectPlatform(authorUrl) {
        if (!authorUrl) return 'Google';
        if (authorUrl.includes('google.com')) return 'Google';
        if (authorUrl.includes('yelp.com')) return 'Yelp';
        if (authorUrl.includes('facebook.com')) return 'Facebook';
        return 'Other';
    }

    // Generate unique ID
    generateId() {
        return 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate mock locations data
    generateMockLocations() {
        return [
            {
                id: 'loc_downtown',
                name: 'Downtown Coffee Shop',
                address: '123 Main Street, Downtown',
                coordinates: { lat: 40.7128, lng: -74.0060 }
            },
            {
                id: 'loc_uptown',
                name: 'Uptown Café',
                address: '456 Oak Avenue, Uptown',
                coordinates: { lat: 40.7589, lng: -73.9851 }
            }
        ];
    }

    // Fallback data when API fails
    getFallbackData() {
        return {
            reviews: [
                {
                    id: 'fallback_1',
                    author_name: "Sarah Johnson",
                    rating: 5,
                    text: "Amazing coffee and the most delicious croissants! The barista was super friendly and made my latte perfectly. Will definitely be back!",
                    time: Date.now() / 1000 - 172800,
                    relative_time_description: "2 days ago",
                    platform: "Google",
                    response: "Thank you so much for your kind words! We're thrilled you enjoyed your experience.",
                    sentiment: 'positive',
                    topics: ['coffee', 'service', 'pastries']
                },
                {
                    id: 'fallback_2',
                    author_name: "Mike Chen",
                    rating: 1,
                    text: "Worst coffee I've ever had. Burnt taste and the staff was rude. Overpriced for what you get. Won't be coming back.",
                    time: Date.now() / 1000 - 604800,
                    relative_time_description: "1 week ago",
                    platform: "Google",
                    response: "We sincerely apologize for this experience. Please contact us directly so we can make this right.",
                    sentiment: 'negative',
                    topics: ['coffee', 'service', 'pricing']
                },
                {
                    id: 'fallback_3',
                    author_name: "Emma Rodriguez",
                    rating: 4,
                    text: "Great atmosphere and good coffee. The pastries are fresh and tasty. Only wish they had more seating available during busy hours.",
                    time: Date.now() / 1000 - 259200,
                    relative_time_description: "3 days ago",
                    platform: "Yelp",
                    response: "Thanks for the feedback! We're working on expanding our seating area.",
                    sentiment: 'positive',
                    topics: ['atmosphere', 'coffee', 'seating']
                }
            ],
            locations: this.generateMockLocations()
        };
    }

    // Sentiment analysis (basic implementation)
    analyzeSentiment(text) {
        const positiveWords = ['amazing', 'excellent', 'great', 'perfect', 'love', 'best', 'wonderful', 'fantastic', 'delicious'];
        const negativeWords = ['terrible', 'awful', 'worst', 'hate', 'horrible', 'disgusting', 'rude', 'poor', 'bad'];
        
        const textLower = text.toLowerCase();
        const positiveCount = positiveWords.reduce((count, word) => 
            count + (textLower.includes(word) ? 1 : 0), 0);
        const negativeCount = negativeWords.reduce((count, word) => 
            count + (textLower.includes(word) ? 1 : 0), 0);

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // Extract topics from review text
    extractTopics(text) {
        const topicKeywords = {
            'coffee': ['coffee', 'espresso', 'latte', 'cappuccino', 'brew', 'caffeine'],
            'service': ['service', 'staff', 'barista', 'waiter', 'server', 'employee'],
            'atmosphere': ['atmosphere', 'ambiance', 'vibe', 'mood', 'environment'],
            'food': ['food', 'pastry', 'croissant', 'muffin', 'sandwich', 'cake'],
            'cleanliness': ['clean', 'dirty', 'hygiene', 'sanitary', 'messy'],
            'pricing': ['price', 'cost', 'expensive', 'cheap', 'value', 'money'],
            'location': ['location', 'parking', 'area', 'neighborhood', 'accessible'],
            'seating': ['seating', 'chairs', 'tables', 'space', 'crowded']
        };

        const textLower = text.toLowerCase();
        const topics = [];

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        });

        return topics.length > 0 ? topics : ['general'];
    }

    // Calculate comprehensive review statistics
    calculateReviewStats(reviews = this.reviews) {
        if (!reviews || reviews.length === 0) {
            return this.getEmptyStats();
        }

        const stats = {
            totalReviews: reviews.length,
            averageRating: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            responseRate: 0,
            platformDistribution: {},
            sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
            topicFrequency: {},
            timeMetrics: {
                avgResponseTime: '2.5h',
                reviewsThisWeek: 0,
                reviewsThisMonth: 0
            }
        };

        let totalRating = 0;
        let respondedReviews = 0;
        const now = Date.now() / 1000;
        const weekAgo = now - (7 * 24 * 60 * 60);
        const monthAgo = now - (30 * 24 * 60 * 60);

        reviews.forEach(review => {
            // Basic metrics
            totalRating += review.rating;
            stats.ratingDistribution[review.rating]++;

            // Response rate
            if (review.response) {
                respondedReviews++;
            }

            // Platform distribution
            const platform = review.platform || 'Google';
            stats.platformDistribution[platform]++;

            // Sentiment distribution
            const sentiment = review.sentiment || this.analyzeSentiment(review.text || '');
            stats.sentimentDistribution[sentiment]++;

            // Topic frequency
            const topics = review.topics || this.extractTopics(review.text || '');
            topics.forEach(topic => {
                stats.topicFrequency[topic] = (stats.topicFrequency[topic] || 0) + 1;
            });

            // Time-based metrics
            if (review.time > weekAgo) stats.timeMetrics.reviewsThisWeek++;
            if (review.time > monthAgo) stats.timeMetrics.reviewsThisMonth++;
        });

        stats.averageRating = totalRating / reviews.length;
        stats.responseRate = (respondedReviews / reviews.length) * 100;

        return stats;
    }

    // Calculate summary insights
    calculateSummary(reviews) {
        const stats = this.calculateReviewStats(reviews);
        
        return {
            satisfaction: stats.averageRating,
            responseRate: stats.responseRate,
            totalReviews: stats.totalReviews,
            topTopics: Object.entries(stats.topicFrequency)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([topic]) => topic),
            sentimentScore: this.calculateSentimentScore(stats.sentimentDistribution)
        };
    }

    // Calculate overall sentiment score
    calculateSentimentScore(sentimentDistribution) {
        const total = Object.values(sentimentDistribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return 0;
        
        const positive = sentimentDistribution.positive || 0;
        const negative = sentimentDistribution.negative || 0;
        
        return ((positive - negative) / total) * 100;
    }

    // Get empty stats structure
    getEmptyStats() {
        return {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            responseRate: 0,
            platformDistribution: {},
            sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
            topicFrequency: {},
            timeMetrics: {
                avgResponseTime: 'N/A',
                reviewsThisWeek: 0,
                reviewsThisMonth: 0
            }
        };
    }

    // Filter reviews based on criteria
    filterReviews(reviews, filters) {
        return reviews.filter(review => {
            // Rating filter
            if (filters.rating) {
                const minRating = parseInt(filters.rating);
                if (review.rating < minRating) return false;
            }

            // Platform filter
            if (filters.platform && review.platform !== filters.platform) return false;

            // Location filter
            if (filters.locationId && review.locationId !== filters.locationId) return false;

            // Response status filter
            if (filters.response === 'responded' && !review.response) return false;
            if (filters.response === 'pending' && review.response) return false;

            // Date range filter
            if (filters.dateRange) {
                const reviewDate = new Date(review.time * 1000);
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);
                if (reviewDate < startDate || reviewDate > endDate) return false;
            }

            // Days filter
            if (filters.days) {
                const cutoff = Date.now() / 1000 - (filters.days * 24 * 60 * 60);
                if (review.time < cutoff) return false;
            }

            // Topic filter
            if (filters.topics && filters.topics.length > 0) {
                const reviewTopics = review.topics || [];
                if (!reviewTopics.some(topic => filters.topics.includes(topic))) return false;
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const searchableText = `${review.author_name} ${review.text}`.toLowerCase();
                if (!searchableText.includes(searchLower)) return false;
            }

            return true;
        });
    }

    // Generate star rating HTML
    generateStarRating(rating, options = {}) {
        const { showEmpty = true, className = 'rating-stars' } = options;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHtml = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += '★';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHtml += '★';
            } else if (showEmpty) {
                starsHtml += '☆';
            }
        }

        return `<span class="${className}">${starsHtml}</span>`;
    }

    // Format date for display
    formatDate(timestamp, options = {}) {
        const { format = 'relative', locale = 'en-US' } = options;
        const date = new Date(timestamp * 1000);
        
        if (format === 'relative') {
            return this.getRelativeTime(date);
        }
        
        const formatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        
        return date.toLocaleDateString(locale, formatOptions);
    }

    // Get relative time string
    getRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
        return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }

    // Create review card HTML with Material Design
    createReviewCard(review, options = {}) {
        const { showActions = true, showResponse = true } = options;
        const avatar = review.author_name.charAt(0).toUpperCase();
        const hasResponse = review.response && showResponse;
        
        return `
            <div class="review-card fade-in" data-review-id="${review.id}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${avatar}</div>
                        <div class="reviewer-details">
                            <div class="reviewer-name">${this.escapeHtml(review.author_name)}</div>
                            <div class="review-meta">
                                ${this.generateStarRating(review.rating)}
                                <span class="platform-badge">${review.platform}</span>
                                <span class="review-date">${review.relative_time_description}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="review-content">${this.escapeHtml(review.text)}</div>
                ${hasResponse ? `
                    <div class="response-section">
                        <div class="response-header">
                            <span class="material-icons" style="font-size: 16px;">reply</span>
                            Business Response
                        </div>
                        <div class="response-text">${this.escapeHtml(review.response)}</div>
                    </div>
                ` : ''}
                ${showActions ? `
                    <div class="review-actions">
                        ${hasResponse 
                            ? '<button class="review-action responded"><span class="material-icons">check</span>Responded</button>'
                            : '<button class="review-action" onclick="reviewsManager.showResponseDialog(\'' + review.id + '\')"><span class="material-icons">reply</span>Respond</button>'
                        }
                        <button class="review-action" onclick="reviewsManager.shareReview('${review.id}')">
                            <span class="material-icons">share</span>Share
                        </button>
                        <button class="review-action" onclick="reviewsManager.flagReview('${review.id}')">
                            <span class="material-icons">flag</span>Flag
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Escape HTML to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Placeholder methods for review actions
    showResponseDialog(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            // This would open a modal or expand a response form
            console.log('Show response dialog for review:', review);
            this.notify('showResponseDialog', { review });
        }
    }

    shareReview(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review && navigator.share) {
            navigator.share({
                title: 'Customer Review',
                text: review.text,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            console.log('Share review:', reviewId);
        }
    }

    flagReview(reviewId) {
        console.log('Flag review for moderation:', reviewId);
        this.notify('reviewFlagged', { reviewId });
    }

    // Initialize charts with Chart.js
    initializeCharts(chartConfigs) {
        const charts = {};
        
        chartConfigs.forEach(config => {
            const ctx = document.getElementById(config.canvasId);
            if (ctx) {
                charts[config.name] = new Chart(ctx, {
                    ...config.chartConfig,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        ...config.chartConfig.options
                    }
                });
            }
        });
        
        return charts;
    }

    // Update chart data
    updateChart(chart, newData) {
        if (chart && newData) {
            chart.data = { ...chart.data, ...newData };
            chart.update();
        }
    }
}

// Create global instance
const reviewsManager = new ReviewsManager();

// Utility functions for backward compatibility
async function fetchReviews() {
    return await reviewsManager.fetchReviews();
}

function calculateReviewStats(reviews) {
    return reviewsManager.calculateReviewStats(reviews);
}

function filterReviews(reviews, filters) {
    return reviewsManager.filterReviews(reviews, filters);
}

function generateStarRating(rating) {
    return reviewsManager.generateStarRating(rating);
}

function formatDate(timestamp) {
    return reviewsManager.formatDate(timestamp);
}

function createReviewCard(review) {
    return reviewsManager.createReviewCard(review);
}

function initializeCharts(chartConfigs) {
    return reviewsManager.initializeCharts(chartConfigs);
}

// Export for ES6 modules
export {
    ReviewsManager,
    reviewsManager,
    fetchReviews,
    calculateReviewStats,
    filterReviews,
    generateStarRating,
    formatDate,
    createReviewCard,
    initializeCharts
}; 