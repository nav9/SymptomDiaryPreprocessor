/**
 * @file step3Controller.js
 * @description Manages the interactive phrase grouping interface for Step 3.
 */
const Step3Controller = (function(logger, ui, phraseService) {

    const selectors = {
        container: $('#step-3-content'),
        groupsContainer: $('#phrase-groups-container'),
        searchInput: $('#step3-search-input'),
        addGroupBtn: $('#step3-add-group-btn'),
        uploadBtn: $('#upload-step3-state'),
        downloadBtn: $('#download-step3-state'),
        proceedTopBtn: $('#step3-proceed-top'),
        proceedBottomBtn: $('#step3-proceed-bottom'),
    };

    let allGroups = []; // The single source of truth for the grouping state.
    let navCallback = null;

    function init(navigationCallback, payload) {
        logger.info("Initializing Step 3: Phrase Grouping.");
        navCallback = navigationCallback;
        
        ui.showLoading("Extracting and grouping phrases...");
        
        setTimeout(() => {
            if (payload) {
                // Loading from a saved state file
                logger.info("Loading Step 3 data from payload.");
                allGroups = payload;
            } else {
                // Processing fresh data from Step 2
                const dataFromStep2 = (window.appState && window.appState.step2 && window.appState.step2.finalData);
                if (!dataFromStep2 || Object.keys(dataFromStep2).length === 0) {
                    ui.hideLoading();
                    selectors.groupsContainer.html('<div class="alert alert-warning">No data received from Step 2.</div>');
                    return;
                }
                const uniquePhrases = phraseService.extractUniquePhrases(dataFromStep2);
                allGroups = phraseService.groupPhrases(uniquePhrases);
            }
            
            render();
            attachEventListeners();
            ui.hideLoading();
        }, 100); // Timeout allows UI to show loading modal
    }
    
    /** Renders the entire Step 3 UI from the `allGroups` state object. */
    function render() {
        selectors.groupsContainer.empty();
        
        const sortedGroups = phraseService.sortGroupsSpatially(allGroups);

        if (sortedGroups.length === 0) {
            selectors.groupsContainer.html('<div class="alert alert-info">No phrases found to group. You can add a new group manually.</div>');
            return;
        }

        sortedGroups.forEach(group => {
            const cardHtml = `
                <div class="group-card" data-group-id="${group.id}">
                    <div class="group-card-header">
                        <h5 class="group-title" contenteditable="true" title="Click to edit title">${group.name}</h5>
                        <button class="btn btn-sm btn-outline-danger delete-group-btn" title="Delete Group"><i class="fas fa-trash"></i></button>
                    </div>
                    <div class="group-card-body">
                        <div class="phrase-tags-container drop-zone">
                            ${group.phrases.map(p => `<span class="phrase-tag" draggable="true" data-phrase-id="${p.id}" title="Count: ${p.count}">${p.text}</span>`).join('')}
                        </div>
                        <div class="add-phrase-form">
                            <input type="text" class="form-control form-control-sm add-phrase-input" placeholder="Add new tag...">
                            <button class="btn btn-sm btn-success add-phrase-btn"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                </div>
            `;
            selectors.groupsContainer.append(cardHtml);
        });

        // After rendering, re-initialize drag and drop
        setupDragAndDrop();
    }

    /** Sets up jQuery UI draggable and droppable interactions. */
    function setupDragAndDrop() {
        $('.phrase-tag').draggable({
            revert: "invalid",
            helper: "clone",
            cursor: "grabbing",
            start: function(event, ui) {
                $(ui.helper).addClass('dragging-tag');
            }
        });

        $('.drop-zone').droppable({
            accept: ".phrase-tag",
            hoverClass: "drop-hover",
            drop: function(event, ui) {
                const phraseId = ui.draggable.data('phrase-id');
                const fromGroupId = ui.draggable.closest('.group-card').data('group-id');
                const toGroupId = $(this).closest('.group-card').data('group-id');
                
                if (fromGroupId === toGroupId) return; // Dropped in the same group

                // Find the phrase and move it in the state object
                const fromGroup = allGroups.find(g => g.id === fromGroupId);
                const toGroup = allGroups.find(g => g.id === toGroupId);
                const phraseIndex = fromGroup.phrases.findIndex(p => p.id === phraseId);

                if (fromGroup && toGroup && phraseIndex > -1) {
                    const [movedPhrase] = fromGroup.phrases.splice(phraseIndex, 1);
                    toGroup.phrases.push(movedPhrase);
                    
                    // If the 'from' group is now empty, remove it.
                    if (fromGroup.phrases.length === 0) {
                        const groupIndexToRemove = allGroups.findIndex(g => g.id === fromGroupId);
                        if (groupIndexToRemove > -1) {
                            allGroups.splice(groupIndexToRemove, 1);
                        }
                    }
                    
                    render(); // Re-render the whole UI to reflect the change.
                }
            }
        });
    }
    
    function attachEventListeners() {
        // Use event delegation for dynamically created elements
        selectors.groupsContainer.off()
            // Delete Group
            .on('click', '.delete-group-btn', function() {
                const groupId = $(this).closest('.group-card').data('group-id');
                if (confirm('Are you sure you want to delete this entire group?')) {
                    allGroups = allGroups.filter(g => g.id !== groupId);
                    render();
                }
            })
            // Save Edited Title
            .on('blur', '.group-title', function() {
                const groupId = $(this).closest('.group-card').data('group-id');
                const newName = $(this).text().trim();
                const group = allGroups.find(g => g.id === groupId);
                if (group && newName) {
                    group.name = newName;
                }
            })
            // Add New Phrase Tag via Button
            .on('click', '.add-phrase-btn', function() {
                const input = $(this).siblings('.add-phrase-input');
                const text = input.val().trim();
                if (!text) return;
                
                const groupId = $(this).closest('.group-card').data('group-id');
                const group = allGroups.find(g => g.id === groupId);
                if (group) {
                    group.phrases.push({
                        id: `phrase-manual-${Date.now()}`,
                        text: text.toLowerCase(),
                        count: 1 // Manual entries have a count of 1
                    });
                    render();
                }
            })
            // Add New Phrase Tag via Enter Key
            .on('keypress', '.add-phrase-input', function(e) {
                if (e.which === 13) { // Enter key
                    $(this).siblings('.add-phrase-btn').click();
                }
            });

        // --- Global Step 3 Listeners ---
        selectors.addGroupBtn.off().on('click', function() {
            const newId = `group-manual-${Date.now()}`;
            allGroups.unshift({
                id: newId,
                name: "New Group (Click to Edit)",
                phrases: []
            });
            render();
            // Scroll to the new group and focus its title
            const newGroupEl = $(`[data-group-id="${newId}"]`);
            if (newGroupEl.length) {
                newGroupEl[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                newGroupEl.find('.group-title').focus();
            }
        });

        selectors.searchInput.off().on('keyup', function() {
            const query = $(this).val().toLowerCase().trim();
            $('.group-card').each(function() {
                const cardText = $(this).text().toLowerCase();
                $(this).toggle(cardText.includes(query));
            });
        });

        // Save/Load State
        selectors.downloadBtn.off().on('click', function() {
            const dataStr = JSON.stringify(allGroups, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'symptom_diary_step3_groups.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        selectors.uploadBtn.off().on('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const loadedGroups = JSON.parse(e.target.result);
                    // Basic validation
                    if (Array.isArray(loadedGroups) && loadedGroups.every(g => g.id && g.name && Array.isArray(g.phrases))) {
                        allGroups = loadedGroups;
                        render();
                    } else {
                        alert("Error: Invalid Step 3 data file format.");
                    }
                } catch (err) {
                    alert("Error reading or parsing the file.");
                    logger.error("Failed to load Step 3 state", err);
                }
            };
            reader.readAsText(file);
            $(this).val(''); // Reset input to allow re-uploading the same file
        });
        
        // Proceed Buttons
        const proceedAction = function() {
            if (!window.appState.step3) window.appState.step3 = {};
            window.appState.step3.finalData = allGroups;
            logger.info("Proceeding to Step 4 with grouped phrases.");
            alert("Proceeding to Step 4 (to be built)!");
            // if(navCallback) navCallback(4);
        };
        selectors.proceedTopBtn.off().on('click', proceedAction);
        selectors.proceedBottomBtn.off().on('click', proceedAction);
    }

    return { init };

})(logger, uiService, PhraseService);