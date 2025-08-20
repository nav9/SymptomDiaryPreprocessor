/**
 * @file phraseService.js
 * @description Handles word extraction, heuristic grouping, and categorization for Step 3.
 */
const PhraseService = (function(logger) {

    const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'to', 'of', 'is', 'am', 'are', 'was', 'were', 'i', 'me', 'my', 'you', 'your', 'it', 'its']);

    // --- Heuristics Data ---
    const HEURISTICS_DATA = [
        { categoryId: 'food', sets: [ new Set(['cheela', 'chela']), 
        new Set(['chilli', 'chillies']), new Set(['choco', 'chocolate', 'chocolates', 'chocochip']),
        new Set(['banana', 'bananas', 'nendran', 'yelakki']), new Set(['bread']), new Set(['carrot', 'carrots']),
        new Set(['clove', 'cloves']), new Set(['coccinea', 'cocacinea', 'coccacinea']), new Set(['colocasia', 'colocassia']),
        new Set(['cheese']), new Set(['chicken', 'chickens']), new Set(['coffee']), new Set(['egg', 'eggs']),
        new Set(['fish', 'karimeen', 'sardines']), new Set(['fruit', 'fruits']), new Set(['juice', 'juices']),
        new Set(['meat', 'mutton']), new Set(['milk', 'paal']), new Set(['nuts']), new Set(['rice']),
        new Set(['soup']), new Set(['tea']), new Set(['vegetable', 'veggies', 'veg', 'sabji', 'sabzi']),
        new Set(['almond', 'almonds', 'badam']), new Set(['bainganpalli', 'bainganpally']), new Set(['beet', 'beetroot']),
        new Set(['biscuit', 'biscuits', 'biscut']), new Set(['bottle gourd']), new Set(['cabbage', 'cabb', 'gobi']),
        new Set(['cashew', 'cashews']), new Set(['cauliflower']), new Set(['chana', 'channa', 'chickpea', 'chickpeas']),
        new Set(['chapathi', 'chapatis']), new Set(['cherry', 'cherries']), new Set(['cinnamon']),
        new Set(['curry', 'curries']), new Set(['dal', 'daal', 'toor', 'urad', 'moong', 'masoor']), 
        new Set(['grape', 'grapes']), new Set(['idli', 'idlis']), new Set(['ladoo', 'laddoo']), 
        new Set(['lime', 'limejuice']), new Set(['mango']), new Set(['masala', 'masalas']), 
        new Set(['onion']), new Set(['orange', 'oranges', 'musambi']), new Set(['paripp', 'parippu']), 
        new Set(['pea', 'matar']), new Set(['peanut', 'peanuts', 'groundnut']), new Set(['plantain', 'plantains', 'pazham']),
        new Set(['plum', 'plums']), new Set(['pomegranate', 'pomogranate']), new Set(['prawn', 'prawns']),
        new Set(['tomato', 'tomatoes']), new Set(['vada', 'vadas']), new Set(['aata', 'wheat', 'maida']),  new Set(['besan']),  
        new Set(['rava']),  new Set(['bajra', 'jowar', 'millets', 'ragi', 'rajgira']),
        new Set(['cheera', 'spinach']),new Set(['chiroti']),new Set(['chiwda']),new Set(['chole']),
        new Set(['clove', 'elaichi', 'cardamom', 'jeera', 'coriander', 'fenugreek', 'ginger', 'mustard', 'pepper', 'turmeric']),
        new Set(['colocasia', 'yam']),new Set(['chow']),new Set(['chutney']),new Set(['bhaji']),new Set(['bitter puli', 'karela']),
        new Set(['bok']),new Set(['broccoli']),new Set(['carambola', 'starfruit']),new Set(['cowpea']),new Set(['cucumber', 'vellarika']),
        new Set(['curd']),new Set(['custard']),new Set(['dates']),new Set(['fig']),new Set(['garlic']),new Set(['ghee']),new Set(['gulab', 'jamun']),
        new Set(['halwa']),new Set(['jam']),new Set(['khichidi', 'pongal', 'porridge']),new Set(['kodubale', 'murukku', 'muruku', 'kuzhalappam']),
        new Set(['kulith']),new Set(['lapsi']),new Set(['lettuce']),new Set(['marinated']),new Set(['melon', 'watermelon']),new Set(['mint']),
        new Set(['moilee']),new Set(['moringa']),new Set(['noodles']),new Set(['oregano']),new Set(['paalappam']),new Set(['papaya']),new Set(['paysam']),
        new Set(['pickle']),new Set(['pineapple']),new Set(['pindi']),new Set(['poori']),new Set(['pulses', 'kadala']),new Set(['pumpkin']),new Set(['raisins']),
        new Set(['roasted']),new Set(['sambar']),new Set(['sameiya']),new Set(['sapota']),new Set(['sauce']),new Set(['sesame']),new Set(['soan']),
        new Set(['soya', 'soyabeans']),new Set(['stew']),new Set(['sugar']),new Set(['tamarind']),new Set(['tutti']),new Set(['uddin']),new Set(['vanilla']),] },
        { categoryId: 'symptom', sets: [ new Set(['ache', 'aches', 'achy', 'aching', 'pain', 'pained', 'painful', 'paining', 'pains', 'sore', 'soreness']),
        new Set(['belching', 'belches', 'burp', 'burping', 'burps']), new Set(['bleeding', 'blood', 'bloody']),
        new Set(['breathlessness', 'breathless', 'breaths']), new Set(['bruise', 'bruised', 'bruises']),
        new Set(['chill', 'chills', 'shiver', 'shivering', 'shiverish']), new Set(['constipation']),
        new Set(['cough', 'coughing', 'coughs']), new Set(['cramp', 'cramping', 'cramps', 'crampy']),
        new Set(['dizziness', 'dizzy']), new Set(['drowsiness', 'drowsy', 'sleepy', 'sleepiness']),
        new Set(['dry', 'dryness']), new Set(['fatigue', 'tired', 'tiredness', 'tiredish', 'exhaustion', 'exhausted', 'weak', 'weakness']),
        new Set(['fever', 'feverish']), new Set(['headache', 'headacheish']), new Set(['heaviness', 'heavy']),
        new Set(['hiccup', 'hiccups']), new Set(['hunger', 'hungry']), new Set(['itch', 'itching', 'itchiness', 'itchy', 'itchyness']),
        new Set(['nausea']), new Set(['numb', 'numbness']), new Set(['leaky', 'voided', 'involuntary', 'involuntarily', 'leaking']),
        new Set(['perspiration', 'sweat', 'sweating', 'sweaty']), new Set(['quiver', 'quivering', 'tremor', 'trembling']),
        new Set(['restlessness', 'restless']), new Set(['stiffness', 'stiff']), new Set(['swelling', 'swollen']),
        new Set(['thirst', 'thirsty', 'thirstyish']), new Set(['tingle', 'tingling', 'tinglingish', 'tinglish', 'tingly']),
        new Set(['twitching', 'twitchy']),new Set(['infection', 'infections']), new Set(['syndrome']), new Set(['ulcer']), new Set(['clench', 'clenching']),
        new Set(['clicking']),new Set(['burning']),new Set(['choking']),new Set(['discomfort']),new Set(['disoriented']),new Set(['insomnia']),new Set(['malaise']),
        new Set(['readjustment']),new Set(['spasm', 'spasms', 'spasming']),new Set(['tightness']),new Set(['palpitations']),new Set(['pang']),new Set(['uneasy']),
        new Set(['yawning']),new Set(['flu']),new Set(['inflammation']),new Set(['sarcoidosis']),new Set(['sclerosis']),new Set(['sjogrens']),new Set(['syncope']),
        new Set(['pimple']),new Set(['uti']),] },
        { categoryId: 'anatomy', sets: [ new Set(['abdomen', 'abd', 'stomach']), new Set(['arm', 'arms', 'forearm', 'forearms', 'bicep', 'biceps', 'tricep', 'triceps']),
        new Set(['back', 'backbone', 'spine']), new Set(['bladder']), new Set(['bone', 'bones']),
        new Set(['chest']), new Set(['ear', 'ears', 'eardrum', 'eardrums', 'earlobe']),
        new Set(['esophagus', 'eso']), new Set(['eye', 'eyes', 'eyeball', 'eyeballs', 'eyebrow', 'eyebrows', 'eyelash', 'eyelashes', 'eyelid', 'eyelids']),
        new Set(['hand', 'hands', 'finger', 'fingers', 'thumb', 'thumbs', 'wrist']), new Set(['head']), 
        new Set(['heart']), new Set(['hip', 'hips']), new Set(['joint', 'joints']), new Set(['kidney', 'kidneys']),
        new Set(['leg', 'legs', 'calf', 'calves', 'knee', 'knees', 'kneecap']), new Set(['liver']),
        new Set(['lung', 'lungs']), new Set(['mouth', 'gum', 'gums', 'lip', 'lips', 'tongue']), new Set(['muscle', 'muscles']),
        new Set(['neck']), new Set(['nose', 'nostril', 'nostrils']), new Set(['skin', 'skins']), 
        new Set(['teeth', 'tooth', 'canine', 'canines', 'incisor', 'incisors', 'molar', 'molars']), new Set(['throat']), new Set(['scrot', 'scrotum']), 
        new Set(['coccyx']),new Set(['appendix']),new Set(['brain']),new Set(['diaphragm']),
        new Set(['face', 'cheek', 'cheeks', 'cheekbone', 'forehead', 'chin', 'jaw', 'jawline', 'jawlines', 'jaws']),new Set(['collar', 'collarbone']),
        new Set(['gallbladder']),new Set(['pancreas']),new Set(['prostate']),new Set(['uvula']),new Set(['ankle']),new Set(['armpit', 'armpits']),
        new Set(['capillary']),new Set(['carpal', 'metacarpals']),new Set(['elbow']),new Set(['fingernail', 'fingernails', 'nail', 'nails']),
        new Set(['fingerprint', 'fingertip']),new Set(['foot', 'feet', 'sole', 'soles', 'toes']),new Set(['glands', 'gland', 'glans', 'lymph']),
        new Set(['groin']),new Set(['gumline']),new Set(['hair', 'hairs', 'scalp']),new Set(['heel']),new Set(['humerus']),new Set(['intestine', 'intestines']),
        new Set(['knuckle', 'knuckles']),new Set(['lobe']),new Set(['metatarsal']),new Set(['nerve', 'nerves']),new Set(['nipple']),new Set(['pelvic', 'pubis', 'pube']),
        new Set(['premolar', 'premolars']),new Set(['rib', 'ribs', 'ribcage']),new Set(['shoulder', 'shoulderblade', 'shoulders', 'trapezius']),new Set(['tendon']),] },
        { categoryId: 'medication', sets: [ new Set(['amoxicillin', 'alimox', 'amox', 'novamox']), new Set(['antibiotic']), new Set(['painkiller', 'painkillers']), ] },
        { categoryId: 'contaminant', sets: [ new Set(['pesticide', 'pesticides']), new Set(['poison', 'poisoning']), new Set(['spoilage', 'spoiled', 'spoiling', 'spoilt']), 
        new Set(['bacteria']),new Set(['chemical']),new Set(['dirt']),new Set(['dust']) ] }
    ];
    
    // Add misc words to their respective categories
    const MISC_WORDS = {
        food: [],
        symptom: [],
        anatomy: [],
        medication: [],
        contaminant: []
    };
    
    let HEURISTICS_LOOKUP = null;

    function buildHeuristicsLookup() {
        if (HEURISTICS_LOOKUP) return;
        
        HEURISTICS_LOOKUP = new Map();
        
        HEURISTICS_DATA.forEach(categoryData => {
            categoryData.sets.forEach(wordSet => {
                wordSet.forEach(word => {
                    HEURISTICS_LOOKUP.set(word, { categoryId: categoryData.categoryId, groupSet: wordSet });
                });
            });
        });

        Object.entries(MISC_WORDS).forEach(([categoryId, words]) => {
            words.forEach(word => {
                if (!HEURISTICS_LOOKUP.has(word)) {
                    const newSet = new Set([word]);
                    HEURISTICS_LOOKUP.set(word, { categoryId, groupSet: newSet });
                }
            });
        });
        logger.info(`Heuristics lookup map built with ${HEURISTICS_LOOKUP.size} keywords.`);
    }

    function extractUniqueWords(step2FinalData) {
        const uniqueWords = new Set();
        const splitter = /[.,:;()\[\]\s]/g;

        Object.values(step2FinalData).forEach(yearData => {
            yearData.forEach(entry => {
                if (entry.phraseText) {
                    entry.phraseText.toLowerCase().split(splitter).forEach(word => {
                        const trimmed = word.trim();
                        if (trimmed && !STOP_WORDS.has(trimmed)) {
                            uniqueWords.add(trimmed);
                        }
                    });
                }
            });
        });
        logger.info(`Extracted ${uniqueWords.size} unique words.`);
        return uniqueWords;
    }

    function autoGroupWords(uniqueWords) {
        buildHeuristicsLookup();
        const categorizedGroups = new Map();
        const ungroupedWords = [];

        uniqueWords.forEach(word => {
            const heuristic = HEURISTICS_LOOKUP.get(word);
            if (heuristic) {
                if (!categorizedGroups.has(heuristic.groupSet)) {
                    categorizedGroups.set(heuristic.groupSet, {
                        categoryId: heuristic.categoryId,
                        tags: []
                    });
                }
                categorizedGroups.get(heuristic.groupSet).tags.push({ id: `tag-${word}-${Math.random()}`, text: word });
            } else {
                ungroupedWords.push(word);
            }
        });

        ungroupedWords.forEach(word => {
            const newSet = new Set([word]);
            categorizedGroups.set(newSet, {
                categoryId: 'none',
                tags: [{ id: `tag-${word}-${Math.random()}`, text: word }]
            });
        });

        const finalGroups = Array.from(categorizedGroups.values()).map(groupData => ({
            id: `group-${groupData.tags[0].text}-${Math.random()}`,
            categoryId: groupData.categoryId,
            tags: groupData.tags.sort((a,b) => a.text.localeCompare(b.text))
        }));

        logger.info(`Created ${finalGroups.length} initial word groups.`);
        return finalGroups;
    }

    return {
        extractUniqueWords,
        autoGroupWords
    };

})(logger);

