const Step1Controller = (function(logger, recognizer, ui, knowledgeBase) {

    const selectors = {
        initialLoadSection: $('#initial-load-section'),
        editorSection: $('#editor-section'),
        fileUpload: $('#fileUpload'),
        loadDummyBtn: $('#loadDummyDataBtn'),
        stickyHeader: $('#step1-sticky-header'),
        dataContainer: $('#data-container'),
        bottomProceedContainer: $('#bottom-proceed-container'),
        spellCheckSection: $('#spell-check-section'),
        spellCheckBtn: $('#spell-check-btn'),
        spellCheckResults: $('#spell-check-results'),
        spellCheckStats: $('#spell-check-stats'),
        uploadIgnoredBtn: $('#upload-ignored-words'),
        downloadIgnoredBtn: $('#download-ignored-words'),
        undoNotificationArea: $('#undo-notification-area'),
        findReplaceSection: $('#find-replace-section'),
        findInput: $('#find-input'),
        replaceInput: $('#replace-input'),
        findBtn: $('#find-btn'),
        replaceBtn: $('#replace-btn'),
        findResultsContainer: $('#find-results-container'),
        findResultsList: $('#find-results-list'),
        findResultsSummary: $('#find-results-summary'),
        findSelectAll: $('#find-select-all'),
    };


    // Data structure: { "2024": [ {id, rawText, type, reason}, ... ], "2023": [ ... ] }
    const yearlyData = {};
    let currentYear = null;
    
    // --- NEW: Spell Check State ---
    let misspelledWordsData = new Map();
    let ignoredWords = new Set();
    let spell; // To hold the SpellChecker object

    // NEW: State for Find and Replace
    let findResults = [];    

    function init(navCallback) {
        logger.info("Initializing Step 1 Controller.");
        initializeSpellChecker();
        attachEventListeners();
    }

    function initializeSpellChecker() {
        try {
            // The en_US variable is loaded from js/dictionaries/en_US.js
            if (typeof SpellCheckerService === 'undefined' || typeof en_US === 'undefined') {
                throw new Error("SpellCheckerService or en_US dictionary not found.");
            }
            // Initialize our custom service with the base dictionary
            spell = new SpellCheckerService([en_US]);
            logger.info("Custom spell checker initialized successfully.");
        } catch (error) {
            logger.error("Failed to initialize spell checker.", error);
            selectors.spellCheckBtn.prop('disabled', true).text("Spell Check Unavailable");
            alert("Could not initialize the custom spell checker.");
        }
    }
    
    function loadData(files) {
        ui.showLoading("Processing files...");
        setTimeout(() => {
            handleDataLoad(files);
            ui.hideLoading();
        }, 50);
    }

    function handleDataLoad(files) {
        Object.keys(yearlyData).forEach(key => delete yearlyData[key]);

        files.forEach(file => {
            const yearMatch = file.fileName.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : 'Unsorted';
            
            const rawLines = file.content.split('\n');
            const processedLines = [];

            rawLines.forEach(line => {
                const subLines = line.split(';');
                subLines.forEach((subLine, index) => {
                    let finalLine = subLine.trim();
                    if (finalLine && index < subLines.length - 1) {
                        finalLine += ';';
                    }
                    if(finalLine) processedLines.push(finalLine);
                });
            });

            if (!yearlyData[year]) yearlyData[year] = [];
            
            processedLines.forEach(line => {
                const cleanedLine = line.endsWith(';') ? line.slice(0, -1) : line;
                if (cleanedLine.trim() === '') return;

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
            selectors.spellCheckSection.show();
            selectors.findReplaceSection.show(); 
            currentYear = Object.keys(yearlyData).sort()[0];
            validateAndRender();
        }
    }    

    function validateAndRender() {
        if (!currentYear) return;
        let lastDateIsValid = false;
        let currentYearErrorCount = 0;
        let totalErrorCount = 0;
        const hasData = Object.keys(yearlyData).length > 0;

        // FIXED: Replaced 'typo' with 'spell' and simplified the readiness check.
        selectors.spellCheckBtn.prop('disabled', !hasData || !spell);

        Object.values(yearlyData).forEach(yearLines => {
            let lastDate = false;
            yearLines.forEach(line => {
                const result = recognizer.recognizeLine(line.rawText, lastDate);
                if (result.type === 'error') totalErrorCount++;
                lastDate = result.type === 'date' ? true : (result.type === 'time' || result.type === 'comment' ? lastDate : false);
            });
        });

        yearlyData[currentYear].forEach(line => {
            const result = recognizer.recognizeLine(line.rawText, lastDateIsValid);
            line.type = result.type;
            line.reason = result.reason;
            if (result.type === 'date') lastDateIsValid = true;
            else if (result.type !== 'time' && result.type !== 'comment') lastDateIsValid = false;
            if (result.type === 'error') currentYearErrorCount++;
        });

        renderStickyHeader(currentYearErrorCount, totalErrorCount);
        renderDataContainer();
        updateProceedButton(totalErrorCount);
    }
    
    function renderStickyHeader(currentYearErrorCount, totalErrorCount) {
        const years = Object.keys(yearlyData).sort();
        const options = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');
        const nextPrevDisabled = yearlyData[currentYear].filter(l => l.type === 'error').length < 2 ? 'disabled' : '';
        const errorBadgeClass = totalErrorCount > 0 ? 'bg-danger' : 'bg-success';
        
        const headerHtml = `
            <div class="row g-2 align-items-center">
                <div class="col-auto"><label for="year-select" class="form-label mb-0">Year:</label><select id="year-select" class="form-select form-select-sm">${options}</select></div>
                <div class="col-auto"><span class="badge ${errorBadgeClass}">${currentYearErrorCount} issues / ${totalErrorCount} total</span></div>
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
        if (item.isEditing) {
            rowClass = 'row-error';
            contentHtml = `<div class="row-content w-100"><textarea class="editable-textarea" rows="1">${item.rawText}</textarea><div class="d-flex justify-content-end align-items-center mt-1"><button class="btn btn-sm btn-secondary cancel-btn me-2" data-id="${item.id}">Cancel</button><button class="btn btn-sm btn-success ok-btn" data-id="${item.id}">OK</button></div></div>`;
        } else {
            let lineClass = 'line-text';
            if (item.type === 'comment') lineClass += ' comment-text';
            if (item.type === 'date') lineClass += ' date-text';
            contentHtml = `<div class="row-content w-100"><span class="${lineClass}">${item.rawText || ' '}</span>${item.type === 'error' ? `<div class="error-message">${item.reason}</div>` : ''}</div>`;
        }
        return `<div id="${item.id}" class="list-group-item data-row ${rowClass}"><input class="form-check-input" type="checkbox" data-id="${item.id}">${contentHtml}</div>`;
    }

    function updateProceedButton(totalErrorCount) {
        const proceedButtonHtml = `<button id="proceed-to-step2-btn" class="btn btn-lg btn-primary">All Clear! Proceed to Step 2 <i class="fas fa-arrow-right"></i></button>`;
        if (totalErrorCount === 0 && Object.keys(yearlyData).length > 0) {
            $('#top-proceed-container').html(proceedButtonHtml.replace('btn-lg', 'btn-sm'));
            selectors.bottomProceedContainer.html(proceedButtonHtml);
        } else {
            $('#top-proceed-container').empty();
            selectors.bottomProceedContainer.empty();
        }
    }

    // --- Spell Check Functions ---
    async function runSpellCheck() {
        if (!spell) return alert("Spell checker is not ready.");
        
        selectors.spellCheckBtn.prop('disabled', true);
        misspelledWordsData.clear();
        
        const totalLines = Object.values(yearlyData).reduce((acc, lines) => acc + lines.length, 0);
        let linesProcessed = 0;
        const wordRegex = /[a-zA-Z']+/g; // Extracts words, allowing apostrophes

        for (const year of Object.keys(yearlyData)) {
            for (const line of yearlyData[year]) {
                linesProcessed++;
                if (linesProcessed % 20 === 0) {
                     ui.showLoading(`Scanning for mistakes... (${linesProcessed}/${totalLines})`);
                     await new Promise(resolve => setTimeout(resolve, 0));
                }
                
                const words = line.rawText.match(wordRegex) || [];
                for (const word of words) {
                    const cleanWord = word.toLowerCase();
                    if (ignoredWords.has(cleanWord) || knowledgeBase.isKnownWord(cleanWord) || spell.check(cleanWord)) {
                        continue;
                    }
                    if (!misspelledWordsData.has(cleanWord)) {
                        misspelledWordsData.set(cleanWord, []);
                    }
                    misspelledWordsData.get(cleanWord).push({
                        lineId: line.id,
                        year: year,
                        isCorrected: false
                    });
                }
            }
        }
        
        ui.hideLoading();
        renderSpellCheckResults();
        updateSpellCheckStats();
        selectors.spellCheckBtn.prop('disabled', false);
    }
    
    function renderSpellCheckResults() {
        selectors.spellCheckResults.empty();
        if (misspelledWordsData.size === 0) {
            selectors.spellCheckResults.html('<div class="alert alert-success mt-2">No spelling mistakes found!</div>');
            return;
        }

        const sortedWords = Array.from(misspelledWordsData.keys()).sort();
        
        sortedWords.forEach(word => {
            const occurrences = misspelledWordsData.get(word);
            const total = occurrences.length;
            const correctedCount = occurrences.filter(o => o.isCorrected).length;
            
            let statusColorClass = 'text-danger';
            if (correctedCount > 0 && correctedCount < total) statusColorClass = 'text-warning';
            else if (correctedCount === total) statusColorClass = 'text-success';
            
            const accordionId = `spell-word-${word}`;
            const listItemsHtml = occurrences.map((occ, index) => {
                const lineData = yearlyData[occ.year].find(l => l.id === occ.lineId);
                const highlightRegex = new RegExp(`\\b(${word})\\b`, 'gi');
                const lineDisplay = occ.isCorrected ? lineData.rawText : lineData.rawText.replace(highlightRegex, `<span class="misspelled-highlight">$1</span>`);
                return `<li class="list-group-item d-flex align-items-center"><input class="form-check-input me-3" type="checkbox" data-line-id="${occ.lineId}" id="check-${word}-${index}" checked><label class="form-check-label flex-grow-1" for="check-${word}-${index}"><strong>[${occ.year}]</strong> ${lineDisplay}</label></li>`;
            }).join('');
            
            const selectControls = total > 1 ? `<div class="form-check"><input class="form-check-input select-all-btn" type="checkbox" data-word="${word}" checked><label class="form-check-label">All</label></div><div class="form-check"><input class="form-check-input select-none-btn" type="checkbox" data-word="${word}"><label class="form-check-label">None</label></div>` : '';

            const accordionItemHtml = `
                <div class="accordion-item" id="accordion-item-${word}">
                    <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}"><strong class="${statusColorClass}">${word}</strong>&nbsp;(${correctedCount}/${total} corrected)</button></h2>
                    <div id="${accordionId}" class="accordion-collapse collapse" data-bs-parent="#spell-check-results">
                        <div class="accordion-body">
                            <div class="d-flex align-items-center gap-3 mb-2 p-2 bg-dark rounded">
                                ${selectControls}
                                <div class="input-group input-group-sm ms-auto">
                                    <input type="text" class="form-control correction-input" placeholder="Enter correction...">
                                    <button class="btn btn-primary apply-correction-btn" data-word="${word}">Apply</button>
                                    <button class="btn btn-secondary not-mistake-btn" data-word="${word}">Not a Mistake</button>
                                </div>
                            </div>
                            <ul class="list-group">${listItemsHtml}</ul>
                        </div>
                    </div>
                </div>`;
            selectors.spellCheckResults.append(accordionItemHtml);
        });
    }

    function updateSpellCheckStats() {
        const totalSuspected = misspelledWordsData.size;
        let totalCorrected = 0;
        misspelledWordsData.forEach(occurrences => {
            if (occurrences.every(o => o.isCorrected)) {
                totalCorrected++;
            }
        });
        selectors.spellCheckStats.html(`<span class="text-danger">${totalSuspected} suspected</span> / <span class="text-success">${totalCorrected} corrected</span>`);
    }

    function showUndoNotification(word, removedOccurrences) {
        const toastId = `undo-${Date.now()}`;
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-bg-dark border-0 undo-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        '${word}' is marked as not a mistake.
                        <button class="btn btn-sm btn-link text-info p-0 ms-2 undo-action-btn">Undo</button>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`;
        
        selectors.undoNotificationArea.append(toastHtml);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 6000 });
        
        $(`#${toastId} .undo-action-btn`).on('click', function() {
            ignoredWords.delete(word);
            misspelledWordsData.set(word, removedOccurrences);
            renderSpellCheckResults();
            updateSpellCheckStats();
            toast.hide();
        });
        
        toast.show();
    }

    async function runFindAndReplaceSearch() {
        const findTerm = selectors.findInput.val();
        if (!findTerm) {
            alert("Please enter a term to find.");
            return;
        }
        const searchType = $('input[name="find-type"]:checked').val();
        let regex;
        try {
            if (searchType === 'word') {
                regex = new RegExp(`\\b(${findTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'gi');
            } else if (searchType === 'regex') {
                regex = new RegExp(`(${findTerm})`, 'g');
            } else {
                regex = new RegExp(`(${findTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
            }
        } catch (e) {
            alert("Invalid Regular Expression. Please check your syntax.");
            return;
        }
        selectors.findBtn.prop('disabled', true);
        ui.showLoading("Searching...");
        findResults = [];
        let totalMatches = 0;
        for (const year of Object.keys(yearlyData).sort()) {
            let lastDate = "";
            for (const line of yearlyData[year]) {
                if (line.type === 'date') lastDate = line.rawText;
                await new Promise(resolve => setTimeout(resolve, 0));
                ui.showLoading(`Searching ${year}... (${lastDate})`);
                const matches = [...line.rawText.matchAll(regex)];
                if (matches.length > 0) {
                    totalMatches += matches.length;
                    findResults.push({
                        lineId: line.id,
                        year: year
                    });
                }
            }
        }
        ui.hideLoading();
        renderFindResults(regex, totalMatches);
        selectors.findBtn.prop('disabled', false);
    }

    function renderFindResults(regex, totalMatches) {
        selectors.findResultsList.empty();
        const findText = selectors.findInput.val();
        const replaceText = selectors.replaceInput.val();

        if (findResults.length === 0) {
            selectors.findResultsSummary.text("No matches found.");
            selectors.findResultsContainer.hide();
            selectors.replaceBtn.prop('disabled', true); // Explicitly disable if no results
            return;
        }

        selectors.findResultsSummary.text(`Found ${totalMatches} match(es) in ${findResults.length} line(s).`);
        findResults.forEach((result, index) => {
            const lineData = yearlyData[result.year].find(l => l.id === result.lineId);
            const highlightedText = lineData.rawText.replace(regex, `<span class="find-highlight">$1</span>`);
            const listItem = `
                <div class="list-group-item">
                    <div class="form-check">
                        <input class="form-check-input find-result-checkbox" type="checkbox" value="" id="find-check-${index}" data-result-index="${index}" checked>
                        <label class="form-check-label" for="find-check-${index}">
                            <strong>[${result.year}]</strong> ${highlightedText}
                        </label>
                    </div>
                </div>`;
            selectors.findResultsList.append(listItem);
        });

        selectors.findSelectAll.prop('checked', true);
        selectors.findResultsContainer.show();
        
        // **FIX**: Activate the replace button immediately based on the find/replace text.
        // This allows replacing with an empty string.
        selectors.replaceBtn.prop('disabled', findText === replaceText);
    }    

    function attachEventListeners() {
        // DETACH ALL PREVIOUS LISTENERS
        selectors.fileUpload.off();
        selectors.loadDummyBtn.off();
        selectors.stickyHeader.off();
        selectors.dataContainer.off();
        selectors.spellCheckSection.off();
        selectors.spellCheckResults.off();
        selectors.downloadIgnoredBtn.off();
        selectors.uploadIgnoredBtn.off();
        selectors.findReplaceSection.off();
        selectors.findResultsContainer.off();        
        $('body').off('click', '#proceed-to-step2-btn');        
        // Initial load listeners
        const fileDataPromises = (files) => Array.from(files).map(file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve({ fileName: file.name, content: e.target.result });
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        }));

        selectors.fileUpload.on('change', function(event) {
            if (!event.target.files.length) return;
            const fileReadPromises = Array.from(event.target.files).map(file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve({ fileName: file.name, content: e.target.result });
                reader.onerror = reject;
                reader.readAsText(file);
            }));            
            Promise.all(fileReadPromises).then(loadedFiles => {
                if (Object.keys(yearlyData).length > 0) {
                    ui.showMergeConflictModal(choice => {
                        if (choice === 'replace') {
                            // Clear existing data before loading
                            Object.keys(yearlyData).forEach(key => delete yearlyData[key]);
                            loadData(loadedFiles);
                        } else if (choice === 'merge') {
                            // Merge logic for Step 1
                            loadedFiles.forEach(file => {
                                const yearMatch = file.fileName.match(/\d{4}/);
                                const year = yearMatch ? yearMatch[0] : 'Unsorted';
                                // Only add the year if it doesn't already exist
                                if (!yearlyData[year]) {
                                     handleDataLoad([file]); // Use handleDataLoad to process and add the new year
                                }
                            });
                            validateAndRender(); // Re-validate after merge
                        }
                    });
                } else {
                    // If no data exists, load directly
                    loadData(loadedFiles);
                }
            });
            $(this).val(''); // Reset file input
        });
        selectors.loadDummyBtn.on('click', () => handleDataLoad(dummyData));

        // Event delegation for dynamic elements
        const header = selectors.stickyHeader;
        const container = selectors.dataContainer;

        header.off(); // Clear previous delegated listeners
        container.off();
        selectors.spellCheckSection.off();

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
            if (Object.keys(yearlyData).length === 0) return;
            
            if (!confirm(`This will attempt to download ${Object.keys(yearlyData).length} file(s). Continue?`)) {
                return;
            }

            try {
                Object.entries(yearlyData).forEach(([year, lines]) => {
                    const textToSave = lines.map(line => line.rawText).join('\n');
                    const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Step1_cleaned_${year}.txt`;
                    
                    // This triggers the download. A slight delay between downloads can help prevent browser blocking.
                    setTimeout(() => {
                        a.click();
                        URL.revokeObjectURL(url);
                    }, 200); // 200ms delay between each file download
                });
                logger.info("Initiated save for all yearly data.");
            } catch (e) {
                logger.error("Failed to save files.", e);
                alert("Could not save the files due to a browser error.");
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
        
        $('body').off('click', '#proceed-to-step2-btn').on('click', '#proceed-to-step2-btn', function() {            
            logger.info("Step 1 complete. Passing data to global state.");
            
            if (!window.appState.step1) window.appState.step1 = {};
            window.appState.step1.finalData = yearlyData;
            
            if (window.navigationCallback) window.navigationCallback(2);
        });                

        // --- NEW: Spell Check Event Listeners ---
        selectors.spellCheckSection.on('click', '#spell-check-btn', runSpellCheck);

        selectors.spellCheckResults.on('click', '.apply-correction-btn', function() {
            const word = $(this).data('word');
            const correctionInput = $(this).closest('.input-group').find('.correction-input');
            const correction = correctionInput.val().trim();
            if (!correction) {
                correctionInput.focus();
                return;
            }

            $(this).closest('.accordion-body').find('input[type="checkbox"]:checked').each(function() {
                const lineId = $(this).data('line-id');
                const occurrences = misspelledWordsData.get(word);
                const occ = occurrences.find(o => o.lineId === lineId);
                
                if (occ && !occ.isCorrected) {
                    const line = yearlyData[occ.year].find(l => l.id === lineId);
                    const replaceRegex = new RegExp(`\\b${word}\\b`, 'gi');
                    line.rawText = line.rawText.replace(replaceRegex, correction);
                    occ.isCorrected = true;
                }
            });
            
            validateAndRender();
            renderSpellCheckResults();
            updateSpellCheckStats();
        });

        selectors.spellCheckResults.on('click', '.not-mistake-btn', function() {
            const word = $(this).data('word');
            const occurrences = misspelledWordsData.get(word);
            
            ignoredWords.add(word);
            spell.addDictionary([word]); // Add to the live dictionary
            
            misspelledWordsData.delete(word);
            $(this).closest('.accordion-item').remove();
            
            if (misspelledWordsData.size === 0) renderSpellCheckResults();
            updateSpellCheckStats();
            
            ui.showUndoNotification(`'${word}' is marked as not a mistake.`, () => {
                ignoredWords.delete(word);
                spell.removeWords([word]); // Remove from the live dictionary
                misspelledWordsData.set(word, occurrences);
                renderSpellCheckResults();
                updateSpellCheckStats();
            });
        });
        
        selectors.spellCheckResults.on('change', '.select-all-btn', function() {
            const word = $(this).data('word');
            $(this).closest('.accordion-body').find('.list-group-item input[type="checkbox"]').prop('checked', true);
            $(this).prop('checked', true);
            $(this).closest('.accordion-body').find('.select-none-btn').prop('checked', false);
        });

        selectors.spellCheckResults.on('change', '.select-none-btn', function() {
            const word = $(this).data('word');
            $(this).closest('.accordion-body').find('.list-group-item input[type="checkbox"]').prop('checked', false);
            $(this).prop('checked', true);
             $(this).closest('.accordion-body').find('.select-all-btn').prop('checked', false);
        });

        selectors.downloadIgnoredBtn.on('click', function() {
            if (ignoredWords.size === 0) {
                alert("No words have been marked as 'Not a mistake'.");
                return;
            }
            const dataStr = JSON.stringify(Array.from(ignoredWords));
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ignored_words.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        selectors.uploadIgnoredBtn.on('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const words = JSON.parse(e.target.result);
                    if (Array.isArray(words)) {
                        words.forEach(word => ignoredWords.add(word.toLowerCase()));
                        spell.addDictionary(words); // Add all loaded words to the live dictionary
                        
                        logger.info(`Loaded ${words.length} words into the ignore list.`);
                        
                        if (misspelledWordsData.size > 0) {
                           // ... (rest of the logic is unchanged) ...
                        }
                    } else { throw new Error("File is not a valid JSON array."); }
                } catch (err) { alert("Error reading ignored words file."); logger.error(err); }
            };
            reader.readAsText(file);
            $(this).val('');
        });

        selectors.findReplaceSection.on('click', '#find-btn', runFindAndReplaceSearch);
        selectors.findReplaceSection.on('input', '#find-input, #replace-input', function() {
            const findText = selectors.findInput.val();
            const replaceText = selectors.replaceInput.val();
            const hasResults = findResults.length > 0;
            // The button is disabled if there are no results OR if the text is identical.
            selectors.replaceBtn.prop('disabled', !hasResults || findText === replaceText);
        });

        selectors.findResultsContainer.on('change', '#find-select-all', function() {
            const isChecked = $(this).is(':checked');
            $('.find-result-checkbox').prop('checked', isChecked);
        });

        selectors.findResultsContainer.on('click', '#replace-btn', function() {
            const findTerm = selectors.findInput.val();
            const replaceTerm = selectors.replaceInput.val();
            const searchType = $('input[name="find-type"]:checked').val();
            let regex;
            
            try {
                if (searchType === 'word') regex = new RegExp(`\\b${findTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
                else if (searchType === 'regex') regex = new RegExp(findTerm, 'g');
                else regex = new RegExp(findTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
            } catch (e) {
                alert("Invalid find term for replacement."); return;
            }

            $('.find-result-checkbox:checked').each(function() {
                const resultIndex = $(this).data('result-index');
                const result = findResults[resultIndex];
                const line = yearlyData[result.year].find(l => l.id === result.lineId);
                if (line) {
                    line.rawText = line.rawText.replace(regex, replaceTerm);
                }
            });

            validateAndRender();
            selectors.findResultsContainer.hide();
            selectors.findResultsList.empty();
            findResults = []; // Clear results after replacement
            logger.info("Replacement complete.");
        });             

    }

    return { init };

})(logger, LineRecognizerService, uiService, KnowledgeBaseService);