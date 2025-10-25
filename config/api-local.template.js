// Local API Configuration Template
// Copy this file to api-local.js and customize for your environment
// DO NOT commit api-local.js to version control!

const LOCAL_API_CONFIG = {
    // Your production API URL (if different from default)
    BASE_URL: 'https://your-production-api-url.com',
    
    // Enable local API server (set to true if running API server locally)
    USE_LOCAL_SERVER: false, // Set to true to use localhost:3000
    
    // Optional: Override individual endpoints if needed
    CUSTOM_ENDPOINTS: {
        // Example: KILLS: '/api/v2/kills'
    },
    
    // Optional: API keys or client IDs (if using OAuth)
    // CLIENT_ID: 'your-client-id-here',
    
    // Development settings
    DEBUG: true,
    TIMEOUT: 60000 // Longer timeout for debugging
};

// Override the global config if this file is loaded
if (typeof API_CONFIG !== 'undefined') {
    // Enable local server if specified
    if (LOCAL_API_CONFIG.USE_LOCAL_SERVER) {
        window.LOCAL_API_SERVER = true;
        API_CONFIG.BASE_URL = 'http://localhost:3000';
    } else if (LOCAL_API_CONFIG.BASE_URL) {
        API_CONFIG.BASE_URL = LOCAL_API_CONFIG.BASE_URL;
    }
    
    API_CONFIG.DEBUG = LOCAL_API_CONFIG.DEBUG;
    API_CONFIG.TIMEOUT = LOCAL_API_CONFIG.TIMEOUT;
    
    // Override endpoints if specified
    if (LOCAL_API_CONFIG.CUSTOM_ENDPOINTS) {
        Object.assign(API_CONFIG.ENDPOINTS, LOCAL_API_CONFIG.CUSTOM_ENDPOINTS);
    }
}