const Step2Controller = (function(preprocessor, parser, validator, ui, dateParser) {

    let state = null; // Local reference to appState.data.step2
    let currentFile = null;

    function init() {
        if (!appState.data.step1.rawFiles.length) {
            $('#step2-data-container').html('<div class="alert alert-warning">Please load data in Step 1 first.</div>');
            return;
        }

        ui.showLoading('Preprocessing and validating files...');
        
        // This setTimeout simulates an async operation and allows the UI to update
        setTimeout(() => {
            try {
                if (Object.keys(appState.data.step2.fileData).length === 0) {
                     appState.data.step1.rawFiles.forEach(file => {
                        // NEW PROCESSING PIPELINE
                        const year = extractYearFromFile(file.fileName) || new Date().getFullYear();
                        
                        // 1. Preprocess
                        const { transformedText, dateOrder } = preprocessor.transform(file.content, year);
                        
                        // 2. Parse the cleaner text
                        let parsed = parser.parse(transformedText);
                        
                        // 3. Validate using the detected order
                        let validated = validator.validate(parsed, dateOrder);

                        // Store the final, validated data
                        appState.data.step2.fileData[file.fileName] = { 
                            data: validated, 
                            dateOrder: dateOrder 
                        };
                    });
                }
                state = appState.data.step2;
                currentFile = Object.keys(state.fileData)[0];
                
                render();
                attachEventListeners();

            } catch(e) {
                logger.error("Failed to initialize Step 2", e);
                $('#step2-data-container').html('<div class="alert alert-danger">A critical error occurred during data processing.</div>');
            } finally {
                ui.hideLoading();
            }
        }, 50);
    }

    /**
     * Extracts time and text from a string like "HH:mm data".
     * @param {string} str The input string.
     * @returns {Object|null} An object with hours, minutes, seconds, and text, or null.
     */
    function extractTimeAndText(str) {
        // Updated Regex to be more flexible with spacing
        const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(.*)/);
        if(match) {
            return {
                hours: parseInt(match[1], 10),
                minutes: parseInt(match[2], 10),
                seconds: match[3] ? parseInt(match[3], 10) : 0,
                text: match[4].trim()
            };
        }
        return null;
    }

    

    /**
     * Extracts a 4-digit year from a filename, or returns null.
     * @param {string} fileName
     * @returns {number|null}
     */
        function extractYearFromFile(fileName) {
            const match = fileName.match(/\d{4}/);
            return match ? parseInt(match[0], 10) : null;
        }

        function revalidateAndRender(scrollToId = null) {
            if (!currentFile || !state.fileData[currentFile]) return; // Defensive check
            ui.showLoading(`Re-validating ${currentFile}...`);
            
            setTimeout(() => {
                try {
                    let currentFileDataObject = state.fileData[currentFile];
                    if (!currentFileDataObject || !currentFileDataObject.data) {
                        logger.error("Data structure is invalid for re-validation.", currentFileDataObject);
                        return;
                    }
                    const currentDataArray = currentFileDataObject.data;
                    const dateOrder = currentFileDataObject.dateOrder;
    
                    const combinedText = currentDataArray.map(d => d.originalLine).join('\n');
                    
                    let parsed = parser.parse(combinedText);
                    let validated = validator.validate(parsed, dateOrder);
    
                    state.fileData[currentFile].data = validated;
                    render();
    
                    if(scrollToId) {
                        const el = document.getElementById(scrollToId);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } catch (e) {
                    logger.error('Error during re-validation', e);
                } finally {
                    ui.hideLoading();
                }
            }, 50);
        }

    function render() {
        renderStickyHeader();
        renderDataContainer();
        appState.isDirty = true; // Any render implies potential changes
    }
    
    function renderStickyHeader() {
        const files = Object.keys(state.fileData);
        if (files.length === 0) return;

        const errorCount = state.fileData[currentFile].data.filter(item => item.type === 'error').length;
        const nextStepDisabled = errorCount > 0 ? 'disabled' : '';

        const options = files.map(f => `<option value="${f}" ${f === currentFile ? 'selected' : ''}>${f}</option>`).join('');

        const headerHtml = `
        <div class="row g-2 align-items-center">
            <div class="col-auto">
                <select id="step2-year-select" class="form-select form-select-sm">${options}</select>
            </div>
            <div class="col-auto">
                <span class="badge bg-${errorCount > 0 ? 'danger' : 'success'}">${errorCount} issues require attention</span>
            </div>
                <div class="col">
                    <button class="btn btn-sm btn-outline-secondary" id="step2-prev-error"><i class="fas fa-arrow-up"></i> Prev</button>
                    <button class="btn btn-sm btn-outline-secondary" id="step2-next-error"><i class="fas fa-arrow-down"></i> Next</button>
                </div>
                <div class="col-auto">
                    <button class="btn btn-sm btn-outline-primary" id="step2-add-line"><i class="fas fa-plus"></i> Add</button>
                    <button class="btn btn-sm btn-outline-warning" id="step2-edit-selection"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-outline-danger" id="step2-delete-selection"><i class="fas fa-trash"></i> Delete</button>
                </div>
                <div class="col-auto">
                <button id="step2-next-step" class="btn btn-sm btn-primary" ${nextStepDisabled}>
                    Next Step <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>`;
    $('#step2-sticky-header').html(headerHtml);
    }

    function renderDataContainer() {
        const container = $('#step2-data-container');
        container.empty();
        if (!currentFile || !state.fileData[currentFile] || !state.fileData[currentFile].data) return;
        
        state.fileData[currentFile].data.forEach(item => {
            container.append(renderRow(item));
        });
    }

    function renderRow(item) {
        let contentHtml = '';
        const isError = item.type === 'error';
        const isEditing = $(`#${item.id}`).find('textarea').length > 0;
        const rowClass = isError || isEditing ? 'row-error' : '';

        // If the row is an error or already in edit mode, render the editable textarea.
        if (isError || isEditing) {
            contentHtml = `
                <div class="row-content w-100">
                    <textarea id="textarea-${item.id}" class="editable-textarea" rows="2">${_getEditableText(item)}</textarea>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <span class="error-message">${item.errorMsg || ''}</span>
                        <div>
                            <button class="btn btn-sm btn-secondary cancel-btn me-2" data-id="${item.id}">Cancel</button>
                            <button class="btn btn-sm btn-success ok-btn" data-id="${item.id}">OK</button>
                        </div>
                    </div>
                </div>`;
        } else {
            // Render the normal, read-only view.
            let innerContent = '';
            if (item.type === 'entry') {
                const displayDate = dateParser.formatDateForDisplay(item.isoDate);
                innerContent = `
                    <div class="d-flex w-100 align-items-center">
                        <span class="timestamp me-3 text-nowrap">${displayDate}</span>
                        <span class="phrases">${item.phrases.join(' • ')}</span>
                    </div>`;
            } else if (item.type === 'comment') {
                innerContent = `<div class="note-content fst-italic text-body-secondary">${item.originalLine}</div>`;
            }
            contentHtml = `<div class="row-content w-100">${innerContent}</div>`;
        }

        return `
            <div id="${item.id}" class="list-group-item data-row ${rowClass}">
                <input class="form-check-input" type="checkbox" data-id="${item.id}">
                <i class="fas fa-grip-vertical drag-handle" title="Drag to re-order"></i>
                ${contentHtml}
            </div>`;
    }
    
    /**
     * PRIVATE HELPER: Generates the human-friendly text for an edit box based on item type.
     * @param {Object} item - The data item from the state.
     * @returns {string} The text to display in the textarea.
     */
    function _getEditableText(item) {
        if (item.type === 'entry') {
            const time = dateParser.formatTimeForEdit(item.isoDate);
            const text = item.phrases.join(', ');
            return `${time} ${text}`;
        }
        // For comments or raw errors, just show the original line.
        return item.originalLine;
    }

    function makeRowEditable(itemId) {
        const item = state.fileData[currentFile].data.find(d => d.id === itemId);
        if (!item) return;

        const rowElement = $(`#${itemId}`);
        if (rowElement.find('textarea').length > 0) return; // Already editing

        // Re-render the specific row to switch it to edit mode
        rowElement.replaceWith(renderRow(item));
    }

    function attachEventListeners() {
        const container = $('#step-2-content');
        container.off(); // Clear all previous listeners

        // --- OK BUTTON (Save changes from textarea) ---
        container.on('click', '.ok-btn', function() {
            const itemId = $(this).data('id');
            const textareaValue = $(`#${itemId}`).find('textarea').val();
            const itemInState = state.fileData[currentFile].data.find(d => d.id === itemId);

            if (!itemInState) return;

            // This is the core logic: Rebuild the machine-readable 'originalLine'
            // from the human-friendly text in the textarea.

            // If it was a comment, the update is simple.
            if (textareaValue.startsWith('//') || textareaValue.startsWith('#')) {
                 itemInState.originalLine = textareaValue;
            } else {
                // For entries, we need to parse the time and prepend the full date.
                const newTimeData = dateParser.extractTimeAndText(textareaValue);
                
                if (newTimeData) {
                    // We have valid new time data. Combine it with the item's existing date.
                    const oldDate = new Date(itemInState.isoDate || Date.now()); // Use existing date, or now as fallback
                    
                    const newFullDate = new Date(
                        oldDate.getFullYear(),
                        oldDate.getMonth(),
                        oldDate.getDate(),
                        newTimeData.hours,
                        newTimeData.minutes,
                        newTimeData.seconds
                    );
                    
                    // Construct the new 'originalLine' in the format our parser expects.
                    itemInState.originalLine = `${newFullDate.toISOString()} ${newTimeData.text}`;
                } else {
                    // The user entered text that doesn't look like "HH:mm text".
                    // Treat the entire entry as the new originalLine and let the
                    // validator flag it as an error.
                    itemInState.originalLine = textareaValue;
                }
            }

            revalidateAndRender(itemId);
        });

        // --- CANCEL BUTTON (Discards changes) ---
        container.on('click', '.cancel-btn', function() {
            render(); // Just re-render the view from the unmodified state.
        });

        // --- YEAR/FILE SELECTOR ---
        container.on('change', '#step2-year-select', function() {
            currentFile = $(this).val();
            render();
        });

        // --- DELETE SELECTED ---
        container.on('click', '#step2-delete-selection', function() {
            const checkedIds = new Set();
            $('#step2-data-container input:checked').each(function() {
                checkedIds.add($(this).data('id'));
            });

            if (checkedIds.size === 0) {
                alert("Please select one or more lines to delete.");
                return;
            }

            if (confirm(`Are you sure you want to delete ${checkedIds.size} line(s)?`)) {
                state.fileData[currentFile].data = state.fileData[currentFile].data.filter(item => !checkedIds.has(item.id));
                revalidateAndRender();
            }
        });

        // --- EDIT SELECTED ---
        container.on('click', '#step2-edit-selection', function() {
            const checkedIds = [];
            $('#step2-data-container input:checked').each(function() {
                checkedIds.push($(this).data('id'));
            });

            if (checkedIds.length === 0) {
                alert("Please select one or more lines to edit.");
                return;
            }
            checkedIds.forEach(id => makeRowEditable(id));
        });

        // --- ADD NEW LINE ---
        container.on('click', '#step2-add-line', function() {
            const newItem = {
                id: `item-${Date.now()}-${Math.random()}`,
                type: 'error',
                errorType: 'new_item',
                errorMsg: 'New line. Please enter data.',
                originalLine: ''
            };

            const checkedCheckboxes = $('#step2-data-container input:checked');
            let insertIndex = 0; // Default to top

            if (checkedCheckboxes.length > 0) {
                const lastSelectedId = checkedCheckboxes.last().data('id');
                const lastSelectedIndex = state.fileData[currentFile].data.findIndex(d => d.id === lastSelectedId);
                if (lastSelectedIndex !== -1) {
                    insertIndex = lastSelectedIndex + 1;
                }
            }

            state.fileData[currentFile].data.splice(insertIndex, 0, newItem);
            render(); // Render to show the new editable row
            document.getElementById(newItem.id).scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // --- NEXT/PREV ERROR NAVIGATION ---
        container.on('click', '#step2-next-error, #step2-prev-error', function() {
            const isNext = $(this).attr('id') === 'step2-next-error';
            const errorRows = $('#step2-data-container .row-error').get();
            if (errorRows.length === 0) return;

            // Find the first error row that is currently in the viewport
            let currentVisibleIndex = -1;
            for (let i = 0; i < errorRows.length; i++) {
                const rect = errorRows[i].getBoundingClientRect();
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    currentVisibleIndex = i;
                    break;
                }
            }

            let nextIndex;
            if (isNext) {
                nextIndex = (currentVisibleIndex === -1 || currentVisibleIndex === errorRows.length - 1) ? 0 : currentVisibleIndex + 1;
            } else { // isPrev
                nextIndex = (currentVisibleIndex === -1 || currentVisibleIndex === 0) ? errorRows.length - 1 : currentVisibleIndex - 1;
            }
            
            errorRows[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

         // --- NEXT STEP BUTTON ---
        container.on('click', '#step2-next-step', function() {
            if ($(this).is(':disabled')) return;
            // The main app controller will handle the navigation logic
            // For now, we can log it.
            logger.info("Proceeding to Step 3.");
            alert("Proceeding to Step 3 (to be built)!");
        });
    }

    return { init };

// Pass the new dateParser dependency
})(PreprocessorService, ParserService, ValidatorService, uiService, DateParser);