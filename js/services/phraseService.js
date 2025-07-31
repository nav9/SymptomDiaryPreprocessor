const PhraseService = (function(logger) {

    // Simple Levenshtein distance implementation
    function levenshtein(s, t) {
        // ... (standard implementation of Levenshtein algorithm)
    }

    function extractUniquePhrases(step2FinalData) {
        const phraseMap = new Map();
        // Regex to split by comma, period, or content within () or []
        const splitter = /[,.()\[\]]/g;

        Object.values(step2FinalData).forEach(yearData => {
            yearData.forEach(entry => {
                if (entry.isComment) return;
                const rawPhraseText = entry.rawText.replace(/^~?\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*/, '');
                rawPhraseText.split(splitter).forEach(p => {
                    const phrase = p.trim().toLowerCase();
                    if (phrase) {
                        if (!phraseMap.has(phrase)) {
                            phraseMap.set(phrase, { text: phrase, count: 0, id: `phrase-${phrase.replace(/\s+/g, '-')}` });
                        }
                        phraseMap.get(phrase).count++;
                    }
                });
            });
        });
        return Array.from(phraseMap.values());
    }

    function groupPhrases(uniquePhrases, threshold = 0.5) {
        const groups = [];
        const assignedPhrases = new Set();

        uniquePhrases.sort((a,b) => b.count - a.count); // Process more common phrases first

        uniquePhrases.forEach(phrase => {
            if (assignedPhrases.has(phrase.id)) return;

            const newGroup = { id: `group-${phrase.id}`, phrases: [phrase] };
            assignedPhrases.add(phrase.id);

            uniquePhrases.forEach(otherPhrase => {
                if (assignedPhrases.has(otherPhrase.id)) return;

                const distance = levenshtein(phrase.text, otherPhrase.text);
                const similarity = 1 - (distance / Math.max(phrase.text.length, otherPhrase.text.length));
                
                if (similarity >= threshold) {
                    newGroup.phrases.push(otherPhrase);
                    assignedPhrases.add(otherPhrase.id);
                }
            });
            groups.push(newGroup);
        });
        return groups;
    }

    return { extractUniquePhrases, groupPhrases };

})(logger);