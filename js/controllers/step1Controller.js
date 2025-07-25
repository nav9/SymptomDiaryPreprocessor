/**
 * @file step1Controller.js
 * @description Manages the logic for Step 1: Data Input.
 * This includes handling file uploads, loading dummy data, displaying file
 * content in editable textareas, and syncing changes back to the global state.
 */

const Step1Controller = (function(logger, ui, dummyData) {
    // A private variable to hold the navigation callback function provided by the AppController.
    let navigationCallback = null;

    // --- Private Methods ---

    /**
     * Handles the 'change' event of the file input element.
     * Reads selected .txt files and populates the application state.
     * @param {Event} event - The file input change event.
     */
    function handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) {
            logger.warn("File selection was cancelled or no files were chosen.");
            return;
        }

        ui.showLoading(`Reading ${files.length} file(s)...`);

        try {
            // Clear any previous data before loading new files.
            appState.data.step1.rawFiles = [];

            const validFiles = Array.from(files).filter(file => {
                if (!file.name.toLowerCase().endsWith('.txt')) {
                    logger.warn(`Skipping non-TXT file: ${file.name}`);
                    return false;
                }
                return true;
            });

            if (validFiles.length === 0) {
                alert("No valid .txt files were selected. Please choose files with a .txt extension.");
                ui.hideLoading();
                return;
            }

            let filesProcessed = 0;
            validFiles.forEach(file => {
                const reader = new FileReader();

                reader.onload = function(e) {
                    // Push the file data into the global state.
                    appState.data.step1.rawFiles.push({
                        fileName: file.name,
                        content: e.target.result
                    });
                };

                reader.onerror = function(e) {
                    logger.error(`Error reading file ${file.name}:`, e);
                    alert(`An error occurred while trying to read ${file.name}. Please check the file and try again.`);
                };

                reader.onloadend = function() {
                    filesProcessed++;
                    // Once all files have been processed (successfully or not), update the UI.
                    if (filesProcessed === validFiles.length) {
                        logger.info("All selected files have been processed.");
                        displayFileContents();
                        ui.hideLoading();
                    }
                };

                reader.readAsText(file);
            });
        } catch (error) {
            logger.error("An unexpected error occurred during file handling.", error);
            alert("A critical error occurred. Please refresh the page and try again.");
            ui.hideLoading();
        }
    }

    /**
     * Handles the click event for the 'Load Sample Data' button.
     * It performs a deep copy of the dummy data into the application state.
     */
    function handleDummyDataLoad() {
        logger.info("Loading sample data.");
        // Use JSON methods to perform a deep copy. This prevents edits to the
        // state from modifying the original dummyData constant.
        try {
            appState.data.step1.rawFiles = JSON.parse(JSON.stringify(dummyData));
            displayFileContents();
        } catch (error) {
            logger.error("Failed to deep copy dummy data.", error);
            alert("Could not load sample data due to an internal error.");
        }
    }

    /**
     * Renders the loaded file content into editable textareas on the page.
     * This function reads from the global state and updates the DOM.
     */
    function displayFileContents() {
        const fileContentArea = $('#file-content-area');
        const dataProcessingSection = $('#data-processing-section');
        
        fileContentArea.empty(); // Clear any existing textareas.

        if (!appState.data.step1.rawFiles || appState.data.step1.rawFiles.length === 0) {
            dataProcessingSection.hide();
            return;
        }

        appState.data.step1.rawFiles.forEach((fileData, index) => {
            const fileId = `file-textarea-${index}`;
            // Construct the HTML for each file's display.
            const fileHtml = `
                <div class="mb-3">
                    <label for="${fileId}" class="form-label fw-bold">
                        <i class="fas fa-file-alt me-2"></i>${fileData.fileName}
                    </label>
                    <textarea class="form-control font-monospace" id="${fileId}" data-index="${index}" rows="8" style="font-size: 0.8rem; tab-size: 4;">${fileData.content}</textarea>
                </div>
            `;
            fileContentArea.append(fileHtml);
        });

        // Show the section containing the 'Next' button and the textareas.
        dataProcessingSection.show();
        logger.info("File contents have been rendered in textareas for review.");
    }

    /**
     * Handles the 'input' event on any textarea, syncing its content
     * back to the corresponding object in the global state.
     * @param {Event} event - The textarea input event.
     */
    function handleTextareaInput(event) {
        const textarea = $(event.target);
        const index = textarea.data('index'); // Retrieve the index stored in the data attribute.
        const newContent = textarea.val();

        // Update the state if the index is valid.
        if (appState.data.step1.rawFiles[index] !== undefined) {
            appState.data.step1.rawFiles[index].content = newContent;
            appState.isDirty = true; // Any edit makes the step dirty.
        } else {
            logger.warn(`Attempted to update content for an invalid index: ${index}`);
        }
    }
    
    /**
     * Attaches all necessary event listeners for this step.
     * Using .off().on() prevents attaching duplicate listeners if init is called multiple times.
     */
    function attachEventListeners() {
        const container = $('#step-1-content');

        container.on('change', '#fileUpload', handleFileUpload);
        container.on('click', '#loadDummyDataBtn', handleDummyDataLoad);
        container.on('input', 'textarea', handleTextareaInput);

        container.on('click', '#step1-nextBtn', function() {
            if (!appState.data.step1.rawFiles || appState.data.step1.rawFiles.length === 0) {
                alert("Please load data before proceeding.");
                return;
            }
            logger.info("Proceeding to Step 2.");
            // Use the stored callback to trigger navigation in the main AppController.
            if (navigationCallback) {
                navigationCallback(2);
            }
        });
    }

    // --- Public Methods ---

    /**
     * Initializes the controller for Step 1.
     * This is the public entry point called by the AppController.
     * @param {Function} navCallback - The function to call to navigate to another step.
     */
    function init(navCallback) {
        logger.info("Initializing Step 1 Controller.");
        navigationCallback = navCallback;
        attachEventListeners();
        
        // Render existing data if user navigates back to this step
        displayFileContents();
    }

    // Expose the public init function.
    return {
        init
    };

})(logger, uiService, dummyData); // "Inject" dependencies.```