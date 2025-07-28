
const Step1Controller = (function(logger, recognizer) {

    const selectors = {
        initialLoadSection: $('#initial-load-section'),
        editorSection: $('#editor-section'),
        fileUpload: $('#fileUpload'),
        loadDummyBtn: $('#loadDummyDataBtn'),
        stickyHeader: $('#step1-sticky-header'),
        dataContainer: $('#data-container'),
        topProceedContainer: $('#top-proceed-container'), 
        bottomProceedContainer: $('#bottom-proceed-container')
    };


    // Data structure: { "2024": [ {id, rawText, type, reason}, ... ], "2023": [ ... ] }
    const yearlyData = {};
    let currentYear = null;

    function init(navCallback) {
        logger.info("Initializing Definitive Step 1 Controller.");
        attachEventListeners();
    }
    
    function handleDataLoad(files) {
        Object.keys(yearlyData).forEach(key => delete yearlyData[key]);

        files.forEach(file => {
            const yearMatch = file.fileName.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : 'Unsorted';
            
            const rawLines = file.content.split('\n');
            const processedLines = [];

            // NEW: Semicolon splitting logic
            rawLines.forEach(line => {
                const subLines = line.split(';');
                subLines.forEach((subLine, index) => {
                    let finalLine = subLine.trim();
                    // Keep the semicolon unless it's the very last sub-line from the original line.
                    if (finalLine && index < subLines.length - 1) {
                        finalLine += ';';
                    }
                    if(finalLine) processedLines.push(finalLine);
                });
            });

            if (!yearlyData[year]) yearlyData[year] = [];
            
            processedLines.forEach(line => {
                // NEW: Trim trailing semicolon from all final lines.
                const cleanedLine = line.endsWith(';') ? line.slice(0, -1) : line;
                if (cleanedLine.trim() === '') return; // Ignore empty lines

                yearlyData[year].push({
                    id: `item-${Date.now()}-${Math.random()}`,
                    rawText: cleanedLine,
                    type: 'new'
                });
            });
        });

        if (Object.keys(yearlyData).length > 0) {
            selectors.initialLoadSection.hide();
            selectors.editorSection.show();
            currentYear = Object.keys(yearlyData).sort()[0];
            validateAndRender();
        }
    }

    function validateAndRender() {
        if (!currentYear) return;
        let lastDateIsValid = false;
        let currentYearErrorCount = 0;
        let totalErrorCount = 0;

        // First, calculate total errors across all years
        Object.values(yearlyData).forEach(yearLines => {
            let lastDate = false;
            yearLines.forEach(line => {
                const result = recognizer.recognizeLine(line.rawText, lastDate);
                if(result.type === 'error') totalErrorCount++;
                if(result.type === 'date') lastDate = true;
                else if (result.type !== 'time' && result.type !== 'comment') lastDate = false;
            });
        });
        
        // Then, process the current year and update its state
        yearlyData[currentYear].forEach(line => {
            const result = recognizer.recognizeLine(line.rawText, lastDateIsValid);
            line.type = result.type;
            line.reason = result.reason;
            if (line.type === 'date') lastDateIsValid = true;
            else if (line.type !== 'time' && line.type !== 'comment') lastDateIsValid = false;
            if (line.type === 'error') currentYearErrorCount++;
        });

        renderStickyHeader(currentYearErrorCount, totalErrorCount);
        renderDataContainer();
        updateProceedButton(currentYearErrorCount);
    }
    
    function renderStickyHeader(currentYearErrorCount, totalErrorCount) {
        const years = Object.keys(yearlyData).sort();
        const options = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');

        // NEW: Logic to disable next/prev buttons
        const errorIds = yearlyData[currentYear].filter(l => l.type === 'error').map(l => l.id);
        const nextPrevDisabled = errorIds.length < 2 ? 'disabled' : '';
        const errorBadgeClass = totalErrorCount > 0 ? 'bg-danger' : 'bg-success';
        const headerHtml = `
            <div class="row g-2 align-items-center">
                <div class="col-auto">
                    <label for="year-select" class="form-label mb-0">Year:</label>
                    <select id="year-select" class="form-select form-select-sm">${options}</select>
                </div>
                <div class="col-auto">
                <span class="badge ${errorBadgeClass}">
                        ${currentYearErrorCount} issues / ${totalErrorCount} total
                    </span>
                </div>
                <div class="col">
                    <button id="prev-error-btn" class="btn btn-sm btn-outline-secondary" title="Previous Issue" ${nextPrevDisabled}><i class="fas fa-arrow-up"></i></button>
                    <button id="next-error-btn" class="btn btn-sm btn-outline-secondary" title="Next Issue" ${nextPrevDisabled}><i class="fas fa-arrow-down"></i></button>
                </div>
                <div class="col-auto ms-auto">
                    <button id="add-btn" class="btn btn-sm btn-custom-green" title="Add New Line"><i class="fas fa-plus"></i></button>
                    <button id="edit-btn" class="btn btn-sm btn-custom-grey" title="Edit Selected" disabled><i class="fas fa-edit"></i></button>
                    <button id="delete-btn" class="btn btn-sm btn-outline-danger" title="Delete Selected" disabled><i class="fas fa-trash"></i></button>
                    <button id="save-btn" class="btn btn-sm btn-primary" title="Save Year Data"><i class="fas fa-save"></i></button>
                </div>
            </div>
            <div id="top-proceed-container" class="text-center mt-2"></div>`;
        selectors.stickyHeader.html(headerHtml);
    }

    function renderDataContainer() {
        selectors.dataContainer.empty();
        if (!yearlyData[currentYear]) return;

        yearlyData[currentYear].forEach(item => {
            selectors.dataContainer.append(renderRow(item));
        });
    }

    function renderRow(item) {
        let contentHtml = '';
        let rowClass = item.type === 'error' ? 'row-error' : '';

        // If the item is currently being edited, force it into an error-style editable view
        if (item.isEditing) {
            rowClass = 'row-error';
            contentHtml = `
                <div class="row-content w-100">
                    <textarea class="editable-textarea" rows="1">${item.rawText}</textarea>
                    <div class="d-flex justify-content-end align-items-center mt-1">
                        <button class="btn btn-sm btn-secondary cancel-btn me-2" data-id="${item.id}">Cancel</button>
                        <button class="btn btn-sm btn-success ok-btn" data-id="${item.id}">OK</button>
                    </div>
                </div>`;
        } else {
            // Standard read-only view
            let lineClass = 'line-text';
            if (item.type === 'comment') lineClass += ' comment-text';
            if (item.type === 'date') lineClass += ' date-text';

            contentHtml = `
                <div class="row-content w-100">
                    <span class="${lineClass}">${item.rawText || ' '}</span>
                    ${item.type === 'error' ? `<div class="error-message">${item.reason}</div>` : ''}
                </div>`;
        }

        return `
            <div id="${item.id}" class="list-group-item data-row ${rowClass}">
                <input class="form-check-input" type="checkbox" data-id="${item.id}">
                ${contentHtml}
            </div>`;
    }

    function updateProceedButton(totalErrorCount) {
        const proceedButtonHtml = `
            <button id="proceed-to-step2" class="btn btn-lg btn-primary">
                All Clear! Proceed to Step 2 <i class="fas fa-arrow-right"></i>
            </button>`;
        
        // Use jQuery's .html() to replace content, effectively hiding/showing
        if (totalErrorCount === 0 && yearlyData[currentYear] && yearlyData[currentYear].length > 0) {
            selectors.topProceedContainer.html(proceedButtonHtml);
            selectors.bottomProceedContainer.html(proceedButtonHtml);
        } else {
            selectors.topProceedContainer.empty();
            selectors.bottomProceedContainer.empty();
        }
    }
    
    function attachEventListeners() {
        // Initial load listeners
        const fileDataPromises = (files) => Array.from(files).map(file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve({ fileName: file.name, content: e.target.result });
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        }));

        selectors.fileUpload.on('change', function(event) {
            if (!event.target.files.length) return;
            Promise.all(fileDataPromises(event.target.files)).then(handleDataLoad);
        });
        selectors.loadDummyBtn.on('click', () => handleDataLoad(dummyData));

        // Event delegation for dynamic elements
        const header = selectors.stickyHeader;
        const container = selectors.dataContainer;

        header.off(); // Clear previous delegated listeners
        container.off();

        header.on('change', '#year-select', function() {
            currentYear = $(this).val();
            validateAndRender();
        });

        // --- NEW: Click on row to edit ---
        container.on('click', '.data-row', function(event) {
            // Don't trigger if clicking on an interactive element
            if ($(event.target).is('input, button, textarea, a')) return;
            
            const itemId = $(this).attr('id');
            const item = yearlyData[currentYear].find(d => d.id === itemId);
            if (item && !item.isEditing) {
                item.isEditing = true;
                validateAndRender(); // Re-render to show the edit box
            }
        });

        // --- OK/CANCEL in edit mode ---
        container.on('click', '.ok-btn', function() {
            const itemId = $(this).data('id');
            const item = yearlyData[currentYear].find(d => d.id === itemId);
            if (item) {
                item.rawText = $(this).closest('.row-content').find('textarea').val();
                item.isEditing = false;
            }
            validateAndRender();
        });

        container.on('click', '.cancel-btn', function() {
            const itemId = $(this).data('id');
            const item = yearlyData[currentYear].find(d => d.id === itemId);
            if (item) item.isEditing = false;
            validateAndRender();
        });
        
        // --- Control Bar Button Logic ---
        header.on('click', '#edit-btn', function() {
            if ($(this).is(':disabled')) return;
            container.find('input:checked').each(function() {
                const itemId = $(this).data('id');
                const item = yearlyData[currentYear].find(d => d.id === itemId);
                if (item) item.isEditing = true;
            });
            validateAndRender();
            container.find('input:checked').prop('checked', false); // Uncheck after editing
            header.find('#edit-btn, #delete-btn').prop('disabled', true);
        });

        header.on('click', '#delete-btn', function() {
            if ($(this).is(':disabled')) return;
            const checkedIds = new Set();
            container.find('input:checked').each(function() { checkedIds.add($(this).data('id')); });
            if (confirm(`Delete ${checkedIds.size} line(s)?`)) {
                yearlyData[currentYear] = yearlyData[currentYear].filter(item => !checkedIds.has(item.id));
                validateAndRender();
            }
        });
        
        header.on('click', '#save-btn', function() {
            if (!currentYear) return;
            try {
                const textToSave = yearlyData[currentYear].map(line => line.rawText).join('\n');
                const blob = new Blob([textToSave], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Step1_data_${currentYear}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                logger.info(`Saved data for year ${currentYear}.`);
            } catch (e) {
                logger.error("Failed to save file.", e);
                alert("Could not save the file due to a browser error.");
            }
        });

        // ===== 'ADD' BUTTON LOGIC =====
        header.on('click', '#add-btn', function() {
            const newItem = {
                id: `item-${Date.now()}-${Math.random()}`,
                rawText: '',
                isEditing: true,
                type: 'new'
            };

            const checkedCheckboxes = container.find('input:checked');
            // Default to the end of the array
            let insertIndex = yearlyData[currentYear].length; 
            if (checkedCheckboxes.length > 0) {
                // Insert after the FIRST selected item
                const firstSelectedId = checkedCheckboxes.first().data('id');
                const foundIndex = yearlyData[currentYear].findIndex(d => d.id === firstSelectedId);
                if (foundIndex !== -1) {
                    insertIndex = foundIndex + 1;
                }
            }

            yearlyData[currentYear].splice(insertIndex, 0, newItem);
            validateAndRender();
            
            // Scroll to and focus the new textarea
            const newElement = document.getElementById(newItem.id);
            if (newElement) {
                newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                $(newElement).find('textarea').focus();
            }
        });

        // --- Checkbox selection enables/disables buttons ---
        container.on('change', 'input[type="checkbox"]', function() {
            const checkedCount = container.find('input:checked').length;
            header.find('#edit-btn, #delete-btn').prop('disabled', checkedCount === 0);
        });

        // --- NEW: PREV/NEXT ERROR NAVIGATION ---
        header.on('click', '#next-error-btn, #prev-error-btn', function() {
            if ($(this).is(':disabled')) return;
            const isNext = $(this).attr('id') === 'next-error-btn';

            // Get all error elements from the DOM
            const errorElements = container.find('.row-error').get();
            if (errorElements.length === 0) return;

            // Find the index of the first error currently visible on screen
            let currentVisibleIndex = -1;
            for(let i=0; i < errorElements.length; i++) {
                const rect = errorElements[i].getBoundingClientRect();
                // Check if the element's top is within the viewport
                if(rect.top >= 0 && rect.top <= window.innerHeight) {
                    currentVisibleIndex = i;
                    break;
                }
            }
            
            let targetIndex;
            if (isNext) {
                // If an error is visible, go to the next one, otherwise start from the top
                targetIndex = currentVisibleIndex > -1 ? (currentVisibleIndex + 1) % errorElements.length : 0;
            } else { // isPrev
                // If an error is visible, go to the previous one, otherwise start from the bottom
                targetIndex = currentVisibleIndex > -1 ? (currentVisibleIndex - 1 + errorElements.length) % errorElements.length : errorElements.length - 1;
            }

            errorElements[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        });        
    }

    return { init };

})(logger, LineRecognizerService);