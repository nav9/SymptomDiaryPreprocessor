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
                        // Phase 1 is now part of reprocessCurrentYear
                        step2Data[year] = { rawLines: lines, structuredData: [] };
                    });
                }
                currentYear = Object.keys(step2Data)[0];
                reprocessCurrentYear(); // Initial processing and render.
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

    function reprocessCurrentYear() {
        if (!currentYear) return;
        
        const yearObject = step2Data[currentYear];
        const yearForParsing = parseInt(currentYear, 10);
        
        // CORRECTED: Use the current state (structuredData) if it exists, otherwise use initial rawLines.
        // This preserves the `isEditing` flag during reprocessing.
        const linesToProcess = yearObject.structuredData.length > 0
            ? yearObject.structuredData
            : yearObject.rawLines;

        // Phase 1: Re-structure the data. The validator will preserve the `isEditing` flag.
        yearObject.structuredData = validator.structureData(linesToProcess);

        // Phase 2: Run chronological validation.
        const { validatedData, totalErrors } = validator.validateChronology(yearObject.structuredData, yearForParsing);
        yearObject.structuredData = validatedData;
        
        let grandTotalErrors = 0;
        Object.values(step2Data).forEach(yearObj => {
            const yearNum = Object.keys(step2Data).find(key => step2Data[key] === yearObj);
            grandTotalErrors += validator.validateChronology(yearObj.structuredData, parseInt(yearNum, 10)).totalErrors;
        });

        render(); // Single call to render the UI.
        attachEventListeners(); // Re-attach listeners after render.
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
        
        const headerHtml = `
            <div class="row g-2 align-items-center">
                <div class="col-auto"><label for="step2-year-select" class="form-label mb-0">Year:</label><select id="step2-year-select" class="form-select form-select-sm w-auto">${options}</select></div>
                <div class="col-auto"><span class="badge ${errorBadgeClass}">${currentYearErrorCount} issues this year / ${totalErrorCount} total</span></div>
                <div class="col"><button id="step2-prev-error-btn" class="btn btn-sm btn-outline-secondary" title="Previous Issue" ${nextPrevDisabled}><i class="fas fa-arrow-up"></i></button><button id="step2-next-error-btn" class="btn btn-sm btn-outline-secondary" title="Next Issue" ${nextPrevDisabled}><i class="fas fa-arrow-down"></i></button></div>
                <div class="col-auto ms-auto"><button id="step2-move-up-btn" class="btn btn-sm btn-outline-secondary" disabled title="Move Up"><i class="fas fa-chevron-up"></i></button><button id="step2-move-down-btn" class="btn btn-sm btn-outline-secondary" disabled title="Move Down"><i class="fas fa-chevron-down"></i></button><button id="step2-add-btn" class="btn btn-sm btn-custom-green" title="Add New Line"><i class="fas fa-plus"></i></button><button id="step2-edit-btn" class="btn btn-sm btn-custom-grey" title="Edit Selected" disabled><i class="fas fa-edit"></i></button><button id="step2-delete-btn" class="btn btn-sm btn-outline-danger" title="Delete Selected" disabled><i class="fas fa-trash"></i></button></div>
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
        const rowClass = item.error ? 'row-error' : '';
        let lineClass = 'line-text';
        if (item.isDateLine) lineClass += ' date-text';
        if (item.note) lineClass += ' comment-text';

        if (item.isEditing) {
            contentHtml = `
                <div class="row-content w-100"><textarea class="editable-textarea" rows="1">${item.rawText}</textarea><div class="d-flex justify-content-end align-items-center mt-1"><button class="btn btn-sm btn-secondary cancel-btn me-2" data-id="${item.id}">Cancel</button><button class="btn btn-sm btn-success ok-btn" data-id="${item.id}">OK</button></div></div>`;
        } else {
            contentHtml = `
                <div class="row-content w-100"><span class="${lineClass}">${item.rawText || ' '}</span>${item.error ? `<div class="error-message">${item.error}</div>` : ''}</div>`;
        }
        
        return `<div id="${item.id}" class="list-group-item data-row ${rowClass}"><input class="form-check-input" type="checkbox" data-id="${item.id}">${contentHtml}</div>`;
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
        ui.showLoading("Finalizing all yearly data...");
        setTimeout(() => {
            try {
                const finalOutputData = {}; 
                Object.entries(step2Data).forEach(([year, yearObject]) => {
                    const yearForParsing = parseInt(year, 10);
                    const finalEntriesForYear = [];
                    
                    yearObject.structuredData.forEach(entry => {
                        if (entry.unrecognized || entry.isDateLine || !entry.date) return;
                        const dateObj = dateParser.parseDate(entry.date, yearForParsing);
                        if (!dateObj) return;

                        if (entry.time) {
                            const timeData = dateParser.extractTimeAndText(entry.time);
                            if (timeData && !timeData.error) {
                                const isoDate = dateParser.buildISOString(
                                    dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(),
                                    timeData.hours, timeData.minutes);
                                finalEntriesForYear.push({id: entry.id, isoDate: isoDate, phraseText: timeData.text});
                            }
                        } else if (entry.note) {
                             const isoDate = dateParser.buildISOString(
                                dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), '00', '00');
                            finalEntriesForYear.push({id: entry.id, isoDate: isoDate, note: entry.note});
                        }
                    });
                    finalOutputData[year] = finalEntriesForYear;
                });
                
                if (!window.appState.step2) window.appState.step2 = {};
                window.appState.step2.finalData = finalOutputData;

                ui.hideLoading();
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
            if (item) item.isEditing = false;
            reprocessCurrentYear();
        });         

        container.on('click', '.data-row', function(event) {
            if ($(event.target).is('input, button, textarea, a, .form-check-input')) return;
            const itemId = $(this).attr('id');
            const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
            if (item && !item.isEditing) {
                item.isEditing = true;
                render(); // Just re-render the UI, don't re-validate everything
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
                const itemId = $(this).data('id');
                const item = step2Data[currentYear].structuredData.find(d => d.id === itemId);
                if (item) item.isEditing = true;
            });
            reprocessCurrentYear();
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
                for (const index of checkedIndices) {
                    if (index > 0) {
                        [currentData[index - 1], currentData[index]] = [currentData[index], currentData[index - 1]];
                    }
                }
            } else {
                for (let i = checkedIndices.length - 1; i >= 0; i--) {
                    const index = checkedIndices[i];
                    if (index < currentData.length - 1) {
                         [currentData[index], currentData[index + 1]] = [currentData[index + 1], currentData[index]];
                    }
                }
            }
            reprocessCurrentYear();
        });

        header.on('click', '#step2-next-error-btn, #step2-prev-error-btn', function() {
            if ($(this).is(':disabled')) return;
            const isNext = $(this).attr('id') === 'step2-next-error-btn';
            const errorElements = container.find('.row-error').get();
            if (errorElements.length === 0) return;
            let currentVisibleIndex = -1;
            for (let i = 0; i < errorElements.length; i++) {
                const rect = errorElements[i].getBoundingClientRect();
                if (rect.top >= 0 && rect.top <= window.innerHeight) { currentVisibleIndex = i; break; }
            }
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