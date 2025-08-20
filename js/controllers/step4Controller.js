const Step4Controller = (function(logger, ui, knowledgeBase) {

    const selectors = {
        container: $('#step-4-content'),
        stickyHeader: $('#step4-sticky-header'),
        tableContainer: $('#step4-table-container'),
        proceedBottomBtn: $('#step4-proceed-bottom'),
    };

    let state = {};
    let navCallback = null;

    function setDefaultState() {
        state = {
            headers: ["Composition", "Nutrition", "Contaminants/Side Effects", "Effective Duration"],
            tableData: [] // Holds { group, data: {header: value} }
        };
    }

    function init(navigationCallback, payload) {
        logger.info("Initializing Step 4: Add Details.");
        navCallback = navigationCallback;

        if (payload) {
            loadState(payload);
        } else {
            const step3Data = window.appState?.step3?.finalData;
            if (!step3Data || !step3Data.groups || step3Data.groups.length === 0) {
                setDefaultState();
                render();
                attachEventListeners();
                return;
            }
            processNewData(step3Data);
        }
    }

    function processNewData(step3Data) {
        ui.showLoading("Sorting and enriching categorized data...");
        setTimeout(() => {
            setDefaultState();

            const categoryOrder = ['food', 'contaminant', 'medication'];
            const sortedGroups = [...step3Data.groups].sort((a, b) => {
                const indexA = categoryOrder.indexOf(a.categoryId);
                const indexB = categoryOrder.indexOf(b.categoryId);
                const priorityA = a.categoryId === 'none' ? Infinity : (indexA === -1 ? categoryOrder.length : indexA);
                const priorityB = b.categoryId === 'none' ? Infinity : (indexB === -1 ? categoryOrder.length : indexB);

                if (priorityA !== priorityB) return priorityA - priorityB;
                if (a.categoryId !== b.categoryId) return a.categoryId.localeCompare(b.categoryId);
                return a.tags[0].text.localeCompare(b.tags[0].text);
            });

            state.tableData = sortedGroups.map(group => {
                const rowData = { group, data: {} };
                state.headers.forEach(h => rowData.data[h] = new Set());

                group.tags.forEach(tag => {
                    const info = knowledgeBase.getInfo(tag.text);
                    if (info) {
                        state.headers.forEach(h => {
                            // CORRECTED: Find key case-insensitively without removing spaces.
                            const key = Object.keys(info).find(k => k.toLowerCase() === h.toLowerCase());
                            if (key && info[key]) {
                                rowData.data[h].add(info[key]);
                            }
                        });
                    }
                });

                Object.keys(rowData.data).forEach(key => {
                    rowData.data[key] = Array.from(rowData.data[key]).join('; ');
                });
                return rowData;
            });
            
            render();
            attachEventListeners();
            ui.hideLoading();
        }, 50);
    }
    
    function loadState(savedState) {
        state = savedState;
        logger.info(`Loaded ${state.tableData.length} rows for Step 4.`);
        render();
        attachEventListeners();
    }

    const isColorLight = (hex) => {
        if (!hex) return false;
        const color = hex.substring(1);
        const r = parseInt(color.substring(0, 2), 16), g = parseInt(color.substring(2, 4), 16), b = parseInt(color.substring(4, 6), 16);
        return ((r * 0.299) + (g * 0.587) + (b * 0.114)) > 150;
    };

    function render() {
        renderHeader();
        renderTable();
    }

    function renderHeader() {
        const headerHtml = `
            <div class="d-flex align-items-center gap-2">
                <h5 class="mb-0 me-3">Step 4: Add Details</h5>
                <input type="search" id="step4-search-input" class="form-control form-control-sm" style="max-width: 200px;" placeholder="Search tags...">
                <div class="ms-auto d-flex gap-2 flex-nowrap">
                    <input type="file" id="step4-load-input" class="d-none" accept=".json">
                    <label for="step4-load-input" class="btn btn-sm btn-outline-secondary" title="Load Details Data"><i class="fas fa-upload me-2"></i>Load</label>
                    <button id="step4-save-btn" class="btn btn-sm btn-outline-secondary" title="Save Details Data"><i class="fas fa-download me-2"></i>Save</button>
                    <button id="step4-add-column-btn" class="btn btn-sm btn-success"><i class="fas fa-plus me-2"></i>Add Column</button>
                    <button id="step4-proceed-top" class="btn btn-sm btn-primary">Proceed to Step 5 <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>`;
        selectors.stickyHeader.html(headerHtml);
    }

    function renderTable() {
        const container = selectors.tableContainer.find('table');
        if (!state.tableData || state.tableData.length === 0) {
            selectors.tableContainer.html('<div class="alert alert-info">No categorized groups from Step 3 to detail. You can add categories in Step 3 or proceed directly to Step 5.</div>');
            return;
        }

        const tableHeaderHtml = `<thead><tr>
            <th style="width: 25%;">Tags</th>
            ${state.headers.map(h => `<th>${h}</th>`).join('')}
        </tr></thead>`;
        
        const tableBodyHtml = `<tbody>
            ${state.tableData.map((row, index) => {
                const category = window.appState.step3.finalData.categories.find(c => c.id === row.group.categoryId);
                const textClass = category && isColorLight(category.color) ? 'tag-text-dark' : '';
                return `
                    <tr data-row-index="${index}">
                        <td class="tags-cell">${row.group.tags.map(tag => `<span class="word-tag ${textClass}" style="background-color:${category?.color || '#6c757d'};">${tag.text}</span>`).join(' ')}</td>
                        ${state.headers.map(h => `<td><textarea class="form-control" data-field="${h}" rows="1">${row.data[h] || ''}</textarea></td>`).join('')}
                    </tr>
                `;
            }).join('')}
        </tbody>`;

        if (container.length > 0) {
            container.html(tableHeaderHtml + tableBodyHtml);
        } else {
            selectors.tableContainer.html(`<table class="table table-bordered table-dark table-sm" id="step4-details-table">${tableHeaderHtml}${tableBodyHtml}</table>`);
        }
    }

    function attachEventListeners() {
        const proceedAction = () => {
            if (!window.appState.step4) window.appState.step4 = {};
            window.appState.step4.finalData = state;
            logger.info("Proceeding to Step 5 with all data preserved.");
            if (navCallback) navCallback(5);
        };

        selectors.stickyHeader.off()
            .on('click', '#step4-proceed-top', proceedAction)
            .on('click', '#step4-save-btn', () => {
                const dataStr = JSON.stringify({ step: 4, data: state }, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `Step4_details_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(a.href);
            })
            .on('change', '#step4-load-input', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const loaded = JSON.parse(event.target.result);
                        if (loaded.step !== 4 || !loaded.data) throw new Error("Invalid format");
                        const performLoad = (mode) => {
                            if (mode === 'replace') {
                                loadState(loaded.data);
                            } else if (mode === 'merge') {
                                const newHeaders = new Set([...state.headers, ...loaded.data.headers]);
                                state.headers = Array.from(newHeaders);
                                const existingRowMap = new Map(state.tableData.map(row => [row.group.id, row]));
                                loaded.data.tableData.forEach(newRow => {
                                    if (!existingRowMap.has(newRow.group.id)) {
                                        state.tableData.push(newRow);
                                    }
                                });
                                render();
                            }
                        };
                        if (state.tableData.length > 0) {
                            ui.showMergeConflictModal(choice => performLoad(choice));
                        } else {
                            performLoad('replace');
                        }
                    } catch(err) { alert("Error loading Step 4 file."); logger.error(err); }
                };
                reader.readAsText(file);
                $(e.target).val('');
            })
            .on('input', '#step4-search-input', function() {
                const query = $(this).val().toLowerCase().trim();
                $('#step4-details-table tbody tr').each(function() {
                    const row = $(this);
                    const tagsText = row.find('.tags-cell').text().toLowerCase();
                    row.toggle(tagsText.includes(query));
                });
            })
            .on('click', '#step4-add-column-btn', () => {
                const newHeader = prompt("Enter new column name:");
                if (newHeader && newHeader.trim() && !state.headers.includes(newHeader)) {
                    state.headers.push(newHeader.trim());
                    state.tableData.forEach(row => { row.data[newHeader] = ''; });
                    renderTable();
                }
            });

            selectors.proceedBottomBtn.off().on('click', proceedAction);
        
            selectors.tableContainer.off().on('input', 'textarea', function() {
                const rowIndex = $(this).closest('tr').data('row-index');
                const field = $(this).data('field');
                if (state.tableData[rowIndex]) {
                    state.tableData[rowIndex].data[field] = $(this).val();
                }
            });
        }
    
        return { init };

})(logger, uiService, KnowledgeBaseService);