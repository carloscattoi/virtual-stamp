// Reviews Module Utilities

// Fetch mock reviews data
async function fetchReviews() {
    try {
        const response = await fetch('../data/mock-reviews.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to hardcoded data if fetch fails
        return {
            reviews: [
                {
                    id: "r1",
                    customer: {
                        name: "Alice Smith",
                        photo: "customer1.jpg"
                    },
                    rating: 5,
                    platform: "Google",
                    date: "2024-03-15",
                    content: "Amazing coffee and friendly staff! The atmosphere is perfect for working remotely.",
                    response: "Thank you, Alice! We're glad you enjoyed your experience with us.",
                    locationId: "loc1",
                    topics: ["coffee", "staff", "atmosphere", "remote work"]
                },
                {
                    id: "r2",
                    customer: {
                        name: "Bob Johnson",
                        photo: "customer2.jpg"
                    },
                    rating: 4,
                    platform: "Yelp",
                    date: "2024-03-14",
                    content: "Great pastries and quick service. The seasonal drinks are a must-try!",
                    response: null,
                    locationId: "loc2",
                    topics: ["pastries", "service", "seasonal drinks"]
                },
                {
                    id: "r3",
                    customer: {
                        name: "Carol White",
                        photo: "customer3.jpg"
                    },
                    rating: 3,
                    platform: "Google",
                    date: "2024-03-13",
                    content: "Good coffee but the seating area was a bit crowded. Staff was helpful though.",
                    response: "Thank you for your feedback, Carol. We're working on expanding our seating area.",
                    locationId: "loc1",
                    topics: ["coffee", "seating", "staff"]
                },
                {
                    id: "r4",
                    customer: {
                        name: "David Brown",
                        photo: "customer4.jpg"
                    },
                    rating: 5,
                    platform: "Yelp",
                    date: "2024-03-12",
                    content: "Best coffee in town! The baristas are so knowledgeable about their craft.",
                    response: "We appreciate your kind words, David! Our baristas work hard to perfect their craft.",
                    locationId: "loc2",
                    topics: ["coffee", "baristas", "quality"]
                },
                {
                    id: "r5",
                    customer: {
                        name: "Emma Davis",
                        photo: "customer5.jpg"
                    },
                    rating: 2,
                    platform: "Google",
                    date: "2024-03-11",
                    content: "The coffee was cold and the service was slow. Not worth the price.",
                    response: "We apologize for your experience, Emma. Please contact us so we can make it right.",
                    locationId: "loc1",
                    topics: ["coffee", "service", "pricing"]
                }
            ],
            locations: [
                {
                    id: "loc1",
                    name: "Downtown Cafe",
                    address: "123 Main St"
                },
                {
                    id: "loc2",
                    name: "Uptown Cafe",
                    address: "456 Oak Ave"
                }
            ]
        };
    }
}

// Calculate review statistics
function calculateReviewStats(reviews) {
    const stats = {
        totalReviews: reviews.length,
        averageRating: 0,
        ratingDistribution: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        },
        responseRate: 0,
        platformDistribution: {},
        topicFrequency: {}
    };

    let totalRating = 0;
    let respondedReviews = 0;

    reviews.forEach(review => {
        // Calculate average rating
        totalRating += review.rating;
        stats.ratingDistribution[review.rating]++;

        // Calculate response rate
        if (review.response) {
            respondedReviews++;
        }

        // Calculate platform distribution
        stats.platformDistribution[review.platform] = (stats.platformDistribution[review.platform] || 0) + 1;

        // Calculate topic frequency
        review.topics.forEach(topic => {
            stats.topicFrequency[topic] = (stats.topicFrequency[topic] || 0) + 1;
        });
    });

    stats.averageRating = (totalRating / reviews.length).toFixed(1);
    stats.responseRate = ((respondedReviews / reviews.length) * 100).toFixed(1);

    return stats;
}

// Filter reviews based on criteria
function filterReviews(reviews, filters) {
    return reviews.filter(review => {
        if (filters.rating && review.rating !== parseInt(filters.rating)) return false;
        if (filters.platform && review.platform !== filters.platform) return false;
        if (filters.locationId && review.locationId !== filters.locationId) return false;
        if (filters.hasResponse && review.response === null) return false;
        if (filters.dateRange) {
            const reviewDate = new Date(review.date);
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            if (reviewDate < startDate || reviewDate > endDate) return false;
        }
        if (filters.topics && filters.topics.length > 0) {
            if (!review.topics.some(topic => filters.topics.includes(topic))) return false;
        }
        return true;
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '<span class="star">★</span>';
        } else if (i === fullStars && hasHalfStar) {
            starsHtml += '<span class="star">★</span>';
        } else {
            starsHtml += '<span class="star">☆</span>';
        }
    }

    return starsHtml;
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Create review card HTML
function createReviewCard(review) {
    return `
        <div class="review-card" data-review-id="${review.id}">
            <div class="review-header">
                <div class="reviewer-info">
                    <img src="/images/${review.customer.photo}" alt="${review.customer.name}" class="reviewer-avatar">
                    <div>
                        <div class="reviewer-name">${review.customer.name}</div>
                        <div class="rating-stars">${generateStarRating(review.rating)}</div>
                    </div>
                </div>
                <div class="review-meta">
                    <span>${review.platform}</span>
                    <span>•</span>
                    <span>${formatDate(review.date)}</span>
                </div>
            </div>
            <div class="review-content">${review.content}</div>
            ${review.response ? `
                <div class="review-response">
                    <strong>Response:</strong> ${review.response}
                </div>
            ` : `
                <div class="response-form">
                    <textarea class="response-textarea" placeholder="Write a response..."></textarea>
                    <div class="response-actions">
                        <button class="action-button secondary-action">Cancel</button>
                        <button class="action-button primary-action">Submit Response</button>
                    </div>
                </div>
            `}
            <div class="topic-tags">
                ${review.topics.map(topic => `
                    <span class="topic-tag">${topic}</span>
                `).join('')}
            </div>
        </div>
    `;
}

// Initialize charts
function initializeCharts(reviews) {
    const stats = calculateReviewStats(reviews);

    // Rating distribution chart
    const ratingCtx = document.getElementById('ratingDistributionChart');
    if (ratingCtx) {
        new Chart(ratingCtx, {
            type: 'bar',
            data: {
                labels: ['5★', '4★', '3★', '2★', '1★'],
                datasets: [{
                    label: 'Number of Reviews',
                    data: [
                        stats.ratingDistribution[5],
                        stats.ratingDistribution[4],
                        stats.ratingDistribution[3],
                        stats.ratingDistribution[2],
                        stats.ratingDistribution[1]
                    ],
                    backgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Platform distribution chart
    const platformCtx = document.getElementById('platformDistributionChart');
    if (platformCtx) {
        new Chart(platformCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(stats.platformDistribution),
                datasets: [{
                    data: Object.values(stats.platformDistribution),
                    backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
                }]
            },
            options: {
                responsive: true
            }
        });
    }
}

// Export utilities
export {
    fetchReviews,
    calculateReviewStats,
    filterReviews,
    generateStarRating,
    formatDate,
    createReviewCard,
    initializeCharts
}; 