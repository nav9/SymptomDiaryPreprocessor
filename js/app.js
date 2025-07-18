document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const dummyDataBtn = document.getElementById('dummy-data-btn');
    const processBtn = document.getElementById('process-btn');
    const filePreviewContainer = document.getElementById('file-preview-container');
    let dataByYear = {};
        // --- NEW: Overlay References and Helpers ---
        const overlay = document.getElementById('processing-overlay');
        const overlayMessage = document.getElementById('processing-message');

        function showProcessingOverlay(message) {
            overlayMessage.textContent = message;
            overlay.classList.add('active');
        }
    
        function hideProcessingOverlay() {
            overlay.classList.remove('active');
        }

    // --- State Management ---
    let uploadedFilesData = [];

    // This function is now the single source of truth for the button state
    const updateProcessButtonState = () => {
        processBtn.disabled = uploadedFilesData.length === 0;
    };

    const extractYearFromFilename = (filename) => {
        const match = filename.match(/\d{4}/);
        return match ? match[0] : new Date().getFullYear().toString();
    };

    const renderFilePreviews = () => {
        filePreviewContainer.innerHTML = '';
        if (uploadedFilesData.length > 0) {
            uploadedFilesData.forEach((fileData, index) => {
                const card = document.createElement('div');
                card.className = 'card mt-2';
                card.dataset.fileId = fileData.id; 
                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-title h6"><i class="fa-solid fa-file-lines"></i> ${fileData.filename}</div>
                        <button class="btn btn-sm btn-error delete-btn" data-file-id="${fileData.id}">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </div>
                    <div class="card-body">
                        <textarea class="form-input" rows="8" style="font-family: monospace; font-size: 12px;">${fileData.content}</textarea>
                    </div>`;
                filePreviewContainer.appendChild(card);
            });
        }
        updateProcessButtonState(); // Update button state after rendering
    };

    filePreviewContainer.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const fileIdToDelete = e.target.closest('.delete-btn').dataset.fileId;
            uploadedFilesData = uploadedFilesData.filter(f => f.id !== fileIdToDelete);
            renderFilePreviews();
        }
    });

    const handleFiles = (files) => {
        const filesToProcess = Array.from(files).filter(file => file.type.startsWith('text/'));
        if (filesToProcess.length === 0) return;

        // --- Use the overlay ---
        showProcessingOverlay(`Reading ${filesToProcess.length} file(s)...`);
        
        let filesHandled = 0;
        filesToProcess.forEach(file => {
            if (!uploadedFilesData.some(f => f.filename === file.name)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedFilesData.push({
                        id: `file-${Date.now()}-${Math.random()}`,
                        filename: file.name,
                        content: e.target.result
                    });
                    filesHandled++;
                    if (filesHandled === filesToProcess.length) {
                        renderFilePreviews();
                        hideProcessingOverlay(); // Hide when all files are done
                    }
                };
                reader.onerror = () => {
                    console.error(`Error reading file: ${file.name}`);
                    filesHandled++;
                    if (filesHandled === filesToProcess.length) {
                        hideProcessingOverlay(); // Still hide even if there was an error
                    }
                };
                reader.readAsText(file);
            } else {
                // If file is a duplicate, still count it as "handled"
                filesHandled++;
                if (filesHandled === filesToProcess.length) {
                    hideProcessingOverlay();
                }
            }
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
                id: `file-${Date.now()}-${Math.random()}`,
                filename: 'HealthDummy2024.txt',
                content: dummyContent
            });
        }
        renderFilePreviews();
    };
    
    // Initial State
    updateProcessButtonState();

    // Event Listeners... (rest of the file is the same as before)
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary-color)'; });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.style.borderColor = '#555'; });
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.style.borderColor = '#555'; if (e.dataTransfer.files.length) { handleFiles(e.dataTransfer.files); } });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) { handleFiles(e.target.files); } });
    dummyDataBtn.addEventListener('click', loadDummyData);
    processBtn.addEventListener('click', () => {
        const updatedFileData = [];
        document.querySelectorAll('#file-preview-container .card').forEach(card => {
            const fileId = card.dataset.fileId;
            const originalFile = uploadedFilesData.find(f => f.id === fileId);
            if(originalFile) {
                const currentContent = card.querySelector('textarea').value;
                updatedFileData.push({ filename: originalFile.filename, content: currentContent });
            }
        });
        if (updatedFileData.length === 0) return;
        const dataForValidation = updatedFileData.map(f => ({ year: extractYearFromFilename(f.filename), content: f.content }));
        sessionStorage.setItem('symptomDataForValidation', JSON.stringify(dataForValidation));
        window.location.href = 'validate.html';
    });
});