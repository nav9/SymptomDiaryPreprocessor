const PhraseService = (function(logger) {

    // Standard Levenshtein distance implementation.
    function levenshtein(s1, s2) {
        if (!s1 || !s2) return 999;
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        let longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    function extractUniquePhrases(step2FinalData) {
        const phraseMap = new Map();
        const splitter = /[,.()\[\]]/g;

        Object.values(step2FinalData).forEach(yearData => {
            yearData.forEach(entry => {
                if (entry.isComment || !entry.phraseText) return;
                entry.phraseText.split(splitter).forEach(p => {
                    const phrase = p.trim().toLowerCase();
                    if (phrase && phrase.length > 1) {
                        if (!phraseMap.has(phrase)) {
                            const safeId = phrase.replace(/[^a-zA-Z0-9]/g, '-');
                            phraseMap.set(phrase, { text: phrase, count: 0, id: `phrase-${safeId}-${Math.random()}` });
                        }
                        phraseMap.get(phrase).count++;
                    }
                });
            });
        });
        return Array.from(phraseMap.values());
    }

    function createInitialGroups(uniquePhrases) {
        // Sort phrases alphabetically for a predictable order
        uniquePhrases.sort((a, b) => a.text.localeCompare(b.text));

        const groups = uniquePhrases.map(phrase => {
            return {
                id: `group-${phrase.id}`,
                name: phrase.text, // The group name is the phrase itself
                phrases: [phrase]   // The group contains only this one phrase
            };
        });

        return groups;
    }

    function groupPhrases(uniquePhrases, threshold = 0.7) { // Increased threshold for better accuracy
        const groups = [];
        const assignedPhrases = new Set();
        uniquePhrases.sort((a,b) => b.count - a.count);

        uniquePhrases.forEach(phrase => {
            if (assignedPhrases.has(phrase.id)) return;
            const newGroup = { 
                id: `group-${phrase.id}`, 
                phrases: [phrase],
                name: phrase.text 
            };
            assignedPhrases.add(phrase.id);
            uniquePhrases.forEach(otherPhrase => {
                // Skip if it's the same phrase or already in a group
                if (phrase.id === otherPhrase.id || assignedPhrases.has(otherPhrase.id)) {
                    return;
                }

                const similarity = levenshtein(phrase.text, otherPhrase.text);
                if (similarity >= threshold) {
                    // It's similar, add it to our new group and mark it as assigned.
                    newGroup.phrases.push(otherPhrase);
                    assignedPhrases.add(otherPhrase.id);
                }
            });
            // After checking all other phrases, finalize and push the new group.
            // (The logic to determine the best name is still valid)
            newGroup.phrases.sort((a,b) => {
                if (a.text.length !== b.text.length) return a.text.length - b.text.length;
                return b.count - a.count;
            });
            newGroup.name = newGroup.phrases[0].text;
            
            groups.push(newGroup);
        });
        return groups;
    }

    return { 
        extractUniquePhrases,
        createInitialGroups,
        groupPhrases // Corrected from groupSimilarPhrases
    };
})(logger);