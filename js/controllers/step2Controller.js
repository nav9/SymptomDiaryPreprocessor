const Step2Controller = (function(logger, validator, dateParser, ui, lineRecognizerService) {

    const selectors = {
        stickyHeader: $('#step2-sticky-header'), // Assuming new IDs for this step
        dataContainer: $('#step2-data-container'),
        topProceedContainer: $('#step2-top-proceed'),
        bottomProceedContainer: $('#step2-bottom-proceed')
    };

    const step2Data = {}; // { "2024": { data: [...], dateOrder: 'asc'}, "2023": ... }
    let currentYear = null;

    function init() {
        logger.info("Initializing Step 2 Controller.");
        
        // This is where data is passed from Step 1
        const step1CleanedData = getStep1Data();
        if (Object.keys(step1CleanedData).length === 0) {
            selectors.dataContainer.html('<div class="alert alert-warning">No data from Step 1. Please go back and load data.</div>');
            return;
        }

        ui.showLoading("Analyzing date and time order...");
        setTimeout(() => {
            try {
                if (Object.keys(step2Data).length === 0) {
                     Object.entries(step1CleanedData).forEach(([year, lines]) => {
                        step2Data[year] = { data: JSON.parse(JSON.stringify(lines)), dateOrder: 'tbd' };
                    });
                }
                currentYear = Object.keys(step2Data)[0];
                validateAndRender();
                attachEventListeners();
            } catch (e) {
                logger.error("Error during Step 2 initialization", e);
            } finally {
                ui.hideLoading();
            }
        }, 50);
    }

    function getStep1Data() {
        if (window.appState && window.appState.step1 && window.appState.step1.finalData) {
            return window.appState.step1.finalData;
        }
        logger.warn("Could not find data from Step 1 in global state.");
        return {};
    }

    function validateAndRender() {
        if (!currentYear) return;
        const { validatedData, dateOrder } = validator.validate(step2Data[currentYear].data);
        step2Data[currentYear].data = validatedData;
        step2Data[currentYear].dateOrder = dateOrder;
        
        const totalErrorCount = Object.values(step2Data).flatMap(y => y.data).filter(l => l.type === 'error').length;
        const currentYearErrorCount = step2Data[currentYear].data.filter(l => l.type === 'error').length;
        
        renderStickyHeader(currentYearErrorCount, totalErrorCount);
        renderDataContainer();
        updateProceedButton(totalErrorCount);
    }

    function renderStickyHeader(currentYearErrorCount, totalErrorCount) {
        const years = Object.keys(step2Data).sort();
        const options = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');
        const errorBadgeClass = totalErrorCount > 0 ? 'bg-danger' : 'bg-success';
        const errorIds = step2Data[currentYear].data.filter(l => l.type === 'error').map(l => l.id);
        const nextPrevDisabled = errorIds.length < 2 ? 'disabled' : '';
        
        const headerHtml = `
            <div class="row g-2 align-items-center">
                <div class="col-auto">
                    <label for="step2-year-select" class="form-label mb-0">Year:</label>
                    <select id="step2-year-select" class="form-select form-select-sm w-auto">${options}</select>
                </div>
                <div class="col-auto">
                    <span class="badge ${errorBadgeClass}">
                        ${currentYearErrorCount} issues this year / ${totalErrorCount} total
                    </span>
                </div>
                <div class="col">
                    <button id="step2-prev-error-btn" class="btn btn-sm btn-outline-secondary" title="Previous Issue" ${nextPrevDisabled}><i class="fas fa-arrow-up"></i></button>
                    <button id="step2-next-error-btn" class="btn btn-sm btn-outline-secondary" title="Next Issue" ${nextPrevDisabled}><i class="fas fa-arrow-down"></i></button>
                </div>
                <div class="col-auto ms-auto">
                    <button id="step2-move-up-btn" class="btn btn-sm btn-outline-secondary" disabled title="Move Up"><i class="fas fa-chevron-up"></i></button>
                    <button id="step2-move-down-btn" class="btn btn-sm btn-outline-secondary" disabled title="Move Down"><i class="fas fa-chevron-down"></i></button>
                    <button id="step2-add-btn" class="btn btn-sm btn-custom-green" title="Add New Line"><i class="fas fa-plus"></i></button>
                    <button id="step2-edit-btn" class="btn btn-sm btn-custom-grey" title="Edit Selected" disabled><i class="fas fa-edit"></i></button>
                    <button id="step2-delete-btn" class="btn btn-sm btn-outline-danger" title="Delete Selected" disabled><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div id="step2-top-proceed" class="text-center mt-2"></div>`;
        selectors.stickyHeader.html(headerHtml);
    }
    
    function renderDataContainer() {
        selectors.dataContainer.empty();
        if (!step2Data[currentYear]) return;
        step2Data[currentYear].data.forEach(item => {
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
            if (item.type === 'header') lineClass += ' date-text text-danger';

            contentHtml = `
                <div class="row-content w-100">
                    <span class="${lineClass}">${item.rawText || ' '}</span>
                    ${item.type === 'error' ? `<div class="error-message">${item.reason}</div>` : ''}
                </div>`;
        }

    //  Disable the checkbox for the non-interactive orphan header
    const checkboxHtml = item.type === 'header' 
        ? `<input class="form-check-input" type="checkbox" data-id="${item.id}" disabled>`
        : `<input class="form-check-input" type="checkbox" data-id="${item.id}">`;

    return `
        <div id="${item.id}" class="list-group-item data-row ${rowClass}">
            ${checkboxHtml}
            ${contentHtml}
        </div>`;
    }
    
    
    function updateProceedButton(totalErrorCount) {
        const proceedBtn = `<button id="proceed-to-step3-btn" class="btn btn-lg btn-primary">Finalize & Proceed to Step 3 <i class="fas fa-arrow-right"></i></button>`;
        if (totalErrorCount === 0 && Object.keys(step2Data).length > 0) {
            selectors.topProceedContainer.html(proceedBtn);
            selectors.bottomProceedContainer.html(proceedBtn);
        } else {
            selectors.topProceedContainer.empty();
            selectors.bottomProceedContainer.empty();
        }
    }

    function finalizeData() {
        ui.showLoading("Finalizing data... This may take a moment.");

        // Use a cancellable timeout to allow the UI to update with the loading modal
        const processId = setTimeout(() => {
            try {
                const step3Data = {}; // The new data structure for all subsequent steps

                Object.keys(step2Data).forEach(year => {
                    const yearObject = step2Data[year];
                    const dateOrder = yearObject.dateOrder;
                    const yearNumber = parseInt(year, 10);

                    // 1. Group again to ensure structure is correct after all edits
                    const dateGroups = validator.groupLinesByDate(yearObject.data);

                    // 2. Sort the date groups chronologically based on the detected order
                    const sortedGroups = Object.values(dateGroups)
                        .filter(g => g.dateObj) // Filter out any groups that might be invalid
                        .sort((a, b) => {
                            const order = (dateOrder === 'asc' ? 1 : -1);
                            // Compare the time value of the date objects
                            return (a.dateObj.getTime() - b.dateObj.getTime()) * order;
                        });

                    // 3. Flatten, create timestamps, and filter out non-time entries
                    const finalEntries = [];
                    sortedGroups.forEach(group => {
                        // The date object is already validated, so we can trust it
                        const dateObj = group.dateObj;

                        // Get all time and comment entries for this date
                        const entriesForDate = group.entries.filter(e => e.type === 'time' || e.type === 'comment');

                        // Sort times within the group. Comments will be interspersed.
                        const sortedEntries = entriesForDate.sort((a, b) => {
                            const timeAData = dateParser.extractTimeAndText(a.rawText);
                            const timeBData = dateParser.extractTimeAndText(b.rawText);

                            // Handle cases where one or both might be a comment
                            if (!timeAData && !timeBData) return 0; // two comments
                            if (!timeAData) return -1; // comment comes before time
                            if (!timeBData) return 1;  // time comes after comment

                            const timeA = parseInt(timeAData.hours, 10) * 60 + parseInt(timeAData.minutes, 10);
                            const timeB = parseInt(timeBData.hours, 10) * 60 + parseInt(timeBData.minutes, 10);
                            return timeA - timeB;
                        });

                        // Process each sorted entry for the day
                        sortedEntries.forEach(entry => {
                            if (entry.type === 'time') {
                                const timeData = dateParser.extractTimeAndText(entry.rawText);
                                if (timeData && !timeData.error) {
                                    // Build the final, definitive ISO timestamp in UTC
                                    const isoDate = dateParser.buildISOString(
                                        dateObj.getUTCFullYear(),
                                        dateObj.getUTCMonth(),
                                        dateObj.getUTCDate(),
                                        timeData.hours,
                                        timeData.minutes
                                    );
                                    
                                    // The final object for Step 3 has a simpler structure
                                    finalEntries.push({
                                        id: entry.id,
                                        isoDate: isoDate,
                                        phrases: entry.rawText.replace(/^~?\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*/, '').split(/[.,]/).map(p=>p.trim()).filter(Boolean),
                                        rawText: entry.rawText
                                    });
                                }
                            } else if (entry.type === 'comment') {
                                // For now, we can choose to include comments with the previous entry's timestamp
                                // or assign them a special status. Let's add them with the date's timestamp.
                                finalEntries.push({
                                    id: entry.id,
                                    isoDate: dateObj.toISOString(), // Assigns comment to midnight UTC of that day
                                    phrases: [entry.rawText], // The whole comment is a single phrase
                                    isComment: true,
                                    rawText: entry.rawText
                                });
                            }
                        });
                    });
                    
                    // Assign the fully processed array to the new data structure
                    step3Data[year] = finalEntries;
                });
                
                // Pass the finalized data to the global state for the next step to consume
                window.appState.step2 = { finalData: step3Data };

                ui.hideLoading();
                logger.info("Data finalized and ready for Step 3.");
                alert("Data has been finalized successfully! Proceeding to Step 3 (to be built).");
                
                // In a real scenario, you would navigate now:
                // if (window.navigationCallback) window.navigationCallback(3);

            } catch(e) {
                ui.hideLoading();
                logger.error("A critical error occurred during data finalization.", e);
                alert("An error occurred during finalization. Please check the console for details.");
            }
        }, 100); // 100ms timeout
    }

    function attachEventListeners() {
        // All listeners from Step 1 (OK, Cancel, Add, Edit, Delete, Checkbox)
        // are reused here, but with Step 2's selectors.
        const header = selectors.stickyHeader;
        const container = selectors.dataContainer;        
        // Clear any previously attached delegated listeners to prevent duplicates
        header.off();
        container.off();
        $('body').off('click', '#proceed-to-step3-btn');
        
        header.on('change', '#step2-year-select', function() {
            currentYear = $(this).val();
            validateAndRender();
        });

        // OK button (when a row is in edit mode)
        container.on('click', '.ok-btn', function() {
            const itemId = $(this).data('id');
            const item = step2Data[currentYear].data.find(d => d.id === itemId);
            if (!item) return;
            const newText = $(this).closest('.row-content').find('textarea').val().trim();
            // Before saving, recognize the user's input.
            const index = step2Data[currentYear].data.findIndex(d => d.id === itemId);
            let lastDateIsValid = false;
            if (index > 0) {
                const prevItem = step2Data[currentYear].data[index - 1];
                if (prevItem.type === 'date' || prevItem.type === 'time') {
                    lastDateIsValid = true;
                }
            }            
            item.rawText = newText; // Otherwise, save it as is.
            item.isEditing = false;            
            validateAndRender(); // Re-validate and render the entire view
        });

        // CANCEL button (when a row is in edit mode)
        container.on('click', '.cancel-btn', function() {
            const itemId = $(this).data('id');
            const item = step2Data[currentYear].data.find(d => d.id === itemId);
            if (item) {
                item.isEditing = false; // Just exit edit mode, discarding changes
            }
            validateAndRender(); // Re-render to show the original state
        });        

        // This goes inside attachEventListeners in step2Controller.js
        container.on('click', '.data-row', function(event) {
            // Prevent triggering when clicking an interactive element within the row
            if ($(event.target).is('input, button, textarea, a, .form-check-input')) {
                return;
            }
            const itemId = $(this).attr('id');
            // It operates on step2Data instead of yearlyData
            const item = step2Data[currentYear].data.find(d => d.id === itemId);
            if (item && !item.isEditing) {
                item.isEditing = true;
                // The call to validateAndRender() is what makes the row appear as an edit box
                validateAndRender();
            }
        });

        // ADD button
        header.on('click', '#step2-add-btn', function() {
            const newItem = {
                id: `item-${Date.now()}-${Math.random()}`,
                rawText: '',
                isEditing: true, // Start in edit mode immediately
                type: 'new'
            };
            const checkedCheckboxes = container.find('input:checked');
            let insertIndex = step2Data[currentYear].data.length; // Default to end
            if (checkedCheckboxes.length > 0) {
                const firstSelectedId = checkedCheckboxes.first().data('id');
                const foundIndex = step2Data[currentYear].data.findIndex(d => d.id === firstSelectedId);
                if (foundIndex !== -1) insertIndex = foundIndex + 1;
            }
            step2Data[currentYear].data.splice(insertIndex, 0, newItem);
            validateAndRender();
            const newElement = document.getElementById(newItem.id);
            if (newElement) {
                newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                $(newElement).find('textarea').focus();
            }
        });

        // EDIT button
        header.on('click', '#step2-edit-btn', function() {
            if ($(this).is(':disabled')) return;
            container.find('input:checked').each(function() {
                const itemId = $(this).data('id');
                const item = step2Data[currentYear].data.find(d => d.id === itemId);
                if (item) item.isEditing = true;
            });
            validateAndRender();
            header.find('#step2-edit-btn, #step2-delete-btn, #step2-move-up-btn, #step2-move-down-btn').prop('disabled', true);
        });

        // DELETE button
        header.on('click', '#step2-delete-btn', function() {
            if ($(this).is(':disabled')) return;
            const checkedIds = new Set();
            container.find('input:checked').each(function() { checkedIds.add($(this).data('id')); });
        // Don't ask for confirmation if just deleting the placeholder orphan header
        if (checkedIds.has('orphan-header')) {
            step2Data[currentYear].data = step2Data[currentYear].data.filter(item => !checkedIds.has(item.id));
            validateAndRender();
            return;
       }            
            if (confirm(`Are you sure you want to permanently delete ${checkedIds.size} line(s)?`)) {
                step2Data[currentYear].data = step2Data[currentYear].data.filter(item => !checkedIds.has(item.id));
                validateAndRender();
            }
        });        

        header.on('click', '#step2-move-up-btn, #step2-move-down-btn', function() {
            if ($(this).is(':disabled')) return;
            const isMoveUp = $(this).attr('id') === 'step2-move-up-btn';
            const currentData = step2Data[currentYear].data;
            
            // Get the indices of all checked items
            const checkedIndices = [];
            container.find('input:checked').each(function() {
                const itemId = $(this).data('id');
                const index = currentData.findIndex(d => d.id === itemId);
                if (index !== -1) checkedIndices.push(index);
            });

            // Sort indices to move them correctly as a block
            checkedIndices.sort((a,b) => a - b);

            if (isMoveUp) {
                // For moving up, iterate forward
                for (const index of checkedIndices) {
                    if (index > 0) {
                        [currentData[index - 1], currentData[index]] = [currentData[index], currentData[index - 1]];
                    }
                }
            } else { // Move Down
                // For moving down, iterate backwards to prevent items from leap-frogging
                for (let i = checkedIndices.length - 1; i >= 0; i--) {
                    const index = checkedIndices[i];
                    if (index < currentData.length - 1) {
                         [currentData[index], currentData[index + 1]] = [currentData[index + 1], currentData[index]];
                    }
                }
            }
            validateAndRender();
        });

        // NEXT/PREV ERROR buttons
        header.on('click', '#step2-next-error-btn, #step2-prev-error-btn', function() {
            if ($(this).is(':disabled')) return;
            const isNext = $(this).attr('id') === 'step2-next-error-btn';
            const errorElements = container.find('.row-error').get();
            if (errorElements.length === 0) return;
            let currentVisibleIndex = -1;
            for (let i = 0; i < errorElements.length; i++) {
                const rect = errorElements[i].getBoundingClientRect();
                if (rect.top >= 0 && rect.top <= window.innerHeight) {
                    currentVisibleIndex = i; break;
                }
            }
            let targetIndex;
            if (isNext) {
                targetIndex = currentVisibleIndex > -1 ? (currentVisibleIndex + 1) % errorElements.length : 0;
            } else {
                targetIndex = currentVisibleIndex > -1 ? (currentVisibleIndex - 1 + errorElements.length) % errorElements.length : errorElements.length - 1;
            }
            errorElements[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        });        

        // CHECKBOX handling to enable/disable buttons
        container.on('change', 'input[type="checkbox"]', function() {
            const checkedCount = container.find('input:checked').length;
            header.find('#step2-edit-btn, #step2-delete-btn').prop('disabled', checkedCount === 0);
            header.find('#step2-move-up-btn, #step2-move-down-btn').prop('disabled', checkedCount === 0);
        });

        // NEW: Proceed button listener
        $('body').on('click', '#proceed-to-step3-btn', finalizeData);
    }

    return { init };

})(logger, ValidatorService, DateParser, uiService, LineRecognizerService);