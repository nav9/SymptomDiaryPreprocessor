const Step2Controller = (function(preprocessor, parser, validator, ui) {

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
                        appState.data.step2.fileData[file.fileName] = validated;
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
     * Extracts a 4-digit year from a filename, or returns null.
     * @param {string} fileName
     * @returns {number|null}
     */
        function extractYearFromFile(fileName) {
            const match = fileName.match(/\d{4}/);
            return match ? parseInt(match[0], 10) : null;
        }

    function revalidateAndRender() {
        if (!currentFile) return;
        ui.showLoading(`Re-validating ${currentFile}...`);
        
        setTimeout(() => {
            try {
                let currentData = state.fileData[currentFile];
                // Update originalLine from any edits before re-validating
                currentData.forEach(item => {
                    const textarea = $(`#textarea-${item.id}`);
                    if (textarea.length) {
                        item.originalLine = textarea.val();
                    }
                });

                // Re-parse and re-validate only the lines, not the whole file content
                let reParsedData = [];
                const combinedText = currentData.map(d => d.originalLine).join('\n');
                reParsedData = parser.parse(combinedText); // This re-parses everything
                
                state.fileData[currentFile] = validator.validate(reParsedData);
                render();
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

        const errorCount = state.fileData[currentFile].filter(item => item.type === 'error').length;
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
            </div>
        `;
        $('#step2-sticky-header').html(headerHtml);
    }

    function renderDataContainer() {
        const container = $('#step2-data-container');
        container.empty();
        if (!currentFile || !state.fileData[currentFile]) return;
        
        state.fileData[currentFile].forEach(item => {
            container.append(renderRow(item));
        });
    }

    function renderRow(item) {
        let contentHtml = '';
        const isError = item.type === 'error';
        const rowClass = isError ? 'row-error' : '';

        if (isError) {
            contentHtml = `
                <div class="row-content">
                    <textarea id="textarea-${item.id}" class="editable-textarea" rows="2">${item.originalLine}</textarea>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <span class="error-message">${item.errorMsg}</span>
                        <button class="btn btn-sm btn-success ok-btn" data-id="${item.id}">OK</button>
                    </div>
                </div>`;
        } else {
            let innerContent = '';
            if (item.type === 'entry') {
                const displayDate = new Date(item.isoDate).toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
                innerContent = `
                    <div class="d-flex w-100 align-items-center">
                        <span class="timestamp me-3 text-nowrap">${displayDate}</span>
                        <span class="phrases">${item.phrases.join(' • ')}</span>
                    </div>`;
            } else if (item.type === 'comment') {
                innerContent = `<div class="note-content fst-italic text-body-secondary">// ${item.content}</div>`;
            }
            contentHtml = `<div class="row-content">${innerContent}</div>`;
        }

        return `
            <div id="${item.id}" class="list-group-item data-row ${rowClass}">
                <input class="form-check-input" type="checkbox" data-id="${item.id}">
                <i class="fas fa-grip-vertical drag-handle"></i>
                ${contentHtml}
            </div>`;
    }
    
    function attachEventListeners() {
        const container = $('#step2-content');
        
        container.off().on('click', '.ok-btn', function() {
            revalidateAndRender();
        });

        container.on('change', '#step2-year-select', function() {
            currentFile = $(this).val();
            render(); // Re-render everything for the new file
        });
        
        // Add listeners for next/prev error, edit, delete, add, save, load etc.
    }

    return { init };

})(PreprocessorService, ParserService, ValidatorService, uiService);