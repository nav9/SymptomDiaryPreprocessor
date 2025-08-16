/**
 * @file step4Controller.js
 * @description Manages the details table for Step 4.
 */
const Step4Controller = (function(logger, ui, knowledgeBase) {

    const selectors = {
        tableHeader: $('#step4-table-header'),
        tableBody: $('#step4-table-body'),
        addColumnBtn: $('#step4-add-column-btn'),
        proceedTopBtn: $('#step4-proceed-top'),
        proceedBottomBtn: $('#step4-proceed-bottom'),
    };

    const defaultColumns = ["Composition", "Nutrition", "Contaminants/Side Effects", "Effective Duration"];
    let customColumns = [];
    let detailsData = new Map(); // Map<tag, Map<columnName, value>>
    let navCallback = null;

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
        // Render Header
        const allColumns = ['Tag', ...defaultColumns, ...customColumns];
        const headerHtml = `<tr>${allColumns.map(col => `<th>${col}</th>`).join('')}</tr>`;
        selectors.tableHeader.html(headerHtml);

        // Render Body
        let bodyHtml = '';
        detailsData.forEach((rowData, tag) => {
            bodyHtml += `<tr data-tag="${escape(tag)}">`;
            bodyHtml += `<td><strong>${tag}</strong></td>`; // The tag itself
            
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
                // Initialize new column with empty values for all tags
                detailsData.forEach(rowData => {
                    rowData.set(columnName.trim(), '');
                });
                render();
            } else if (columnName) {
                alert("Column name is invalid or already exists.");
            }
        });

        // Use event delegation for textareas
        selectors.tableBody.off().on('input', 'textarea', function() {
            const textarea = $(this);
            const tag = unescape(textarea.closest('tr').data('tag'));
            const column = unescape(textarea.data('column'));
            const value = textarea.val();

            if (detailsData.has(tag)) {
                detailsData.get(tag).set(column, value);
            }
        });

        const proceedAction = function() {
            if (!window.appState.step4) window.appState.step4 = {};
            // Pass both the original Step 2 data and the new details data
            window.appState.step4.finalData = {
                step2Data: window.appState.step2.finalData,
                details: Object.fromEntries(
                    Array.from(detailsData.entries()).map(([k, v]) => [k, Object.fromEntries(v)])
                )
            };
            logger.info("Proceeding to Visualization with enriched data.");
            alert("Proceeding to Visualization (to be built)!");
        };
        selectors.proceedTopBtn.off().on('click', proceedAction);
        selectors.proceedBottomBtn.off().on('click', proceedAction);
    }

    return { init };
})(logger, uiService, KnowledgeBaseService);