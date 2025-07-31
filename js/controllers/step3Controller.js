const Step3Controller = (function(logger, phraseService, ui) {

    let step3Data = {}; // { groups: [...], phrases: [...] }
    
    function init(navCallback, payload) {
        logger.info("Initializing Step 3 Controller.");
        // If payload exists, it's from a loaded state file.
        // Otherwise, process data from the global state.
        const dataToProcess = payload || window.appState.step2.finalData;

        ui.showLoading("Extracting and grouping phrases...");
        setTimeout(() => {
            const uniquePhrases = phraseService.extractUniquePhrases(dataToProcess);
            const groups = phraseService.groupPhrases(uniquePhrases);
            step3Data = { groups, allPhrases: uniquePhrases };
            
            render();
            attachEventListeners();
            ui.hideLoading();
        }, 50);
    }

    function render() {
        const container = $('#phrase-groups-container');
        container.empty();
        step3Data.groups.forEach(group => {
            const tagsHtml = group.phrases.map(p => `
                <div class="phrase-tag" data-phrase-id="${p.id}">
                    ${p.text} <span class="badge bg-dark rounded-pill">${p.count}</span>
                </div>`).join('');
            
            const groupHtml = `
                <div class="phrase-group" data-group-id="${group.id}">
                    <div class="phrase-group-title">${group.phrases[0].text}</div>
                    <div class="phrase-tags-container">${tagsHtml}</div>
                </div>`;
            container.append(groupHtml);
        });
        makeDraggable();
    }

    function makeDraggable() {
        $('.phrase-tag').draggable({
            revert: "invalid",
            helper: "clone",
            cursor: "grabbing"
        });
        $('.phrase-group').droppable({
            accept: ".phrase-tag",
            hoverClass: "bg-secondary",
            drop: function(event, ui) {
                const phraseId = ui.draggable.data('phrase-id');
                const fromGroupId = ui.draggable.closest('.phrase-group').data('group-id');
                const toGroupId = $(this).data('group-id');
                
                if (fromGroupId === toGroupId) return;

                // --- Update the data model ---
                const fromGroup = step3Data.groups.find(g => g.id === fromGroupId);
                const toGroup = step3Data.groups.find(g => g.id === toGroupId);
                const phraseIndex = fromGroup.phrases.findIndex(p => p.id === phraseId);
                const [movedPhrase] = fromGroup.phrases.splice(phraseIndex, 1);
                toGroup.phrases.push(movedPhrase);
                
                // If a group becomes empty, remove it (optional)
                if(fromGroup.phrases.length === 0) {
                    step3Data.groups = step3Data.groups.filter(g => g.id !== fromGroupId);
                }
                
                // Re-render the entire view to reflect the change
                render();
            }
        });
    }

    function attachEventListeners() {
        const container = $('#phrase-groups-container');
        // Click to edit/delete
        container.on('click', '.phrase-tag', function() {
            // Logic to open a modal to edit or delete the phrase text globally.
            // This would require finding the phrase in `step3Data.allPhrases`
            // and re-running the grouping if the text changes.
        });
        
        // Listener for the global save event
        $(document).on('save-step3-data', function() {
            // ... Logic to save step3Data into the global file format and trigger download
        });
    }

    return { init };

})(logger, PhraseService, ui);