const AppController = (function(step1, step2, step3, step4) { 
    function init() {
        logger.info("Initializing Application Controller");
        
        // Make the navigation function globally accessible for step controllers to use.
        window.navigationCallback = navigateToStep;

        // Attach all global event listeners.
        attachGlobalFileHandlers();
        attachStepperNavigation();
        
        // Initialize the application to Step 1 on first load.
        navigateToStep(1, true); 
    }

    function navigateToStep(stepNumber, force = false, dataPayload = null) {
        if (!force && window.appState && window.appState.isDirty) {
            if (!confirm("You have unsaved changes. Are you sure you want to leave this step?")) {
                return;
            }
        }

        logger.info(`Navigating to step ${stepNumber}`);

        if (!window.appState) window.appState = {};
        window.appState.currentStep = stepNumber;
        window.appState.isDirty = false;

        // Update UI for stepper and content visibility
        $('.app-step').hide();
        $(`#step-${stepNumber}-content`).show();
        $('.stepper-item').removeClass('active');
        $(`.stepper-item[data-step=${stepNumber}]`).addClass('active');
        
        // Call the init function for the target step's controller
        switch(stepNumber) {
            case 1:
                step1.init(navigateToStep, dataPayload); 
                break;
            case 2:
                step2.init(navigateToStep, dataPayload);
                break;
            case 3:
                step3.init(navigateToStep, dataPayload);
                break;   
            case 4:
                step4.init(navigateToStep, dataPayload);
                break;                              
            case 5: // ADDED
                step5.init(navigateToStep, dataPayload);
                break;
        }
    }

    function attachGlobalFileHandlers() {
        $('#globalFileUpload').on('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const state = JSON.parse(e.target.result);
                    if (state.step && state.data) {
                        if (confirm(`This file is from Step ${state.step}. Do you want to load this state?`)) {
                            navigateToStep(state.step, true, state.data);
                        }
                    } else { throw new Error("Invalid project file format."); }
                } catch (err) {
                    logger.error("Failed to read project file.", err);
                    alert("Error: Could not read or parse the selected file.");
                }
            };
            reader.readAsText(file);
            $(this).val('');
        });
        
        $('#globalSaveBtn').on('click', function(e) {
            e.preventDefault();
            if (window.appState && window.appState.currentStep) {
                $(document).trigger(`save-step-data`, [window.appState.currentStep]);
            }
        });
    }   

    function attachStepperNavigation() {
        $('.stepper-item').on('click', function() {
            const targetStep = $(this).data('step');
            if (window.appState && targetStep !== window.appState.currentStep) {
                navigateToStep(targetStep);
            }
        });
    }

    return { init };

})(Step1Controller, Step2Controller, Step3Controller, Step4Controller);

$(document).ready(AppController.init);
