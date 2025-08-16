/**
 * @file step3Controller.js
 * @description Manages the interactive word tagging interface for Step 3.
 */
const Step3Controller = (function(logger, ui, phraseService) {

    const selectors = {
        container: $('#step-3-content'),
        cardsContainer: $('#phrase-cards-container'),
        addPhraseBtn: $('#step3-add-phrase-btn'),
        uploadBtn: $('#upload-step3-state'),
        downloadBtn: $('#download-step3-state'),
        proceedTopBtn: $('#step3-proceed-top'),
        proceedBottomBtn: $('#step3-proceed-bottom'),
    };

    let originalPhrases = []; // Array of {id, text} objects.
    let tagState = new Map(); // Global state: Map<string, {alias: string}>
    let navCallback = null;

    function init(navigationCallback, payload) {
        logger.info("Initializing Step 3: Word Tagging.");
        navCallback = navigationCallback;
        
        if (payload) {
            loadState(payload);
        } else {
            const dataFromStep2 = window.appState?.step2?.finalData;
            if (!dataFromStep2 || Object.keys(dataFromStep2).length === 0) {
                selectors.cardsContainer.html('<div class="alert alert-warning">No data received from Step 2.</div>');
                return;
            }
            processNewData(dataFromStep2);
        }
    }

    function processNewData(dataFromStep2) {
        ui.showLoading("Extracting unique phrases...");
        setTimeout(() => {
            originalPhrases = phraseService.extractUniquePhrases(dataFromStep2);
            
            ui.showLoading("Applying automatic tagging...");
            applyHeuristics();

            // CORRECTED: Run merge check immediately after applying heuristics.
            ui.showLoading("Merging adjacent tags...");
            checkForMerges();

            ui.showLoading("Sorting phrases for layout...");
            originalPhrases = phraseService.sortCardsSpatially(originalPhrases);
            
            render();
            attachEventListeners();
            ui.hideLoading();
        }, 50);
    }
    
    /** Loads a previously saved state. */
    function loadState(savedState) {
        ui.showLoading("Loading saved tags...");
        setTimeout(() => {
            originalPhrases = savedState.phrases;
            tagState = new Map(savedState.tags);
            logger.info(`Loaded ${originalPhrases.length} phrases and ${tagState.size} tags.`);
            render();
            attachEventListeners();
            ui.hideLoading();
        }, 50);
    }

    /** Pre-selects common keywords from the heuristics dictionary. */
    function applyHeuristics() {
        tagState.clear();
        const tokens = new Set();
        originalPhrases.forEach(p => {
            p.text.toLowerCase().split(/\s+/).forEach(word => tokens.add(word));
        });

        tokens.forEach(token => {
            if (phraseService.HEURISTICS_KEYWORDS.has(token)) {
                tagState.set(token, { alias: '' });
            }
        });
        logger.info(`Pre-selected ${tagState.size} common tags.`);
    }

    /** Renders the entire UI from the current state. */
    function render() {
        selectors.cardsContainer.empty();
        originalPhrases.forEach(phrase => {
            selectors.cardsContainer.append(createPhraseCard(phrase));
        });
    }

    /** Creates the HTML for a single phrase card. */
    function createPhraseCard(phrase) {
        const tokens = phraseService.tokenizePhrase(phrase.text);
        let contentHtml = '';

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (!token.isWord) {
                contentHtml += `<span class="whitespace">${token.text}</span>`;
                continue;
            }

            // Look-ahead for the longest possible matching multi-word tag
            let bestMatch = { text: '', endIndex: -1 };
            let currentPhrase = '';
            for (let j = i; j < tokens.length; j++) {
                currentPhrase += tokens[j].text;
                if (tagState.has(currentPhrase.toLowerCase())) {
                    bestMatch = { text: currentPhrase, endIndex: j };
                }
            }

            // If a multi-word tag was found, render it as a single block
            if (bestMatch.endIndex > -1) {
                const tagText = bestMatch.text;
                const lowerCaseTag = tagText.toLowerCase();
                const alias = tagState.get(lowerCaseTag)?.alias || '';
                
                contentHtml += `
                    <span class="word-tag tag-selected" data-tag-text="${escape(tagText)}" title="Alias: ${alias || 'none'}">
                        ${tagText}
                        <i class="fas fa-tag alias-icon"></i>
                        ${alias ? `<small class="tag-alias">${alias}</small>` : ''}
                    </span>`;
                
                i = bestMatch.endIndex; // Jump the loop index forward
            } else {
                // Otherwise, render the single word tag
                const tagText = token.text;
                const lowerCaseTag = tagText.toLowerCase();
                const isSelected = tagState.has(lowerCaseTag);
                const alias = tagState.get(lowerCaseTag)?.alias || '';

                contentHtml += `
                    <span class="word-tag ${isSelected ? 'tag-selected' : ''}" data-tag-text="${escape(tagText)}" title="Alias: ${alias || 'none'}">
                        ${tagText}
                        <i class="fas fa-tag alias-icon"></i>
                        ${alias ? `<small class="tag-alias">${alias}</small>` : ''}
                    </span>`;
            }
        }

        return `<div class="phrase-card" data-phrase-id="${phrase.id}">${contentHtml}</div>`;
    }

    /** The core logic for handling tag clicks and merging. */
    function handleTagClick(clickedTag) {
        const fullTagText = unescape(clickedTag.data('tag-text'));
        const lowerCaseTag = fullTagText.toLowerCase();
        const isSelected = clickedTag.hasClass('tag-selected');

        if (isSelected) {
            tagState.delete(lowerCaseTag);
        } else {
            tagState.set(lowerCaseTag, { alias: '' });
            checkForMerges(); // Check for new merges after any selection
        }
        render(); // Always re-render to ensure global consistency
    }

    function checkForMerges() {
        let stateModified;
        do {
            stateModified = false;
            const newTagState = new Map(tagState);
            
            // This loop must run on the original phrase text, not the rendered tags.
            for (const phrase of originalPhrases) {
                const tokens = phraseService.tokenizePhrase(phrase.text);
                
                for (let i = 0; i < tokens.length; i++) {
                    if (!tokens[i].isWord) continue;
                    
                    const firstWord = tokens[i].text.toLowerCase();
                    if (!newTagState.has(firstWord)) continue;

                    // Build a chain of adjacent selected tags
                    let chain = [tokens[i]];
                    let currentChainText = tokens[i].text;
                    let lastWordIndex = i;

                    for (let j = i + 1; j < tokens.length; j++) {
                        const token = tokens[j];
                        if (token.isWord) {
                            const nextWord = (currentChainText + token.text).toLowerCase();
                            // This is incorrect logic. Need to check if the next word *itself* is a tag.
                            const nextWordAlone = token.text.toLowerCase();
                            if (newTagState.has(nextWordAlone)) {
                                 // Add the space(s) and the word to the chain
                                for (let k = lastWordIndex + 1; k < j; k++) {
                                    chain.push(tokens[k]);
                                }
                                chain.push(token);
                                lastWordIndex = j;
                            } else {
                                break; // Chain is broken
                            }
                        }
                    }

                    if (chain.filter(t => t.isWord).length > 1) {
                        const componentTags = chain.filter(t => t.isWord).map(t => t.text.toLowerCase());
                        const mergedTagText = chain.map(t => t.text).join('');
                        
                        // Modify the tag state
                        componentTags.forEach(tag => newTagState.delete(tag));
                        newTagState.set(mergedTagText.toLowerCase(), { alias: '' });
                        
                        tagState = newTagState;
                        stateModified = true;
                        break; // Restart the entire process with the new state
                    }
                }
                if (stateModified) break;
            }
        } while (stateModified);
    }  
    
    /** Checks for and performs tag merging within a card. */
    function attemptMergeOnCard(card) {
        const tagsAndSpaces = card.children('span');
        let hasMerged = false;
        
        for (let i = 0; i < tagsAndSpaces.length - 1; i++) {
            const current = $(tagsAndSpaces[i]);
            if (!current.hasClass('tag-selected')) continue;

            // Find the next actual word-tag, skipping whitespace
            let nextIndex = i + 1;
            while(nextIndex < tagsAndSpaces.length && !$(tagsAndSpaces[nextIndex]).hasClass('word-tag')) {
                nextIndex++;
            }
            if (nextIndex >= tagsAndSpaces.length) continue;
            const next = $(tagsAndSpaces[nextIndex]);

            // Check if the next tag is also selected
            if (next.hasClass('tag-selected')) {
                const oldTag1 = unescape(current.data('tag-text')).toLowerCase();
                const oldTag2 = unescape(next.data('tag-text')).toLowerCase();

                // Collect all text between the two tags (for multiple spaces)
                const spaceText = tagsAndSpaces.slice(i + 1, nextIndex).text();
                const newTagText = `${unescape(current.data('tag-text'))}${spaceText}${unescape(next.data('tag-text'))}`;
                
                // Update global state: remove old tags, add new one
                tagState.delete(oldTag1);
                tagState.delete(oldTag2);
                tagState.set(newTagText.toLowerCase(), { alias: '' });
                
                hasMerged = true;
                break; // Exit after one merge to restart the process cleanly
            }
        }
        // If a merge happened, the calling function will handle the re-render.
        return hasMerged;
    }

    function attachEventListeners() {
        selectors.cardsContainer.off()
            .on('click', '.word-tag', function() {
                handleTagClick($(this));
            })
            .on('click', '.alias-icon', function(e) {
                e.stopPropagation();
                const tagSpan = $(this).closest('.word-tag');
                const tagText = unescape(tagSpan.data('tag-text'));
                const lowerCaseTag = tagText.toLowerCase();
                const currentAlias = tagState.get(lowerCaseTag)?.alias || '';
                const newAlias = prompt(`Enter an alternate name for "${tagText}":`, currentAlias);

                if (newAlias !== null) { // Handle cancel vs. empty string
                    tagState.set(lowerCaseTag, { alias: newAlias.trim() });
                    render(); // Re-render to show/hide the alias text
                }
            });

        selectors.addPhraseBtn.off().on('click', function() {
            const newPhraseText = prompt("Enter a new phrase to tag:");
            if (newPhraseText && newPhraseText.trim()) {
                originalPhrases.unshift({
                    id: `phrase-manual-${Date.now()}`,
                    text: newPhraseText.trim()
                });
                render();
            }
        });
        
        selectors.downloadBtn.off().on('click', function() {
            const stateToSave = {
                phrases: originalPhrases,
                tags: Array.from(tagState.entries())
            };
            const dataStr = JSON.stringify(stateToSave, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Step3_tags_${new Date().toISOString().slice(0,10)}.json`;
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
                    if (savedState.phrases && savedState.tags) {
                        loadState(savedState);
                    } else { throw new Error("Invalid format"); }
                } catch (err) { alert("Error: Could not parse the Step 3 file."); }
            };
            reader.readAsText(file);
            $(this).val('');
        });

        const proceedAction = function() {
            if (!window.appState.step3) window.appState.step3 = {};
            window.appState.step3.tags = Array.from(tagState.entries()); // Pass the tags
            // The original Step 2 data is implicitly still in `window.appState.step2.finalData`
            alert("Proceeding to Step 4 (to be built)!");
        };
        selectors.proceedTopBtn.off().on('click', proceedAction);
        selectors.proceedBottomBtn.off().on('click', proceedAction);
    }

    return { init };

})(logger, uiService, PhraseService);