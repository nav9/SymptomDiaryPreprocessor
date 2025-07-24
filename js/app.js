// Global state object to hold data across steps
window.symptomDiary = {
    rawData: [], // Will store objects like { fileName: 'Health2024.txt', content: '...' }
};

$(document).ready(function() {
    logger.info("Application page loaded.");

    // --- Step 1: Data Input ---
    const fileUpload = $('#fileUpload');
    const fileList = $('#file-list');
    const loadDummyDataBtn = $('#loadDummyDataBtn');
    const nextBtn = $('#step1-nextBtn');

    // Event listener for file input
    fileUpload.on('change', function(event) {
        handleFileUpload(event.target.files);
    });

    // Event listener for dummy data button
    loadDummyDataBtn.on('click', function() {
        logger.info("Loading dummy data.");
        window.symptomDiary.rawData = dummyData; // dummyData is from dummy-data.js
        updateFileList();
        nextBtn.prop('disabled', false);
    });

    // Handles reading the selected files
    function handleFileUpload(files) {
        if (!files || files.length === 0) {
            logger.warn("No files selected.");
            return;
        }
        logger.info(`Processing ${files.length} file(s).`);
        
        window.symptomDiary.rawData = []; // Clear previous selection
        let filesToProcess = files.length;
        
        for (const file of files) {
            // Basic validation for file type and name
            if (!file.name.toLowerCase().endsWith('.txt')) {
                logger.warn(`Skipping non-TXT file: ${file.name}`);
                filesToProcess--;
                continue;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                window.symptomDiary.rawData.push({
                    fileName: file.name,
                    content: e.target.result
                });
                
                // Once all files are read, update the UI
                if (window.symptomDiary.rawData.length === filesToProcess) {
                    updateFileList();
                    nextBtn.prop('disabled', window.symptomDiary.rawData.length === 0);
                }
            };
            reader.onerror = function(e) {
                logger.error(`Error reading file ${file.name}:`, e);
                filesToProcess--;
            };
            reader.readAsText(file);
        }
    }

    // Updates the UI list with loaded file names
    function updateFileList() {
        fileList.empty();
        if (window.symptomDiary.rawData.length === 0) {
            fileList.append('<li class="list-group-item text-body-secondary">No data loaded.</li>');
            return;
        }

        window.symptomDiary.rawData.forEach(fileData => {
            const sizeInKB = (fileData.content.length / 1024).toFixed(2);
            fileList.append(`<li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="fas fa-file-alt me-2"></i>${fileData.fileName}</span>
                <span class="badge bg-secondary rounded-pill">${sizeInKB} KB</span>
            </li>`);
        });
        logger.info("File list updated.");
    }
    
    // Placeholder for moving to the next step
    nextBtn.on('click', function() {
        if (window.symptomDiary.rawData.length > 0) {
            logger.info("Proceeding to Step 2.");
            // Here you would add logic to hide step 1 and show step 2
            // For now, we'll just log the data.
            console.log("Final Raw Data:", window.symptomDiary.rawData);
            alert("Proceeding to the next step (to be built)!");
        }
    });

});