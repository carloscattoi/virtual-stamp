// Mock data structure
const mockSalesData = {
    dailyTarget: 1000,
    currentSales: 750,
    hourlyData: [
        { hour: '06:00', sales: 25, transactions: 8 },
        { hour: '08:00', sales: 45, transactions: 12 },
        { hour: '09:00', sales: 67, transactions: 18 },
        { hour: '10:00', sales: 89, transactions: 24 },
        { hour: '11:00', sales: 120, transactions: 32 },
        { hour: '12:00', sales: 234, transactions: 45 },
        { hour: '13:00', sales: 180, transactions: 38 },
        { hour: '14:00', sales: 145, transactions: 30 },
        { hour: '15:00', sales: 120, transactions: 25 },
        { hour: '16:00', sales: 156, transactions: 28 },
        { hour: '17:00', sales: 189, transactions: 35 },
        { hour: '18:00', sales: 167, transactions: 32 },
        { hour: '19:00', sales: 145, transactions: 28 },
        { hour: '20:00', sales: 98, transactions: 20 },
        { hour: '21:00', sales: 67, transactions: 15 },
        { hour: '22:00', sales: 45, transactions: 10 }
    ],
    monthlyData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 500) + 500,
        transactions: Math.floor(Math.random() * 100) + 50
    })),
    productData: {
        topPerformers: [
            { name: 'Espresso', revenue: 2345, units: 234, trend: 15 },
            { name: 'Croissant', revenue: 1234, units: 123, trend: 25 },
            { name: 'Chicken Sandwich', revenue: 567, units: 45, trend: -5 }
        ],
        categories: ['Coffee', 'Pastries', 'Sandwiches', 'Drinks', 'Snacks'],
        stockLevels: {
            'Espresso': { status: 'good', quantity: 100 },
            'Croissant': { status: 'warning', quantity: 15 },
            'Chicken Sandwich': { status: 'low', quantity: 5 }
        }
    },
    weatherImpact: {
        sunny: { multiplier: 1.1 },
        rainy: { multiplier: 1.15 },
        cloudy: { multiplier: 1.0 }
    }
};

// Common chart configuration
const chartConfig = {
    colors: {
        primary: '#E07A5F',
        secondary: '#8FBC8F',
        accent: '#F8F8FF',
        success: '#4CAF50',
        warning: '#FFC107',
        danger: '#F44336'
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    }
};

// Utility functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`;
};

const getTrendIndicator = (trend) => {
    return {
        icon: trend > 0 ? '↑' : '↓',
        class: trend > 0 ? 'trend-up' : 'trend-down',
        value: formatPercentage(trend)
    };
};

// Chart creation helpers
const createLineChart = (ctx, data, options = {}) => {
    return new Chart(ctx, {
        type: 'line',
        data: data,
        options: { ...chartConfig.options, ...options }
    });
};

const createBarChart = (ctx, data, options = {}) => {
    return new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { ...chartConfig.options, ...options }
    });
};

const createDoughnutChart = (ctx, data, options = {}) => {
    return new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: { ...chartConfig.options, ...options }
    });
};

// Loading state management
const showLoading = (element) => {
    element.classList.add('loading');
    element.innerHTML = '<div class="loading-spinner"></div>';
};

const hideLoading = (element) => {
    element.classList.remove('loading');
};

// Export functions
const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
        data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Real-time update simulation
const simulateRealTimeUpdates = (callback, interval = 5000) => {
    return setInterval(callback, interval);
};

// Export all utilities
window.salesUtils = {
    mockSalesData,
    chartConfig,
    formatCurrency,
    formatPercentage,
    getTrendIndicator,
    createLineChart,
    createBarChart,
    createDoughnutChart,
    showLoading,
    hideLoading,
    exportToCSV,
    simulateRealTimeUpdates
}; 