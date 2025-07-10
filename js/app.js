document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const dummyDataBtn = document.getElementById('dummy-data-btn');
    const processBtn = document.getElementById('process-btn');
    const filePreviewContainer = document.getElementById('file-preview-container');

    // --- State Management ---
    let uploadedFilesData = [];

    // --- Core Functions ---

    const extractYearFromFilename = (filename) => {
        const match = filename.match(/\d{4}/);
        return match ? match[0] : new Date().getFullYear().toString();
    };

    /**
     * Renders the preview cards for each loaded file.
     */
    const renderFilePreviews = () => {
        filePreviewContainer.innerHTML = ''; // Clear existing previews
        if (uploadedFilesData.length === 0) {
            processBtn.disabled = true;
            return;
        }

        uploadedFilesData.forEach((fileData, index) => {
            const card = document.createElement('div');
            card.className = 'card mt-2';
            card.dataset.index = index; // Link card to data array index

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title h6"><i class="fa-solid fa-file-lines"></i> ${fileData.filename}</div>
                    <button class="btn btn-sm btn-error delete-btn" data-index="${index}">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                </div>
                <div class="card-body">
                    <textarea class="form-input" rows="8" style="font-family: monospace; font-size: 12px;">${fileData.content}</textarea>
                </div>
            `;
            filePreviewContainer.appendChild(card);
        });

        // Add event listeners to the new delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const indexToDelete = parseInt(e.currentTarget.dataset.index, 10);
                // Remove the file data from the array
                uploadedFilesData.splice(indexToDelete, 1);
                // Re-render the UI
                renderFilePreviews();
            });
        });

        processBtn.disabled = false;
    };

    const handleFiles = (files) => {
        // We'll append new files instead of replacing
        let filesToProcess = Array.from(files).filter(file => file.type.startsWith('text/')).length;
        if (filesToProcess === 0) return;

        // Show loading indicator temporarily
        const loadingToast = document.createElement('div');
        loadingToast.className = 'toast toast-primary';
        loadingToast.textContent = `Loading ${filesToProcess} file(s)...`;
        filePreviewContainer.prepend(loadingToast);

        let filesRead = 0;
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('text/')) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                // Avoid adding duplicate filenames
                if (!uploadedFilesData.some(f => f.filename === file.name)) {
                    uploadedFilesData.push({
                        filename: file.name,
                        content: e.target.result
                    });
                }
                filesRead++;
                if (filesRead === filesToProcess) {
                    loadingToast.remove();
                    renderFilePreviews();
                }
            };
            reader.readAsText(file);
        });
    };
    
    const loadDummyData = () => {
        const dummyContent = `2 jun; 
 4:15 woke. mild rt; 
 6:35 brushed; 
 6:59 rice. chickpeas, jackfruit seed with mango curry. mild rt; 
 8:20 nap; 8:45 woke. rt;
 
1 jun;
2:15 u;
3:00 sleep;
6:38 woke. u. eyes very droopy and heavy with sleep;
//eyes getting easily into burning state after just 20 minutes of using PC;
11:51 woke from shallow drowsy sleep. liver area was a bit numb;
20:50 rice, kovakka, chicken. refill;`;
        
        if (!uploadedFilesData.some(f => f.filename === 'HealthDummy2024.txt')) {
             uploadedFilesData.push({
                filename: 'HealthDummy2024.txt',
                content: dummyContent
            });
        }
        renderFilePreviews();
    };

    // --- Event Listeners ---
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary-color)'; });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.style.borderColor = '#555'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#555';
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) { handleFiles(e.target.files); } });
    dummyDataBtn.addEventListener('click', loadDummyData);

    processBtn.addEventListener('click', () => {
        // IMPORTANT: Read the current content from textareas, not the original state
        const updatedFileData = [];
        document.querySelectorAll('#file-preview-container .card').forEach(card => {
            const index = card.dataset.index;
            const originalFilename = uploadedFilesData[index].filename;
            const currentContent = card.querySelector('textarea').value;
            updatedFileData.push({
                filename: originalFilename,
                content: currentContent
            });
        });

        if (updatedFileData.length === 0) {
            alert('Please upload at least one file or use the dummy data.');
            return;
        }

        const dataForValidation = updatedFileData.map(fileData => ({
            year: extractYearFromFilename(fileData.filename),
            content: fileData.content
        }));
        
        try {
            sessionStorage.setItem('symptomDataForValidation', JSON.stringify(dataForValidation));
            window.location.href = 'validate.html';
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
            alert('Could not process data. It may be too large for session storage.');
        }
    });
});