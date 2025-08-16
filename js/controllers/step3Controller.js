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

    /** Processes fresh data from Step 2. */
    function processNewData(dataFromStep2) {
        ui.showLoading("Extracting unique phrases...");
        setTimeout(() => {
            originalPhrases = phraseService.extractUniquePhrases(dataFromStep2);
            
            ui.showLoading("Applying automatic tagging...");
            applyHeuristics();

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
        let currentTagBuffer = [];

        const processBuffer = () => {
            if (currentTagBuffer.length > 0) {
                const tagText = currentTagBuffer.join('');
                const isSelected = tagState.has(tagText.toLowerCase());
                const alias = tagState.get(tagText.toLowerCase())?.alias || '';
                contentHtml += `
                    <span class="word-tag ${isSelected ? 'tag-selected' : ''}" data-tag-text="${escape(tagText)}">
                        ${tagText}
                        <i class="fas fa-pencil-alt alias-icon" title="Set alias: ${alias || 'none'}"></i>
                    </span>`;
                currentTagBuffer = [];
            }
        };

        for (const token of tokens) {
            if (token.isWord) {
                currentTagBuffer.push(token.text);
            } else {
                processBuffer();
                contentHtml += `<span class="whitespace">${token.text}</span>`;
            }
        }
        processBuffer(); // Process any remaining buffer

        return `<div class="phrase-card" data-phrase-id="${phrase.id}">${contentHtml}</div>`;
    }

    /** The core logic for handling tag clicks and merging. */
    function handleTagClick(clickedTag) {
        const fullTagText = unescape(clickedTag.data('tag-text'));
        const lowerCaseTag = fullTagText.toLowerCase();
        const isSelected = clickedTag.hasClass('tag-selected');

        // Step 1: Update the global state
        if (isSelected) {
            tagState.delete(lowerCaseTag);
        } else {
            tagState.set(lowerCaseTag, { alias: '' });
        }
        
        // Step 2: Attempt to merge adjacent tags in the clicked card
        const card = clickedTag.closest('.phrase-card');
        const merged = attemptMerge(card);

        // Step 3: Re-render the entire UI to reflect the global change
        if (!merged) {
             render(); // Full re-render if no merge happened
        }
    }
    
    /** Checks for and performs tag merging within a card. */
    function attemptMerge(card) {
        const tagsAndSpaces = card.children('span');
        let hasMerged = false;

        for (let i = 0; i < tagsAndSpaces.length - 2; i++) {
            const current = $(tagsAndSpaces[i]);
            const space = $(tagsAndSpaces[i + 1]);
            const next = $(tagsAndSpaces[i + 2]);

            // Check for two adjacent, selected word tags
            if (current.hasClass('word-tag tag-selected') && space.hasClass('whitespace') && next.hasClass('word-tag tag-selected')) {
                const oldTag1 = unescape(current.data('tag-text')).toLowerCase();
                const oldTag2 = unescape(next.data('tag-text')).toLowerCase();
                const newTagText = `${unescape(current.data('tag-text'))}${space.text()}${unescape(next.data('tag-text'))}`;
                const newTagLower = newTagText.toLowerCase();

                // Smart Un-selection: Remove old individual tags and select the new merged one.
                tagState.delete(oldTag1);
                tagState.delete(oldTag2);
                tagState.set(newTagLower, { alias: '' });

                hasMerged = true;
                break; // Stop after the first merge to simplify state updates
            }
        }

        if (hasMerged) {
            render(); // A merge forces a full re-render
        }
        return hasMerged;
    }

    function attachEventListeners() {
        selectors.cardsContainer.off().on('click', '.word-tag', function() {
            handleTagClick($(this));
        }).on('click', '.alias-icon', function(e) {
            e.stopPropagation();
            const tagSpan = $(this).parent();
            const tagText = unescape(tagSpan.data('tag-text')).toLowerCase();
            const currentAlias = tagState.get(tagText)?.alias || '';
            const newAlias = prompt(`Enter an alternate name for "${tagText}":`, currentAlias);
            if (newAlias !== null) {
                tagState.set(tagText, { alias: newAlias.trim() });
                $(this).attr('title', `Set alias: ${newAlias.trim() || 'none'}`);
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