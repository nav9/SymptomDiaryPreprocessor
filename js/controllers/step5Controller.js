// Create a new file: js/controllers/step5Controller.js
const Step5Controller = (function(logger) {

    function init(navCallback, payload) {
        logger.info("Initializing Step 5: Visualize.");
        
        const displayData = {
            step2_finalData: window.appState?.step2?.finalData || "Not Available",
            step3_finalData: window.appState?.step3?.finalData || "Not Available",
            step4_finalData: window.appState?.step4?.finalData || "Not Available",
        };
        
        const content = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Step 5: Final Data Received</h5>
                    <p class="card-text text-body-secondary">This is the final data object available for visualization. All data from previous steps has been preserved and is displayed below.</p>
                    <pre class="form-control" style="height: 70vh;">${JSON.stringify(displayData, null, 2)}</pre>
                </div>
            </div>
        `;
        
        $('#step-5-content').html(content);
    }

    return { init };

})(logger);