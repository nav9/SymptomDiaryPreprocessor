// Global state object to hold data across steps
window.symptomDiary = {
    rawData: [], // Will store objects like { fileName: 'Health2024.txt', content: '...' }
};

$(document).ready(function() {
    logger.info("Application page loaded.");

    // --- Step 1: Element Selectors ---
    const fileUpload = $('#fileUpload');
    const loadDummyDataBtn = $('#loadDummyDataBtn');
    const nextBtn = $('#step1-nextBtn');
    const dataProcessingSection = $('#data-processing-section');
    const fileContentArea = $('#file-content-area');

    // --- Event Listeners ---
    fileUpload.on('change', function(event) {
        handleFileUpload(event.target.files);
    });

    loadDummyDataBtn.on('click', function() {
        logger.info("Loading dummy data.");
        // Deep copy the dummy data to allow for edits without affecting the original constant
        window.symptomDiary.rawData = JSON.parse(JSON.stringify(dummyData));
        displayFileContents();
    });

    // Syncs textarea edits back to the global state object
    fileContentArea.on('input', 'textarea', function() {
        const textarea = $(this);
        const index = textarea.data('index');
        const newContent = textarea.val();

        if (window.symptomDiary.rawData[index]) {
            window.symptomDiary.rawData[index].content = newContent;
        }
    });
    
    nextBtn.on('click', function() {
        if (window.symptomDiary.rawData.length > 0) {
            logger.info("Proceeding to Step 2 with potentially edited data.");
            // Log the final state of the data before moving on
            console.log("Final Raw Data:", window.symptomDiary.rawData);
            alert("Proceeding to the next step (to be built)!");
            // Future logic: hide step 1, show step 2, and pass the data.
        }
    });

    // --- Core Functions for Step 1 ---

    function handleFileUpload(files) {
        if (!files || files.length === 0) {
            logger.warn("No files selected for upload.");
            return;
        }
        logger.info(`Processing ${files.length} file(s).`);
        
        window.symptomDiary.rawData = []; // Clear previous data
        let filesToProcess = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.txt')).length;
        let filesProcessed = 0;

        if (filesToProcess === 0) {
            alert("No valid .txt files were selected.");
            return;
        }

        for (const file of files) {
            if (!file.name.toLowerCase().endsWith('.txt')) {
                logger.warn(`Skipping non-TXT file: ${file.name}`);
                continue;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                window.symptomDiary.rawData.push({
                    fileName: file.name,
                    content: e.target.result
                });
                filesProcessed++;
                
                if (filesProcessed === filesToProcess) {
                    logger.info("All files have been read.");
                    displayFileContents();
                }
            };
            reader.onerror = function(e) {
                logger.error(`Error reading file ${file.name}:`, e);
                filesProcessed++; // Still count as processed to avoid getting stuck
            };
            reader.readAsText(file);
        }
    }

    /**
     * Renders the loaded file data into textareas for review and editing.
     */
    function displayFileContents() {
        fileContentArea.empty(); // Clear previous content

        if (window.symptomDiary.rawData.length === 0) {
            dataProcessingSection.hide(); // Hide section if there's no data
            return;
        }

        window.symptomDiary.rawData.forEach((fileData, index) => {
            const fileId = `file-textarea-${index}`;
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
        
        dataProcessingSection.show(); // Show the button and textareas
        logger.info("File contents displayed in textareas for review.");
    }
});