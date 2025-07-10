document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileListDiv = document.getElementById('file-list');
    const dummyDataBtn = document.getElementById('dummy-data-btn');
    const processBtn = document.getElementById('process-btn');

    // --- State Management ---
    // This will store an array of objects: { filename: '...', content: '...' }
    let uploadedFilesData = [];

    // --- Initial UI State ---
    processBtn.disabled = true;

    // --- Core Functions ---

    /**
     * Extracts a four-digit year from a filename.
     * @param {string} filename - The name of the file.
     * @returns {string} The extracted year, or the current year as a fallback.
     */
    const extractYearFromFilename = (filename) => {
        const match = filename.match(/\d{4}/);
        if (match) {
            return match[0]; // Return the first 4-digit number found
        }
        // Fallback to the current year if no 4-digit number is found in the filename
        console.warn(`Could not find year in filename "${filename}". Defaulting to current year.`);
        return new Date().getFullYear().toString();
    };

    /**
     * Updates the file list display in the UI.
     */
    const updateFileListUI = () => {
        fileListDiv.innerHTML = ''; // Clear current list
        if (uploadedFilesData.length > 0) {
            const list = document.createElement('ul');
            list.className = 'menu'; // Spectre CSS class for a nice list
            uploadedFilesData.forEach(fileData => {
                const listItem = document.createElement('li');
                listItem.className = 'menu-item';
                listItem.innerHTML = `<i class="fa-solid fa-file-lines text-gray mr-2"></i> ${fileData.filename}`;
                list.appendChild(listItem);
            });
            fileListDiv.appendChild(list);
            processBtn.disabled = false; // Enable the process button
        } else {
            processBtn.disabled = true; // Disable if no files
        }
    };

    /**
     * Processes a FileList object from a drop or file input event.
     * @param {FileList} files - The list of files to process.
     */
    const handleFiles = (files) => {
        uploadedFilesData = []; // Reset the data array for new uploads
        fileListDiv.innerHTML = '<div class="loading loading-lg"></div>'; // Show a loading indicator

        let filesToProcess = files.length;
        if (filesToProcess === 0) {
            updateFileListUI();
            return;
        }

        for (const file of files) {
            // We only want to process text files.
            if (!file.type.startsWith('text/')) {
                console.warn(`Skipping non-text file: ${file.name}`);
                filesToProcess--;
                if (filesToProcess === 0) updateFileListUI(); // Update UI if it was the last file
                continue;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                // Add file data to our state
                uploadedFilesData.push({
                    filename: file.name,
                    content: e.target.result
                });

                // Once all files have been read, update the UI
                if (uploadedFilesData.length === filesToProcess) {
                    updateFileListUI();
                }
            };

            reader.onerror = (e) => {
                console.error(`Error reading file: ${file.name}`, e);
                filesToProcess--;
                if (filesToProcess === 0) updateFileListUI(); // Still update UI on error
            };

            reader.readAsText(file);
        }
    };

    /**
     * Loads predefined dummy data for demonstration purposes.
     */
    const loadDummyData = () => {
        const dummyContent = `1 jun;
2:15 u;
3:00 sleep;
6:38 woke. u. eyes very droopy and heavy with sleep;
// This is a comment and should be handled in the next step
11:51 woke from shallow drowsy sleep. liver area was a bit numb;
12:30 rice, kovakka, chicken, pickle, kadala, potato fry. refill;
15:30 poo. u;

31 may;
8:15 woke. u. rt;
8:30 rice, aviyal, pickle. felt very good;
11:00 nap;
`;
        // Create a dummy file object and add to state
        uploadedFilesData = [{
            filename: 'HealthDummy2023.txt',
            content: dummyContent
        }];

        // Update the UI to reflect the loaded dummy data
        updateFileListUI();
        // A little extra UI feedback for clarity
        const dummyInfo = document.createElement('p');
        dummyInfo.className = 'toast toast-success';
        dummyInfo.textContent = 'Dummy data for 2023 has been loaded.';
        fileListDiv.appendChild(dummyInfo);
    };


    // --- Event Listeners ---

    // Drag and Drop listeners
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('active'); // Optional: Add a class for visual feedback
        dropZone.style.borderColor = 'var(--primary-color)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
        dropZone.style.borderColor = '#555';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
        dropZone.style.borderColor = '#555';

        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files; // Sync the file input with dropped files
            handleFiles(files);
        }
    });

    // Click to select file listener
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFiles(e.target.files);
        }
    });

    // Dummy Data button listener
    dummyDataBtn.addEventListener('click', loadDummyData);

    // Process button listener
    processBtn.addEventListener('click', () => {
        if (uploadedFilesData.length === 0) {
            alert('Please upload at least one file or use the dummy data.');
            return;
        }

        // Prepare the data for the next page
        const dataForValidation = uploadedFilesData.map(fileData => ({
            year: extractYearFromFilename(fileData.filename),
            content: fileData.content
        }));

        // Use sessionStorage to pass data between pages without a server.
        // It's cleared when the browser tab is closed.
        try {
            sessionStorage.setItem('symptomDataForValidation', JSON.stringify(dataForValidation));
            // Navigate to the validation page
            window.location.href = 'validate.html';
        } catch (error) {
            console.error('Error saving data to sessionStorage:', error);
            alert('Could not process the data. It might be too large for your browser\'s session storage. Please try with smaller files.');
        }
    });
});