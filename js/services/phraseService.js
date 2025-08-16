/**
 * @file phraseService.js
 * @description Handles phrase extraction, pre-selection, and sorting for Step 3.
 */
const PhraseService = (function(logger) {

    // CORRECTED: Massively expanded and cleaned keywords from the user-provided list.
    const HEURISTICS_KEYWORDS = new Set(['aata', 'abdomen', 'abdominal', 'ache', 'ached', 'aches', 'aching', 'achy', 'acid', 'active', 'ajwain', 'almond', 'almonds', 'amla', 'amoxicillin', 'amount', 'ankle', 'antibiotic', 'ants', 'anus', 'anxiety', 'appendix', 'appam', 'appetite', 'apple', 'apples', 'arm', 'armpit', 'armpits', 'arms', 'arsenic', 'asofteida', 'asparagus', 'avakaya', 'avial', 'avocado', 'back', 'backbone', 'bacteria', 'bajra', 'banana', 'bananas', 'beans', 'beef', 'beetroot', 'besan', 'bhajji', 'biceps', 'biriyani', 'biscuit', 'biscuits', 'bladder', 'bleeding', 'bloating', 'blood', 'body', 'boiled', 'bone', 'bones', 'boondi', 'bottle', 'brain', 'bread', 'breakfast', 'breath', 'breathing', 'brinjal', 'brocolli', 'bruise', 'bruised', 'burning', 'burp', 'burping', 'burps', 'butter', 'buttercream', 'butternut', 'cabbage', 'cadmium', 'cake', 'calf', 'calves', 'capsicum', 'carambola', 'cardamom', 'carrot', 'carrots', 'cashew', 'cashews', 'cauliflower', 'cavities', 'cavity', 'chapathi', 'cheese', 'cheera', 'cherries', 'chest', 'chevon', 'chicken', 'chickens', 'chickpeas', 'chills', 'chocolate', 'choking', 'cholesterol', 'chutney', 'cinnamon', 'clam', 'cocacinea', 'coconut', 'coffee', 'cold', 'colocasia', 'congestion', 'constipated', 'constipation', 'contaminant', 'contaminants', 'cooked', 'corn', 'cornflakes', 'corriander', 'cough', 'coughed', 'coughing', 'coughs', 'cowpea', 'cramp', 'cramping', 'cramps', 'crunchy', 'cup', 'curd', 'curry', 'custard', 'dal', 'dandruff', 'dates', 'diaphragm', 'diarrhea', 'dizziness', 'dizzy', 'dosa', 'drowsiness', 'drowsy', 'drumstick', 'duck', 'dull', 'ear', 'eardrum', 'eardrums', 'earlobe', 'ears', 'eaten', 'eating', 'egg', 'eggs', 'elbow', 'endosperm', 'energetic', 'esophagus', 'escarole', 'eye', 'eyeball', 'eyeballs', 'eyebrow', 'eyebrows', 'eyelash', 'eyelashes', 'eyelid', 'eyelids', 'eyes', 'eyesight', 'faint', 'fatigue', 'fear', 'feeling', 'feelings', 'feels', 'feet', 'fenugreek', 'fever', 'feverish', 'few', 'finger', 'fingernail', 'fingernails', 'fingers', 'fish', 'flake', 'flaking', 'flat', 'flower', 'flu', 'foam', 'food', 'foods', 'foot', 'forearm', 'forearms', 'forehead', 'foxtail', 'fried', 'fruit', 'fruits', 'fungal', 'fungus', 'gallbladder', 'ganache', 'garlic', 'gas', 'gastric', 'ghee', 'ginger', 'gland', 'glands', 'goat', 'goosebumps', 'gourd', 'gram', 'grapes', 'green', 'grinding', 'groin', 'groundnut', 'guava', 'gulab', 'gum', 'gumline', 'gums', 'gut', 'halwa', 'hand', 'hands', 'head', 'headache', 'headacheish', 'healing', 'health', 'healthy', 'heart', 'heartbeat', 'heartbeats', 'heaviness', 'heavy', 'heel', 'herbicide', 'herbicides', 'hiccups', 'hip', 'hips', 'homemade', 'hot', 'hunger', 'hungry', 'hurt', 'ibuprofen', 'ice', 'idli', 'idlis', 'inflammation', 'infection', 'infections', 'insomnia', 'intestinal', 'intestine', 'intestines', 'iron', 'irritated', 'irritating', 'irritation', 'itch', 'itched', 'itches', 'itchiness', 'itching', 'itchy', 'jackfruit', 'jaggery', 'jam', 'jamun', 'jaw', 'jawline', 'jawlines', 'jaws', 'jeera', 'joint', 'joints', 'jowar', 'juice', 'juices', 'karimeen', 'ketchup', 'kidney', 'kidneys', 'knee', 'kneecap', 'knees', 'knuckle', 'knuckles', 'kodampuli', 'kodubale', 'koorka', 'kovakka', 'kozhukatta', 'kulith', 'kuzhalappam', 'laddoo', 'large', 'lead', 'leaf', 'leg', 'legs', 'lentils', 'less', 'lethargic', 'lettuce', 'lime', 'lip', 'lips', 'listeria', 'little', 'liver', 'loose', 'lungs', 'mackerel', 'maida', 'malaise', 'mango', 'many', 'masala', 'mayo', 'meal', 'meals', 'meat', 'medicine', 'meds', 'melon', 'mercury', 'mild', 'milk', 'millet', 'millets', 'minor', 'mint', 'molar', 'molars', 'more', 'moringa', 'most', 'motion', 'mouth', 'much', 'mucus', 'muscle', 'muscles', 'mushroom', 'mutton', 'mycotoxin', 'mycotoxins', 'nail', 'nails', 'nasal', 'nausea', 'neck', 'nerve', 'nerves', 'nipple', 'node', 'nodes', 'noodles', 'nose', 'nostril', 'nostrils', 'noticeable', 'numb', 'numbness', 'nut', 'nutmeg', 'nuts', 'oats', 'obattu', 'oil', 'oily', 'omelette', 'onion', 'orange', 'oranges', 'oregano', 'paalappam', 'pain', 'pained', 'painful', 'pains', 'paisam', 'palak', 'palm', 'pancreas', 'papadam', 'papaya', 'paracetamol', 'pasta', 'pea', 'peanut', 'peanuts', 'peas', 'pepper', 'pesticide', 'pesticides', 'pickle', 'piece', 'pill', 'pimple', 'pimples', 'pineapple', 'pista', 'pizza', 'plantain', 'plaque', 'plum', 'poha', 'pomegranate', 'pongal', 'pork', 'porridge', 'potato', 'prawns', 'prostate', 'protein', 'pudina', 'puli', 'pumpkin', 'puri', 'puttu', 'quail', 'quiona', 'radish', 'ragi', 'raisins', 'rajgira', 'ramen', 'rash', 'rashes', 'rava', 'raw', 'reaction', 'redness', 'rice', 'ridgegourd', 'ripe', 'roasted', 'robusta', 'romaine', 'roopchand', 'root', 'roots', 'rough', 'roughness', 'salad', 'saliva', 'salmonella', 'salt', 'salty', 'sambar', 'sapota', 'sardines', 'sauce', 'scab', 'scalp', 'sensitive', 'sesame', 'severe', 'sharp', 'shrimp', 'shiver', 'shivering', 'shoulder', 'shoulderblade', 'shoulders', 'sickness', 'side', 'sides', 'sinus', 'sinuses', 'skin', 'skins', 'sleep', 'sleepiness', 'sleepy', 'slice', 'slow', 'small', 'smell', 'smelly', 'sneeze', 'sneezed', 'sneezes', 'sneezing', 'soda', 'soft', 'some', 'sore', 'soreness', 'soup', 'sour', 'spasm', 'spasms', 'spice', 'spices', 'spicy', 'spinach', 'spine', 'spitting', 'stabbing', 'stale', 'stew', 'sticky', 'stiff', 'stomach', 'stone', 'stones', 'strawberries', 'stress', 'strong', 'sugar', 'sugary', 'sunflower', 'supplement', 'sweat', 'sweating', 'sweaty', 'sweet', 'sweets', 'swelling', 'swollen', 'symptom', 'symptoms', 'tablet', 'tablets', 'tailbone', 'tamarind', 'tapioca', 'taste', 'tasteless', 'tea', 'tear', 'tears', 'teeth', 'temple', 'temples', 'tender', 'tendon', 'tension', 'thigh', 'thighs', 'thirsty', 'throbbing', 'throat', 'thumb', 'thumbs', 'tingle', 'tingling', 'tired', 'tiredness', 'tissue', 'tissues', 'toe', 'toes', 'tomato', 'tongue', 'tooth', 'toothache', 'toothbrush', 'toothpaste', 'trauma', 'tuna', 'turmeric', 'twitch', 'twitched', 'twitches', 'twitching', 'ulcer', 'uncomfortable', 'uneasiness', 'uneasy', 'upma', 'urad', 'urine', 'vada', 'vanilla', 'vegetable', 'vegetables', 'vertigo', 'vitamin', 'vomiting', 'walnut', 'warm', 'wart', 'warts', 'water', 'watermelon', 'wax', 'weak', 'weakness', 'wet', 'wheat', 'whey', 'white', 'windpipe', 'wound', 'wrist', 'yakult', 'yam', 'yawning', 'yeast', 'yellow', 'yellowish', 'yogurt', 'zucchini']);

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