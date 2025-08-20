const Step4Controller = (function(logger, ui, knowledgeBase) {

    const selectors = {
        container: $('#step-4-content'),
        stickyHeader: $('#step4-sticky-header'),
        tableHeader: $('#step4-table-header'),
        tableBody: $('#step4-table-body'),
        addColumnBtn: $('#step4-add-column-btn'),
        saveBtn: $('#step4-save-btn'),
        loadInput: $('#step4-load-input'),
        proceedTopBtn: $('#step4-proceed-top'),
        proceedBottomBtn: $('#step4-proceed-bottom'),
        step2DataDisplay: $('#step4-step2-data-display'),
        step3DataDisplay: $('#step4-step3-data-display'),
    };

    let state = {};
    let navCallback = null;
    let searchResults = [];
    let currentSearchIndex = -1;

    const DEFAULT_HEADERS = ['Tags', 'Composition', 'Nutrition', 'Contaminants/Side-Effects', 'Duration'];
    // Defines the sorting order for categories in the table
    const CATEGORY_SORT_ORDER = {
        'food': 1,
        'contaminant': 2,
        'medication': 3,
        'symptom': 4,
        'action': 10,
        'anatomy': 11,
        'none': 99
    };


    function setDefaultState() {
        state = {
            headers: [...DEFAULT_HEADERS],
            rows: []
        };
    }

    function init(navigationCallback, payload) {
        logger.info("Initializing Step 4: Add Details.");
        navCallback = navigationCallback;
        setDefaultState();

        if (payload) {
            loadState(payload);
        } else {
            const dataFromStep2 = window.appState?.step2?.finalData;
            const dataFromStep3 = window.appState?.step3?.finalData;

            if (!dataFromStep3 || dataFromStep3.groups.length === 0) {
                selectors.tableBody.html('<tr><td colspan="5" class="text-center alert alert-warning">No data to process. Please complete Step 3 or load a file.</td></tr>');
                attachEventListeners();
                return;
            }
            processNewData(dataFromStep2, dataFromStep3);
        }
    }

    function loadState(savedState) {
        ui.showLoading("Loading saved state for Step 4...");
        setTimeout(() => {
            state = savedState;
            const dataFromStep2 = window.appState?.step2?.finalData;
            const dataFromStep3 = window.appState?.step3?.finalData;
            render(dataFromStep2, dataFromStep3);
            attachEventListeners();
            ui.hideLoading();
        }, 50);
    }
    
    function processNewData(dataFromStep2, dataFromStep3) {
        ui.showLoading("Processing data from previous steps...");
        setTimeout(() => {
            const groups = dataFromStep3.groups;
            
            state.rows = groups.map(group => {
                const newRow = {
                    groupId: group.id,
                    categoryId: group.categoryId,
                    tags: group.tags,
                    displayTags: group.tags.map(t => t.text).join(', '),
                    details: {}
                };
                
                // Pre-fill details from Knowledge Base
                const mergedDetails = {};
                group.tags.forEach(tag => {
                    const info = knowledgeBase.getInfo(tag.text);
                    if (info) {
                        for (const [key, value] of Object.entries(info)) {
                            if (!mergedDetails[key]) mergedDetails[key] = new Set();
                            // Add details, splitting by semicolon to handle multiple entries
                            value.split(';').forEach(v => mergedDetails[key].add(v.trim()));
                        }
                    }
                });

                // Convert sets back to strings for display
                for (const key in mergedDetails) {
                    newRow.details[key] = Array.from(mergedDetails[key]).join('; ');
                }

                return newRow;
            });
            
            sortRows();
            render(dataFromStep2, dataFromStep3);
            attachEventListeners();
            ui.hideLoading();
        }, 50);
    }

    function sortRows() {
        state.rows.sort((a, b) => {
            const orderA = CATEGORY_SORT_ORDER[a.categoryId] || 50;
            const orderB = CATEGORY_SORT_ORDER[b.categoryId] || 50;
            if (orderA !== orderB) return orderA - orderB;
            // If categories are the same, sort alphabetically by tags
            return a.displayTags.localeCompare(b.displayTags);
        });
    }

    function render(dataFromStep2, dataFromStep3) {
        renderRawDataAccordions(dataFromStep2, dataFromStep3);
        renderHeader();
        renderBody();
    }

    function renderRawDataAccordions(step2Data, step3Data) {
        selectors.step2DataDisplay.text(step2Data ? JSON.stringify(step2Data, null, 2) : 'Step 2 data is not available.');
        selectors.step3DataDisplay.text(step3Data ? JSON.stringify(step3Data, null, 2) : 'Step 3 data is not available.');
    }

    function renderHeader() {
        const searchControls = `
             <div class="col-md-4">
                <div class="input-group input-group-sm">
                    <input type="search" id="step4-search-input" class="form-control" placeholder="Search table...">
                    <button class="btn btn-outline-secondary" id="step4-search-prev" disabled><i class="fas fa-chevron-up"></i></button>
                    <button class="btn btn-outline-secondary" id="step4-search-next" disabled><i class="fas fa-chevron-down"></i></button>
                </div>
            </div>
            <div class="col-md-8 text-end" id="step4-search-status"></div>
        `;
        // Inject search controls into the sticky header
        selectors.stickyHeader.find('.d-flex.align-items-center').after(`<div class="row mt-2 align-items-center">${searchControls}</div>`);


        let headerHtml = '<tr>';
        state.headers.forEach(header => {
            headerHtml += `<th scope="col">${header}`;
            // Add delete button for custom columns
            if (!DEFAULT_HEADERS.includes(header)) {
                 headerHtml += ` <i class="fas fa-times-circle text-danger delete-column-btn" style="cursor:pointer;" title="Delete '${header}' Column" data-header="${header}"></i>`;
            }
            headerHtml += '</th>';
        });
        headerHtml += '</tr>';
        selectors.tableHeader.html(headerHtml);
    }

    function renderBody() {
        let bodyHtml = '';
        const dataFromStep3 = window.appState?.step3?.finalData;
        const categories = dataFromStep3 ? new Map(dataFromStep3.categories.map(c => [c.id, c])) : new Map();

        state.rows.forEach((row, rowIndex) => {
            bodyHtml += `<tr data-row-index="${rowIndex}">`;
            state.headers.forEach(header => {
                if (header === 'Tags') {
                    const category = categories.get(row.categoryId) || { color: '#6c757d', name: 'Unknown' };
                    const tagsHtml = row.tags.map(tag => 
                        `<span class="word-tag" style="background-color:${category.color};">${tag.text}</span>`
                    ).join(' ');
                    bodyHtml += `<td class="text-nowrap">${tagsHtml}</td>`;
                } else {
                    const value = row.details[header] || '';
                    bodyHtml += `<td><textarea class="form-control" data-header="${header}">${value}</textarea></td>`;
                }
            });
            bodyHtml += `</tr>`;
        });
        selectors.tableBody.html(bodyHtml);
    }

    function attachEventListeners() {
        selectors.container.off(); // Clear all previous delegated listeners for this step
        
        selectors.addColumnBtn.on('click', function() {
            const newColumnName = prompt("Enter the name for the new column:");
            if (newColumnName && !state.headers.includes(newColumnName)) {
                state.headers.push(newColumnName);
                state.rows.forEach(row => {
                    row.details[newColumnName] = '';
                });
                renderHeader();
                renderBody();
            } else if (newColumnName) {
                alert("A column with this name already exists.");
            }
        });

        selectors.tableHeader.on('click', '.delete-column-btn', function() {
            const headerToDelete = $(this).data('header');
            if (confirm(`Are you sure you want to delete the "${headerToDelete}" column?`)) {
                state.headers = state.headers.filter(h => h !== headerToDelete);
                state.rows.forEach(row => {
                    delete row.details[headerToDelete];
                });
                renderHeader();
                renderBody();
            }
        });
        
        selectors.tableBody.on('input', 'textarea', function() {
            const rowIndex = $(this).closest('tr').data('row-index');
            const header = $(this).data('header');
            state.rows[rowIndex].details[header] = $(this).val();
            window.appState.isDirty = true;
        });
        
        selectors.saveBtn.on('click', function() {
            const stateToSave = { step: 4, data: state };
            const dataStr = JSON.stringify(stateToSave, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Step4_details_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            logger.info("Step 4 data saved.");
        });

        selectors.loadInput.on('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const loadedData = JSON.parse(e.target.result);
                    if (loadedData.step !== 4 || !loadedData.data) throw new Error("Invalid Step 4 file format.");
                    
                    const performLoad = (mode) => {
                        if (mode === 'replace') {
                            state = loadedData.data;
                        } else if (mode === 'merge') {
                            // Merge headers
                            loadedData.data.headers.forEach(h => {
                                if (!state.headers.includes(h)) state.headers.push(h);
                            });
                            // Merge rows by groupId
                            const existingRows = new Map(state.rows.map(r => [r.groupId, r]));
                            loadedData.data.rows.forEach(loadedRow => {
                                if (existingRows.has(loadedRow.groupId)) {
                                    const existingRow = existingRows.get(loadedRow.groupId);
                                    Object.assign(existingRow.details, loadedRow.details);
                                } else {
                                    state.rows.push(loadedRow);
                                }
                            });
                        }
                        render(window.appState?.step2?.finalData, window.appState?.step3?.finalData);
                    };
                    
                    if (state.rows.length > 0) {
                        ui.showMergeConflictModal(choice => performLoad(choice));
                    } else {
                        performLoad('replace');
                    }
                    
                } catch (err) {
                    alert("Error reading or parsing the Step 4 file.");
                    logger.error("Failed to load Step 4 file.", err);
                }
            };
            reader.readAsText(file);
            $(this).val('');
        });

        const proceedAction = function() {
            if (confirm("Are you sure you want to finalize details and proceed to visualization?")) {
                if (!window.appState.step4) window.appState.step4 = {};
                window.appState.step4.finalData = state;
                logger.info("Step 4 complete. Passing all data to global state for Step 5.");
                if (navCallback) navCallback(5);
            }
        };

        selectors.proceedTopBtn.on('click', proceedAction);
        selectors.proceedBottomBtn.on('click', proceedAction);
        
        // --- Search Listeners ---
        selectors.container.on('input', '#step4-search-input', function() {
            const query = $(this).val().toLowerCase().trim();
            // Remove previous highlights
            selectors.tableBody.find('tr').removeClass('table-primary');
            
            if (query === '') {
                searchResults = [];
                currentSearchIndex = -1;
                $('#step4-search-prev, #step4-search-next').prop('disabled', true);
                $('#step4-search-status').text('');
                return;
            }
            
            searchResults = [];
            selectors.tableBody.find('tr').each(function() {
                const rowText = $(this).text().toLowerCase();
                if (rowText.includes(query)) {
                    searchResults.push(this);
                }
            });

            if (searchResults.length > 0) {
                currentSearchIndex = 0;
                highlightSearchResult();
                $('#step4-search-prev, #step4-search-next').prop('disabled', searchResults.length <= 1);
            } else {
                currentSearchIndex = -1;
                 $('#step4-search-prev, #step4-search-next').prop('disabled', true);
                 $('#step4-search-status').text('No matches found.');
            }
        });
        
        selectors.container.on('click', '#step4-search-next', function() {
            if (searchResults.length === 0) return;
            currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
            highlightSearchResult();
        });

        selectors.container.on('click', '#step4-search-prev', function() {
            if (searchResults.length === 0) return;
            currentSearchIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
            highlightSearchResult();
        });

    }
    
    function highlightSearchResult() {
        selectors.tableBody.find('tr').removeClass('table-primary');
        const currentResult = $(searchResults[currentSearchIndex]);
        currentResult.addClass('table-primary');
        currentResult[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('#step4-search-status').text(`Showing ${currentSearchIndex + 1} of ${searchResults.length}`);
    }

    return { init };

})(logger, uiService, KnowledgeBaseService);