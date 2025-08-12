/**
 * @file step3Controller.js
 * @description A simplified controller for Step 3 to act as a data viewer.
 * It receives the final, cleaned data from Step 2 and displays it as a raw JSON string.
 */
const Step3Controller = (function(logger, ui) {

    const selectors = {
        dataDisplay: $('#step3-data-display'),
        proceedBtn: $('#proceed-to-step4-btn')
    };

    let step3Data = {}; // This will hold the data received from Step 2.
    let navCallback = null;

    /**
     * Initializes the controller.
     * @param {Function} navigationCallback - The main app's navigation function.
     * @param {Object|null} payload - Data from a loaded state file (not used in this simplified version).
     */
    function init(navigationCallback, payload) {
        logger.info("Initializing Step 3 Data Viewer.");
        navCallback = navigationCallback;
        
        // --- DATA RECEPTION ---
        // Get the finalized data object from the global state, which was set by step2Controller.
        const dataFromStep2 = (window.appState && window.appState.step2 && window.appState.step2.finalData);

        if (dataFromStep2 && Object.keys(dataFromStep2).length > 0) {
            logger.info("Successfully received data from Step 2.");
            step3Data = dataFromStep2;
            
            // Render the received data.
            render();
            attachEventListeners();
        } else {
            // If no data is found, display an error message.
            logger.warn("No data received from Step 2.");
            selectors.dataDisplay.text("Error: No data was passed from the previous step. Please go back to Step 2 and complete the finalization process.");
            selectors.proceedBtn.prop('disabled', true);
        }
    }

    /**
     * Renders the received data into the <pre> tag.
     */
    function render() {
        // Use JSON.stringify with formatting to make the output human-readable.
        // The 'null, 2' arguments add indentation for nice formatting.
        const formattedJsonString = JSON.stringify(step3Data, null, 2);
        
        selectors.dataDisplay.text(formattedJsonString);
        
        // Enable the "Proceed" button now that we have successfully displayed the data.
        selectors.proceedBtn.prop('disabled', false);
    }

    /**
     * Attaches event listeners for this step.
     */
    function attachEventListeners() {
        selectors.proceedBtn.off().on('click', function() {
            logger.info("Proceeding to Step 4.");
            
            // Store the data for the next step
            if (!window.appState.step3) window.appState.step3 = {};
            window.appState.step3.finalData = step3Data;

            // Navigate to the next step
            if (navCallback) {
                // For now, this will just be an alert until Step 4 is built.
                alert("Proceeding to Step 4 (to be built)!");
                // navCallback(4); 
            }
        });
    }

    // Expose the init function as the public entry point.
    return {
        init
    };

// This controller only needs the logger and uiService for now.
})(logger, uiService);

