/**
 * @file phraseService.js
 * @description Handles phrase extraction, similarity analysis, and grouping for Step 3.
 */
const PhraseService = (function(logger) {

    // Common English stop words to ignore during similarity comparison.
    const STOP_WORDS = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'is', 'am', 'are', 'was', 'were', 'and', 'or', 'but']);

    /**
     * Extracts unique phrases from the finalized data of Step 2.
     * @param {Object} step2FinalData - The data object from appState.
     * @returns {Array<Object>} An array of unique phrase objects {id, text, count}.
     */
    function extractUniquePhrases(step2FinalData) {
        const phraseMap = new Map();
        const splitter = /[.,;()\[\]]/g; // Split by common delimiters

        Object.values(step2FinalData).forEach(yearData => {
            yearData.forEach(entry => {
                if (!entry.phraseText) return;

                entry.phraseText.split(splitter).forEach(p => {
                    const phrase = p.trim().toLowerCase();
                    if (phrase && phrase.length > 2) { // Ignore very short phrases
                        if (!phraseMap.has(phrase)) {
                            const safeId = `phrase-${phrase.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random()}`;
                            phraseMap.set(phrase, { text: phrase, count: 0, id: safeId });
                        }
                        phraseMap.get(phrase).count++;
                    }
                });
            });
        });
        logger.info(`Extracted ${phraseMap.size} unique phrases.`);
        return Array.from(phraseMap.values());
    }

    /**
     * Calculates similarity between two phrases, ignoring word order.
     * Uses Jaccard similarity on token sets, enhanced by Levenshtein for close matches.
     * @param {string} str1
     * @param {string} str2
     * @returns {number} A similarity score between 0 and 1.
     */
    function calculateSimilarity(str1, str2) {
        // Tokenize and remove stop words
        const getTokens = (s) => new Set(s.split(/\s+/).filter(token => !STOP_WORDS.has(token)));
        const set1 = getTokens(str1);
        const set2 = getTokens(str2);

        if (set1.size === 0 || set2.size === 0) return 0;
        
        // Jaccard Index calculation
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        const jaccardIndex = intersection.size / union.size;

        // If Jaccard is high, refine with Levenshtein on the full string for typo-sensitivity
        if (jaccardIndex > 0.6) {
            const levenshteinScore = levenshtein(str1, str2);
            // Average the two scores to get a blended result
            return (jaccardIndex + levenshteinScore) / 2;
        }

        return jaccardIndex;
    }

    /**
     * Levenshtein distance based similarity score.
     * @returns {number} A similarity score between 0 and 1.
     */
    function levenshtein(s1, s2) {
        let longer = s1, shorter = s2;
        if (s1.length < s2.length) { longer = s2; shorter = s1; }
        let longerLength = longer.length;
        if (longerLength === 0) return 1.0;
        
        const costs = [];
        for (let i = 0; i <= shorter.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= longer.length; j++) {
                if (i === 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (shorter.charAt(i - 1) !== longer.charAt(j - 1))
                        newValue = Math.min(newValue, lastValue, costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[longer.length] = lastValue;
        }
        return (longerLength - costs[longer.length]) / parseFloat(longerLength);
    }

    /**
     * Automatically groups similar phrases together.
     * @param {Array<Object>} uniquePhrases - The output from extractUniquePhrases.
     * @param {number} threshold - The similarity score required to be grouped (e.g., 0.6).
     * @returns {Array<Object>} An array of group objects.
     */
    function groupPhrases(uniquePhrases, threshold = 0.6) {
        const groups = [];
        const assignedPhrases = new Set();
        // Sort by count descending to use more common phrases as group seeds.
        uniquePhrases.sort((a,b) => b.count - a.count);

        uniquePhrases.forEach(phrase => {
            if (assignedPhrases.has(phrase.id)) return;

            const newGroup = { 
                id: `group-${phrase.id}`, 
                name: phrase.text, // Initial name is the seed phrase
                phrases: [phrase] 
            };
            assignedPhrases.add(phrase.id);

            uniquePhrases.forEach(otherPhrase => {
                if (phrase.id === otherPhrase.id || assignedPhrases.has(otherPhrase.id)) return;

                const similarity = calculateSimilarity(phrase.text, otherPhrase.text);
                if (similarity >= threshold) {
                    newGroup.phrases.push(otherPhrase);
                    assignedPhrases.add(otherPhrase.id);
                }
            });
            
            // Sort phrases within the group for consistent display
            newGroup.phrases.sort((a, b) => b.count - a.count || a.text.localeCompare(b.text));
            // The best name for the group is often the shortest, most common phrase.
            newGroup.name = newGroup.phrases.reduce((best, current) => {
                return current.text.length < best.text.length ? current : best;
            }).text;

            groups.push(newGroup);
        });
        
        logger.info(`Created ${groups.length} initial groups.`);
        return groups;
    }
    
    /**
     * Sorts group cards to place similar ones near each other.
     * @param {Array<Object>} groups - The array of group objects.
     * @returns {Array<Object>} The sorted array of group objects.
     */
    function sortGroupsSpatially(groups) {
        if (groups.length < 3) return groups;

        // Create a "signature" for each group (a set of all words in its tags).
        groups.forEach(group => {
            const wordSet = new Set();
            group.phrases.forEach(p => {
                p.text.split(/\s+/).forEach(word => {
                    if(!STOP_WORDS.has(word)) wordSet.add(word);
                });
            });
            group.signature = wordSet;
        });

        const sortedGroups = [];
        let remainingGroups = [...groups];
        
        // Start with the largest group
        remainingGroups.sort((a,b) => b.phrases.length - a.phrases.length);
        let currentGroup = remainingGroups.shift();
        sortedGroups.push(currentGroup);

        while (remainingGroups.length > 0) {
            remainingGroups.sort((a, b) => {
                const simA = calculateJaccard(currentGroup.signature, a.signature);
                const simB = calculateJaccard(currentGroup.signature, b.signature);
                return simB - simA; // Sort by highest similarity to the current group
            });
            currentGroup = remainingGroups.shift();
            sortedGroups.push(currentGroup);
        }

        logger.info("Spatially sorted groups for intuitive layout.");
        return sortedGroups;
    }

    // Helper for spatial sort
    function calculateJaccard(set1, set2) {
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    return { 
        extractUniquePhrases,
        groupPhrases,
        sortGroupsSpatially
    };
})(logger);