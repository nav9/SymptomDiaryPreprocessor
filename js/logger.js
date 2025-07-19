// A simple logger utility

// For now, we can just wrap console.log to create a simple logger.
// This can be replaced with a more advanced library if needed, without
// changing the function calls throughout the application.

const logger = {
    info: function(message) {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    },
    warn: function(message) {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    },
    error: function(message, errorObj) {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, errorObj || '');
    },
    debug: function(message) {
        // In a production environment, you might want to disable debug logs
        console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
};

// Example usage:
// logger.info("Application has started.");
// logger.error("Failed to load a resource.");
