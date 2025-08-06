const Step2Controller = (function(logger, validator, dateParser, ui, lineRecognizerService) {

    const selectors = {
        stickyHeader: $('#step2-sticky-header'),
        dataContainer: $('#step2-data-container'),
        topProceedContainer: $('#step2-top-proceed'),
        bottomProceedContainer: $('#step2-bottom-proceed')
    };

    let step2Data = {};
    let currentYear = null;

    function init(navCallback, payload) {
        logger.info("Initializing Step 2 Controller.");
        const step1Data = payload || getStep1Data();
        if (Object.keys(step1Data).length === 0) {
            selectors.dataContainer.html('<div class="alert alert-warning">No data from Step 1. Please go back.</div>');
            return;
        }

        ui.showLoading("Structuring and validating data...");
        setTimeout(() => {
            try {
                // Initialize step2Data only once from Step 1's output.
                if (Object.keys(step2Data).length === 0) {
                     Object.entries(step1Data).forEach(([year, lines]) => {
                        const yearForParsing = parseInt(year, 10) || new Date().getFullYear();
                        const structuredData = validator.structureData(lines, yearForParsing);
                        step2Data[year] = { structuredData, isValidated: false };
                    });
                }
                currentYear = Object.keys(step2Data)[0];
                runValidation(); // Initial validation and render.
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
        return {};
    }

    /**
     * The single source of truth for validation and rendering in this step.
     */
    function runValidation() {
        if (!currentYear) return;
        
        const yearObject = step2Data[currentYear];
        const yearForParsing = parseInt(currentYear, 10) || new Date().getFullYear();
        
        // Phase 2 validation (chronology) is run here.
        const { validatedData, totalErrors } = validator.validateChronology(yearObject.structuredData, yearForParsing);
        yearObject.structuredData = validatedData;
        
        let grandTotalErrors = 0;
        Object.values(step2Data).forEach(yearObj => {
            // Count errors by checking the .error property which the validator sets.
            grandTotalErrors += yearObj.structuredData.filter(line => line.error).length;
        });

        renderStickyHeader(totalErrors, grandTotalErrors);
        renderDataContainer();
        updateProceedButton(grandTotalErrors);
        attachEventListeners(); // Re-attach listeners to the newly rendered elements.
    }

    function renderStickyHeader(currentYearErrorCount, totalErrorCount) {
        const years = Object.keys(step2Data).sort();
        const options = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');
        const errorBadgeClass = totalErrorCount > 0 ? 'bg-danger' : 'bg-success';
        
        const errorIds = step2Data[currentYear].structuredData.filter(l => l.error).map(l => l.id);
        const nextPrevDisabled = errorIds.length < 2 ? 'disabled' : '';
        
        const headerHtml = `
            <div class="row g-2 align-items-center">
                <div class="col-auto">
                    <label for="step2-year-select" class="form-label mb-0">Year:</label>
                    <select id="step2-year-select" class="form-select form-select-sm w-auto">${options}</select>
                </div>
                <div class="col-auto">
                    <span class="badge ${errorBadgeClass}">${currentYearErrorCount} issues this year / ${totalErrorCount} total</span>
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
        step2Data[currentYear].structuredData.forEach(item => {
            selectors.dataContainer.append(renderRow(item));
        });
    }

    function renderRow(item) {
        let contentHtml = '';
        // The error property is now the source of truth for styling.
        const rowClass = item.error ? 'row-error' : '';
        let lineContent = item.time || item.note || item.unrecognized || item.rawText || '';

        if (item.isEditing) {
            contentHtml = `
                <div class="row-content w-100">
                    <textarea class="editable-textarea" rows="1">${item.rawText}</textarea>
                    <div class="d-flex justify-content-end align-items-center mt-1">
                        <button class="btn btn-sm btn-secondary cancel-btn me-2" data-id="${item.id}">Cancel</button>
                        <button class="btn btn-sm btn-success ok-btn" data-id="${item.id}">OK</button>
                    </div>
                </div>`;
        } else {
            // Rebuild the display text from the structured properties
            contentHtml = `
                <div class="row-content w-100">
                    <span class="line-text">${lineContent}</span>
                    ${item.error ? `<div class="error-message">${item.error}</div>` : ''}
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

    /**
     * Final transformation: Sorts all data chronologically, creates ISO timestamps,
     * removes non-entry lines, and prepares the data structure for Step 3.
     */
    function finalizeData() {
        ui.showLoading("Finalizing all yearly data...");

        // Use a cancellable timeout to allow the UI to update with the loading modal
        const processId = setTimeout(() => {
            try {
                const finalOutputData = {}; 
                const allYears = Object.keys(step2Data);
                logger.info(`Finalizing data for ${allYears.length} year(s): ${allYears.join(', ')}`);

                allYears.forEach(year => {
                    const yearObject = step2Data[year];
                    if (!yearObject || !yearObject.structuredData) {
                        logger.warn(`Skipping year ${year} due to missing data.`);
                        return;
                    }
                    
                    const yearForParsing = parseInt(year, 10);
                    const finalEntriesForYear = [];
                    
                    // --- STEP 1: Create simple, clean groups for finalization ---
                    const simpleGroups = {};
                    yearObject.structuredData.forEach(item => {
                        // We only care about items that have a date and are not errors.
                        if (item.date && !item.error) {
                            if (!simpleGroups[item.date]) {
                                simpleGroups[item.date] = {
                                    dateObj: dateParser.parseDate(item.date, yearForParsing),
                                    entries: []
                                };
                            }
                            simpleGroups[item.date].entries.push(item);
                        }
                    });

                    // --- STEP 2: Sort these simple groups chronologically (always ascending) ---
                    const sortedGroups = Object.values(simpleGroups)
                        .filter(g => g.dateObj) // Ensure date was valid
                        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

                    // --- STEP 3: Process entries within each sorted group ---
                    sortedGroups.forEach(group => {
                        const dateObj = group.dateObj;
                        
                        // Filter for valid time entries and sort them
                        const sortedTimeEntries = group.entries
                            .filter(e => e.time && !dateParser.isLineJustDate(e.time))
                            .sort((a, b) => {
                                const timeAData = dateParser.extractTimeAndText(a.time);
                                const timeBData = dateParser.extractTimeAndText(b.time);
                                if (!timeAData || !timeBData) return 0;
                                const timeA = parseInt(timeAData.hours, 10) * 60 + parseInt(timeAData.minutes, 10);
                                const timeB = parseInt(timeBData.hours, 10) * 60 + parseInt(timeBData.minutes, 10);
                                return timeA - timeB;
                            });
                        
                        // --- STEP 4: Build the final clean objects with ISO dates ---
                        sortedTimeEntries.forEach(entry => {
                            const timeData = dateParser.extractTimeAndText(entry.time);
                            if (timeData && !timeData.error) {
                                const isoDate = dateParser.buildISOString(
                                    dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(),
                                    timeData.hours, timeData.minutes
                                );
                                finalEntriesForYear.push({
                                    id: entry.id,
                                    isoDate: isoDate,
                                    phraseText: timeData.text
                                });
                            }
                        });
                        // Notes and other types are intentionally ignored in the final output for Step 3.
                    });
                    
                    finalOutputData[year] = finalEntriesForYear;
                    logger.info(`Successfully finalized ${finalEntriesForYear.length} entries for year ${year}.`);
                });
                
                // Pass the complete final output to the global state.
                if (!window.appState.step2) window.appState.step2 = {};
                window.appState.step2.finalData = finalOutputData;

                ui.hideLoading();
                logger.info("All years finalized. Proceeding to Step 3.");
                
                if (window.navigationCallback) {
                    window.navigationCallback(3);
                }

            } catch(e) {
                ui.hideLoading();
                logger.error("A critical error occurred during data finalization.", e);
                alert("An error occurred during finalization. Please check the console for details.");
            }
        }, 100); // A small timeout prevents the UI from freezing on large datasets.
    }
        
    // function finalizeData() {
    //     ui.showLoading("Finalizing data...");
    //     setTimeout(() => {
    //         try {
    //             const finalOutputData = {}; 
    //             Object.entries(step2Data).forEach(([year, yearObject]) => {
    //                 const yearForParsing = parseInt(year, 10);
    //                 const finalEntriesForYear = [];
    //                 const dateGroups = validator.groupStructuredDataByDate(yearObject.structuredData, yearForParsing);

    //                 // Sort groups by date (always ascending for final output)
    //                 const sortedGroups = Object.values(dateGroups).filter(g => g.dateObj).sort((a,b) => a.dateObj.getTime() - b.dateObj.getTime());
                    
    //                 sortedGroups.forEach(group => {
    //                     const dateObj = group.dateObj;
    //                     group.entries.forEach(entry => {
    //                         if (entry.time) {
    //                             const timeData = dateParser.extractTimeAndText(entry.time);
    //                             if (timeData && !timeData.error) {
    //                                 const isoDate = dateParser.buildISOString(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), timeData.hours, timeData.minutes);
    //                                 finalEntriesForYear.push({ id: entry.id, isoDate: isoDate, phraseText: timeData.text });
    //                             }
    //                         } else if (entry.note) {
    //                             finalEntriesForYear.push({ id: entry.id, isoDate: dateObj.toISOString(), note: entry.note });
    //                         }
    //                     });
    //                 });
    //                 finalOutputData[year] = finalEntriesForYear;
    //             });
                
    //             window.appState.step2 = { finalData: finalOutputData };
    //             ui.hideLoading();
    //             if (window.navigationCallback) window.navigationCallback(3);
    //         } catch(e) { /* ... error handling ... */ }
    //     }, 100);
    // }

    function attachEventListeners() {
        const header = selectors.stickyHeader;
        const container = selectors.dataContainer;        
        header.off(); container.off();
        $('body').off('click', '#proceed-to-step3-btn');
        
        header.on('change', '#step2-year-select', function() {
            currentYear = $(this).val();
            runValidation();
        });

        container.on('click', '.ok-btn', function() {
            const itemId = $(this).data('id');
            const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
            if (!item) return;
            // CORRECT, SIMPLIFIED LOGIC: Just update rawText and let runValidation handle the rest.
            item.rawText = $(this).closest('.row-content').find('textarea').val().trim();
            item.isEditing = false;
            runValidation();
        });

        container.on('click', '.cancel-btn', function() {
            const itemId = $(this).data('id');
            const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
            if (item) item.isEditing = false;
            // CORRECT: Call runValidation to redraw, not the old function.
            runValidation();
        });         

        container.on('click', '.data-row', function(event) {
            if ($(event.target).is('input, button, textarea, a, .form-check-input')) return;
            const itemId = $(this).attr('id');
            const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
            if (item && !item.isEditing) {
                item.isEditing = true;
                // CORRECT: Call runValidation to redraw, not the old function.
                runValidation();
            }
        });

        // ADD button
        header.on('click', '#step2-add-btn', function() {
            const newItem = { id: `item-${Date.now()}-${Math.random()}`, rawText: '', isEditing: true };
            const checkedCheckboxes = container.find('input:checked');
            // CORRECT: All '.data' changed to '.structuredData'
            let insertIndex = step2Data[currentYear].structuredData.length;
            if (checkedCheckboxes.length > 0) {
                const firstSelectedId = checkedCheckboxes.first().data('id');
                const foundIndex = step2Data[currentYear].structuredData.findIndex(d => d.id === firstSelectedId);
                if (foundIndex !== -1) insertIndex = foundIndex + 1;
            }
            step2Data[currentYear].structuredData.splice(insertIndex, 0, newItem);
            runValidation();
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
            step2Data[currentYear].structuredData = step2Data[currentYear].structuredData.filter(item => !checkedIds.has(item.id));
            validateAndRender();
            return;
       }            
            if (confirm(`Are you sure you want to permanently delete ${checkedIds.size} line(s)?`)) {
                step2Data[currentYear].structuredData = step2Data[currentYear].structuredData.filter(item => !checkedIds.has(item.id));
                runValidation();
            }
        });        

        header.on('click', '#step2-move-up-btn, #step2-move-down-btn', function() {
            if ($(this).is(':disabled')) return;
            const isMoveUp = $(this).attr('id') === 'step2-move-up-btn';
            const currentData = step2Data[currentYear].structuredData;
            
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
            runValidation();
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