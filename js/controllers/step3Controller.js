const Step3Controller = (function(logger, ui, phraseService) {

    const selectors = {
        container: $('#step-3-content'),
        groupsWrapper: $('#groups-container-wrapper'),
        groupsContainer: $('#groups-container'),
        categoryPalette: $('#category-palette-bar'),
        uploadBtn: $('#upload-step3-state'),
        downloadBtn: $('#download-step3-state'),
        proceedTopBtn: $('#step3-proceed-top'),
    };

    let state = {};
    let colorPicker = null;
    let navCallback = null;
    let categoryModal = null;
    let addGroupModal = null;
    let newCategoryColor = '#cccccc'; // Default for new categories

    function setDefaultState() {
        state = {
            categories: [
                { id: 'none', name: 'None', color: '#6c757d', removable: false },
                { id: 'symptom', name: 'Symptom', color: '#ffc107', removable: true },
                { id: 'food', name: 'Food', color: '#0dcaf0', removable: true },
                { id: 'medication', name: 'Medication', color: '#198754', removable: true },
                { id: 'action', name: 'Action', color: '#fd7e14', removable: true },
                { id: 'anatomy', name: 'Anatomy', color: '#8b4513', removable: true },
                { id: 'contaminant', name: 'Contaminant', color: '#dc3545', removable: true },
            ],
            groups: [],
            isPaintMode: false,
            activeCategoryId: 'none'
        };
    }

    function init(navigationCallback, payload) {
        logger.info("Initializing Step 3: Word Grouping.");
        navCallback = navigationCallback;
        setDefaultState();
        injectModals();

        if (payload) {
            loadState(payload);
        } else {
            const dataFromStep2 = window.appState?.step2?.finalData;
            if (!dataFromStep2 || Object.keys(dataFromStep2).length === 0) {
                selectors.groupsContainer.html('<div class="alert alert-warning">No data to process. Please complete Step 2 or load a file.</div>');
                renderCategoryControls();
                attachEventListeners();
                return;
            }
            processNewData(dataFromStep2);
        }
    }

    function processNewData(dataFromStep2) {
        setTimeout(() => {
            ui.showLoading(`Extracting unique words...`);
            const uniqueWords = phraseService.extractUniqueWords(dataFromStep2);
            
            ui.showLoading(`Categorizing ${uniqueWords.size} words...`);
            setTimeout(() => {
                state.groups = phraseService.autoGroupWords(uniqueWords);
                
                ui.showLoading(`Sorting ${state.groups.length} groups...`);
                setTimeout(() => {
                    state.groups.sort((a, b) => a.tags[0].text.localeCompare(b.tags[0].text));
                    render();
                    attachEventListeners();
                    ui.hideLoading();
                }, 50);
            }, 50);
        }, 50);
    }

    function loadState(savedState) {
        ui.showLoading("Loading saved state...");
        setTimeout(() => {
            state.categories = savedState.categories || state.categories;
            state.groups = savedState.groups || [];
            state.isPaintMode = savedState.isPaintMode || false;
            logger.info(`Loaded ${state.groups.length} groups and ${state.categories.length} categories.`);
            render();
            attachEventListeners();
            ui.hideLoading();
        }, 50);
    }

    /** Determines if a hex color is light or dark to decide font color. */
    const isColorLight = (hex) => {
        if (!hex) return false;
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return ((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186;
    };
        
    /** Sorts groups alphabetically by their first tag. */
    function sortGroups() {
        state.groups = state.groups
            .filter(g => g.tags && g.tags.length > 0)
            .sort((a, b) => a.tags[0].text.localeCompare(b.tags[0].text));
    }

    function render() {
        renderCategoryControls();
        renderGroups();
    }

    function renderCategoryControls() {
        const palette = selectors.categoryPalette;
        palette.empty();

        const controlsHtml = `
            <div class="d-flex align-items-center gap-3">
                <div class="form-check form-switch" title="Assign the tags in any group to the selected category by clicking any tag in the group below">
                    <input class="form-check-input" type="checkbox" role="switch" id="category-paint-toggle" ${state.isPaintMode ? 'checked' : ''}>
                    <label class="form-check-label" for="category-paint-toggle">Activate</label>
                </div>
                <div class="category-palette-scroll">
                    ${state.categories.map(cat => `
                        <div class="category-radio">
                            <input type="radio" name="category-palette" id="cat-radio-${cat.id}" value="${cat.id}" ${state.activeCategoryId === cat.id ? 'checked' : ''}>
                            <label for="cat-radio-${cat.id}" class="${isColorLight(cat.color) ? 'tag-text-dark' : ''}" style="background-color: ${cat.color};">
                                ${cat.name}
                            </label>
                        </div>
                    `).join('')}
                </div>
                <button id="edit-categories-btn" class="btn btn-sm btn-outline-secondary" title="Edit Categories"><i class="fas fa-edit"></i></button>
            </div>
        `;
        palette.html(controlsHtml);
    }

    function renderGroups() {
        selectors.groupsContainer.empty();
        
        const newGroupBtnHtml = `<div id="add-new-group-card" class="group-card add-group-card" title="Create a new group">
            <i class="fas fa-plus"></i> New Group
        </div>`;
        selectors.groupsContainer.append(newGroupBtnHtml);

        state.groups.forEach(group => {
            const category = state.categories.find(c => c.id === group.categoryId) || state.categories[0];
            const textClass = isColorLight(category.color) ? 'tag-text-dark' : '';
            const tagsHtml = group.tags.map(tag => 
                `<span class="word-tag ${textClass}" draggable="true" data-tag-id="${tag.id}" style="background-color:${category.color};">${tag.text}</span>`
            ).join('');
            
            const groupHtml = `<div class="group-card ${state.isPaintMode ? 'paint-mode-active' : ''}" data-group-id="${group.id}">
                ${tagsHtml}
            </div>`;
            selectors.groupsContainer.append(groupHtml);
        });
        setupDragAndDrop();
    }

    function setupDragAndDrop() {
        let scrollInterval = null;
        
        $('.word-tag').draggable({
            revert: "invalid", helper: "clone", cursor: "grabbing",
            start: function() { $(this).css('opacity', 0.5); },
            stop: function() { 
                $(this).css('opacity', 1);
                clearInterval(scrollInterval);
                scrollInterval = null;
            },
            drag: function(event) {
                const wrapper = selectors.groupsWrapper[0];
                const rect = wrapper.getBoundingClientRect();
                const scrollSpeed = 15;
                
                if (event.clientY < rect.top + 50) {
                    if (!scrollInterval) scrollInterval = setInterval(() => wrapper.scrollTop -= scrollSpeed, 15);
                } else if (event.clientY > rect.bottom - 50) {
                    if (!scrollInterval) scrollInterval = setInterval(() => wrapper.scrollTop += scrollSpeed, 15);
                } else {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                }
            }
        });

        $('.group-card:not(.add-group-card)').droppable({
            accept: ".word-tag", hoverClass: "drop-hover",
            drop: function(event, ui) { handleDrop(ui.draggable, $(this).data('group-id')); }
        });

        selectors.groupsWrapper.droppable({
            accept: ".word-tag",
            drop: function(event, ui) {
                if ($(event.target).is(selectors.groupsWrapper)) { handleDrop(ui.draggable, null); }
            }
        });
    }

    function handleDrop(draggedTag, targetGroupId) {
        const tagId = draggedTag.data('tag-id');
        let sourceGroup = null, tagIndex = -1;

        for (const group of state.groups) {
            const index = group.tags.findIndex(t => t.id === tagId);
            if (index > -1) { sourceGroup = group; tagIndex = index; break; }
        }
        
        if (!sourceGroup) return;
        const [movedTag] = sourceGroup.tags.splice(tagIndex, 1);

        if (targetGroupId) {
            const targetGroup = state.groups.find(g => g.id === targetGroupId);
            targetGroup.tags.push(movedTag);
        } else {
            state.groups.push({
                id: `group-new-${Date.now()}`,
                categoryId: 'none',
                tags: [movedTag]
            });
        }
        
        if (sourceGroup.tags.length === 0) {
            state.groups = state.groups.filter(g => g.id !== sourceGroup.id);
        }
        
        sortGroups();
        render();
    }

    function attachEventListeners() {
        selectors.categoryPalette.off()
            .on('change', '#category-paint-toggle', function() {
                state.isPaintMode = $(this).is(':checked');
                renderGroups();
            })
            .on('change', 'input[name="category-palette"]', function() {
                state.activeCategoryId = $(this).val();
            })
            .on('click', '#edit-categories-btn', () => {
                renderCategoriesModal();
                categoryModal.show();
            });

        selectors.groupsContainer.off()
            .on('click', '#add-new-group-card', () => addGroupModal.show())
            .on('click', '.group-card:not(.add-group-card)', function() {
                if (state.isPaintMode) {
                    const groupId = $(this).data('group-id');
                    const group = state.groups.find(g => g.id === groupId);
                    if (group) {
                        group.categoryId = state.activeCategoryId;
                        renderGroups();
                    }
                }
            });
        
        selectors.groupsWrapper.off().on('keydown', function(e) {
            const wrapper = $(this)[0];
            const scrollAmount = e.key === 'PageDown' || e.key === 'PageUp' ? wrapper.clientHeight * 0.9 : 40;
            let handled = false;

            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                wrapper.scrollTop += scrollAmount;
                handled = true;
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                wrapper.scrollTop -= scrollAmount;
                handled = true;
            }
            if (handled) e.preventDefault();
        });

        selectors.downloadBtn.off().on('click', () => {
            const dataStr = JSON.stringify(state, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Step3_groups_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        });

        selectors.uploadBtn.off().on('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const savedState = JSON.parse(event.target.result);
                    if (!savedState.categories || !savedState.groups) throw new Error("Invalid format");
                    
                    const performLoad = (mode) => {
                        if (mode === 'replace') {
                            loadState(savedState);
                        } else if (mode === 'merge') {
                            const existingGroups = new Map(state.groups.flatMap(g => g.tags).map(t => [t.text, g]));
                            savedState.groups.forEach(g => {
                                const firstTag = g.tags[0]?.text;
                                if(firstTag && !existingGroups.has(firstTag)) {
                                    state.groups.push(g);
                                }
                            });
                            
                            const existingCategories = new Map(state.categories.map(c => [c.name, c]));
                            savedState.categories.forEach(c => {
                                if(!existingCategories.has(c.name)) state.categories.push(c);
                            });
                            render();
                        }
                    };
                    
                    if (state.groups.length > 0) {
                        ui.showMergeConflictModal(choice => performLoad(choice));
                    } else {
                        performLoad('replace');
                    }
                } catch (err) { alert("Error loading Step 3 file."); logger.error(err); }
            };
            reader.readAsText(file);
            $(this).val('');
        });

        const proceedAction = function() {
            if (!window.appState.step3) window.appState.step3 = {};
            window.appState.step3.finalData = state;
            alert("Proceeding to Step 4 (to be built)!");
        };
        selectors.proceedTopBtn.off().on('click', proceedAction);
    }
    
    function renderCategoriesModal() {
        const modalBody = $('#edit-categories-modal .modal-body ul');
        modalBody.empty();
        state.categories.forEach(cat => {
            if (!cat.removable) return;
            modalBody.append(`
                <li class="list-group-item d-flex align-items-center gap-2">
                    <button class="btn btn-sm category-color-dot edit-color-btn" data-cat-id="${cat.id}" style="background-color:${cat.color};"></button>
                    <span class="flex-grow-1">${cat.name}</span>
                    <button class="btn btn-sm btn-outline-secondary edit-name-btn" data-cat-id="${cat.id}" title="Rename"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-cat-btn" data-cat-id="${cat.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </li>
            `);
        });
    }

    function injectModals() {
        if ($('#edit-categories-modal').length > 0) return;
        $('body').append(`
            <div class="modal fade" id="edit-categories-modal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Edit Categories</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <div class="modal-body">
                        <ul class="list-group mb-3"></ul>
                        <div class="input-group">
                            <input type="text" id="new-category-name" class="form-control" placeholder="New category name">
                            <button id="add-category-btn" class="btn btn-primary">Add</button>
                        </div>
                    </div>
                </div></div>
            </div>
            <div class="modal fade" id="add-group-modal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Create New Group</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="new-group-tags" class="form-label">Tags (comma-separated)</label>
                            <input type="text" id="new-group-tags" class="form-control" placeholder="e.g., headache, pain, dull">
                        </div>
                        <div class="mb-3">
                            <label for="new-group-category" class="form-label">Category</label>
                            <select id="new-group-category" class="form-select"></select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="create-group-confirm" class="btn btn-primary">Create</button>
                    </div>
                </div></div>
            </div>
        `);

        categoryModal = new bootstrap.Modal($('#edit-categories-modal'));
        addGroupModal = new bootstrap.Modal($('#add-group-modal'));        

        $('#edit-categories-modal').on('click', '.edit-name-btn', function() {
            const catId = $(this).data('cat-id');
            const category = state.categories.find(c => c.id === catId);
            const newName = prompt('Enter new category name:', category.name);
            if (newName && newName.trim()) {
                category.name = newName.trim();
                renderCategoriesModal();
                renderCategoryControls();
            }
        });
        $('#edit-categories-modal').on('click', '.edit-color-btn', function() {
            const catId = $(this).data('cat-id');
            const category = state.categories.find(c => c.id === catId);
            if(colorPicker) colorPicker.destroy();
            colorPicker = new Picker({
                parent: this, popup: 'right', alpha: false, color: category.color,
                onDone: (color) => {
                    category.color = color.hex;
                    renderCategoriesModal();
                    render();
                }
            });
            colorPicker.open();
        });                
        $('#edit-categories-modal').on('click', '#add-category-btn', function() {
            const nameInput = $('#new-category-name');
            const name = nameInput.val().trim();
            if (name && !state.categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
                state.categories.push({ id: `cat-${Date.now()}`, name, color: '#cccccc', removable: true });
                nameInput.val('');
                renderCategoriesModal();
                renderCategoryControls();
            }
        });
        $('#edit-categories-modal').on('click', '.list-group-item button', function() {
            const catId = $(this).data('cat-id');
            state.categories = state.categories.filter(c => c.id !== catId);
            state.groups.forEach(g => { if(g.categoryId === catId) g.categoryId = 'none'; });
            renderCategoriesModal();
            render();
        });
        $('#add-group-modal').on('show.bs.modal', function() {
            const catSelect = $('#new-group-category');
            catSelect.empty();
            state.categories.forEach(c => catSelect.append(`<option value="${c.id}">${c.name}</option>`));
        });
        $('#add-group-modal').on('click', '#create-group-confirm', function() {
            const tagsInput = $('#new-group-tags');
            const tags = tagsInput.val().split(',').map(t => t.trim()).filter(Boolean);
            if (tags.length === 0) return;
            
            const newGroup = {
                id: `group-manual-${Date.now()}`,
                categoryId: $('#new-group-category').val(),
                tags: tags.map(t => ({ id: `tag-${t}-${Date.now()}`, text: t }))
            };
            state.groups.unshift(newGroup);
            tagsInput.val('');
            addGroupModal.hide();
            sortGroups();
            render();
        });
    }

    return { init };

})(logger, uiService, PhraseService);