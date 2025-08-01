/**
 * @file step3Controller.js
 * @description (Simplified) Displays the data received from Step 2 for verification.
 */
const Step3Controller = (function(logger, ui) {

    let step3Data = {};
    let navCallback = null;
    
    function init(navigationCallback, payload) {
        logger.info("Initializing Simplified Step 3 Controller.");
        navCallback = navigationCallback;
        
        let dataToDisplay;
        if (payload) {
            dataToDisplay = payload;
        } else if (window.appState && window.appState.step2 && window.appState.step2.finalData) {
            dataToDisplay = window.appState.step2.finalData;
        } else {
            $('#step3-data-display').text("Error: No data was received from the previous step.");
            return;
        }

        try {
            const formattedJson = JSON.stringify(dataToDisplay, null, 2);
            $('#step3-data-display').text(formattedJson);
            $('#proceed-to-step4-btn').prop('disabled', false);
            step3Data = dataToDisplay;
            attachEventListeners();
        } catch (e) {
            logger.error("Failed to display Step 3 data.", e);
            $('#step3-data-display').text("An error occurred. See console for details.");
        }
    }

    function attachEventListeners() {
        $('body').off('click', '#proceed-to-step4-btn'); // Clear previous listeners
        $('body').on('click', '#proceed-to-step4-btn', function() {
            if ($(this).is(':disabled')) return;
            if (!window.appState.step3) window.appState.step3 = {};
            window.appState.step3.finalData = step3Data;
            alert("Proceeding to Step 4 (to be built).");
        });
    }

    return { init };
})(logger, uiService);

// const Step3Controller = (function(logger, phraseService, ui) {

//     let step3Data = {}; // { groups: [...], phrases: [...] }
//     let navCallback = null;
    
//     function init(navCallback, payload) {
//         logger.info("Initializing Step 3 Controller.");
//         navCallback = navCallback; // Store for later use
//         // If payload exists, it's from a loaded state file. Otherwise, process data from the global state.
//         let dataToProcess;

//         if (payload) {
//             logger.info("Loading Step 3 state from file payload.");
//             step3Data = { 
//                 groups: payload.groups, 
//                 allPhrases: payload.groups.flatMap(g => g.phrases)
//             };
//             render();
//             attachEventListeners();
//             return;
//         } else if (window.appState && window.appState.step2 && window.appState.step2.finalData) {
//             logger.info("Processing finalized data from Step 2.");
//             dataToProcess = window.appState.step2.finalData;
//         } else {
//             $('#phrase-groups-container').html('<div class="alert alert-warning">No data received from Step 2. Please complete the previous steps first.</div>');
//             return;
//         }        
//         // if (payload) {
//         //     // Data is from a loaded file. The payload is the "data" property of the file.
//         //     logger.info("Loading Step 3 state from file payload.");
//         //     // We need to rebuild the state from the saved groups.
//         //     step3Data = { 
//         //         groups: payload.groups, 
//         //         // allPhrases can be rebuilt if needed, or we assume the groups contain them all.
//         //         allPhrases: payload.groups.flatMap(g => g.phrases)
//         //     };
//         //     // No processing needed, just render.
//         //     render();
//         //     attachEventListeners();
//         //     return;
//         // } else if (window.appState && window.appState.step2 && window.appState.step2.finalData) {
//         //     // Data is coming from Step 2.
//         //     logger.info("Processing finalized data from Step 2.");
//         //     dataToProcess = window.appState.step2.finalData;
//         // } else {
//         //     // No data available. Show an error message.
//         //     $('#phrase-groups-container').html('<div class="alert alert-warning">No data received from Step 2. Please complete the previous steps first.</div>');
//         //     return;
//         // }

//         ui.showLoading("Extracting and grouping phrases...");
//         setTimeout(() => {
//             try {
//                 // ===== NEW, DIRECT LOGIC =====

//                 // 1. Use a JavaScript Set to automatically handle uniqueness.
//                 const uniquePhraseSet = new Set();
//                 const splitter = /[,.()\[\]]/g; // The splitter you defined

//                 // 2. Loop through all years and all entries from Step 2's data.
//                 Object.values(dataToProcess).forEach(yearData => {
//                     yearData.forEach(entry => {
//                         // Ignore comments and entries without the phraseText property.
//                         if (entry.isComment || !entry.phraseText) {
//                             return;
//                         }
                        
//                         // 3. Split the phraseText into individual phrases.
//                         entry.phraseText.split(splitter).forEach(p => {
//                             // 4. Clean each phrase and add it to the Set.
//                             const phrase = p.trim().toLowerCase();
//                             if (phrase && phrase.length > 1) {
//                                 uniquePhraseSet.add(phrase);
//                             }
//                         });
//                     });
//                 });
                
//                 // 5. Convert the Set into the array of objects our controller expects.
//                 const allPhrases = Array.from(uniquePhraseSet).sort(); // Sort alphabetically
                
//                 const uniquePhraseObjects = allPhrases.map(phraseText => {
//                     const safeId = phraseText.replace(/[^a-zA-Z0-9]/g, '-');
//                     return {
//                         id: `phrase-${safeId}-${Math.random()}`,
//                         text: phraseText,
//                         // We don't have an accurate count anymore, but we can set it to 1.
//                         count: 1 
//                     };
//                 });
                
//                 // 6. Create initial groups, one for each unique phrase.
//                 const groups = uniquePhraseObjects.map(phraseObj => {
//                     return {
//                         id: `group-${phraseObj.id}`,
//                         name: phraseObj.text,
//                         phrases: [phraseObj]
//                     };
//                 });

//                 step3Data = { groups: groups, allPhrases: uniquePhraseObjects };
                
//                 render();
//                 attachEventListeners();

//             } catch (e) {
//                 logger.error("Error during Step 3 initialization.", e);
//                 $('#phrase-groups-container').html('<div class="alert alert-danger">An error occurred while processing phrases. Please check the console.</div>');
//             } finally {
//                 ui.hideLoading();
//             }
//         }, 50);

//         // setTimeout(() => {
//         //     try {
//         //         const uniquePhrases = phraseService.extractUniquePhrases(dataToProcess);
//         //         //const groups = phraseService.createInitialGroups(uniquePhrases);
//         //         const groups = phraseService.createInitialGroups(uniquePhrases);
//         //         step3Data = { groups, allPhrases: uniquePhrases };
                
//         //         render();
//         //         attachEventListeners();
//         //     } catch (e) {
//         //         logger.error("Error during Step 3 initialization.", e);
//         //         // Also update the UI on error
//         //         $('#phrase-groups-container').html('<div class="alert alert-danger">An error occurred while processing phrases. Please check the console.</div>');
//         //     } finally {
//         //         ui.hideLoading();
//         //     }
//         // }, 50);
//     }

//     // function render() {
//     //     const container = $('#phrase-groups-container');
//     //     container.empty();
//     //     if (!step3Data.groups || step3Data.groups.length === 0) {
//     //         container.html('<div class="alert alert-info">No common phrases were found to group. You can create new groups manually.</div>');
//     //         return;
//     //     }        
//     //     step3Data.groups.forEach(group => {
//     //         const tagsHtml = group.phrases.map(p => `
//     //             <div class="phrase-tag" data-phrase-id="${p.id}">
//     //                 ${p.text} <span class="badge bg-dark rounded-pill">${p.count}</span>
//     //             </div>`).join('');
            
//     //         // The title is now an input field for editing
//     //         const groupHtml = `
//     //             <div class="phrase-group" data-group-id="${group.id}">
//     //                 <div class="phrase-group-title d-flex align-items-center">
//     //                     <input type="text" class="form-control form-control-sm group-name-input me-2" value="${group.name}" data-group-id="${group.id}">
//     //                     <button class="btn btn-sm btn-outline-danger delete-group-btn" title="Delete Group"><i class="fas fa-trash"></i></button>
//     //                 </div>
//     //                 <div class="phrase-tags-container">${tagsHtml}</div>
//     //             </div>`;
//     //         container.append(groupHtml);
//     //     });
//     //     makeInteractive();
//     //     // Add the proceed button to the UI if it doesn't exist
//     //     if ($('#proceed-to-step4-btn').length === 0) {
//     //         $('#step3-bottom-proceed').html(`
//     //             <button id="proceed-to-step4-btn" class="btn btn-lg btn-primary">
//     //                 Confirm Groups & Proceed to Step 4 <i class="fas fa-arrow-right"></i>
//     //             </button>
//     //         `);
//     //     }
//     // }

//     function render() {
//         const container = $('#phrase-groups-container');
//         container.empty();
        
//         if (!step3Data.groups || step3Data.groups.length === 0) {
//             // This message will now only appear if there are genuinely zero phrases in the data.
//             container.html('<div class="alert alert-info">No phrases were found in the data. You can create new groups manually.</div>');
//             return;
//         }
        
//         // The rest of the render function is unchanged and should now work.
//         step3Data.groups.forEach(group => {
//             const tagsHtml = group.phrases.map(p => `
//                 <div class="phrase-tag" data-phrase-id="${p.id}" title="Count: ${p.count}">
//                     ${p.text}
//                 </div>`).join('');
            
//             const groupHtml = `
//                 <div class="phrase-group" data-group-id="${group.id}">
//                     <div class="phrase-group-title d-flex align-items-center">
//                         <input type="text" class="form-control form-control-sm group-name-input me-2" value="${group.name}">
//                         <button class="btn btn-sm btn-outline-danger delete-group-btn" title="Delete Group"><i class="fas fa-trash"></i></button>
//                     </div>
//                     <div class="phrase-tags-container">${tagsHtml}</div>
//                 </div>`;
//             container.append(groupHtml);
//         });
        
//         // This is a placeholder for now, as the full logic is complex
//         // makeInteractive(); 
//     }

//     // function makeInteractive() {
//     //     // --- DRAGGABLE TAGS ---
//     //     $('.phrase-tag').draggable({
//     //         revert: "invalid",
//     //         helper: "clone",
//     //         cursor: "grabbing",
//     //         start: () => $('#new-group-dropzone').slideDown('fast')
//     //     });

//     //     // --- DROPPABLE GROUPS ---
//     //     $('.phrase-group').droppable({
//     //         accept: ".phrase-tag",
//     //         hoverClass: "bg-secondary",
//     //         drop: function(event, ui) {
//     //             const phraseId = ui.draggable.data('phrase-id');
//     //             const fromGroupId = ui.draggable.closest('.phrase-group').data('group-id');
//     //             const toGroupId = $(this).data('group-id');
                
//     //             if (fromGroupId === toGroupId) return;
//     //             movePhrase(phraseId, fromGroupId, toGroupId);
//     //             $('#new-group-dropzone').slideUp('fast');
//     //         }
//     //     });

//     //     // --- NEW GROUP DROP ZONE ---
//     //     $('#new-group-dropzone').droppable({
//     //         accept: ".phrase-tag",
//     //         hoverClass: "bg-success",
//     //         drop: function(event, ui) {
//     //             const phraseId = ui.draggable.data('phrase-id');
//     //             const fromGroupId = ui.draggable.closest('.phrase-group').data('group-id');
                
//     //             const fromGroup = step3Data.groups.find(g => g.id === fromGroupId);
//     //             const phraseIndex = fromGroup.phrases.findIndex(p => p.id === phraseId);
//     //             const [movedPhrase] = fromGroup.phrases.splice(phraseIndex, 1);
                
//     //             const newGroup = {
//     //                 id: `group-${movedPhrase.id}`,
//     //                 name: movedPhrase.text,
//     //                 phrases: [movedPhrase]
//     //             };
//     //             step3Data.groups.push(newGroup);

//     //             if (fromGroup.phrases.length === 0) {
//     //                 step3Data.groups = step3Data.groups.filter(g => g.id !== fromGroupId);
//     //             }
                
//     //             render();
//     //             $('#new-group-dropzone').slideUp('fast');
//     //         }
//     //     });
//     // }
    
//     // function movePhrase(phraseId, fromGroupId, toGroupId) {
//     //     const fromGroup = step3Data.groups.find(g => g.id === fromGroupId);
//     //     const toGroup = step3Data.groups.find(g => g.id === toGroupId);
//     //     if (!fromGroup || !toGroup) return;

//     //     const phraseIndex = fromGroup.phrases.findIndex(p => p.id === phraseId);
//     //     if (phraseIndex === -1) return;

//     //     const [movedPhrase] = fromGroup.phrases.splice(phraseIndex, 1);
//     //     toGroup.phrases.push(movedPhrase);
        
//     //     if (fromGroup.phrases.length === 0) {
//     //         step3Data.groups = step3Data.groups.filter(g => g.id !== fromGroupId);
//     //     }
//     //     render(); // Re-render the entire view
//     // }    

//     // function attachEventListeners() {
//     //     const container = $('#phrase-groups-container');
//     //     const header = $('#step3-sticky-header');
//     //     container.off(); header.off();
//     //     $(document).off('save-step-data'); // Clear previous step listeners

//     //     // --- EDITING A GROUP NAME ---
//     //     container.on('change', '.group-name-input', function() {
//     //         const input = $(this);
//     //         const newName = input.val().trim().toLowerCase();
//     //         const groupId = input.data('group-id');
//     //         const targetGroup = step3Data.groups.find(g => g.id === groupId);

//     //         // --- VALIDATION ---
//     //         // Check if the name already exists in another group's name or its phrases
//     //         const isDuplicate = step3Data.groups.some(group => {
//     //             if (group.id === groupId) return false; // Don't check against self
//     //             if (group.name === newName) return true;
//     //             return group.phrases.some(p => p.text === newName);
//     //         });

//     //         if (newName === '') {
//     //             alert("Group name cannot be empty.");
//     //             input.val(targetGroup.name); // Revert to old name
//     //         } else if (isDuplicate) {
//     //             alert(`The name "${newName}" is already in use as a group name or phrase. Please choose a unique name.`);
//     //             input.val(targetGroup.name); // Revert
//     //         } else {
//     //             // --- SAVE CHANGE ---
//     //             logger.info(`Renaming group "${targetGroup.name}" to "${newName}"`);
//     //             targetGroup.name = newName;
//     //             input.val(newName); // Ensure it's the trimmed/lowercase version
//     //         }
//     //     });

//     //     // --- DELETE GROUP ---
//     //     container.on('click', '.delete-group-btn', function() {
//     //         if (!confirm("Are you sure you want to delete this entire group? All phrases within it will become un-grouped and may form new groups.")) {
//     //             return;
//     //         }
//     //         const groupId = $(this).closest('.phrase-group').data('group-id');
//     //         const groupToDelete = step3Data.groups.find(g => g.id === groupId);
//     //         if (!groupToDelete) return;

//     //         // Re-run the grouping algorithm on all phrases to regenerate groups
//     //         ui.showLoading("Re-grouping phrases...");
//     //         setTimeout(() => {
//     //             const groups = phraseService.groupPhrases(step3Data.allPhrases);
//     //             step3Data.groups = groups;
//     //             render();
//     //             ui.hideLoading();
//     //         }, 50);
//     //     });

//     //     header.on('click', '#step3-new-group-btn', function() {
//     //         const newName = prompt("Enter a name for the new, empty group:");
//     //         if (!newName || newName.trim() === '') return;

//     //         // Check for duplicates
//     //         const isDuplicate = step3Data.groups.some(g => g.name.toLowerCase() === newName.trim().toLowerCase());
//     //         if (isDuplicate) {
//     //             alert("A group with this name already exists.");
//     //             return;
//     //         }

//     //         const newGroup = {
//     //             id: `group-manual-${Date.now()}`,
//     //             name: newName.trim(),
//     //             phrases: []
//     //         };
//     //         step3Data.groups.unshift(newGroup); // Add to the beginning
//     //         render();
//     //     });        
        
//     //     // --- CONTEXTUAL SAVE LISTENER ---
//     //     $(document).on('save-step-data', function(event, step) {
//     //         if (step !== 3) return; // Only respond if we are the active step
            
//     //         const dataToSave = {
//     //             step: 3,
//     //             version: "1.0",
//     //             // We only need to save the groups. Phrases can be rebuilt from this.
//     //             data: { groups: step3Data.groups } 
//     //         };
            
//     //         try {
//     //             const textToSave = JSON.stringify(dataToSave, null, 2); // Pretty print JSON
//     //             const blob = new Blob([textToSave], { type: 'application/json' });
//     //             const url = URL.createObjectURL(blob);
//     //             const a = document.createElement('a');
//     //             a.href = url;
//     //             a.download = `Step3_Phrase_Groups.json`;
//     //             a.click();
//     //             URL.revokeObjectURL(url);
//     //             logger.info("Saved Step 3 data.");
//     //         } catch (e) { /* ... error handling ... */ }
//     //     });

//     //     // --- PROCEED TO STEP 4 ---
//     //     $('body').off('click', '#proceed-to-step4-btn').on('click', '#proceed-to-step4-btn', function() {
//     //         if (!confirm("This will lock the phrase groups. Are you sure you want to proceed?")) {
//     //             return;
//     //         }
//     //         logger.info("Step 3 complete. Passing final groups to global state.");
            
//     //         // Create the global state object for the next step
//     //         if (!window.appState.step3) window.appState.step3 = {};
//     //         window.appState.step3.finalData = {
//     //             groups: step3Data.groups,
//     //             allPhrases: step3Data.allPhrases
//     //         };
            
//     //         // Use the navigation callback to go to the next step
//     //         if (window.navigationCallback) {
//     //             window.navigationCallback(4);
//     //         }
//     //     });        
//     // }

//     function attachEventListeners() {
//         logger.info("Step 3 Event Listeners Attached.");
//     }    

//     return { init };

// })(logger, PhraseService, uiService);