const AppController = (function(uiService, step1, step2) {
    function init() {
        logger.info("Initializing Application Controller");
        
        window.navigationCallback = navigateToStep; // Make it globally accessible
        navigateToStep(1, true); 
                
        $('.stepper-item').on('click', function() {
            const targetStep = $(this).data('step');
            navigateToStep(targetStep);
        });

        // Initialize the first step
        navigateToStep(appState.currentStep, true); 
    }

    function navigateToStep(stepNumber, force = false) {
        if (!force && appState.isDirty) {
            if (!confirm("You have unsaved changes. Are you sure you want to leave this step?")) {
                return;
            }
        }

        if (stepNumber === appState.currentStep && !force) return;

        logger.info(`Navigating to step ${stepNumber}`);
        appState.currentStep = stepNumber;
        appState.isDirty = false;

        // UI updates
        $('.app-step').hide();
        $(`#step-${stepNumber}-content`).show();

        $('.stepper-item').removeClass('active');
        $(`.stepper-item[data-step=${stepNumber}]`).addClass('active');
        
        // "Dependency Injection" - Call the init function for the target step's controller
        switch(stepNumber) {
            case 1:
                step1.init(navigateToStep); // Pass navigation function
                break;
            case 2:
                step2.init();
                break;
            // Add other steps here
        }
    }

    return { init, navigateToStep };

})(uiService, Step1Controller, Step2Controller); // Inject dependencies

$(document).ready(AppController.init);
