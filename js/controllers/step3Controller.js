//TODO: Find and remove the vanilla color picker code

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
    let navCallback = null;
    let categoryModal = null;
    let addGroupModal = null;
    let editSingleCategoryModal = null;
    let newCategoryColor = '#cccccc';

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
        if (payload) { loadState(payload); } 
        else {
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

    async function processNewData(dataFromStep2) {
        ui.showLoading(`Extracting unique words...`);
        const uniqueWords = phraseService.extractUniqueWords(dataFromStep2);
        const progressCallback = (processed, total) => ui.showLoading(`Categorizing words... (${processed} / ${total})`);
        state.groups = await phraseService.autoGroupWords(uniqueWords, progressCallback);
        ui.showLoading(`Sorting ${state.groups.length} groups...`);
        sortGroups();
        render();
        attachEventListeners();
        ui.hideLoading();
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
        const color = hex.substring(1);
        const r = parseInt(color.substring(0, 2), 16), g = parseInt(color.substring(2, 4), 16), b = parseInt(color.substring(4, 6), 16);
        return ((r * 0.299) + (g * 0.587) + (b * 0.114)) > 150;
    };
        
    /** Sorts groups alphabetically by their first tag. */
    function sortGroups() {
        state.groups = state.groups.filter(g => g.tags && g.tags.length > 0).sort((a, b) => a.tags[0].text.localeCompare(b.tags[0].text));
    }

    function render() {
        renderCategoryControls();
        renderGroups();
    }

    function renderCategoryControls() {
        const palette = selectors.categoryPalette;
        const controlsHtml = `<div class="category-palette-wrapper d-flex align-items-center gap-2">
            <div class="form-check form-switch" title="Assign the tags in any group to the selected category by clicking any tag in the group below">
                <input class="form-check-input" type="checkbox" role="switch" id="category-paint-toggle" ${state.isPaintMode ? 'checked' : ''}>
                <label class="form-check-label" for="category-paint-toggle">Activate</label>
            </div>            
            <div class="category-palette-scroll">
                ${state.categories.map(cat => `<div class="category-radio">
                    <input type="radio" name="category-palette" id="cat-radio-${cat.id}" value="${cat.id}" ${state.activeCategoryId === cat.id ? 'checked' : ''}>
                    <label for="cat-radio-${cat.id}" class="${isColorLight(cat.color) ? 'tag-text-dark' : ''}" style="background-color: ${cat.color}; ${state.activeCategoryId === cat.id ? 'font-weight: bold;' : ''}">
                        ${cat.name}
                    </label>
                </div>`).join('')}
            </div>
            <button class="btn btn-sm palette-arrow" id="palette-arrow-left"><i class="fas fa-chevron-left"></i></button>
            <button class="btn btn-sm palette-arrow" id="palette-arrow-right"><i class="fas fa-chevron-right"></i></button>
            <button id="edit-categories-btn" class="btn btn-sm btn-outline-secondary" title="Edit Categories"><i class="fas fa-edit"></i></button>
        </div>`;
        palette.html(controlsHtml);
        updatePaletteArrows();
    }


    function renderGroups() {
        selectors.groupsContainer.empty();
        
        const headerHtml = `
            <div class="groups-header d-flex gap-3 align-items-center mb-2">
                <div class="flex-grow-1">
                    <input type="search" id="tag-search-input" class="form-control form-control-sm" placeholder="Search for tags...">
                </div>
                <button id="add-new-group-card" class="btn btn-sm btn-success flex-shrink-0" title="Create a new group">
                    <i class="fas fa-plus me-1"></i> New Group
                </button>
            </div>
        `;
        selectors.groupsContainer.append(headerHtml);

        const groupsArea = $('<div class="groups-area"></div>');
        state.groups.forEach(group => {
            const category = state.categories.find(c => c.id === group.categoryId) || state.categories[0];
            const textClass = isColorLight(category.color) ? 'tag-text-dark' : '';
            const tagsHtml = group.tags.map(tag => 
                `<span class="word-tag ${textClass}" draggable="true" data-tag-id="${tag.id}" style="background-color:${category.color};">${tag.text}</span>`
            ).join('');
            
            const groupHtml = `<div class="group-card ${state.isPaintMode ? 'paint-mode-active' : ''}" data-group-id="${group.id}">${tagsHtml}</div>`;
            groupsArea.append(groupHtml);
        });
        selectors.groupsContainer.append(groupsArea);
        setupDragAndDrop();
    }

    function updatePaletteArrows() {
        const scrollArea = $('.category-palette-scroll');
        if (!scrollArea.length) return;
        const scrollLeft = scrollArea.scrollLeft();
        const scrollWidth = scrollArea[0].scrollWidth;
        const clientWidth = scrollArea[0].clientWidth;
        //$('#palette-arrow-left').toggle(scrollLeft > 0);
        $('#palette-arrow-left').toggle(scrollLeft < scrollWidth - clientWidth - 1);
        $('#palette-arrow-right').toggle(scrollLeft < scrollWidth - clientWidth - 1);
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
        
        if (!sourceGroup) return; // Tag not found, abort
        if (sourceGroup.id === targetGroupId) return; // Dropped in the same group, abort

        const [movedTag] = sourceGroup.tags.splice(tagIndex, 1);

        if (targetGroupId) {
            const targetGroup = state.groups.find(g => g.id === targetGroupId);
            targetGroup.tags.push(movedTag);
        } else {
            state.groups.push({
                id: `group-new-${Date.now()}`,
                categoryId: 'none', // Dropping in empty space defaults to None category
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
            .on('change', '#category-paint-toggle', function() { state.isPaintMode = $(this).is(':checked'); renderGroups(); })
            .on('change', 'input[name="category-palette"]', function() { state.activeCategoryId = $(this).val(); renderCategoryControls(); })
            .on('click', '#edit-categories-btn', () => { renderCategoriesModal(); categoryModal.show(); })
            .on('click', '#palette-arrow-left', () => { $('.category-palette-scroll').animate({scrollLeft: '-=200px'}, 300); })
            .on('click', '#palette-arrow-right', () => { $('.category-palette-scroll').animate({scrollLeft: '+=200px'}, 300); })
            .on('scroll', '.category-palette-scroll', updatePaletteArrows);
        $(window).off('resize.step3').on('resize.step3', updatePaletteArrows);           

        selectors.groupsContainer.off()
            .on('click', '#add-new-group-card', () => addGroupModal.show())
            .on('click', '.group-card', function() {
                if (state.isPaintMode) {
                    const group = state.groups.find(g => g.id === $(this).data('group-id'));
                    if (group) { group.categoryId = state.activeCategoryId; renderGroups(); }
                }
            })
            .on('input', '#tag-search-input', function() {
                const query = $(this).val().toLowerCase().trim();
                $('.groups-area .group-card').each(function() {
                    const cardText = $(this).text().toLowerCase();
                    $(this).toggle(cardText.includes(query));
                });
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
            if (navCallback) navCallback(4);
        };
        selectors.proceedTopBtn.off().on('click', proceedAction);
    }
    
    function renderCategoriesModal() {
        const modalBody = $('#edit-categories-modal .modal-body ul');
        modalBody.empty();
        state.categories.forEach(cat => {
            if (!cat.removable) return;
            modalBody.append(`<li class="list-group-item d-flex align-items-center gap-2">
                <span class="category-color-dot" style="background-color:${cat.color};"></span>
                <span class="flex-grow-1">${cat.name}</span>
                <button class="btn btn-sm btn-outline-secondary edit-cat-btn" data-cat-id="${cat.id}" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn btn-sm btn-outline-danger delete-cat-btn" data-cat-id="${cat.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </li>`);
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
                            <input type="color" id="new-category-color-input" class="form-control form-control-color" value="${newCategoryColor}">
                            <input type="text" id="new-category-name" class="form-control" placeholder="New category name">
                            <button id="add-category-btn" class="btn btn-primary">Add</button>
                        </div>
                    </div>
                </div></div>
            </div>
            <div class="modal fade" id="edit-single-category-modal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Edit Category</h5></div>
                    <div class="modal-body">
                        <input type="hidden" id="edit-category-id-input">
                        <div class="mb-3"><label for="edit-category-name-input" class="form-label">Name</label><input type="text" id="edit-category-name-input" class="form-control"></div>
                        <div class="mb-3"><label for="edit-category-color-input" class="form-label">Color</label><input type="color" id="edit-category-color-input" class="form-control form-control-color"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" id="save-category-changes-btn" class="btn btn-primary">Save Changes</button>
                    </div>
                </div></div>
            </div>
            <div class="modal fade" id="add-group-modal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Create New Group</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <div class="modal-body">
                        <div class="mb-3"><label for="new-group-tags" class="form-label">Tags (comma-separated)</label><input type="text" id="new-group-tags" class="form-control" placeholder="e.g., headache, pain, dull"></div>
                        <div class="mb-3"><label for="new-group-category" class="form-label">Category</label><select id="new-group-category" class="form-select"></select></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="button" id="create-group-confirm" class="btn btn-primary">Create</button>
                    </div>
                </div></div>
            </div>
        `);
        
        // CORRECTED: Pass the raw DOM element [0] to the Bootstrap constructor
        categoryModal = new bootstrap.Modal($('#edit-categories-modal')[0]);
        addGroupModal = new bootstrap.Modal($('#add-group-modal')[0]);
        editSingleCategoryModal = new bootstrap.Modal($('#edit-single-category-modal')[0]); 

        $('#new-category-color-swatch').css('background-color', newCategoryColor).on('click', function() {
            new Picker({
                parent: this, popup: 'right', alpha: false, color: newCategoryColor,
                onDone: (color) => { newCategoryColor = color.hex; $(this).css('background-color', newCategoryColor); }
            }).open();
        });

        $('#add-category-btn').on('click', function() {
            const name = $('#new-category-name').val().trim();
            if (name && !state.categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
                newCategoryColor = $('#new-category-color-input').val();
                state.categories.push({ id: `cat-${Date.now()}`, name, color: newCategoryColor, removable: true });
                $('#new-category-name').val('');
                renderCategoriesModal();
                renderCategoryControls();
            }
        });

        $('#save-category-changes-btn').on('click', function() {
            const catId = $('#edit-category-id-input').val();
            const category = state.categories.find(c => c.id === catId);
            if (category) {
                const newName = $('#edit-category-name-input').val().trim();
                if(newName) category.name = newName;
                category.color = $('#edit-category-color-input').val();
            }
            editSingleCategoryModal.hide();
            renderCategoriesModal();
            render();
        });        

        $('#edit-categories-modal').on('click', '.edit-cat-btn', function() {
            const catId = $(this).data('cat-id');
            const category = state.categories.find(c => c.id === catId);
            $('#edit-category-id-input').val(category.id);
            $('#edit-category-name-input').val(category.name);
            $('#edit-category-color-input').val(category.color);
            editSingleCategoryModal.show();
        });

        $('#edit-categories-modal').on('click', '.delete-cat-btn', function() {
            const catId = $(this).data('cat-id');
            state.categories = state.categories.filter(c => c.id !== catId);
            state.groups.forEach(g => { if(g.categoryId === catId) g.categoryId = 'none'; });
            renderCategoriesModal();
            render();
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