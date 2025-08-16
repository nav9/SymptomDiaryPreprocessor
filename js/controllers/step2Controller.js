const Step2Controller = (function(logger, validator, dateParser, ui) {

    const selectors = {
        stickyHeader: $('#step2-sticky-header'),
        dataContainer: $('#step2-data-container'),
        topProceedContainer: $('#step2-top-proceed'),
        bottomProceedContainer: $('#step2-bottom-proceed')
    };

    let step2Data = {};
    let currentYear = null;

    function init(navCallback) {
        logger.info("Initializing Step 2 Controller.");
        
        window.navigationCallback = navCallback;
        const step1Data = getStep1Data();

        if (Object.keys(step1Data).length === 0) {
            selectors.dataContainer.html('<div class="alert alert-warning">No data from Step 1. Please go back.</div>');
            return;
        }

        ui.showLoading("Structuring and validating data...");
        setTimeout(() => {
            try {
                if (Object.keys(step2Data).length === 0) {
                     Object.entries(step1Data).forEach(([year, lines]) => {
                        const rawLinesWithState = lines.map(line => ({ ...line, isEditing: false }));
                        step2Data[year] = { rawLines: rawLinesWithState, structuredData: [] };
                    });
                }
                currentYear = Object.keys(step2Data)[0];
                reprocessCurrentYear();
            } catch (e) {
                logger.error("Error during Step 2 initialization", e);
                ui.showLoading("An error occurred. Please check console.");
            } finally {
                ui.hideLoading();
            }
        }, 50);
    }
    
    function getStep1Data() {
        return (window.appState && window.appState.step1 && window.appState.step1.finalData) || {};
    }

    /**
     * The single source of truth for validation and rendering in this step.
     */
    function runValidation() {
        if (!currentYear) return;
        
        const yearObject = step2Data[currentYear];
        const yearForParsing = parseInt(currentYear, 10);
        
        // Phase 2 validation (chronology) is run here. This is called on every change.
        const { validatedData, totalErrors } = validator.validateChronology(yearObject.structuredData, yearForParsing);
        yearObject.structuredData = validatedData;
        
        let grandTotalErrors = 0;
        Object.values(step2Data).forEach(yearObj => {
            grandTotalErrors += yearObj.structuredData.filter(line => line.error).length;
        });

        renderStickyHeader(totalErrors, grandTotalErrors);
        renderDataContainer();
        updateProceedButton(grandTotalErrors);
        attachEventListeners();
    }

    function reprocessCurrentYear() {
        if (!currentYear) return;
        
        const yearObject = step2Data[currentYear];
        const yearForParsing = parseInt(currentYear, 10);
        
        const linesToProcess = yearObject.structuredData.length > 0
            ? yearObject.structuredData
            : yearObject.rawLines;

        yearObject.structuredData = validator.structureData(linesToProcess);

        const { validatedData } = validator.validateChronology(yearObject.structuredData, yearForParsing);
        yearObject.structuredData = validatedData;
        
        render();
        attachEventListeners();
    }

    /** Renders all UI components based on the current state. */
    function render() {
        let totalErrors = 0;
        let grandTotalErrors = 0;

        if (step2Data[currentYear]) {
            totalErrors = step2Data[currentYear].structuredData.filter(item => item.error).length;
            grandTotalErrors = Object.values(step2Data).reduce((acc, yearObj) => acc + yearObj.structuredData.filter(item => item.error).length, 0);
        }

        renderStickyHeader(totalErrors, grandTotalErrors);
        renderDataContainer();
        updateProceedButton(grandTotalErrors);
    }    

    function renderStickyHeader(currentYearErrorCount, totalErrorCount) {
        const years = Object.keys(step2Data).sort();
        const options = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');
        const errorBadgeClass = totalErrorCount > 0 ? 'bg-danger' : 'bg-success';
        const nextPrevDisabled = currentYearErrorCount < 2 ? 'disabled' : '';
        
        // The container for the top proceed button is now part of the static layout.
        const headerHtml = `
            <div class="row g-2 align-items-center">
                <div class="col-auto"><label for="step2-year-select" class="form-label mb-0">Year:</label><select id="step2-year-select" class="form-select form-select-sm w-auto">${options}</select></div>
                <div class="col-auto"><span class="badge ${errorBadgeClass}">${currentYearErrorCount} issues this year / ${totalErrorCount} total</span></div>
                <div class="col">
                    <button id="step2-prev-error-btn" class="btn btn-sm btn-outline-secondary" title="Previous Issue" ${nextPrevDisabled}><i class="fas fa-arrow-up"></i></button>
                    <button id="step2-next-error-btn" class="btn btn-sm btn-outline-secondary" title="Next Issue" ${nextPrevDisabled}><i class="fas fa-arrow-down"></i></button>
                </div>
                <div class="col-auto ms-auto d-flex gap-2">
                    <input type="file" id="step2-load-input" class="d-none" accept=".json">
                    <label for="step2-load-input" class="btn btn-sm btn-outline-secondary" title="Load Step 2 Data"><i class="fas fa-upload me-2"></i>Load</label>
                    <button id="step2-save-btn" class="btn btn-sm btn-outline-secondary" title="Save Step 2 Data"><i class="fas fa-download me-2"></i>Save</button>
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
        if (!step2Data[currentYear] || !step2Data[currentYear].structuredData) return;
        step2Data[currentYear].structuredData.forEach(item => {
            selectors.dataContainer.append(renderRow(item));
        });
    }

    function renderRow(item) {
        let contentHtml = '';
        const rowClass = item.error ? 'row-error' : '';
        let lineClass = 'line-text';
        if (item.isDateLine) lineClass += ' date-text';
        if (item.note) lineClass += ' comment-text';

        if (item.isEditing) {
            contentHtml = `<div class="row-content w-100"><textarea class="editable-textarea" rows="1">${item.rawText}</textarea><div class="d-flex justify-content-end align-items-center mt-1"><button class="btn btn-sm btn-secondary cancel-btn me-2" data-id="${item.id}">Cancel</button><button class="btn btn-sm btn-success ok-btn" data-id="${item.id}">OK</button></div></div>`;
        } else {
            contentHtml = `<div class="row-content w-100"><span class="${lineClass}">${item.rawText || ' '}</span>${item.error ? `<div class="error-message">${item.error}</div>` : ''}</div>`;
        }
        
        return `<div id="${item.id}" class="list-group-item data-row ${rowClass}"><input class="form-check-input" type="checkbox" data-id="${item.id}">${contentHtml}</div>`;
    }
    
    function updateProceedButton(totalErrorCount) {
        const proceedBtnHtml = `<button id="proceed-to-step3-btn" class="btn btn-lg btn-primary">Finalize & Proceed to Step 3 <i class="fas fa-arrow-right"></i></button>`;
        
        // Target the container inside the sticky header specifically.
        const topContainer = $('#step2-top-proceed');

        if (totalErrorCount === 0 && Object.keys(step2Data).length > 0) {
            // Use a smaller button for the top bar.
            topContainer.html(proceedBtnHtml.replace('btn-lg', 'btn-sm'));
            selectors.bottomProceedContainer.html(proceedBtnHtml);
        } else {
            topContainer.empty();
            selectors.bottomProceedContainer.empty();
        }
    }

    function finalizeData() {
        ui.showLoading("Finalizing all yearly data...");
        setTimeout(() => {
            try {
                logger.info("Starting finalization process for all years.");
                const finalOutputData = {}; 

                // A single, authoritative loop to process and convert each year's data.
                Object.entries(step2Data).forEach(([year, yearObject]) => {
                    logger.info(`Processing and finalizing year ${year}...`);
                    const yearForParsing = parseInt(year, 10);
                    
                    // Step 1: Determine the correct source of truth for this year's data
                    // and run the full structuring/validation pipeline.
                    const linesToProcess = yearObject.structuredData.length > 0 ? yearObject.structuredData : yearObject.rawLines;
                    const processedData = validator.structureData(linesToProcess);
                    const { validatedData } = validator.validateChronology(processedData, yearForParsing);
                    
                    // Step 2: Convert the now-validated data into the final ISO format.
                    const finalEntriesForYear = [];
                    validatedData.forEach(entry => {
                        if (entry.unrecognized || entry.isDateLine || !entry.date) return;
                        const dateObj = dateParser.parseDate(entry.date, yearForParsing);
                        if (!dateObj || isNaN(dateObj.getTime())) return;

                        if (entry.time) {
                            const timeData = dateParser.extractTimeAndText(entry.time);
                            if (timeData && !timeData.error) {
                                const isoDate = dateParser.buildISOString(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), timeData.hours, timeData.minutes);
                                finalEntriesForYear.push({id: entry.id, isoDate: isoDate, phraseText: timeData.text});
                            }
                        } else if (entry.note) {
                             const isoDate = dateParser.buildISOString(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), '00', '00');
                            finalEntriesForYear.push({id: entry.id, isoDate: isoDate, note: entry.note});
                        }
                    });

                    finalOutputData[year] = finalEntriesForYear;
                    logger.info(`Successfully finalized ${finalEntriesForYear.length} entries for year ${year}.`);
                });
                
                if (!window.appState.step2) window.appState.step2 = {};
                window.appState.step2.finalData = finalOutputData;

                ui.hideLoading();
                logger.info("All data finalized. Navigating to Step 3.");
                if (window.navigationCallback) window.navigationCallback(3);

            } catch(e) {
                ui.hideLoading();
                logger.error("A critical error occurred during data finalization.", e);
                alert("An error occurred during finalization. Please check the console for details.");
            }
        }, 100);
    }
    
    function attachEventListeners() {
        const header = selectors.stickyHeader;
        const container = selectors.dataContainer;        
        header.off(); container.off();
        $('body').off('click', '#proceed-to-step3-btn');
        
        header.on('change', '#step2-year-select', function() {
            currentYear = $(this).val();
            reprocessCurrentYear();
        });

        header.on('click', '#step2-save-btn', function() {
            logger.info("Saving Step 2 state.");
            const stateToSave = {
                step: 2,
                data: {}
            };

            // Package the data from all years
            Object.entries(step2Data).forEach(([year, yearObject]) => {
                const lines = yearObject.structuredData.length > 0 ? yearObject.structuredData : yearObject.rawLines;
                stateToSave.data[year] = lines.map(item => ({ id: item.id, rawText: item.rawText }));
            });

            const dataStr = JSON.stringify(stateToSave, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().slice(0, 10);
            a.download = `Step2_progress_${timestamp}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // --- NEW: LOAD BUTTON HANDLER ---
        header.on('change', '#step2-load-input', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const loadedState = JSON.parse(e.target.result);
                    if (loadedState.step !== 2 || !loadedState.data) {
                        throw new Error("Invalid Step 2 file format.");
                    }

                    logger.info("Loading Step 2 data from file.");
                    step2Data = {}; // Clear existing data

                    Object.entries(loadedState.data).forEach(([year, lines]) => {
                        step2Data[year] = {
                            rawLines: [], // Raw lines are now superseded by the loaded data
                            structuredData: lines.map(line => ({ ...line, isEditing: false }))
                        };
                    });

                    currentYear = Object.keys(step2Data)[0];
                    reprocessCurrentYear(); // Reprocess and render the loaded data

                } catch (err) {
                    logger.error("Failed to load Step 2 state", err);
                    alert(`Error: Could not load file. ${err.message}`);
                }
            };
            reader.readAsText(file);
            $(this).val(''); // Reset input
        });        

        container.on('click', '.ok-btn', function() {
            const itemId = $(this).data('id');
            const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
            if (item) {
                item.rawText = $(this).closest('.row-content').find('textarea').val().trim();
                item.isEditing = false;
            }
            reprocessCurrentYear();
        });

        container.on('click', '.cancel-btn', function() {
            const itemId = $(this).data('id');
            const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
            if (item) {
                item.isEditing = false;
            }
            render(); // Just re-render, no need to reprocess everything.
            attachEventListeners();
        });         

        container.on('click', '.data-row', function(event) {
            if ($(event.target).is('input, button, textarea, a, .form-check-input')) return;
            const itemId = $(this).attr('id');
            const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
            if (item && !item.isEditing) {
                item.isEditing = true;
                render();
                attachEventListeners();
            }
        });
        
        header.on('click', '#step2-add-btn', function() {
            const newItem = { id: `item-${Date.now()}-${Math.random()}`, rawText: '', isEditing: true };
            const dataArray = step2Data[currentYear].structuredData;
            const checkedCheckboxes = container.find('input:checked');
            let insertIndex = dataArray.length;
            if (checkedCheckboxes.length > 0) {
                const firstSelectedId = checkedCheckboxes.first().data('id');
                const foundIndex = dataArray.findIndex(d => d.id === firstSelectedId);
                if (foundIndex !== -1) insertIndex = foundIndex + 1;
            }
            dataArray.splice(insertIndex, 0, newItem);
            reprocessCurrentYear();
            const newElement = document.getElementById(newItem.id);
            if (newElement) {
                newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                $(newElement).find('textarea').focus();
            }
        });

        header.on('click', '#step2-edit-btn', function() {
            if ($(this).is(':disabled')) return;
            container.find('input:checked').each(function() {
                const item = step2Data[currentYear].structuredData.find(d => d.id === $(this).data('id'));
                if (item) item.isEditing = true;
            });
            render();
            attachEventListeners();
        });

        header.on('click', '#step2-delete-btn', function() {
            if ($(this).is(':disabled')) return;
            const checkedIds = new Set();
            container.find('input:checked').each(function() { checkedIds.add($(this).data('id')); });
            if (confirm(`Are you sure you want to permanently delete ${checkedIds.size} line(s)?`)) {
                step2Data[currentYear].structuredData = step2Data[currentYear].structuredData.filter(item => !checkedIds.has(item.id));
                reprocessCurrentYear();
            }
        });        

        header.on('click', '#step2-move-up-btn, #step2-move-down-btn', function() {
            if ($(this).is(':disabled')) return;
            const isMoveUp = $(this).attr('id') === 'step2-move-up-btn';
            const currentData = step2Data[currentYear].structuredData;
            const checkedIndices = [];
            container.find('input:checked').each(function() {
                const index = currentData.findIndex(d => d.id === $(this).data('id'));
                if (index !== -1) checkedIndices.push(index);
            });
            checkedIndices.sort((a,b) => a - b);
            if (isMoveUp) {
                for (const index of checkedIndices) { if (index > 0) [currentData[index - 1], currentData[index]] = [currentData[index], currentData[index - 1]]; }
            } else {
                for (let i = checkedIndices.length - 1; i >= 0; i--) { const index = checkedIndices[i]; if (index < currentData.length - 1) [currentData[index], currentData[index + 1]] = [currentData[index + 1], currentData[index]]; }
            }
            reprocessCurrentYear();
        });

        header.on('click', '#step2-next-error-btn, #step2-prev-error-btn', function() {
            if ($(this).is(':disabled')) return;
            const isNext = $(this).attr('id') === 'step2-next-error-btn';
            const errorElements = container.find('.row-error').get();
            if (errorElements.length === 0) return;
            let currentVisibleIndex = -1;
            for (let i = 0; i < errorElements.length; i++) { if (errorElements[i].getBoundingClientRect().top >= 0) { currentVisibleIndex = i; break; } }
            let targetIndex;
            if (isNext) {
                targetIndex = currentVisibleIndex > -1 ? (currentVisibleIndex + 1) % errorElements.length : 0;
            } else {
                targetIndex = currentVisibleIndex > -1 ? (currentVisibleIndex - 1 + errorElements.length) % errorElements.length : errorElements.length - 1;
            }
            errorElements[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        });        

        container.on('change', 'input[type="checkbox"]', function() {
            const checkedCount = container.find('input:checked').length;
            header.find('#step2-edit-btn, #step2-delete-btn, #step2-move-up-btn, #step2-move-down-btn').prop('disabled', checkedCount === 0);
        });

        $('body').on('click', '#proceed-to-step3-btn', finalizeData);
    }

    return { init };

})(logger, ValidatorService, DateParser, uiService);