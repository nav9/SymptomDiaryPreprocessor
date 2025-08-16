/**
 * @file knowledgeBaseService.js
 * @description Provides a database of pre-filled information for common tags.
 */
const KnowledgeBaseService = (function() {

    const knowledgeBase = {
        // Foods
        "rice": {
            "Composition": "Starch (amylose and amylopectin).",
            "Nutrition": "Primary source of carbohydrates (for energy). Brown rice contains fiber, magnesium, and B vitamins (aids metabolism).",
            "Contaminants/Side Effects": "Arsenic (can accumulate from soil; chronic exposure is a health risk).",
            "Effective Duration": "Carbohydrates provide energy for 2-4 hours."
        },
        "idli": {
            "Composition": "Fermented rice and urad dal (black lentils).",
            "Nutrition": "Good source of carbohydrates and protein. Fermentation increases B-vitamin content and makes it easy to digest.",
            "Contaminants/Side Effects": "High glycemic index if made only with white rice. Can be high in sodium.",
            "Effective Duration": "Provides sustained energy for 3-4 hours."
        },
        "chicken": {
            "Composition": "Lean protein, fats.",
            "Nutrition": "Excellent source of protein (for muscle repair), niacin (brain function), and selenium (antioxidant).",
            "Contaminants/Side Effects": "Risk of Salmonella or Campylobacter if undercooked.",
            "Effective Duration": "Protein digestion is slow, promoting satiety for 3-5 hours."
        },
        "coffee": {
            "Composition": "Caffeine, antioxidants (polyphenols).",
            "Nutrition": "Caffeine acts as a central nervous system stimulant (improves alertness).",
            "Contaminants/Side Effects": "Can cause anxiety, insomnia, or stomach upset in sensitive individuals. Mycotoxins (aflatoxin) can be present in low-quality beans.",
            "Effective Duration": "Effects of caffeine peak in 30-60 mins and can last 3-5 hours."
        },
        // Medications
        "ibuprofen": {
            "Composition": "Active ingredient: Ibuprofen (a nonsteroidal anti-inflammatory drug - NSAID).",
            "Nutrition": "N/A",
            "Contaminants/Side Effects": "Stomach upset, heartburn, risk of ulcers with long-term use. Can interact with blood thinners.",
            "Effective Duration": "Pain and fever relief typically lasts for 4-6 hours."
        },
        "paracetamol": {
            "Composition": "Active ingredient: Acetaminophen.",
            "Nutrition": "N/A",
            "Contaminants/Side Effects": "Generally safe at recommended doses. Overdose can cause severe liver damage.",
            "Effective Duration": "Pain and fever relief typically lasts for 4-6 hours."
        },
        // Contaminants
        "arsenic": {
            "Composition": "A toxic heavy metal element.",
            "Nutrition": "N/A",
            "Contaminants/Side Effects": "Chronic exposure is linked to cancers, skin lesions, and cardiovascular disease.",
            "Effective Duration": "Can accumulate in the body over time. Half-life can be several days to weeks depending on form."
        }
    };

    /**
     * Retrieves knowledge for a given tag.
     * @param {string} tag - The tag to look up (e.g., "rice").
     * @returns {Object|null} The data object for the tag or null if not found.
     */
    function getInfo(tag) {
        return knowledgeBase[tag.toLowerCase()] || null;
    }

    return { getInfo };

})();