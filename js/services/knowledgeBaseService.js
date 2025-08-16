/**
 * @file knowledgeBaseService.js
 * @description Provides a database of pre-filled information for common tags.
 */
const KnowledgeBaseService = (function() {

    const knowledgeBase = {
        // --- Indian & Specific Foods ---
        "aata": { "Composition": "whole wheat flour", "Nutrition": "complex carbs (energy), fiber (digestion), iron", "Contaminants/Side Effects": "gluten, phytic acid", "Effective Duration": "energy: 3-5 hours" },
        "ajwain": { "Composition": "carom seeds, thymol", "Nutrition": "digestive aid, anti-inflammatory, antiseptic", "Contaminants/Side Effects": "acidity (excess)", "Effective Duration": "effects: 1-3 hours" },
        "amla": { "Composition": "indian gooseberry", "Nutrition": "vitamin C (immunity, antioxidant), iron, fiber", "Contaminants/Side Effects": "acidity (excess), constipation (excess)", "Effective Duration": "vitamin C: ~24 hours" },
        "bajra": { "Composition": "pearl millet", "Nutrition": "complex carbs, fiber, magnesium, iron, protein", "Contaminants/Side Effects": "goitrogens (thyroid interference)", "Effective Duration": "energy: 4-6 hours" },
        "besan": { "Composition": "chickpea flour, gram flour", "Nutrition": "protein, fiber, iron, gluten-free", "Contaminants/Side Effects": "gas, bloating", "Effective Duration": "satiety: 3-4 hours" },
        "chapathi": { "Composition": "whole wheat flour (aata), water", "Nutrition": "complex carbohydrates, fiber, B-vitamins", "Contaminants/Side Effects": "gluten", "Effective Duration": "energy: 3-5 hours" },
        "dosa": { "Composition": "fermented rice, urad dal", "Nutrition": "carbohydrates, protein, probiotics, iron", "Contaminants/Side Effects": "oil, high glycemic index", "Effective Duration": "energy: 3-4 hours" },
        "ghee": { "Composition": "clarified butter, milk fat", "Nutrition": "healthy fats, vitamin A, vitamin E, butyric acid", "Contaminants/Side Effects": "high calories, saturated fat", "Effective Duration": "energy: long-term source" },
        "idli": { "Composition": "fermented rice, urad dal (black lentils)", "Nutrition": "carbohydrates, protein, B-vitamins, probiotics", "Contaminants/Side Effects": "high glycemic index, sodium", "Effective Duration": "energy: 3-4 hours" },
        "jaggery": { "Composition": "unrefined cane sugar, molasses", "Nutrition": "iron, magnesium, potassium", "Contaminants/Side Effects": "high sugar, calories", "Effective Duration": "energy: 1-2 hours (quick spike)" },
        "jowar": { "Composition": "sorghum", "Nutrition": "complex carbs, protein, fiber, gluten-free, antioxidants", "Contaminants/Side Effects": "tannins (can reduce nutrient absorption)", "Effective Duration": "energy: 4-6 hours" },
        "maida": { "Composition": "refined wheat flour", "Nutrition": "simple carbohydrates", "Contaminants/Side Effects": "low fiber, high glycemic index, gluten", "Effective Duration": "energy: 1-2 hours (quick spike)" },
        "moong dal": { "Composition": "mung beans (split)", "Nutrition": "protein, fiber, potassium, easy to digest", "Contaminants/Side Effects": "low risk", "Effective Duration": "satiety: 2-4 hours" },
        "moringa": { "Composition": "moringa leaf, drumstick leaf", "Nutrition": "vitamin C, vitamin A, calcium, protein, antioxidants", "Contaminants/Side Effects": "laxative effect (excess)", "Effective Duration": "vitamins absorbed quickly" },
        "poha": { "Composition": "flattened rice", "Nutrition": "carbohydrates, iron, low gluten", "Contaminants/Side Effects": "high glycemic index", "Effective Duration": "energy: 2-3 hours" },
        "ragi": { "Composition": "finger millet", "Nutrition": "calcium (bones), fiber, iron, amino acids, gluten-free", "Contaminants/Side Effects": "low risk", "Effective Duration": "energy: 4-6 hours" },
        "sambar": { "Composition": "tur dal (pigeon peas), tamarind, vegetables, spices", "Nutrition": "protein, fiber, vitamins, antioxidants", "Contaminants/Side Effects": "high sodium, gas", "Effective Duration": "satiety: 3-4 hours" },
        "turmeric": { "Composition": "curcumin (active compound)", "Nutrition": "anti-inflammatory, antioxidant", "Contaminants/Side Effects": "staining, lead (adulteration risk)", "Effective Duration": "anti-inflammatory: several hours" },
        "urad dal": { "Composition": "black gram (lentil)", "Nutrition": "protein, iron, folic acid, magnesium", "Contaminants/Side Effects": "gas, bloating, kidney stones (uric acid)", "Effective Duration": "satiety: 3-4 hours" },

        // --- General Foods & Ingredients ---
        "almond": { "Composition": "nut, healthy fats, protein", "Nutrition": "vitamin E, magnesium, fiber, monounsaturated fats", "Contaminants/Side Effects": "allergies, high calories", "Effective Duration": "satiety: 3-4 hours" },
        "apple": { "Composition": "fruit, fiber, fructose", "Nutrition": "fiber (pectin), vitamin C, antioxidants", "Contaminants/Side Effects": "pesticides, wax coating", "Effective Duration": "energy: 1-2 hours" },
        "avocado": { "Composition": "fruit, healthy fats", "Nutrition": "monounsaturated fats, potassium, fiber, vitamin K", "Contaminants/Side Effects": "high calories", "Effective Duration": "satiety: 3-5 hours" },
        "banana": { "Composition": "fruit, starch, fructose", "Nutrition": "potassium (muscles), vitamin B6, carbohydrates", "Contaminants/Side Effects": "high sugar (ripe)", "Effective Duration": "energy: 1-3 hours" },
        "beef": { "Composition": "red meat, protein, saturated fat", "Nutrition": "iron, vitamin B12, zinc, protein", "Contaminants/Side Effects": "high saturated fat, cholesterol", "Effective Duration": "satiety: 4-6 hours" },
        "cabbage": { "Composition": "cruciferous vegetable", "Nutrition": "vitamin K, vitamin C, fiber, sulforaphane", "Contaminants/Side Effects": "gas, bloating, goitrogens", "Effective Duration": "nutrients absorbed quickly" },
        "carrot": { "Composition": "root vegetable", "Nutrition": "beta-carotene (vitamin A), fiber", "Contaminants/Side Effects": "pesticides", "Effective Duration": "vitamins absorbed quickly" },
        "cheese": { "Composition": "dairy, milk protein (casein), fat", "Nutrition": "calcium, protein, vitamin B12", "Contaminants/Side Effects": "high sodium, saturated fat, lactose", "Effective Duration": "satiety: 3-5 hours" },
        "chicken": { "Composition": "poultry, lean protein, fats", "Nutrition": "protein (muscle repair), niacin, selenium", "Contaminants/Side Effects": "salmonella (undercooked), antibiotics", "Effective Duration": "satiety: 3-5 hours" },
        "coffee": { "Composition": "caffeine, antioxidants", "Nutrition": "stimulant, alertness", "Contaminants/Side Effects": "anxiety, insomnia, mycotoxins", "Effective Duration": "caffeine: 3-5 hours" },
        "egg": { "Composition": "protein (albumin), fat (yolk)", "Nutrition": "complete protein, vitamin D, vitamin B12, choline", "Contaminants/Side Effects": "salmonella, cholesterol (yolk)", "Effective Duration": "satiety: 3-4 hours" },
        "fish": { "Composition": "protein, fats (omega-3)", "Nutrition": "omega-3 fatty acids, protein, vitamin D, iodine", "Contaminants/Side Effects": "mercury, microplastics, parasites", "Effective Duration": "satiety: 3-4 hours" },
        "garlic": { "Composition": "allicin (active compound)", "Nutrition": "antibacterial, anti-inflammatory, cardiovascular benefits", "Contaminants/Side Effects": "bad breath, heartburn", "Effective Duration": "effects: several hours" },
        "ginger": { "Composition": "gingerol (active compound)", "Nutrition": "anti-nausea, anti-inflammatory, digestive aid", "Contaminants/Side Effects": "heartburn (excess)", "Effective Duration": "effects: 2-4 hours" },
        "milk": { "Composition": "dairy, lactose, casein, whey", "Nutrition": "calcium, vitamin D, protein, vitamin B12", "Contaminants/Side Effects": "lactose intolerance, hormones", "Effective Duration": "satiety: 2-3 hours" },
        "oats": { "Composition": "whole grain", "Nutrition": "soluble fiber (beta-glucan), complex carbs, manganese", "Contaminants/Side Effects": "phytic acid, glyphosate (pesticide)", "Effective Duration": "energy: 3-5 hours" },
        "onion": { "Composition": "quercetin, sulfur compounds", "Nutrition": "antioxidant, anti-inflammatory", "Contaminants/Side Effects": "gas, heartburn", "Effective Duration": "effects: several hours" },
        "potato": { "Composition": "starch, vegetable", "Nutrition": "potassium, vitamin C, carbohydrates", "Contaminants/Side Effects": "acrylamide (high temp cooking), solanine (green skin)", "Effective Duration": "energy: 2-3 hours" },
        "spinach": { "Composition": "leafy green", "Nutrition": "iron, vitamin K, vitamin A, oxalates", "Contaminants/Side Effects": "oxalates (kidney stones), pesticides", "Effective Duration": "nutrients absorbed quickly" },
        "tea": { "Composition": "caffeine, theanine, catechins (antioxidants)", "Nutrition": "alertness, relaxation (theanine)", "Contaminants/Side Effects": "caffeine, tannins (inhibit iron absorption)", "Effective Duration": "caffeine: 3-5 hours" },
        "tomato": { "Composition": "fruit, lycopene", "Nutrition": "lycopene (antioxidant), vitamin C, potassium", "Contaminants/Side Effects": "acidity, nightshade sensitivity", "Effective Duration": "nutrients absorbed quickly" },
        "walnut": { "Composition": "nut, omega-3 (ALA)", "Nutrition": "omega-3, antioxidants, manganese", "Contaminants/Side Effects": "allergies, high calories", "Effective Duration": "satiety: 3-4 hours" },
        
        // --- Medications ---
        "amoxicillin": { "Composition": "antibiotic (penicillin class)", "Nutrition": "N/A", "Contaminants/Side Effects": "diarrhea, nausea, allergic reaction, disrupts gut flora", "Effective Duration": "active in body: 8-12 hours" },
        "ibuprofen": { "Composition": "NSAID", "Nutrition": "N/A", "Contaminants/Side Effects": "stomach upset, heartburn, ulcer risk", "Effective Duration": "relief: 4-6 hours" },
        "paracetamol": { "Composition": "acetaminophen", "Nutrition": "N/A", "Contaminants/Side Effects": "liver damage (overdose)", "Effective Duration": "relief: 4-6 hours" },

        // --- Contaminants ---
        "arsenic": { "Composition": "heavy metal", "Nutrition": "N/A", "Contaminants/Side Effects": "toxic, carcinogenic, skin lesions", "Effective Duration": "accumulates, long half-life" },
        "lead": { "Composition": "heavy metal", "Nutrition": "N/A", "Contaminants/Side Effects": "neurotoxin, developmental issues", "Effective Duration": "accumulates in bones, very long half-life" },
        "mercury": { "Composition": "heavy metal", "Nutrition": "N/A", "Contaminants/Side Effects": "neurotoxin, kidney damage", "Effective Duration": "accumulates, long half-life" },
        "pesticides": { "Composition": "various chemicals", "Nutrition": "N/A", "Contaminants/Side Effects": "endocrine disruption, carcinogenic risk", "Effective Duration": "variable, can accumulate" }
    };

    /**
     * Retrieves knowledge for a given tag.
     * @param {string} tag - The tag to look up (e.g., "rice").
     * @returns {Object|null} The data object for the tag or null if not found.
     */
    function getInfo(tag) {
        return knowledgeBase[tag.toLowerCase()] || null;
    }

    function getAllKeywords() {
        const keywords = new Set();
        Object.values(knowledgeBase).forEach(entry => {
            Object.values(entry).forEach(value => {
                // Split by comma and space to get individual keywords
                value.split(/,\s*|\s+/).forEach(word => {
                    const cleanWord = word.replace(/[()]/g, ''); // Remove parentheses
                    if (cleanWord && cleanWord !== 'N/A') keywords.add(cleanWord.trim());
                });
            });
        });
        return Array.from(keywords);
    }    

    return { getInfo, getAllKeywords };

})();