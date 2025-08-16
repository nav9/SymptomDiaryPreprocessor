/**
 * @file phraseService.js
 * @description Handles phrase extraction, pre-selection, and sorting for Step 3.
 */
const PhraseService = (function(logger) {

    // A comprehensive set of keywords for automatic pre-selection.
    const HEURISTICS_KEYWORDS = new Set([
        // Symptoms & Sensations
        'pain', 'ache', 'headache', 'migraine', 'dull', 'sharp', 'stabbing', 'throbbing', 'burning', 'sore', 'itchy', 'numbness', 'tingling', 'dizzy', 'dizziness', 'vertigo', 'nausea', 'vomiting', 'fatigue', 'tired', 'lethargy', 'weakness', 'fever', 'chills', 'sweats', 'bloating', 'cramps', 'spasm', 'inflammation', 'swelling', 'rash', 'hives', 'anxiety', 'stress', 'depression', 'insomnia', 'congestion', 'cough', 'sneezing', 'diarrhea', 'constipation',
        // Body Parts
        'head', 'temple', 'forehead', 'eye', 'ear', 'nose', 'throat', 'neck', 'shoulder', 'back', 'upper', 'lower', 'spine', 'chest', 'rib', 'stomach', 'abdomen', 'hip', 'leg', 'thigh', 'knee', 'calf', 'ankle', 'foot', 'arm', 'elbow', 'wrist', 'hand', 'finger', 'muscle', 'joint', 'stomach', 'gut', 'intestine', 'kidney', 'liver', 'molar', 'tooth', 'gum',
        // Foods
        'rice', 'chicken', 'fish', 'beef', 'pork', 'eggs', 'oatmeal', 'bread', 'pasta', 'cheese', 'milk', 'yogurt', 'apple', 'banana', 'orange', 'berries', 'nuts', 'almonds', 'coffee', 'tea', 'water', 'sugar', 'salt', 'oil', 'potato', 'tomato', 'onion', 'garlic', 'spinach', 'broccoli', 'carrot', 'salad', 'soup', 'cabbage', 'prawns', 'lentils', 'beans',
        // Medicines & Treatments
        'paracetamol', 'ibuprofen', 'aspirin', 'antacid', 'gargle', 'antibiotic', 'probiotic', 'vitamin', 'supplement', 'medication', 'pill', 'tablet',
        // General Indicators
        'feeling', 'good', 'bad', 'better', 'worse', 'started', 'stopped', 'increased', 'decreased',
        // Food Contaminants
        'arsenic', 'mercury', 'lead', 'cadmium', 'pesticide', 'pesticides', 'herbicide', 'herbicides', 'bpa', 'aflatoxin', 'aflatoxins', 'mycotoxin', 'mycotoxins', 'salmonella', 'e.coli', 'listeria', 'acrylamide', 'dioxins', 'pcbs',        
    ]);

    /**
     * Extracts unique phrases from Step 2 data.
     * @param {Object} step2FinalData - The data object from appState.
     * @returns {Array<Object>} An array of unique phrase objects { id, text }.
     */
    function extractUniquePhrases(step2FinalData) {
        const uniquePhrases = new Set();
        const splitter = /[.,;()\[\]]/g;

        Object.values(step2FinalData).forEach(yearData => {
            yearData.forEach(entry => {
                if (entry.phraseText) {
                    entry.phraseText.split(splitter).forEach(p => {
                        const phrase = p.trim();
                        if (phrase) uniquePhrases.add(phrase);
                    });
                }
            });
        });
        
        logger.info(`Extracted ${uniquePhrases.size} unique phrases.`);
        // Convert the Set to the required object structure for the controller.
        return Array.from(uniquePhrases, (phrase, index) => ({
            id: `phrase-${index}-${Date.now()}`,
            text: phrase
        }));
    }

    /**
     * Parses a phrase string into an array of word/whitespace tokens.
     * @param {string} phraseText - The full phrase.
     * @returns {Array<Object>} An array of token objects, e.g., [{text: "word", isWord: true}, {text: " ", isWord: false}].
     */
    function tokenizePhrase(phraseText) {
        // This regex splits the string by spaces, but keeps the spaces as delimiters in the result.
        return phraseText.split(/(\s+)/).filter(Boolean).map(token => ({
            text: token,
            isWord: /\S+/.test(token) // It's a word if it contains non-whitespace characters
        }));
    }

    /**
     * Sorts phrase cards to place similar ones near each other.
     * @param {Array<Object>} phrases - The array of phrase objects.
     * @returns {Array<Object>} The sorted array of phrase objects.
     */
    function sortCardsSpatially(phrases) {
        if (phrases.length < 3) return phrases;

        const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'is', 'am', 'are', 'was', 'were']);
        phrases.forEach(p => {
            p.signature = new Set(p.text.toLowerCase().split(/\s+/).filter(w => !stopWords.has(w)));
        });

        const jaccard = (set1, set2) => {
            const intersection = new Set([...set1].filter(x => set2.has(x)));
            const union = new Set([...set1, ...set2]);
            return union.size === 0 ? 0 : intersection.size / union.size;
        };

        const sorted = [];
        let remaining = [...phrases];
        let current = remaining.pop(); // Start with an arbitrary phrase
        sorted.push(current);

        while (remaining.length > 0) {
            remaining.sort((a, b) => jaccard(current.signature, b.signature) - jaccard(current.signature, a.signature));
            current = remaining.shift();
            sorted.push(current);
        }

        logger.info("Spatially sorted phrase cards for intuitive layout.");
        return sorted;
    }

    return {
        HEURISTICS_KEYWORDS,
        extractUniquePhrases,
        tokenizePhrase,
        sortCardsSpatially
    };

})(logger);