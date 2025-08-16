/**
 * @file step4Controller.js
 * @description Manages the details table for Step 4.
 */
const Step4Controller = (function(logger, ui, knowledgeBase) {

    const selectors = {
        tableHeader: $('#step4-table-header'),
        tableBody: $('#step4-table-body'),
        addColumnBtn: $('#step4-add-column-btn'),
        saveBtn: $('#step4-save-btn'),
        loadInput: $('#step4-load-input'),
        proceedTopBtn: $('#step4-proceed-top'),
        proceedBottomBtn: $('#step4-proceed-bottom'),
        suggestionsContainer: $('#step4-suggestions-container')
    };

    const defaultColumns = ["Composition", "Nutrition", "Contaminants/Side Effects", "Effective Duration"];
    let customColumns = [];
    let detailsData = new Map();
    let navCallback = null;
    let activeTextarea = null;

    function init(navigationCallback) {
        logger.info("Initializing Step 4: Add Details.");
        navCallback = navigationCallback;
        const tagsFromStep3 = window.appState?.step3?.tags;
        if (!tagsFromStep3 || tagsFromStep3.size === 0) {
            selectors.tableBody.html('<tr><td colspan="5" class="text-center">No tags were selected in Step 3.</td></tr>');
            return;
        }
        initializeData(tagsFromStep3);
        render();
        attachEventListeners();
    }

    /** Shows autocomplete suggestions positioned below the active textarea. */
    function showSuggestions(suggestions, element) {
        if (suggestions.length === 0) {
            hideSuggestions();
            return;
        }
        const pos = element.position();
        const height = element.outerHeight();
        selectors.suggestionsContainer
            .html(suggestions.map(s => `<li class="list-group-item">${s}</li>`).join(''))
            .css({ top: pos.top + height, left: pos.left, width: element.outerWidth() })
            .show();
    }
    
    /** Hides the autocomplete suggestions box. */
    function hideSuggestions() {
        selectors.suggestionsContainer.hide();
    }

    /** Populates the detailsData Map from Step 3 tags and the knowledge base. */
    function initializeData(tags) {
        detailsData.clear();
        customColumns = [];
        tags.forEach((tagData, tag) => {
            const prefilledInfo = knowledgeBase.getInfo(tag);
            const rowData = new Map();
            defaultColumns.forEach(col => {
                rowData.set(col, prefilledInfo?.[col] || '');
            });
            detailsData.set(tag, rowData);
        });
        logger.info(`Initialized details for ${detailsData.size} tags.`);
    }

    /** Renders the entire table from the current state. */
    function render() {
        const allColumns = ['Tag', ...defaultColumns, ...customColumns];
        const headerHtml = `<tr>${allColumns.map(col => `<th>${col}</th>`).join('')}</tr>`;
        selectors.tableHeader.html(headerHtml);
        let bodyHtml = '';
        detailsData.forEach((rowData, tag) => {
            bodyHtml += `<tr data-tag="${escape(tag)}">`;
            bodyHtml += `<td><strong>${tag}</strong></td>`;
            allColumns.slice(1).forEach(col => {
                const value = rowData.get(col) || '';
                bodyHtml += `<td><textarea class="form-control form-control-sm" data-column="${escape(col)}">${value}</textarea></td>`;
            });
            bodyHtml += `</tr>`;
        });
        selectors.tableBody.html(bodyHtml);
    }

    function attachEventListeners() {
        selectors.addColumnBtn.off().on('click', function() {
            const columnName = prompt("Enter the name for the new column:");
            if (columnName && columnName.trim() && !defaultColumns.includes(columnName) && !customColumns.includes(columnName)) {
                customColumns.push(columnName.trim());
                detailsData.forEach(rowData => rowData.set(columnName.trim(), ''));
                render();
            } else if (columnName) {
                alert("Column name is invalid or already exists.");
            }
        });

        // --- Save and Load ---
        selectors.saveBtn.off().on('click', function() {
            const stateToSave = {
                customColumns: customColumns,
                details: Array.from(detailsData.entries()).map(([tag, dataMap]) => [tag, Array.from(dataMap.entries())])
            };
            const dataStr = JSON.stringify(stateToSave, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Step4_details_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        });
        
        selectors.loadInput.off().on('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const state = JSON.parse(event.target.result);
                    if (!state.customColumns || !state.details) throw new Error("Invalid format.");
                    customColumns = state.customColumns;
                    detailsData = new Map(state.details.map(([tag, data]) => [tag, new Map(data)]));
                    render();
                } catch (err) { alert("Error loading Step 4 file."); }
            };
            reader.readAsText(file);
            $(this).val('');
        });      

        // --- Autocomplete and Data Binding ---
        selectors.tableBody.off()
            .on('input', 'textarea', function() {
                const textarea = $(this);
                const tag = unescape(textarea.closest('tr').data('tag'));
                const column = unescape(textarea.data('column'));
                const value = textarea.val();
                if (detailsData.has(tag)) detailsData.get(tag).set(column, value);
            })
            .on('keyup', 'textarea', function() {
                activeTextarea = $(this);
                const query = activeTextarea.val().split(/,\s*|\s+/).pop().toLowerCase();
                if (query.length < 2) { hideSuggestions(); return; }
                
                // CORRECTED: This call will now work correctly.
                const allKeywords = new Set(knowledgeBase.getAllKeywords());
                detailsData.forEach(row => row.forEach(val => val.split(/,\s*/).forEach(w => allKeywords.add(w.trim()))));
                
                const suggestions = Array.from(allKeywords).filter(k => k.toLowerCase().startsWith(query));
                showSuggestions(suggestions.slice(0, 10), activeTextarea);
            })
            .on('focus', 'textarea', function() { activeTextarea = $(this); })
            .on('blur', 'textarea', function() { setTimeout(hideSuggestions, 200); });


            selectors.suggestionsContainer.off().on('mousedown', 'li', function(e) {
                e.preventDefault();
                if (!activeTextarea) return;
                const suggestion = $(this).text();
                const currentValue = activeTextarea.val();
                const words = currentValue.split(/,\s*|\s+/);
                words.pop();
                words.push(suggestion);
                activeTextarea.val(words.join(', ') + ' ').focus();
                activeTextarea.trigger('input');
                hideSuggestions();
            });

            const proceedAction = function() {
                if (!window.appState.step4) window.appState.step4 = {};
                window.appState.step4.finalData = {
                    step2Data: window.appState.step2.finalData,
                    details: Object.fromEntries(Array.from(detailsData.entries()).map(([k, v]) => [k, Object.fromEntries(v)]))
                };
                logger.info("Proceeding to Visualization with enriched data.");
                alert("Proceeding to Visualization (to be built)!");
            };
            selectors.proceedTopBtn.off().on('click', proceedAction);
            selectors.proceedBottomBtn.off().on('click', proceedAction);
    }

    return { init };
})(logger, uiService, KnowledgeBaseService);