/**
 * @file knowledgeBaseService.js
 * @description Provides a database of pre-filled information for common tags.
 */
const KnowledgeBaseService = (function() {
    const knowledgeBase = {
        "aata": {
            "Composition": "whole wheat flour (wheat); carbohydrates, proteins, fats, fiber, vitamins (B1, B2, B3, A), minerals (iron, magnesium)",
            "Nutrition": "complex carbs (energy), fiber (digestion), iron (blood health), B vitamins (metabolism)",
            "Contaminants/Side Effects": "gluten (allergen), phytic acid (mineral absorption inhibitor)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "aaloo": {
            "Composition": "potato (Solanum tuberosum); carbohydrates, water, fiber, vitamin C, potassium",
            "Nutrition": "energy (carbs), vitamin C (immune support), potassium (muscle function), fiber (digestion)",
            "Contaminants/Side Effects": "glycoalkaloids (toxic in high amounts), high glycemic index",
            "Effective Duration": "energy: 2-4 hours"
        },
        "apple": {
            "Composition": "apple (Malus domestica); water, fructose, fiber, vitamin C, polyphenols",
            "Nutrition": "fiber (digestion), vitamin C (immune health), antioxidants (cell protection)",
            "Contaminants/Side Effects": "pesticide residues, sugar content (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "apples": {
            "Composition": "apple (Malus domestica); water, fructose, fiber, vitamin C, polyphenols",
            "Nutrition": "fiber (digestion), vitamin C (immune health), antioxidants (cell protection)",
            "Contaminants/Side Effects": "pesticide residues, sugar content (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "cheela": {
            "Composition": "pancake (besan-based); chickpea flour, water, spices, sometimes vegetables",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "oil (high calories if fried), gluten (if wheat added)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "cheera": {
            "Composition": "amaranth leaves (Amaranthus); water, vitamins (A, C, K), calcium, iron",
            "Nutrition": "vitamin A (vision), vitamin C (immune health), calcium (bone health), iron (blood health)",
            "Contaminants/Side Effects": "oxalic acid (kidney stone risk), pesticide residues",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "chilli": {
            "Composition": "chili pepper (Capsicum); capsaicin, vitamin C, vitamin A, water",
            "Nutrition": "vitamin C (immune health), capsaicin (metabolism boost), antioxidants",
            "Contaminants/Side Effects": "capsaicin (irritation, digestive upset), pesticide residues",
            "Effective Duration": "metabolism boost: 1-2 hours"
        },
        "chillies": {
            "Composition": "chili pepper (Capsicum); capsaicin, vitamin C, vitamin A, water",
            "Nutrition": "vitamin C (immune health), capsaicin (metabolism boost), antioxidants",
            "Contaminants/Side Effects": "capsaicin (irritation, digestive upset), pesticide residues",
            "Effective Duration": "metabolism boost: 1-2 hours"
        },
        "chiroti": {
            "Composition": "layered pastry (maida-based); refined wheat flour, ghee, sugar",
            "Nutrition": "carbs (energy), fats (caloric density)",
            "Contaminants/Side Effects": "high sugar (dental issues), high fat (weight gain), gluten",
            "Effective Duration": "energy: 2-4 hours"
        },
        "choco": {
            "Composition": "chocolate; cocoa solids, sugar, milk solids, cocoa butter",
            "Nutrition": "antioxidants (flavonoids), energy (sugar, fats), magnesium",
            "Contaminants/Side Effects": "high sugar (dental issues), caffeine (jitters), milk allergens",
            "Effective Duration": "energy: 1-3 hours"
        },
        "chiwda": {
            "Composition": "flattened rice snack (poha-based); rice, peanuts, spices, oil",
            "Nutrition": "carbs (energy), protein (peanuts), healthy fats (if roasted)",
            "Contaminants/Side Effects": "high sodium, oil (calories if fried), peanut allergens",
            "Effective Duration": "energy: 2-4 hours"
        },
        "chocochip": {
            "Composition": "chocolate chips; cocoa solids, sugar, milk solids, soy lecithin",
            "Nutrition": "antioxidants (flavonoids), energy (sugar, fats)",
            "Contaminants/Side Effects": "high sugar, milk allergens, soy allergens",
            "Effective Duration": "energy: 1-3 hours"
        },
        "chocolates": {
            "Composition": "chocolate; cocoa solids, sugar, milk solids, cocoa butter",
            "Nutrition": "antioxidants (flavonoids), energy (sugar, fats), magnesium",
            "Contaminants/Side Effects": "high sugar (dental issues), caffeine (jitters), milk allergens",
            "Effective Duration": "energy: 1-3 hours"
        },
        "banana": {
            "Composition": "banana (Musa); water, potassium, vitamin B6, vitamin C, fructose",
            "Nutrition": "potassium (muscle function), vitamin B6 (brain health), energy (carbs)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "bananas": {
            "Composition": "banana (Musa); water, potassium, vitamin B6, vitamin C, fructose",
            "Nutrition": "potassium (muscle function), vitamin B6 (brain health), energy (carbs)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "bread": {
            "Composition": "bread; wheat flour, water, yeast, salt, sometimes sugar",
            "Nutrition": "carbs (energy), fiber (if whole grain), B vitamins",
            "Contaminants/Side Effects": "gluten, high sodium, preservatives",
            "Effective Duration": "energy: 2-4 hours"
        },
        "carrot": {
            "Composition": "carrot (Daucus carota); beta-carotene, water, fiber, vitamin A",
            "Nutrition": "vitamin A (vision), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (moderate)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "carrots": {
            "Composition": "carrot (Daucus carota); beta-carotene, water, fiber, vitamin A",
            "Nutrition": "vitamin A (vision), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (moderate)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "chole": {
            "Composition": "chickpea curry; chickpeas, spices, tomatoes, onions, oil",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron, antioxidants",
            "Contaminants/Side Effects": "high sodium, oil (calories), digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "clove": {
            "Composition": "clove (Syzygium aromaticum); eugenol, fiber, manganese",
            "Nutrition": "antioxidants (eugenol), anti-inflammatory, digestive aid",
            "Contaminants/Side Effects": "eugenol (irritation in excess), pesticide residues",
            "Effective Duration": "effects: 1-3 hours"
        },
        "cloves": {
            "Composition": "clove (Syzygium aromaticum); eugenol, fiber, manganese",
            "Nutrition": "antioxidants (eugenol), anti-inflammatory, digestive aid",
            "Contaminants/Side Effects": "eugenol (irritation in excess), pesticide residues",
            "Effective Duration": "effects: 1-3 hours"
        },
        "coccinea": {
            "Composition": "ivy gourd (Coccinia grandis); water, fiber, vitamin C, beta-carotene",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, oxalic acid (kidney stone risk)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "cocacinea": {
            "Composition": "ivy gourd (Coccinia grandis); water, fiber, vitamin C, beta-carotene",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, oxalic acid (kidney stone risk)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "coccacinea": {
            "Composition": "ivy gourd (Coccinia grandis); water, fiber, vitamin C, beta-carotene",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, oxalic acid (kidney stone risk)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "colocasia": {
            "Composition": "taro root (Colocasia esculenta); carbs, fiber, potassium, vitamin C",
            "Nutrition": "energy (carbs), fiber (digestion), potassium (muscle function)",
            "Contaminants/Side Effects": "oxalic acid (irritation, kidney stone risk), pesticide residues",
            "Effective Duration": "energy: 2-4 hours"
        },
        "colocassia": {
            "Composition": "taro root (Colocasia esculenta); carbs, fiber, potassium, vitamin C",
            "Nutrition": "energy (carbs), fiber (digestion), potassium (muscle function)",
            "Contaminants/Side Effects": "oxalic acid (irritation, kidney stone risk), pesticide residues",
            "Effective Duration": "energy: 2-4 hours"
        },
        "chow": {
            "Composition": "vegetable",
            "Nutrition": "carbs (energy), fiber (vegetables), protein (if meat added)",
            "Contaminants/Side Effects": "",
            "Effective Duration": "energy: 2-4 hours"
        },
        "chutney": {
            "Composition": "condiment; herbs, spices, fruits, vinegar, sugar",
            "Nutrition": "antioxidants (herbs), vitamin C (if fruit-based), digestive aid",
            "Contaminants/Side Effects": "high sugar, high sodium, vinegar (acidity)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "cheese": {
            "Composition": "cheese; milk solids, fat, protein, calcium, salt",
            "Nutrition": "calcium (bone health), protein (muscle repair), fats (energy)",
            "Contaminants/Side Effects": "lactose (intolerance), high sodium, high fat",
            "Effective Duration": "energy: 3-5 hours"
        },
        "chicken": {
            "Composition": "chicken meat; protein, water, fats, B vitamins",
            "Nutrition": "protein (muscle repair), B vitamins (metabolism), zinc",
            "Contaminants/Side Effects": "bacteria (salmonella), hormones (if not organic)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "chocolate": {
            "Composition": "chocolate; cocoa solids, sugar, milk solids, cocoa butter",
            "Nutrition": "antioxidants (flavonoids), energy (sugar, fats), magnesium",
            "Contaminants/Side Effects": "high sugar (dental issues), caffeine (jitters), milk allergens",
            "Effective Duration": "energy: 1-3 hours"
        },
        "coffee": {
            "Composition": "coffee; caffeine, chlorogenic acids, water, antioxidants",
            "Nutrition": "caffeine (alertness), antioxidants (cell protection)",
            "Contaminants/Side Effects": "caffeine (jitters, insomnia), acidity (digestive upset)",
            "Effective Duration": "alertness: 2-6 hours"
        },
        "egg": {
            "Composition": "egg; protein, fats, choline, vitamin D, water",
            "Nutrition": "protein (muscle repair), choline (brain health), vitamin D (bone health)",
            "Contaminants/Side Effects": "salmonella, cholesterol (moderate concern), egg allergens",
            "Effective Duration": "energy: 3-5 hours"
        },
        "eggs": {
            "Composition": "egg; protein, fats, choline, vitamin D, water",
            "Nutrition": "protein (muscle repair), choline (brain health), vitamin D (bone health)",
            "Contaminants/Side Effects": "salmonella, cholesterol (moderate concern), egg allergens",
            "Effective Duration": "energy: 3-5 hours"
        },
        "fish": {
            "Composition": "fish; protein, omega-3 fatty acids, water, vitamin D",
            "Nutrition": "protein (muscle repair), omega-3s (heart, brain health), vitamin D",
            "Contaminants/Side Effects": "mercury, microplastics, allergens",
            "Effective Duration": "energy: 3-5 hours"
        },
        "fruit": {
            "Composition": "various fruits; water, fructose, fiber, vitamins (C, A), antioxidants",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "fruits": {
            "Composition": "various fruits; water, fructose, fiber, vitamins (C, A), antioxidants",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "juice": {
            "Composition": "fruit or vegetable juice; water, fructose, vitamins (C, A), antioxidants",
            "Nutrition": "vitamin C (immune health), hydration, antioxidants",
            "Contaminants/Side Effects": "high sugar, loss of fiber, preservatives",
            "Effective Duration": "energy: 1-2 hours"
        },
        "juices": {
            "Composition": "fruit or vegetable juice; water, fructose, vitamins (C, A), antioxidants",
            "Nutrition": "vitamin C (immune health), hydration, antioxidants",
            "Contaminants/Side Effects": "high sugar, loss of fiber, preservatives",
            "Effective Duration": "energy: 1-2 hours"
        },
        "meat": {
            "Composition": "animal meat; protein, fats, water, B vitamins, iron",
            "Nutrition": "protein (muscle repair), iron (blood health), B vitamins (metabolism)",
            "Contaminants/Side Effects": "bacteria (E. coli, salmonella), high fat, hormones",
            "Effective Duration": "energy: 3-5 hours"
        },
        "milk": {
            "Composition": "milk; water, lactose, protein, calcium, vitamin D",
            "Nutrition": "calcium (bone health), protein (muscle repair), vitamin D",
            "Contaminants/Side Effects": "lactose (intolerance), bacteria (if unpasteurized), hormones",
            "Effective Duration": "energy: 2-4 hours"
        },
        "nuts": {
            "Composition": "various nuts; protein, healthy fats, fiber, vitamin E, magnesium",
            "Nutrition": "healthy fats (heart health), protein (muscle repair), fiber (digestion)",
            "Contaminants/Side Effects": "allergens, high calories, aflatoxins (if improperly stored)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "potato": {
            "Composition": "potato (Solanum tuberosum); carbohydrates, water, fiber, vitamin C, potassium",
            "Nutrition": "energy (carbs), vitamin C (immune support), potassium (muscle function), fiber",
            "Contaminants/Side Effects": "glycoalkaloids (toxic in high amounts), high glycemic index",
            "Effective Duration": "energy: 2-4 hours"
        },
        "rice": {
            "Composition": "rice; carbohydrates, water, fiber (brown rice), B vitamins",
            "Nutrition": "energy (carbs), fiber (brown rice), B vitamins (metabolism)",
            "Contaminants/Side Effects": "arsenic (in some regions), high glycemic index (white rice)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "soup": {
            "Composition": "soup; water, vegetables, spices, sometimes meat or grains",
            "Nutrition": "hydration, vitamins (vegetables), protein (if meat added)",
            "Contaminants/Side Effects": "high sodium, allergens (if meat or dairy-based)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "tea": {
            "Composition": "tea; caffeine, polyphenols, water, antioxidants",
            "Nutrition": "antioxidants (cell protection), caffeine (alertness), hydration",
            "Contaminants/Side Effects": "caffeine (jitters, insomnia), tannins (iron absorption inhibition)",
            "Effective Duration": "alertness: 2-6 hours"
        },
        "vegetable": {
            "Composition": "various vegetables; water, fiber, vitamins (A, C, K), minerals",
            "Nutrition": "fiber (digestion), vitamins (immune, vision, bone health), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, oxalates (kidney stone risk)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "veggies": {
            "Composition": "various vegetables; water, fiber, vitamins (A, C, K), minerals",
            "Nutrition": "fiber (digestion), vitamins (immune, vision, bone health), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, oxalates (kidney stone risk)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "almond": {
            "Composition": "almond (Prunus dulcis); protein, healthy fats, fiber, vitamin E, magnesium",
            "Nutrition": "healthy fats (heart health), vitamin E (skin health), magnesium (muscle function)",
            "Contaminants/Side Effects": "allergens, high calories, aflatoxins (if improperly stored)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "almonds": {
            "Composition": "almond (Prunus dulcis); protein, healthy fats, fiber, vitamin E, magnesium",
            "Nutrition": "healthy fats (heart health), vitamin E (skin health), magnesium (muscle function)",
            "Contaminants/Side Effects": "allergens, high calories, aflatoxins (if improperly stored)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "badam": {
            "Composition": "almond (Prunus dulcis); protein, healthy fats, fiber, vitamin E, magnesium",
            "Nutrition": "healthy fats (heart health), vitamin E (skin health), magnesium (muscle function)",
            "Contaminants/Side Effects": "allergens, high calories, aflatoxins (if improperly stored)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "bainganpalli": {
            "Composition": "mango (Mangifera indica, Banaganapalli variety); fructose, water, vitamin C, vitamin A",
            "Nutrition": "vitamin C (immune health), vitamin A (vision), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "bainganpally": {
            "Composition": "mango (Mangifera indica, Banaganapalli variety); fructose, water, vitamin C, vitamin A",
            "Nutrition": "vitamin C (immune health), vitamin A (vision), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "bajra": {
            "Composition": "pearl millet (Pennisetum glaucum); carbs, fiber, protein, magnesium, iron",
            "Nutrition": "energy (carbs), fiber (digestion), magnesium (muscle function), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid (mineral absorption inhibitor), pesticide residues",
            "Effective Duration": "energy: 3-5 hours"
        },
        "beet": {
            "Composition": "beetroot (Beta vulgaris); betalains, water, folate, manganese",
            "Nutrition": "folate (cell growth), antioxidants (betalains), blood pressure regulation",
            "Contaminants/Side Effects": "oxalic acid (kidney stone risk), pesticide residues",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "beetroot": {
            "Composition": "beetroot (Beta vulgaris); betalains, water, folate, manganese",
            "Nutrition": "folate (cell growth), antioxidants (betalains), blood pressure regulation",
            "Contaminants/Side Effects": "oxalic acid (kidney stone risk), pesticide residues",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "bengal": {
            "Composition": "Bengal gram (Cicer arietinum); protein, carbs, fiber, iron, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health), folate",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "besan": {
            "Composition": "chickpea flour (Cicer arietinum); protein, carbs, fiber, iron",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "bhaji": {
            "Composition": "vegetable fritters; vegetables, chickpea flour, spices, oil",
            "Nutrition": "fiber (vegetables), protein (chickpea flour), antioxidants (spices)",
            "Contaminants/Side Effects": "high oil (calories), high sodium, digestive discomfort",
            "Effective Duration": "energy: 2-4 hours"
        },
        "biscuit": {
            "Composition": "biscuit; wheat flour, sugar, fats, sometimes milk solids",
            "Nutrition": "carbs (energy), fats (caloric density)",
            "Contaminants/Side Effects": "high sugar, high fat, gluten, preservatives",
            "Effective Duration": "energy: 1-3 hours"
        },
        "biscuits": {
            "Composition": "biscuit; wheat flour, sugar, fats, sometimes milk solids",
            "Nutrition": "carbs (energy), fats (caloric density)",
            "Contaminants/Side Effects": "high sugar, high fat, gluten, preservatives",
            "Effective Duration": "energy: 1-3 hours"
        },
        "biscut": {
            "Composition": "biscuit; wheat flour, sugar, fats, sometimes milk solids",
            "Nutrition": "carbs (energy), fats (caloric density)",
            "Contaminants/Side Effects": "high sugar, high fat, gluten, preservatives",
            "Effective Duration": "energy: 1-3 hours"
        },
        "bitter puli": {
            "Composition": "bitter gourd (Momordica charantia); water, fiber, vitamin C, charantin",
            "Nutrition": "vitamin C (immune health), fiber (digestion), blood sugar regulation",
            "Contaminants/Side Effects": "bitter taste (digestive upset), pesticide residues",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "bok": {
            "Composition": "bok choy (Brassica rapa); water, vitamin C, vitamin K, fiber",
            "Nutrition": "vitamin C (immune health), vitamin K (blood clotting), fiber (digestion)",
            "Contaminants/Side Effects": "pesticide residues, goitrogens (thyroid interference)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "bottle gourd": {
            "Composition": "bottle gourd (Lagenaria siceraria); water, fiber, vitamin C, potassium",
            "Nutrition": "hydration, fiber (digestion), vitamin C (immune health)",
            "Contaminants/Side Effects": "bitter compounds (toxic in rare cases), pesticide residues",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "broccoli": {
            "Composition": "broccoli (Brassica oleracea); water, vitamin C, vitamin K, fiber, sulforaphane",
            "Nutrition": "vitamin C (immune health), vitamin K (blood clotting), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, goitrogens (thyroid interference)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "cabbage": {
            "Composition": "cabbage (Brassica oleracea); water, vitamin C, vitamin K, fiber",
            "Nutrition": "vitamin C (immune health), vitamin K (blood clotting), fiber (digestion)",
            "Contaminants/Side Effects": "pesticide residues, goitrogens (thyroid interference)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "cabb": {
            "Composition": "cabbage (Brassica oleracea); water, vitamin C, vitamin K, fiber",
            "Nutrition": "vitamin C (immune health), vitamin K (blood clotting), fiber (digestion)",
            "Contaminants/Side Effects": "pesticide residues, goitrogens (thyroid interference)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "carambola": {
            "Composition": "starfruit (Averrhoa carambola); water, vitamin C, fiber, oxalic acid",
            "Nutrition": "vitamin C (immune health), fiber (digestion), hydration",
            "Contaminants/Side Effects": "oxalic acid (kidney stone risk), neurotoxins (in renal patients)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "cardamom": {
            "Composition": "cardamom (Elettaria cardamomum); cineole, fiber, volatile oils",
            "Nutrition": "antioxidants, digestive aid, anti-inflammatory",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "cashew": {
            "Composition": "cashew (Anacardium occidentale); protein, healthy fats, fiber, magnesium",
            "Nutrition": "healthy fats (heart health), magnesium (muscle function), protein",
            "Contaminants/Side Effects": "allergens, high calories, aflatoxins (if improperly stored)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "cashews": {
            "Composition": "cashew (Anacardium occidentale); protein, healthy fats, fiber, magnesium",
            "Nutrition": "healthy fats (heart health), magnesium (muscle function), protein",
            "Contaminants/Side Effects": "allergens, high calories, aflatoxins (if improperly stored)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "cauliflower": {
            "Composition": "cauliflower (Brassica oleracea); water, vitamin C, fiber, choline",
            "Nutrition": "vitamin C (immune health), fiber (digestion), choline (brain health)",
            "Contaminants/Side Effects": "pesticide residues, goitrogens (thyroid interference)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "chana": {
            "Composition": "chickpea (Cicer arietinum); protein, carbs, fiber, iron, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health), folate",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "channa": {
            "Composition": "chickpea (Cicer arietinum); protein, carbs, fiber, iron, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health), folate",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "chapathi": {
            "Composition": "flatbread (wheat-based); whole wheat flour, water, sometimes oil",
            "Nutrition": "carbs (energy), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "gluten, high carbs (glycemic index)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "chapatis": {
            "Composition": "flatbread (wheat-based); whole wheat flour, water, sometimes oil",
            "Nutrition": "carbs (energy), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "gluten, high carbs (glycemic index)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "cherries": {
            "Composition": "cherry (Prunus avium); water, fructose, vitamin C, anthocyanins",
            "Nutrition": "vitamin C (immune health), antioxidants (anthocyanins), fiber",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "cherry": {
            "Composition": "cherry (Prunus avium); water, fructose, vitamin C, anthocyanins",
            "Nutrition": "vitamin C (immune health), antioxidants (anthocyanins), fiber",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "chickpea": {
            "Composition": "chickpea (Cicer arietinum); protein, carbs, fiber, iron, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health), folate",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "chickpeas": {
            "Composition": "chickpea (Cicer arietinum); protein, carbs, fiber, iron, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health), folate",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "cinnamon": {
            "Composition": "cinnamon (Cinnamomum verum); cinnamaldehyde, fiber, antioxidants",
            "Nutrition": "antioxidants (cell protection), blood sugar regulation, anti-inflammatory",
            "Contaminants/Side Effects": "coumarin (liver toxicity in excess), pesticide residues",
            "Effective Duration": "effects: 1-3 hours"
        },
        "cocount": {
            "Composition": "coconut (Cocos nucifera); water, healthy fats, fiber, manganese",
            "Nutrition": "healthy fats (energy), fiber (digestion), manganese (metabolism)",
            "Contaminants/Side Effects": "high calories, allergens (rare)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "corn": {
            "Composition": "corn (Zea mays); carbs, fiber, vitamin C, magnesium",
            "Nutrition": "energy (carbs), fiber (digestion), vitamin C (immune health)",
            "Contaminants/Side Effects": "pesticide residues, high glycemic index",
            "Effective Duration": "energy: 2-4 hours"
        },
        "coriander": {
            "Composition": "coriander (Coriandrum sativum); water, vitamin C, vitamin K, linalool",
            "Nutrition": "vitamin C (immune health), vitamin K (blood clotting), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "cowpea": {
            "Composition": "cowpea (Vigna unguiculata); protein, carbs, fiber, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), folate (cell growth)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "cucumber": {
            "Composition": "cucumber (Cucumis sativus); water, vitamin K, fiber, antioxidants",
            "Nutrition": "hydration, vitamin K (blood clotting), fiber (digestion)",
            "Contaminants/Side Effects": "pesticide residues, wax coating (if not organic)",
            "Effective Duration": "hydration: 1-3 hours"
        },
        "curd": {
            "Composition": "yogurt; milk solids, lactose, probiotics, calcium",
            "Nutrition": "calcium (bone health), probiotics (gut health), protein",
            "Contaminants/Side Effects": "lactose (intolerance), bacteria (if unpasteurized)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "curry": {
            "Composition": "curry; vegetables, spices, sometimes meat or lentils, oil",
            "Nutrition": "antioxidants (spices), fiber (vegetables), protein (if meat or lentils)",
            "Contaminants/Side Effects": "high sodium, oil (calories), allergens (if meat-based)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "curries": {
            "Composition": "curry; vegetables, spices, sometimes meat or lentils, oil",
            "Nutrition": "antioxidants (spices), fiber (vegetables), protein (if meat or lentils)",
            "Contaminants/Side Effects": "high sodium, oil (calories), allergens (if meat-based)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "custard": {
            "Composition": "custard; milk, sugar, eggs, vanilla, cornstarch",
            "Nutrition": "calcium (milk), protein (eggs), energy (sugar)",
            "Contaminants/Side Effects": "high sugar, egg allergens, lactose (intolerance)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "dal": {
            "Composition": "lentil curry (various lentils); protein, carbs, fiber, spices",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "daal": {
            "Composition": "lentil curry (various lentils); protein, carbs, fiber, spices",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "dates": {
            "Composition": "date (Phoenix dactylifera); fructose, fiber, potassium, antioxidants",
            "Nutrition": "energy (carbs), fiber (digestion), potassium (muscle function)",
            "Contaminants/Side Effects": "high sugar (dental health), pesticide residues",
            "Effective Duration": "energy: 1-3 hours"
        },
        "elaichi": {
            "Composition": "cardamom (Elettaria cardamomum); cineole, fiber, volatile oils",
            "Nutrition": "antioxidants, digestive aid, anti-inflammatory",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "fenugreek": {
            "Composition": "fenugreek (Trigonella foenum-graecum); fiber, protein, iron, alkaloids",
            "Nutrition": "fiber (digestion), blood sugar regulation, iron (blood health)",
            "Contaminants/Side Effects": "pesticide residues, digestive upset (excess)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "fig": {
            "Composition": "fig (Ficus carica); fructose, fiber, vitamin K, potassium",
            "Nutrition": "fiber (digestion), potassium (muscle function), antioxidants",
            "Contaminants/Side Effects": "high sugar (dental health), pesticide residues",
            "Effective Duration": "energy: 1-3 hours"
        },
        "garlic": {
            "Composition": "garlic (Allium sativum); allicin, sulfur compounds, vitamin C",
            "Nutrition": "antioxidants (allicin), immune support, anti-inflammatory",
            "Contaminants/Side Effects": "pesticide residues, digestive upset (excess)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "gatlic": {
            "Composition": "garlic (Allium sativum); allicin, sulfur compounds, vitamin C",
            "Nutrition": "antioxidants (allicin), immune support, anti-inflammatory",
            "Contaminants/Side Effects": "pesticide residues, digestive upset (excess)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "ghee": {
            "Composition": "clarified butter; milk fats, vitamin A, butyrate",
            "Nutrition": "healthy fats (energy), vitamin A (vision), butyrate (gut health)",
            "Contaminants/Side Effects": "high calories, lactose traces (intolerance)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "ginger": {
            "Composition": "ginger (Zingiber officinale); gingerol, fiber, antioxidants",
            "Nutrition": "anti-inflammatory (gingerol), digestive aid, immune support",
            "Contaminants/Side Effects": "pesticide residues, digestive upset (excess)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "gobi": {
            "Composition": "cauliflower (Brassica oleracea); water, vitamin C, fiber, choline",
            "Nutrition": "vitamin C (immune health), fiber (digestion), choline (brain health)",
            "Contaminants/Side Effects": "pesticide residues, goitrogens (thyroid interference)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "grape": {
            "Composition": "grape (Vitis vinifera); fructose, water, vitamin C, resveratrol",
            "Nutrition": "antioxidants (resveratrol), vitamin C (immune health), hydration",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "grapes": {
            "Composition": "grape (Vitis vinifera); fructose, water, vitamin C, resveratrol",
            "Nutrition": "antioxidants (resveratrol), vitamin C (immune health), hydration",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "groundnut": {
            "Composition": "peanut (Arachis hypogaea); protein, healthy fats, fiber, vitamin E",
            "Nutrition": "healthy fats (heart health), protein (muscle repair), vitamin E",
            "Contaminants/Side Effects": "allergens, aflatoxins (if improperly stored), high calories",
            "Effective Duration": "energy: 3-5 hours"
        },
        "guava": {
            "Composition": "guava (Psidium guajava); water, vitamin C, fiber, lycopene",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants (lycopene)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (moderate)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "gulab": {
            "Composition": "rose-based sweet (gulab jamun); milk solids, sugar, flour, ghee",
            "Nutrition": "energy (sugar, fats), calcium (milk solids)",
            "Contaminants/Side Effects": "high sugar, high fat, gluten, lactose",
            "Effective Duration": "energy: 2-4 hours"
        },
        "halwa": {
            "Composition": "sweet dish; semolina/wheat, sugar, ghee, nuts",
            "Nutrition": "energy (carbs, fats), protein (nuts), calcium (if milk-based)",
            "Contaminants/Side Effects": "high sugar, high fat, gluten, nut allergens",
            "Effective Duration": "energy: 2-4 hours"
        },
        "idli": {
            "Composition": "steamed rice cake; rice, urad dal, water, salt",
            "Nutrition": "carbs (energy), protein (urad dal), probiotics (fermentation)",
            "Contaminants/Side Effects": "high glycemic index, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "idlis": {
            "Composition": "steamed rice cake; rice, urad dal, water, salt",
            "Nutrition": "carbs (energy), protein (urad dal), probiotics (fermentation)",
            "Contaminants/Side Effects": "high glycemic index, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "jam": {
            "Composition": "fruit jam; fruit puree, sugar, pectin, citric acid",
            "Nutrition": "vitamin C (fruit), energy (sugar)",
            "Contaminants/Side Effects": "high sugar (dental health), preservatives",
            "Effective Duration": "energy: 1-3 hours"
        },
        "jamun": {
            "Composition": "black plum (Syzygium cumini); water, fructose, vitamin C, anthocyanins",
            "Nutrition": "vitamin C (immune health), antioxidants, blood sugar regulation",
            "Contaminants/Side Effects": "pesticide residues, high sugar (moderate)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "jeera": {
            "Composition": "cumin (Cuminum cyminum); cuminaldehyde, fiber, iron",
            "Nutrition": "antioxidants, digestive aid, iron (blood health)",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "jowar": {
            "Composition": "sorghum (Sorghum bicolor); carbs, fiber, protein, iron",
            "Nutrition": "energy (carbs), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, pesticide residues",
            "Effective Duration": "energy: 3-5 hours"
        },
        "kadala": {
            "Composition": "Bengal gram (Cicer arietinum); protein, carbs, fiber, iron",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "karela": {
            "Composition": "bitter gourd (Momordica charantia); water, fiber, vitamin C, charantin",
            "Nutrition": "vitamin C (immune health), fiber (digestion), blood sugar regulation",
            "Contaminants/Side Effects": "bitter taste (digestive upset), pesticide residues",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "karimeen": {
            "Composition": "pearl spot fish (Etroplus suratensis); protein, omega-3s, vitamin D",
            "Nutrition": "protein (muscle repair), omega-3s (heart, brain health), vitamin D",
            "Contaminants/Side Effects": "mercury, allergens, environmental pollutants",
            "Effective Duration": "energy: 3-5 hours"
        },
        "khichidi": {
            "Composition": "lentil-rice dish; rice, lentils, spices, ghee",
            "Nutrition": "carbs (energy), protein (lentils), fiber (digestion)",
            "Contaminants/Side Effects": "high glycemic index, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "kodubale": {
            "Composition": "fried snack; rice flour, spices, oil, sometimes gram flour",
            "Nutrition": "carbs (energy), protein (if gram flour), spices (antioxidants)",
            "Contaminants/Side Effects": "high oil (calories), high sodium, gluten (if wheat-based)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "kulith": {
            "Composition": "horse gram (Macrotyloma uniflorum); protein, carbs, fiber, iron",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "kuzhalappam": {
            "Composition": "fried snack; rice flour, coconut, spices, oil",
            "Nutrition": "carbs (energy), healthy fats (coconut), antioxidants (spices)",
            "Contaminants/Side Effects": "high oil (calories), high sodium",
            "Effective Duration": "energy: 2-4 hours"
        },
        "laddoo": {
            "Composition": "sweet ball; gram flour, sugar, ghee, nuts",
            "Nutrition": "energy (sugar, fats), protein (nuts, gram flour), calcium (if milk-based)",
            "Contaminants/Side Effects": "high sugar, high fat, nut allergens, gluten",
            "Effective Duration": "energy: 2-4 hours"
        },
        "ladoo": {
            "Composition": "sweet ball; gram flour, sugar, ghee, nuts",
            "Nutrition": "energy (sugar, fats), protein (nuts, gram flour), calcium (if milk-based)",
            "Contaminants/Side Effects": "high sugar, high fat, nut allergens, gluten",
            "Effective Duration": "energy: 2-4 hours"
        },
        "lapsi": {
            "Composition": "broken wheat porridge (dalia); wheat, water, sometimes sugar or spices",
            "Nutrition": "carbs (energy), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "gluten, high sugar (if sweetened)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "lettuce": {
            "Composition": "lettuce (Lactuca sativa); water, vitamin K, vitamin A, fiber",
            "Nutrition": "hydration, vitamin K (blood clotting), vitamin A (vision)",
            "Contaminants/Side Effects": "pesticide residues, bacteria (E. coli risk)",
            "Effective Duration": "nutrient absorption: 1-3 hours"
        },
        "lime": {
            "Composition": "lime (Citrus aurantiifolia); water, vitamin C, citric acid, fiber",
            "Nutrition": "vitamin C (immune health), hydration, digestive aid",
            "Contaminants/Side Effects": "pesticide residues, acidity (dental erosion)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "limejuice": {
            "Composition": "lime juice; water, vitamin C, citric acid, sometimes sugar",
            "Nutrition": "vitamin C (immune health), hydration, digestive aid",
            "Contaminants/Side Effects": "high sugar (if sweetened), acidity (dental erosion)",
            "Effective Duration": "effects: 1-2 hours"
        },
        "maida": {
            "Composition": "refined wheat flour; carbs, minimal protein, no fiber",
            "Nutrition": "energy (carbs)",
            "Contaminants/Side Effects": "gluten, high glycemic index, low nutrient density",
            "Effective Duration": "energy: 1-3 hours"
        },
        "mango": {
            "Composition": "mango (Mangifera indica); fructose, water, vitamin C, vitamin A",
            "Nutrition": "vitamin C (immune health), vitamin A (vision), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "mang": {
            "Composition": "mango (Mangifera indica); fructose, water, vitamin C, vitamin A",
            "Nutrition": "vitamin C (immune health), vitamin A (vision), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "marinated": {
            "Composition": "marinated food; base ingredient (meat/vegetable), spices, oil, vinegar",
            "Nutrition": "varies by base, antioxidants (spices), protein (if meat)",
            "Contaminants/Side Effects": "high sodium, allergens (base-dependent), preservatives",
            "Effective Duration": "energy: 3-5 hours"
        },
        "masala": {
            "Composition": "spice mix; various spices (cumin, coriander, turmeric, etc.)",
            "Nutrition": "antioxidants, anti-inflammatory, digestive aid",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare), high sodium (pre-mixed)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "masalas": {
            "Composition": "spice mix; various spices (cumin, coriander, turmeric, etc.)",
            "Nutrition": "antioxidants, anti-inflammatory, digestive aid",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare), high sodium (pre-mixed)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "masoor": {
            "Composition": "red lentil (Lens culinaris); protein, carbs, fiber, iron, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health), folate",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "matar": {
            "Composition": "green pea (Pisum sativum); protein, carbs, fiber, vitamin C",
            "Nutrition": "protein (muscle repair), fiber (digestion), vitamin C (immune health)",
            "Contaminants/Side Effects": "pesticide residues, digestive discomfort (excess)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "matthi": {
            "Composition": "savory snack; wheat flour, spices, oil",
            "Nutrition": "carbs (energy), spices (antioxidants), fats",
            "Contaminants/Side Effects": "high oil (calories), high sodium, gluten",
            "Effective Duration": "energy: 2-4 hours"
        },
        "melon": {
            "Composition": "melon (Cucumis melo); water, fructose, vitamin C, potassium",
            "Nutrition": "hydration, vitamin C (immune health), potassium (muscle function)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "millets": {
            "Composition": "various millets; carbs, fiber, protein, magnesium, iron",
            "Nutrition": "energy (carbs), fiber (digestion), magnesium (muscle function), iron",
            "Contaminants/Side Effects": "phytic acid, pesticide residues",
            "Effective Duration": "energy: 3-5 hours"
        },
        "mint": {
            "Composition": "mint (Mentha); menthol, vitamin C, antioxidants, water",
            "Nutrition": "antioxidants, digestive aid, vitamin C (immune health)",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "moilee": {
            "Composition": "coconut milk curry; coconut milk, spices, fish or vegetables",
            "Nutrition": "healthy fats (coconut), antioxidants (spices), protein (if fish)",
            "Contaminants/Side Effects": "high calories, allergens (fish), high sodium",
            "Effective Duration": "energy: 3-5 hours"
        },
        "moong": {
            "Composition": "mung bean (Vigna radiata); protein, carbs, fiber, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), folate (cell growth)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "moringa": {
            "Composition": "moringa (Moringa oleifera); vitamin C, vitamin A, calcium, protein",
            "Nutrition": "vitamin C (immune health), vitamin A (vision), calcium (bone health)",
            "Contaminants/Side Effects": "pesticide residues, digestive upset (excess)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "murukku": {
            "Composition": "fried snack; rice flour, urad dal flour, spices, oil",
            "Nutrition": "carbs (energy), protein (urad dal), antioxidants (spices)",
            "Contaminants/Side Effects": "high oil (calories), high sodium",
            "Effective Duration": "energy: 2-4 hours"
        },
        "muruku": {
            "Composition": "fried snack; rice flour, urad dal flour, spices, oil",
            "Nutrition": "carbs (energy), protein (urad dal), antioxidants (spices)",
            "Contaminants/Side Effects": "high oil (calories), high sodium",
            "Effective Duration": "energy: 2-4 hours"
        },
        "musambi": {
            "Composition": "sweet lime (Citrus limetta); water, vitamin C, fructose, fiber",
            "Nutrition": "vitamin C (immune health), hydration, fiber (digestion)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "mushroom": {
            "Composition": "mushroom; water, protein, fiber, vitamin D, selenium",
            "Nutrition": "protein (muscle repair), vitamin D (bone health), antioxidants",
            "Contaminants/Side Effects": "allergens, toxins (if wild or improperly stored)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "mustard": {
            "Composition": "mustard (Brassica); glucosinolates, fiber, omega-3s, selenium",
            "Nutrition": "antioxidants, anti-inflammatory, digestive aid",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "mutton": {
            "Composition": "goat/sheep meat; protein, fats, iron, B vitamins",
            "Nutrition": "protein (muscle repair), iron (blood health), B vitamins (metabolism)",
            "Contaminants/Side Effects": "bacteria (E. coli), high fat, hormones",
            "Effective Duration": "energy: 3-5 hours"
        },
        "namdhari": {
            "Composition": "vegetable/seed variety; varies by type (e.g., tomatoes, greens)",
            "Nutrition": "fiber, vitamins (A, C, K), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, allergens (varies)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "namdharis": {
            "Composition": "vegetable/seed variety; varies by type (e.g., tomatoes, greens)",
            "Nutrition": "fiber, vitamins (A, C, K), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, allergens (varies)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "nendran": {
            "Composition": "banana (Musa, Nendran variety); water, potassium, vitamin B6, fructose",
            "Nutrition": "potassium (muscle function), vitamin B6 (brain health), energy (carbs)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "noodles": {
            "Composition": "noodles; wheat flour, water, sometimes eggs, oil",
            "Nutrition": "carbs (energy), protein (if egg-based)",
            "Contaminants/Side Effects": "gluten, high sodium, preservatives",
            "Effective Duration": "energy: 2-4 hours"
        },
        "onion": {
            "Composition": "onion (Allium cepa); water, fiber, vitamin C, sulfur compounds",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, digestive upset (excess)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "orange": {
            "Composition": "orange (Citrus sinensis); water, vitamin C, fiber, fructose",
            "Nutrition": "vitamin C (immune health), fiber (digestion), hydration",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "oranges": {
            "Composition": "orange (Citrus sinensis); water, vitamin C, fiber, fructose",
            "Nutrition": "vitamin C (immune health), fiber (digestion), hydration",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "oregano": {
            "Composition": "oregano (Origanum vulgare); carvacrol, fiber, antioxidants",
            "Nutrition": "antioxidants, anti-inflammatory, digestive aid",
            "Contaminants/Side Effects": "pesticide residues, allergic reactions (rare)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "paal": {
            "Composition": "milk; water, lactose, protein, calcium, vitamin D",
            "Nutrition": "calcium (bone health), protein (muscle repair), vitamin D",
            "Contaminants/Side Effects": "lactose (intolerance), bacteria (if unpasteurized), hormones",
            "Effective Duration": "energy: 2-4 hours"
        },
        "paalappam": {
            "Composition": "rice pancake; rice flour, coconut milk, yeast, water",
            "Nutrition": "carbs (energy), healthy fats (coconut milk), probiotics (fermentation)",
            "Contaminants/Side Effects": "high glycemic index, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "papaya": {
            "Composition": "papaya (Carica papaya); water, vitamin C, fiber, papain",
            "Nutrition": "vitamin C (immune health), fiber (digestion), papain (digestive enzyme)",
            "Contaminants/Side Effects": "pesticide residues, latex allergens (rare)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "paripp": {
            "Composition": "lentil curry (dal); lentils, spices, water, sometimes ghee",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "parippu": {
            "Composition": "lentil curry (dal); lentils, spices, water, sometimes ghee",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "patato": {
            "Composition": "potato (Solanum tuberosum); carbohydrates, water, fiber, vitamin C, potassium",
            "Nutrition": "energy (carbs), vitamin C (immune support), potassium (muscle function), fiber",
            "Contaminants/Side Effects": "glycoalkaloids (toxic in high amounts), high glycemic index",
            "Effective Duration": "energy: 2-4 hours"
        },
        "paysam": {
            "Composition": "sweet porridge; rice, milk, sugar, nuts, spices",
            "Nutrition": "energy (carbs, sugar), calcium (milk), protein (nuts)",
            "Contaminants/Side Effects": "high sugar, lactose (intolerance), nut allergens",
            "Effective Duration": "energy: 2-4 hours"
        },
        "pazham": {
            "Composition": "banana (Musa); water, potassium, vitamin B6, fructose",
            "Nutrition": "potassium (muscle function), vitamin B6 (brain health), energy (carbs)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "pea": {
            "Composition": "green pea (Pisum sativum); protein, carbs, fiber, vitamin C",
            "Nutrition": "protein (muscle repair), fiber (digestion), vitamin C (immune health)",
            "Contaminants/Side Effects": "pesticide residues, digestive discomfort (excess)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "peanuts": {
            "Composition": "peanut (Arachis hypogaea); protein, healthy fats, fiber, vitamin E",
            "Nutrition": "healthy fats (heart health), protein (muscle repair), vitamin E",
            "Contaminants/Side Effects": "allergens, aflatoxins (if improperly stored), high calories",
            "Effective Duration": "energy: 3-5 hours"
        },
        "pepper": {
            "Composition": "black pepper (Piper nigrum); piperine, fiber, antioxidants",
            "Nutrition": "antioxidants, digestive aid, anti-inflammatory",
            "Contaminants/Side Effects": "pesticide residues, irritation (excess)",
            "Effective Duration": "effects: 1-3 hours"
        },
        "pickle": {
            "Composition": "pickle; vegetables, spices, oil, vinegar, salt",
            "Nutrition": "antioxidants (spices), fiber (vegetables), probiotics (if fermented)",
            "Contaminants/Side Effects": "high sodium, oil (calories), preservatives",
            "Effective Duration": "effects: 1-3 hours"
        },
        "pineapple": {
            "Composition": "pineapple (Ananas comosus); water, vitamin C, fructose, bromelain",
            "Nutrition": "vitamin C (immune health), bromelain (digestive enzyme), hydration",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "pindi": {
            "Composition": "chickpea flour dish; besan, spices, oil, water",
            "Nutrition": "protein (chickpea flour), fiber (digestion), antioxidants (spices)",
            "Contaminants/Side Effects": "high oil (calories), digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "plantain": {
            "Composition": "plantain (Musa paradisiaca); carbs, fiber, potassium, vitamin C",
            "Nutrition": "energy (carbs), potassium (muscle function), fiber (digestion)",
            "Contaminants/Side Effects": "pesticide residues, high glycemic index (if ripe)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "plantains": {
            "Composition": "plantain (Musa paradisiaca); carbs, fiber, potassium, vitamin C",
            "Nutrition": "energy (carbs), potassium (muscle function), fiber (digestion)",
            "Contaminants/Side Effects": "pesticide residues, high glycemic index (if ripe)",
            "Effective Duration": "energy: 2-4 hours"
        },
        "plum": {
            "Composition": "plum (Prunus domestica); water, fructose, vitamin C, fiber",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "plums": {
            "Composition": "plum (Prunus domestica); water, fructose, vitamin C, fiber",
            "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "pomegranate": {
            "Composition": "pomegranate (Punica granatum); water, fructose, vitamin C, punicalagins",
            "Nutrition": "antioxidants (punicalagins), vitamin C (immune health), fiber",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "pomogranate": {
            "Composition": "pomegranate (Punica granatum); water, fructose, vitamin C, punicalagins",
            "Nutrition": "antioxidants (punicalagins), vitamin C (immune health), fiber",
            "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
            "Effective Duration": "energy: 1-3 hours"
        },
        "pongal": {
            "Composition": "rice-lentil dish; rice, moong dal, ghee, spices",
            "Nutrition": "carbs (energy), protein (moong dal), fiber, antioxidants (spices)",
            "Contaminants/Side Effects": "high glycemic index, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "poori": {
            "Composition": "fried bread; wheat flour, water, oil",
            "Nutrition": "carbs (energy), fats (caloric density)",
            "Contaminants/Side Effects": "high oil (calories), gluten, high glycemic index",
            "Effective Duration": "energy: 2-4 hours"
        },
        "porridge": {
            "Composition": "porridge; grains (oats, rice, wheat), water, sometimes milk or sugar",
            "Nutrition": "carbs (energy), fiber (digestion), calcium (if milk-based)",
            "Contaminants/Side Effects": "high sugar (if sweetened), gluten (if wheat-based), lactose",
            "Effective Duration": "energy: 3-5 hours"
        },
        "prawn": {
            "Composition": "prawn; protein, omega-3s, water, selenium",
            "Nutrition": "protein (muscle repair), omega-3s (heart health), selenium (antioxidant)",
            "Contaminants/Side Effects": "allergens, cholesterol, environmental pollutants",
            "Effective Duration": "energy: 3-5 hours"
        },
        "prawns": {
            "Composition": "prawn; protein, omega-3s, water, selenium",
            "Nutrition": "protein (muscle repair), omega-3s (heart health), selenium (antioxidant)",
            "Contaminants/Side Effects": "allergens, cholesterol, environmental pollutants",
            "Effective Duration": "energy: 3-5 hours"
        },
        "pulses": {
            "Composition": "various pulses; protein, carbs, fiber, iron, folate",
            "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health), folate",
            "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
            "Effective Duration": "energy: 3-5 hours"
        },
        "pumpkin": {
            "Composition": "pumpkin (Cucurbita); water, beta-carotene, fiber, vitamin C",
            "Nutrition": "vitamin A (vision), fiber (digestion), vitamin C (immune health)",
            "Contaminants/Side Effects": "pesticide residues, high sugar (moderate)",
            "Effective Duration": "nutrient absorption: 2-4 hours"
        },
        "ragi": {
            "Composition": "finger millet (Eleusine coracana); carbs, fiber, calcium, iron",
            "Nutrition": "calcium (bone health), fiber (digestion), iron (blood health)",
            "Contaminants/Side Effects": "phytic acid, pesticide residues",
            "Effective Duration": "energy: 3-5 hours"
        },
        "raisins": {
            "Composition": "raisin (Vitis vinifera); fructose, fiber, iron, antioxidants",
            "Nutrition": "energy (carbs), fiber (digestion), iron (blood health), antioxidants",
            "Contaminants/Side Effects": "high sugar (dental health), pesticide residues",
            "Effective Duration": "energy: 1-3 hours"
        },
        "rajgira": {
            "Composition": "amaranth (Amaranthus); protein, carbs, fiber, magnesium",
            "Nutrition": "protein (muscle repair), fiber (digestion), magnesium (muscle function)",
            "Contaminants/Side Effects": "phytic acid, pesticide residues",
            "Effective Duration": "energy: 3-5 hours"
        },
        "rava": {
            "Composition": "semolina (wheat); carbs, protein, minimal fiber",
            "Nutrition": "energy (carbs), protein (muscle repair)",
            "Contaminants/Side Effects": "gluten, high glycemic index",
            "Effective Duration": "energy: 2-4 hours"
        },
        "roasted": {
            "Composition": "roasted food; varies (nuts, seeds, vegetables), minimal oil",
            "Nutrition": "varies by base, protein (nuts), fiber (vegetables), healthy fats",
            "Contaminants/Side Effects": "high sodium (if salted), allergens (base-dependent)",
            "Effective Duration": "energy: 2-5 hours"
        },
        "sabji": {
            "Composition": "vegetable curry; vegetables, spices, oil, sometimes lentils",
            "Nutrition": "fiber (vegetables), antioxidants (spices), protein (if lentils)",
            "Contaminants/Side Effects": "high sodium, oil (calories), pesticide residues",
            "Effective Duration": "energy: 3-5 hours"
        },
            "sambar": {
                "Composition": "lentil-vegetable stew; lentils (toor dal), vegetables (drumstick, carrot), tamarind, spices",
                "Nutrition": "protein (lentils), fiber (vegetables), antioxidants (spices), vitamin C",
                "Contaminants/Side Effects": "high sodium, digestive discomfort (excess), pesticide residues (vegetables)",
                "Effective Duration": "energy: 3-5 hours"
            },
            "sameya": {
                "Composition": "vermicelli (semiya); wheat flour, water",
                "Nutrition": "carbs (energy), minimal protein",
                "Contaminants/Side Effects": "gluten, high glycemic index, low nutrient density",
                "Effective Duration": "energy: 2-4 hours"
            },
            "sapota": {
                "Composition": "sapodilla (Manilkara zapota); water, fructose, fiber, vitamin C",
                "Nutrition": "vitamin C (immune health), fiber (digestion), energy (carbs)",
                "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
                "Effective Duration": "energy: 1-3 hours"
            },
            "sardines": {
                "Composition": "sardine fish; protein, omega-3 fatty acids, vitamin D, calcium",
                "Nutrition": "protein (muscle repair), omega-3s (heart health), calcium (bone health)",
                "Contaminants/Side Effects": "mercury, allergens, environmental pollutants",
                "Effective Duration": "energy: 3-5 hours"
            },
            "sauce": {
                "Composition": "sauce; varies (tomatoes, spices, sugar, vinegar), water",
                "Nutrition": "antioxidants (if tomato-based), vitamin C, varies by type",
                "Contaminants/Side Effects": "high sodium, high sugar, preservatives",
                "Effective Duration": "effects: 1-3 hours"
            },
            "sesame": {
                "Composition": "sesame seeds (Sesamum indicum); healthy fats, protein, fiber, calcium",
                "Nutrition": "calcium (bone health), healthy fats (heart health), fiber (digestion)",
                "Contaminants/Side Effects": "allergens, high calories, pesticide residues",
                "Effective Duration": "energy: 3-5 hours"
            },
            "soan": {
                "Composition": "soan papdi (sweet); gram flour, sugar, ghee, nuts",
                "Nutrition": "energy (sugar, fats), protein (nuts, gram flour)",
                "Contaminants/Side Effects": "high sugar, high fat, nut allergens, gluten",
                "Effective Duration": "energy: 2-4 hours"
            },
            "soya": {
                "Composition": "soybean (Glycine max); protein, healthy fats, fiber, isoflavones",
                "Nutrition": "protein (muscle repair), fiber (digestion), isoflavones (antioxidants)",
                "Contaminants/Side Effects": "allergens, phytoestrogens (hormonal effects), pesticide residues",
                "Effective Duration": "energy: 3-5 hours"
            },
            "soyabeans": {
                "Composition": "soybean (Glycine max); protein, healthy fats, fiber, isoflavones",
                "Nutrition": "protein (muscle repair), fiber (digestion), isoflavones (antioxidants)",
                "Contaminants/Side Effects": "allergens, phytoestrogens (hormonal effects), pesticide residues",
                "Effective Duration": "energy: 3-5 hours"
            },
            "spinach": {
                "Composition": "spinach (Spinacia oleracea); water, vitamin A, vitamin K, iron, folate",
                "Nutrition": "vitamin A (vision), vitamin K (blood clotting), iron (blood health), folate",
                "Contaminants/Side Effects": "oxalic acid (kidney stone risk), pesticide residues",
                "Effective Duration": "nutrient absorption: 2-4 hours"
            },
            "starfruit": {
                "Composition": "starfruit (Averrhoa carambola); water, vitamin C, fiber, oxalic acid",
                "Nutrition": "vitamin C (immune health), fiber (digestion), hydration",
                "Contaminants/Side Effects": "oxalic acid (kidney stone risk), neurotoxins (in renal patients)",
                "Effective Duration": "energy: 1-3 hours"
            },
            "stew": {
                "Composition": "stew; vegetables, meat or pulses, water, spices",
                "Nutrition": "protein (meat/pulses), fiber (vegetables), antioxidants (spices)",
                "Contaminants/Side Effects": "high sodium, allergens (meat-based), pesticide residues",
                "Effective Duration": "energy: 3-5 hours"
            },
            "sugar": {
                "Composition": "sugar; sucrose, glucose, fructose",
                "Nutrition": "energy (carbs)",
                "Contaminants/Side Effects": "high glycemic index, dental issues, weight gain",
                "Effective Duration": "energy: 1-2 hours"
            },
            "tamarind": {
                "Composition": "tamarind (Tamarindus indica); tartaric acid, fiber, vitamin C",
                "Nutrition": "vitamin C (immune health), fiber (digestion), antioxidants",
                "Contaminants/Side Effects": "pesticide residues, acidity (dental erosion)",
                "Effective Duration": "effects: 1-3 hours"
            },
            "tomato": {
                "Composition": "tomato (Solanum lycopersicum); water, lycopene, vitamin C, fiber",
                "Nutrition": "vitamin C (immune health), lycopene (antioxidant), fiber (digestion)",
                "Contaminants/Side Effects": "pesticide residues, acidity (digestive upset)",
                "Effective Duration": "nutrient absorption: 2-4 hours"
            },
            "toor": {
                "Composition": "pigeon pea (Cajanus cajan); protein, carbs, fiber, folate",
                "Nutrition": "protein (muscle repair), fiber (digestion), folate (cell growth)",
                "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
                "Effective Duration": "energy: 3-5 hours"
            },
            "turmeric": {
                "Composition": "turmeric (Curcuma longa); curcumin, fiber, antioxidants",
                "Nutrition": "antioxidants (curcumin), anti-inflammatory, digestive aid",
                "Contaminants/Side Effects": "pesticide residues, digestive upset (excess)",
                "Effective Duration": "effects: 1-3 hours"
            },
            "tutti": {
                "Composition": "tutti frutti (candied fruit); fruit pieces, sugar, artificial colors",
                "Nutrition": "energy (sugar), minimal vitamins (fruit)",
                "Contaminants/Side Effects": "high sugar, artificial colors (allergic reactions), preservatives",
                "Effective Duration": "energy: 1-2 hours"
            },
            "uddin": {
                "Composition": "black gram (Vigna mungo); protein, carbs, fiber, iron",
                "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
                "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
                "Effective Duration": "energy: 3-5 hours"
            },
            "udlu": {
                "Composition": "black gram (Vigna mungo); protein, carbs, fiber, iron",
                "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
                "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
                "Effective Duration": "energy: 3-5 hours"
            },
            "urad": {
                "Composition": "black gram (Vigna mungo); protein, carbs, fiber, iron",
                "Nutrition": "protein (muscle repair), fiber (digestion), iron (blood health)",
                "Contaminants/Side Effects": "phytic acid, digestive discomfort (excess)",
                "Effective Duration": "energy: 3-5 hours"
            },
            "vada": {
                "Composition": "fried fritter; urad dal, spices, oil, sometimes rice flour",
                "Nutrition": "protein (urad dal), carbs (energy), antioxidants (spices)",
                "Contaminants/Side Effects": "high oil (calories), high sodium, digestive discomfort",
                "Effective Duration": "energy: 2-4 hours"
            },
            "vadas": {
                "Composition": "fried fritter; urad dal, spices, oil, sometimes rice flour",
                "Nutrition": "protein (urad dal), carbs (energy), antioxidants (spices)",
                "Contaminants/Side Effects": "high oil (calories), high sodium, digestive discomfort",
                "Effective Duration": "energy: 2-4 hours"
            },
            "vanilla": {
                "Composition": "vanilla (Vanilla planifolia); vanillin, antioxidants, minimal fiber",
                "Nutrition": "antioxidants, flavor enhancer",
                "Contaminants/Side Effects": "allergic reactions (rare), artificial vanillin (if synthetic)",
                "Effective Duration": "effects: 1-3 hours"
            },
            "veg": {
                "Composition": "various vegetables; water, fiber, vitamins (A, C, K), minerals",
                "Nutrition": "fiber (digestion), vitamins (immune, vision, bone health), antioxidants",
                "Contaminants/Side Effects": "pesticide residues, oxalates (kidney stone risk)",
                "Effective Duration": "nutrient absorption: 2-4 hours"
            },
            "vellarika": {
                "Composition": "cucumber (Cucumis sativus); water, vitamin K, fiber, antioxidants",
                "Nutrition": "hydration, vitamin K (blood clotting), fiber (digestion)",
                "Contaminants/Side Effects": "pesticide residues, wax coating (if not organic)",
                "Effective Duration": "hydration: 1-3 hours"
            },
            "watermelon": {
                "Composition": "watermelon (Citrullus lanatus); water, lycopene, vitamin C, fructose",
                "Nutrition": "hydration, vitamin C (immune health), lycopene (antioxidant)",
                "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
                "Effective Duration": "energy: 1-3 hours"
            },
            "wheat": {
                "Composition": "wheat; carbs, protein, fiber, B vitamins, iron",
                "Nutrition": "energy (carbs), fiber (digestion), iron (blood health), B vitamins",
                "Contaminants/Side Effects": "gluten, pesticide residues, high glycemic index",
                "Effective Duration": "energy: 3-5 hours"
            },
            "yam": {
                "Composition": "yam (Dioscorea); carbs, fiber, vitamin C, potassium",
                "Nutrition": "energy (carbs), fiber (digestion), vitamin C (immune health)",
                "Contaminants/Side Effects": "oxalic acid (kidney stone risk), pesticide residues",
                "Effective Duration": "energy: 2-4 hours"
            },
            "yelakki": {
                "Composition": "banana (Musa, Yelakki variety); water, potassium, vitamin B6, fructose",
                "Nutrition": "potassium (muscle function), vitamin B6 (brain health), energy (carbs)",
                "Contaminants/Side Effects": "pesticide residues, high sugar (dental health)",
                "Effective Duration": "energy: 1-3 hours"
            },
            "aching": {
                "Composition": "symptom; pain in muscles or joints, often due to inflammation or strain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to days, depending on cause)"
            },
            "ache": {
                "Composition": "symptom; pain in muscles or joints, often due to inflammation or strain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to days, depending on cause)"
            },
            "aches": {
                "Composition": "symptom; pain in muscles or joints, often due to inflammation or strain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to days, depending on cause)"
            },
            "achy": {
                "Composition": "symptom; pain in muscles or joints, often due to inflammation or strain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to days, depending on cause)"
            },
            "belching": {
                "Composition": "symptom; release of gas from stomach through mouth",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive issues, food intolerance, or overeating",
                "Effective Duration": "minutes to hours"
            },
            "belches": {
                "Composition": "symptom; release of gas from stomach through mouth",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive issues, food intolerance, or overeating",
                "Effective Duration": "minutes to hours"
            },
            "bleeding": {
                "Composition": "symptom; loss of blood from body, internal or external",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or medical condition",
                "Effective Duration": "varies (immediate medical attention often required)"
            },
            "blood": {
                "Composition": "symptom; presence of blood in abnormal locations (e.g., urine, stool)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or serious condition",
                "Effective Duration": "varies (immediate medical attention often required)"
            },
            "bloody": {
                "Composition": "symptom; presence of blood in abnormal locations (e.g., urine, stool)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or serious condition",
                "Effective Duration": "varies (immediate medical attention often required)"
            },
            "breathlessness": {
                "Composition": "symptom; difficulty breathing or shortness of breath",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate respiratory or cardiovascular issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "breathless": {
                "Composition": "symptom; difficulty breathing or shortness of breath",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate respiratory or cardiovascular issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "breaths": {
                "Composition": "symptom; abnormal breathing patterns",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate respiratory or cardiovascular issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "bruise": {
                "Composition": "symptom; skin discoloration from broken blood vessels",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate trauma, clotting issues, or vitamin deficiency",
                "Effective Duration": "days to weeks"
            },
            "bruised": {
                "Composition": "symptom; skin discoloration from broken blood vessels",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate trauma, clotting issues, or vitamin deficiency",
                "Effective Duration": "days to weeks"
            },
            "bruises": {
                "Composition": "symptom; skin discoloration from broken blood vessels",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate trauma, clotting issues, or vitamin deficiency",
                "Effective Duration": "days to weeks"
            },
            "clench": {
                "Composition": "symptom; involuntary muscle tightening, often in jaw or fists",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate stress, neurological issues, or dental problems",
                "Effective Duration": "varies (seconds to persistent)"
            },
            "clenching": {
                "Composition": "symptom; involuntary muscle tightening, often in jaw or fists",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate stress, neurological issues, or dental problems",
                "Effective Duration": "varies (seconds to persistent)"
            },
            "clicking": {
                "Composition": "symptom; joint or bone sounds during movement",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate joint issues, arthritis, or injury",
                "Effective Duration": "varies (intermittent to persistent)"
            },
            "burning": {
                "Composition": "symptom; sensation of heat or pain, often in skin or digestive tract",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate irritation, infection, or nerve issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "burping": {
                "Composition": "symptom; release of gas from stomach through mouth",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive issues, food intolerance, or overeating",
                "Effective Duration": "minutes to hours"
            },
            "burps": {
                "Composition": "symptom; release of gas from stomach through mouth",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive issues, food intolerance, or overeating",
                "Effective Duration": "minutes to hours"
            },
            "chills": {
                "Composition": "symptom; feeling cold, often with shivering",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, infection, or immune response",
                "Effective Duration": "hours to days"
            },
            "choking": {
                "Composition": "symptom; obstruction or difficulty in throat or airway",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate food blockage, allergies, or medical emergency",
                "Effective Duration": "immediate (requires urgent attention)"
            },
            "chill": {
                "Composition": "symptom; feeling cold, often with shivering",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, infection, or immune response",
                "Effective Duration": "hours to days"
            },
            "shiver": {
                "Composition": "symptom; involuntary trembling due to cold or illness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, infection, or neurological issues",
                "Effective Duration": "hours to days"
            },
            "shivering": {
                "Composition": "symptom; involuntary trembling due to cold or illness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, infection, or neurological issues",
                "Effective Duration": "hours to days"
            },
            "shiverish": {
                "Composition": "symptom; mild trembling or feeling cold",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate early fever, infection, or fatigue",
                "Effective Duration": "hours to days"
            },
            "constipation": {
                "Composition": "symptom; infrequent or difficult bowel movements",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate low fiber, dehydration, or medication side effects",
                "Effective Duration": "days to weeks"
            },
            "cough": {
                "Composition": "symptom; reflex to clear airways",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate infection, allergies, or respiratory issues",
                "Effective Duration": "varies (days to weeks)"
            },
            "coughing": {
                "Composition": "symptom; reflex to clear airways",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate infection, allergies, or respiratory issues",
                "Effective Duration": "varies (days to weeks)"
            },
            "coughs": {
                "Composition": "symptom; reflex to clear airways",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate infection, allergies, or respiratory issues",
                "Effective Duration": "varies (days to weeks)"
            },
            "cramping": {
                "Composition": "symptom; painful muscle contractions",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, electrolyte imbalance, or injury",
                "Effective Duration": "minutes to hours"
            },
            "cramps": {
                "Composition": "symptom; painful muscle contractions",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, electrolyte imbalance, or injury",
                "Effective Duration": "minutes to hours"
            },
            "cramp": {
                "Composition": "symptom; painful muscle contraction",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, electrolyte imbalance, or injury",
                "Effective Duration": "minutes to hours"
            },
            "discomfort": {
                "Composition": "symptom; vague unease or pain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive issues, injury, or infection",
                "Effective Duration": "varies (hours to persistent)"
            },
            "disoriented": {
                "Composition": "symptom; confusion or loss of spatial awareness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, low blood sugar, or neurological issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "dizziness": {
                "Composition": "symptom; sensation of spinning or imbalance",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, low blood pressure, or inner ear issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "dizzy": {
                "Composition": "symptom; sensation of spinning or imbalance",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, low blood pressure, or inner ear issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "drowsiness": {
                "Composition": "symptom; excessive sleepiness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fatigue, medication side effects, or medical condition",
                "Effective Duration": "hours to days"
            },
            "drowsy": {
                "Composition": "symptom; excessive sleepiness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fatigue, medication side effects, or medical condition",
                "Effective Duration": "hours to days"
            },
            "sleepy": {
                "Composition": "symptom; excessive sleepiness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fatigue, medication side effects, or medical condition",
                "Effective Duration": "hours to days"
            },
            "sleepiness": {
                "Composition": "symptom; excessive sleepiness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fatigue, medication side effects, or medical condition",
                "Effective Duration": "hours to days"
            },
            "dry": {
                "Composition": "symptom; lack of moisture, often in mouth, throat, or skin",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, medication side effects, or medical condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "dryness": {
                "Composition": "symptom; lack of moisture, often in mouth, throat, or skin",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, medication side effects, or medical condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "fatigue": {
                "Composition": "symptom; extreme tiredness or lack of energy",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate sleep issues, anemia, or chronic condition",
                "Effective Duration": "varies (days to persistent)"
            },
            "tired": {
                "Composition": "symptom; extreme tiredness or lack of energy",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate sleep issues, anemia, or chronic condition",
                "Effective Duration": "varies (days to persistent)"
            },
            "tiredness": {
                "Composition": "symptom; extreme tiredness or lack of energy",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate sleep issues, anemia, or chronic condition",
                "Effective Duration": "varies (days to persistent)"
            },
            "tiredish": {
                "Composition": "symptom; mild tiredness or lack of energy",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate early fatigue, poor sleep, or low energy intake",
                "Effective Duration": "hours to days"
            },
            "fever": {
                "Composition": "symptom; elevated body temperature",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate infection, inflammation, or immune response",
                "Effective Duration": "hours to days"
            },
            "feverish": {
                "Composition": "symptom; mild elevated body temperature or feeling hot",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate early infection or immune response",
                "Effective Duration": "hours to days"
            },
            "headache": {
                "Composition": "symptom; pain in head or neck",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate stress, dehydration, or medical condition",
                "Effective Duration": "hours to days"
            },
            "headacheish": {
                "Composition": "symptom; mild pain in head or neck",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate early stress, dehydration, or fatigue",
                "Effective Duration": "hours to days"
            },
            "heaviness": {
                "Composition": "symptom; sensation of weight or pressure, often in chest or limbs",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate cardiovascular issues, fatigue, or digestive problems",
                "Effective Duration": "varies (hours to persistent)"
            },
            "heavy": {
                "Composition": "symptom; sensation of weight or pressure, often in chest or limbs",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate cardiovascular issues, fatigue, or digestive problems",
                "Effective Duration": "varies (hours to persistent)"
            },
            "tightheavy": {
                "Composition": "symptom; combined tightness and heaviness, often in chest or muscles",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate cardiovascular or muscular issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "hiccups": {
                "Composition": "symptom; involuntary diaphragm spasms",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive irritation, overeating, or nerve issues",
                "Effective Duration": "minutes to hours"
            },
            "hiccough": {
                "Composition": "symptom; involuntary diaphragm spasms",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive irritation, overeating, or nerve issues",
                "Effective Duration": "minutes to hours"
            },
            "hunger": {
                "Composition": "symptom; strong desire for food",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate low blood sugar, poor diet, or medical condition",
                "Effective Duration": "varies (hours until eating)"
            },
            "hungry": {
                "Composition": "symptom; strong desire for food",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate low blood sugar, poor diet, or medical condition",
                "Effective Duration": "varies (hours until eating)"
            },
            "insomnia": {
                "Composition": "symptom; difficulty falling or staying asleep",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate stress, caffeine, or medical condition",
                "Effective Duration": "varies (nights to persistent)"
            },
            "itch": {
                "Composition": "symptom; skin irritation causing scratching urge",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate allergies, infection, or skin condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "itching": {
                "Composition": "symptom; skin irritation causing scratching urge",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate allergies, infection, or skin condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "itchiness": {
                "Composition": "symptom; skin irritation causing scratching urge",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate allergies, infection, or skin condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "itchy": {
                "Composition": "symptom; skin irritation causing scratching urge",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate allergies, infection, or skin condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "itchyness": {
                "Composition": "symptom; skin irritation causing scratching urge",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate allergies, infection, or skin condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "malaise": {
                "Composition": "symptom; general feeling of unwellness",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate infection, fatigue, or chronic condition",
                "Effective Duration": "varies (days to persistent)"
            },
            "nausea": {
                "Composition": "symptom; feeling of sickness or urge to vomit",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate digestive issues, infection, or medication side effects",
                "Effective Duration": "hours to days"
            },
            "numb": {
                "Composition": "symptom; loss of sensation in body part",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve issues, circulation problems, or injury",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "numbness": {
                "Composition": "symptom; loss of sensation in body part",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve issues, circulation problems, or injury",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "pain": {
                "Composition": "symptom; discomfort or suffering in body",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "pained": {
                "Composition": "symptom; discomfort or suffering in body",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "painful": {
                "Composition": "symptom; discomfort or suffering in body",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "paining": {
                "Composition": "symptom; discomfort or suffering in body",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "pains": {
                "Composition": "symptom; discomfort or suffering in body",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "pain, itch": {
                "Composition": "symptom; combined pain and itching sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate skin condition, nerve irritation, or allergies",
                "Effective Duration": "varies (hours to persistent)"
            },
            "pain, numbness": {
                "Composition": "symptom; combined pain and loss of sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve damage, circulation issues, or injury",
                "Effective Duration": "varies (hours to persistent)"
            },
            "pain, readjustment": {
                "Composition": "symptom; pain associated with body movement or alignment",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate musculoskeletal issues or injury",
                "Effective Duration": "varies (hours to persistent)"
            },
            "painspasm": {
                "Composition": "symptom; combined pain and muscle spasms",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate muscle strain, nerve issues, or electrolyte imbalance",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "paintightness": {
                "Composition": "symptom; combined pain and tightness sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate muscle strain, cardiovascular issues, or injury",
                "Effective Duration": "varies (hours to persistent)"
            },
            "palpitations": {
                "Composition": "symptom; irregular or rapid heartbeat",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate stress, caffeine, or cardiovascular issues",
                "Effective Duration": "minutes to hours"
            },
            "pang": {
                "Composition": "symptom; sudden sharp pain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, digestive issues, or nerve problems",
                "Effective Duration": "seconds to hours"
            },
            "perspiration": {
                "Composition": "symptom; excessive sweating",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, stress, or medical condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "sweat": {
                "Composition": "symptom; excessive sweating",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, stress, or medical condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "sweating": {
                "Composition": "symptom; excessive sweating",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, stress, or medical condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "sweaty": {
                "Composition": "symptom; excessive sweating",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fever, stress, or medical condition",
                "Effective Duration": "varies (hours to persistent)"
            },
            "quiver": {
                "Composition": "symptom; slight trembling or shaking",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fatigue, nerve issues, or low blood sugar",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "quivering": {
                "Composition": "symptom; slight trembling or shaking",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fatigue, nerve issues, or low blood sugar",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "restlessness": {
                "Composition": "symptom; inability to stay still or relaxed",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate stress, caffeine, or neurological issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "restless": {
                "Composition": "symptom; inability to stay still or relaxed",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate stress, caffeine, or neurological issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "soreness": {
                "Composition": "symptom; pain or tenderness in muscles or tissues",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, overuse, or infection",
                "Effective Duration": "varies (days to weeks)"
            },
            "sore": {
                "Composition": "symptom; pain or tenderness in muscles or tissues",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, overuse, or infection",
                "Effective Duration": "varies (days to weeks)"
            },
            "spasm": {
                "Composition": "symptom; involuntary muscle contraction",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, electrolyte imbalance, or nerve issues",
                "Effective Duration": "varies (seconds to hours)"
            },
            "spasms": {
                "Composition": "symptom; involuntary muscle contractions",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, electrolyte imbalance, or nerve issues",
                "Effective Duration": "varies (seconds to hours)"
            },
            "spasming": {
                "Composition": "symptom; involuntary muscle contractions",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, electrolyte imbalance, or nerve issues",
                "Effective Duration": "varies (seconds to hours)"
            },
            "stiffness": {
                "Composition": "symptom; reduced flexibility in muscles or joints",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate arthritis, injury, or overuse",
                "Effective Duration": "varies (days to persistent)"
            },
            "stiff": {
                "Composition": "symptom; reduced flexibility in muscles or joints",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate arthritis, injury, or overuse",
                "Effective Duration": "varies (days to persistent)"
            },
            "swelling": {
                "Composition": "symptom; abnormal enlargement of body part",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or inflammation",
                "Effective Duration": "varies (days to persistent)"
            },
            "swollen": {
                "Composition": "symptom; abnormal enlargement of body part",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or inflammation",
                "Effective Duration": "varies (days to persistent)"
            },
            "thirst": {
                "Composition": "symptom; strong desire for water",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, diabetes, or medication side effects",
                "Effective Duration": "varies (hours until hydration)"
            },
            "thirsty": {
                "Composition": "symptom; strong desire for water",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate dehydration, diabetes, or medication side effects",
                "Effective Duration": "varies (hours until hydration)"
            },
            "thirstyish": {
                "Composition": "symptom; mild desire for water",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate early dehydration or low fluid intake",
                "Effective Duration": "varies (hours until hydration)"
            },
            "tingle": {
                "Composition": "symptom; prickling or stinging sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve irritation, circulation issues, or allergies",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "tingling": {
                "Composition": "symptom; prickling or stinging sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve irritation, circulation issues, or allergies",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "tinglingish": {
                "Composition": "symptom; mild prickling or stinging sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate early nerve irritation or circulation issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "tinglish": {
                "Composition": "symptom; mild prickling or stinging sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate early nerve irritation or circulation issues",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "tingly": {
                "Composition": "symptom; prickling or stinging sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve irritation, circulation issues, or allergies",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "tinglycrampy": {
                "Composition": "symptom; combined tingling and cramping sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve issues or electrolyte imbalance",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "tremor": {
                "Composition": "symptom; involuntary shaking or trembling",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate neurological issues, stress, or low blood sugar",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "trembling": {
                "Composition": "symptom; involuntary shaking or trembling",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate neurological issues, stress, or low blood sugar",
                "Effective Duration": "varies (minutes to persistent)"
            },
            "twitching": {
                "Composition": "symptom; small, involuntary muscle movements",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve irritation, stress, or electrolyte imbalance",
                "Effective Duration": "varies (seconds to persistent)"
            },
            "twitchy": {
                "Composition": "symptom; small, involuntary muscle movements",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve irritation, stress, or electrolyte imbalance",
                "Effective Duration": "varies (seconds to persistent)"
            },
            "weakness": {
                "Composition": "symptom; reduced strength or energy",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate anemia, fatigue, or neurological issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "weak": {
                "Composition": "symptom; reduced strength or energy",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate anemia, fatigue, or neurological issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "weak, numb": {
                "Composition": "symptom; combined weakness and loss of sensation",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate nerve damage or circulation issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "weak, uneasy": {
                "Composition": "symptom; combined weakness and vague unease",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate fatigue, stress, or early illness",
                "Effective Duration": "varies (hours to persistent)"
            },
            "yawning": {
                "Composition": "symptom; involuntary opening of mouth, often due to fatigue or boredom",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate low oxygen, fatigue, or medication side effects",
                "Effective Duration": "seconds to minutes"
            },
            "flu": {
                "Composition": "condition; viral infection (influenza)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "fever, body aches, fatigue, respiratory symptoms",
                "Effective Duration": "days to weeks"
            },
            "infection": {
                "Composition": "condition; invasion by pathogens (bacteria, virus, etc.)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "fever, inflammation, pain, varies by type",
                "Effective Duration": "days to weeks"
            },
            "infections": {
                "Composition": "condition; invasion by pathogens (bacteria, virus, etc.)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "fever, inflammation, pain, varies by type",
                "Effective Duration": "days to weeks"
            },
            "inflammation": {
                "Composition": "condition; immune response causing swelling, redness, pain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate injury, infection, or chronic disease",
                "Effective Duration": "varies (days to persistent)"
            },
            "sarcoidosis": {
                "Composition": "condition; inflammatory disease with granulomas",
                "Nutrition": "none",
                "Contaminants/Side Effects": "fatigue, lung issues, skin lesions, organ damage",
                "Effective Duration": "chronic (months to years)"
            },
            "sclerosis": {
                "Composition": "condition; hardening of tissue (e.g., multiple sclerosis, atherosclerosis)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "varies by type (nerve damage, cardiovascular issues)",
                "Effective Duration": "chronic (months to years)"
            },
            "sjogrens": {
                "Composition": "condition; autoimmune disorder affecting moisture-producing glands",
                "Nutrition": "none",
                "Contaminants/Side Effects": "dry eyes, dry mouth, joint pain, fatigue",
                "Effective Duration": "chronic (lifelong)"
            },
            "syncope": {
                "Composition": "condition; temporary loss of consciousness (fainting)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate low blood pressure, dehydration, or heart issues",
                "Effective Duration": "seconds to minutes"
            },
            "syndrome": {
                "Composition": "condition; group of symptoms indicating a disorder",
                "Nutrition": "none",
                "Contaminants/Side Effects": "varies by specific syndrome",
                "Effective Duration": "varies (days to chronic)"
            },
            "ulcer, pimple": {
                "Composition": "condition; combined skin ulcer and pimple",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate infection, skin irritation, or systemic issues",
                "Effective Duration": "days to weeks"
            },
            "ulcer": {
                "Composition": "condition; open sore on skin or mucous membrane",
                "Nutrition": "none",
                "Contaminants/Side Effects": "may indicate infection, poor circulation, or digestive issues",
                "Effective Duration": "days to weeks"
            },
            "uti": {
                "Composition": "condition; urinary tract infection",
                "Nutrition": "none",
                "Contaminants/Side Effects": "burning urination, frequent urination, pain",
                "Effective Duration": "days to weeks (with treatment)"
            },
            "coccyx": {
                "Composition": "body part; tailbone",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain from injury, prolonged sitting, or inflammation",
                "Effective Duration": "varies (days to weeks)"
            },
            "abdomen": {
                "Composition": "body part; abdominal cavity",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, bloating, or issues from organ dysfunction",
                "Effective Duration": "varies (hours to persistent)"
            },
            "abd": {
                "Composition": "body part; abdominal cavity",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, bloating, or issues from organ dysfunction",
                "Effective Duration": "varies (hours to persistent)"
            },
            "appendix": {
                "Composition": "body part; vermiform appendix",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, inflammation (appendicitis), infection risk",
                "Effective Duration": "varies (hours to persistent)"
            },
            "arm": {
                "Composition": "body part; upper limb",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "arms": {
                "Composition": "body part; upper limbs",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "back": {
                "Composition": "body part; posterior torso",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, muscle strain, or spinal issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "backbone": {
                "Composition": "body part; spine",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or degenerative conditions",
                "Effective Duration": "varies (days to persistent)"
            },
            "blad": {
                "Composition": "body part; bladder",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection (UTI), or urinary issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "bladder": {
                "Composition": "body part; urinary bladder",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection (UTI), or urinary issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "bones": {
                "Composition": "body part; skeletal structure",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, fractures, or degenerative conditions",
                "Effective Duration": "varies (days to persistent)"
            },
            "bone": {
                "Composition": "body part; individual skeletal structure",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, fractures, or degenerative conditions",
                "Effective Duration": "varies (days to persistent)"
            },
            "brain": {
                "Composition": "body part; central nervous system organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "headaches, cognitive issues, or neurological conditions",
                "Effective Duration": "varies (hours to persistent)"
            },
            "chest": {
                "Composition": "body part; thoracic cavity",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, respiratory, or cardiovascular issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "diaphragm": {
                "Composition": "body part; muscle for breathing",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, spasms, or respiratory issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "ear": {
                "Composition": "body part; auditory organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or hearing issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "ears": {
                "Composition": "body part; auditory organs",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or hearing issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "eardrum": {
                "Composition": "body part; tympanic membrane",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or hearing issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "eardrums": {
                "Composition": "body part; tympanic membranes",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or hearing issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "earlobe": {
                "Composition": "body part; soft tissue of ear",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "esophagus": {
                "Composition": "body part; digestive tube",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, acid reflux, or obstruction",
                "Effective Duration": "varies (hours to persistent)"
            },
            "eso": {
                "Composition": "body part; esophagus",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, acid reflux, or obstruction",
                "Effective Duration": "varies (hours to persistent)"
            },
            "eye": {
                "Composition": "body part; visual organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, irritation, or vision issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "eyes": {
                "Composition": "body part; visual organs",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, irritation, or vision issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "eyeball": {
                "Composition": "body part; spherical part of eye",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, irritation, or vision issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "eyeballs": {
                "Composition": "body part; spherical parts of eyes",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, irritation, or vision issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "eyebrow": {
                "Composition": "body part; hair above eye",
                "Nutrition": "none",
                "Contaminants/Side Effects": "irritation, infection, or cosmetic issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "eyebrows": {
                "Composition": "body part; hair above eyes",
                "Nutrition": "none",
                "Contaminants/Side Effects": "irritation, infection, or cosmetic issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "eyelash": {
                "Composition": "body part; hair on eyelid",
                "Nutrition": "none",
                "Contaminants/Side Effects": "irritation, infection, or cosmetic issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "eyelashes": {
                "Composition": "body part; hairs on eyelids",
                "Nutrition": "none",
                "Contaminants/Side Effects": "irritation, infection, or cosmetic issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "eyelid": {
                "Composition": "body part; skin covering eye",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "eyelids": {
                "Composition": "body part; skin covering eyes",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "eyesight": {
                "Composition": "body part; visual function",
                "Nutrition": "none",
                "Contaminants/Side Effects": "blurred vision, strain, or eye conditions",
                "Effective Duration": "varies (hours to persistent)"
            },
            "face": {
                "Composition": "body part; front of head",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or skin issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "cheek": {
                "Composition": "body part; side of face",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or skin issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "cheekbone": {
                "Composition": "body part; zygomatic bone",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or swelling",
                "Effective Duration": "varies (days to persistent)"
            },
            "cheeks": {
                "Composition": "body part; sides of face",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or skin issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "chin": {
                "Composition": "body part; lower part of face",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or skin issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "collar": {
                "Composition": "body part; clavicle or collarbone",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, fracture, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "collarbone": {
                "Composition": "body part; clavicle",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, fracture, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "forearm": {
                "Composition": "body part; lower arm",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "forearms": {
                "Composition": "body part; lower arms",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "forehead": {
                "Composition": "body part; upper face",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or skin issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "gallbladder": {
                "Composition": "body part; organ storing bile",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, gallstones, or infection",
                "Effective Duration": "varies (hours to persistent)"
            },
            "hand": {
                "Composition": "body part; upper limb extremity",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "hands": {
                "Composition": "body part; upper limb extremities",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "head": {
                "Composition": "body part; skull and brain",
                "Nutrition": "none",
                "Contaminants/Side Effects": "headaches, injury, or neurological issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "heart": {
                "Composition": "body part; cardiovascular organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, palpitations, or cardiovascular issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "hip": {
                "Composition": "body part; pelvic joint",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, arthritis, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "hips": {
                "Composition": "body part; pelvic joints",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, arthritis, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "joints": {
                "Composition": "body part; connections between bones",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, arthritis, or inflammation",
                "Effective Duration": "varies (days to persistent)"
            },
            "joint": {
                "Composition": "body part; connection between bones",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, arthritis, or inflammation",
                "Effective Duration": "varies (days to persistent)"
            },
            "kidney": {
                "Composition": "body part; organ for filtration",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or kidney stones",
                "Effective Duration": "varies (days to persistent)"
            },
            "kidneys": {
                "Composition": "body part; organs for filtration",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or kidney stones",
                "Effective Duration": "varies (days to persistent)"
            },
            "leg": {
                "Composition": "body part; lower limb",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "legs": {
                "Composition": "body part; lower limbs",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "liver": {
                "Composition": "body part; metabolic organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, inflammation, or liver disease",
                "Effective Duration": "varies (days to persistent)"
            },
            "lungs": {
                "Composition": "body part; respiratory organs",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or respiratory issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "lung": {
                "Composition": "body part; respiratory organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or respiratory issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "mouth": {
                "Composition": "body part; oral cavity",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, ulcers, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "muscle": {
                "Composition": "body part; contractile tissue",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, strain, or spasms",
                "Effective Duration": "varies (days to persistent)"
            },
            "muscles": {
                "Composition": "body part; contractile tissues",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, strain, or spasms",
                "Effective Duration": "varies (days to persistent)"
            },
            "neck": {
                "Composition": "body part; cervical region",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, stiffness, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "nose": {
                "Composition": "body part; olfactory organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "congestion, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "nostrils": {
                "Composition": "body part; nasal openings",
                "Nutrition": "none",
                "Contaminants/Side Effects": "congestion, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "nostril": {
                "Composition": "body part; nasal opening",
                "Nutrition": "none",
                "Contaminants/Side Effects": "congestion, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "pancreas": {
                "Composition": "body part; digestive and endocrine organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, inflammation, or diabetes",
                "Effective Duration": "varies (days to persistent)"
            },
            "prostate": {
                "Composition": "body part; male reproductive gland",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, enlargement, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "skin": {
                "Composition": "body part; outer protective layer",
                "Nutrition": "none",
                "Contaminants/Side Effects": "irritation, infection, or allergic reactions",
                "Effective Duration": "varies (days to persistent)"
            },
            "skins": {
                "Composition": "body part; outer protective layer",
                "Nutrition": "none",
                "Contaminants/Side Effects": "irritation, infection, or allergic reactions",
                "Effective Duration": "varies (days to persistent)"
            },
            "stomach": {
                "Composition": "body part; digestive organ",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, ulcers, or digestive issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "tomach": {
                "Composition": "body part; digestive organ (stomach)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, ulcers, or digestive issues",
                "Effective Duration": "varies (hours to persistent)"
            },
            "teeth": {
                "Composition": "body part; dental structures",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, cavities, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "tooth": {
                "Composition": "body part; dental structure",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, cavities, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "throat": {
                "Composition": "body part; pharynx and larynx",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "tthroat": {
                "Composition": "body part; pharynx and larynx",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "thriat": {
                "Composition": "body part; pharynx and larynx",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "tongue": {
                "Composition": "body part; muscular organ in mouth",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "touge": {
                "Composition": "body part; muscular organ in mouth (tongue)",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or irritation",
                "Effective Duration": "varies (days to persistent)"
            },
            "tonsil": {
                "Composition": "body part; lymphoid tissue in throat",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection (tonsillitis), or swelling",
                "Effective Duration": "varies (days to persistent)"
            },
            "tonsils": {
                "Composition": "body part; lymphoid tissues in throat",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection (tonsillitis), or swelling",
                "Effective Duration": "varies (days to persistent)"
            },
            "uvula": {
                "Composition": "body part; tissue in throat",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "ankle": {
                "Composition": "body part; joint connecting foot to leg",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, sprain, or swelling",
                "Effective Duration": "varies (days to persistent)"
            },
            "armpit": {
                "Composition": "body part; axilla",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "armpits": {
                "Composition": "body part; axillae",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, swelling, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "bicep": {
                "Composition": "body part; upper arm muscle",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, strain, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "biceps": {
                "Composition": "body part; upper arm muscles",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, strain, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "calf": {
                "Composition": "body part; lower leg muscle",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, strain, or cramps",
                "Effective Duration": "varies (days to persistent)"
            },
            "calves": {
                "Composition": "body part; lower leg muscles",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, strain, or cramps",
                "Effective Duration": "varies (days to persistent)"
            },
            "canine": {
                "Composition": "body part; pointed tooth",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, cavities, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "canines": {
                "Composition": "body part; pointed teeth",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, cavities, or infection",
                "Effective Duration": "varies (days to persistent)"
            },
            "capillary": {
                "Composition": "body part; small blood vessel",
                "Nutrition": "none",
                "Contaminants/Side Effects": "bruising, inflammation, or circulation issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "carpal": {
                "Composition": "body part; wrist bones",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, carpal tunnel, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "elbow": {
                "Composition": "body part; arm joint",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, arthritis, or injury",
                "Effective Duration": "varies (days to persistent)"
            },
            "fingernail": {
                "Composition": "body part; keratin structure on finger",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or trauma",
                "Effective Duration": "varies (days to persistent)"
            },
            "fingernails": {
                "Composition": "body part; keratin structures on fingers",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, infection, or trauma",
                "Effective Duration": "varies (days to persistent)"
            },
            "fingerprint": {
                "Composition": "body part; skin ridges on finger",
                "Nutrition": "none",
                "Contaminants/Side Effects": "irritation or injury (rare)",
                "Effective Duration": "varies (days to persistent)"
            },
            "finger": {
                "Composition": "body part; digit of hand",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
            "fingers": {
                "Composition": "body part; digits of hand",
                "Nutrition": "none",
                "Contaminants/Side Effects": "pain, injury, or nerve issues",
                "Effective Duration": "varies (days to persistent)"
            },
                "fingertip": {
                    "Composition": "body part; end of finger",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, nerve issues, or sensitivity",
                    "Effective Duration": "varies (days to persistent)"
                },
                "foot": {
                    "Composition": "body part; lower limb extremity",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "feet": {
                    "Composition": "body part; lower limb extremities",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "glands": {
                    "Composition": "body part; organs secreting hormones or other substances",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "swelling, infection, or hormonal imbalances",
                    "Effective Duration": "varies (days to persistent)"
                },
                "gland": {
                    "Composition": "body part; organ secreting hormones or other substances",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "swelling, infection, or hormonal imbalances",
                    "Effective Duration": "varies (days to persistent)"
                },
                "glans": {
                    "Composition": "body part; sensitive tip of penis",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, infection, or irritation",
                    "Effective Duration": "varies (days to persistent)"
                },
                "groin": {
                    "Composition": "body part; area between abdomen and thigh",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, strain, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "gum": {
                    "Composition": "body part; soft tissue around teeth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, inflammation, or infection (gingivitis)",
                    "Effective Duration": "varies (days to persistent)"
                },
                "gumline": {
                    "Composition": "body part; edge of gums near teeth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, inflammation, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "gums": {
                    "Composition": "body part; soft tissues around teeth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, inflammation, or infection (gingivitis)",
                    "Effective Duration": "varies (days to persistent)"
                },
                "hair": {
                    "Composition": "body part; keratin filaments on skin",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "irritation, infection, or hair loss",
                    "Effective Duration": "varies (days to persistent)"
                },
                "hairs": {
                    "Composition": "body part; keratin filaments on skin",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "irritation, infection, or hair loss",
                    "Effective Duration": "varies (days to persistent)"
                },
                "heel": {
                    "Composition": "body part; posterior part of foot",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or plantar fasciitis",
                    "Effective Duration": "varies (days to persistent)"
                },
                "humerus": {
                    "Composition": "body part; upper arm bone",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, fracture, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "incisor": {
                    "Composition": "body part; front cutting tooth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, cavities, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "incisors": {
                    "Composition": "body part; front cutting teeth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, cavities, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "intestine": {
                    "Composition": "body part; digestive organ (small or large intestine)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, inflammation, or infection",
                    "Effective Duration": "varies (hours to persistent)"
                },
                "intestines": {
                    "Composition": "body part; digestive organs (small and large intestines)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, inflammation, or infection",
                    "Effective Duration": "varies (hours to persistent)"
                },
                "jaw": {
                    "Composition": "body part; mandible or maxilla",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, TMJ issues, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "jawline": {
                    "Composition": "body part; outline of jaw",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, swelling, or skin issues",
                    "Effective Duration": "varies (days to persistent)"
                },
                "jawlines": {
                    "Composition": "body part; outlines of jaw",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, swelling, or skin issues",
                    "Effective Duration": "varies (days to persistent)"
                },
                "jaws": {
                    "Composition": "body part; mandibles or maxillae",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, TMJ issues, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "knee": {
                    "Composition": "body part; joint connecting thigh and leg",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, arthritis, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "kneecap": {
                    "Composition": "body part; patella",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or dislocation",
                    "Effective Duration": "varies (days to persistent)"
                },
                "knees": {
                    "Composition": "body part; joints connecting thighs and legs",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, arthritis, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "knuckle": {
                    "Composition": "body part; joint of finger",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, arthritis, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "knuckles": {
                    "Composition": "body part; joints of fingers",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, arthritis, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "lip": {
                    "Composition": "body part; soft tissue around mouth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, swelling, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "lips": {
                    "Composition": "body part; soft tissues around mouth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, swelling, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "lobe": {
                    "Composition": "body part; soft lower part of ear or brain region",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, infection, or neurological issues",
                    "Effective Duration": "varies (days to persistent)"
                },
                "lymph": {
                    "Composition": "body part; lymphatic system fluid or nodes",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "swelling, infection, or lymphoma",
                    "Effective Duration": "varies (days to persistent)"
                },
                "metacarpals": {
                    "Composition": "body part; hand bones",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, fracture, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "metatarsal": {
                    "Composition": "body part; foot bone",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, fracture, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "molar": {
                    "Composition": "body part; grinding tooth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, cavities, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "molars": {
                    "Composition": "body part; grinding teeth",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, cavities, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "nail": {
                    "Composition": "body part; keratin structure on finger or toe",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, infection, or trauma",
                    "Effective Duration": "varies (days to persistent)"
                },
                "nails": {
                    "Composition": "body part; keratin structures on fingers or toes",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, infection, or trauma",
                    "Effective Duration": "varies (days to persistent)"
                },
                "nerve": {
                    "Composition": "body part; tissue transmitting signals",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, numbness, or nerve damage",
                    "Effective Duration": "varies (days to persistent)"
                },
                "nerves": {
                    "Composition": "body part; tissues transmitting signals",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, numbness, or nerve damage",
                    "Effective Duration": "varies (days to persistent)"
                },
                "nipple": {
                    "Composition": "body part; projection on breast",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, irritation, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "pelvic": {
                    "Composition": "body part; pelvic region or bones",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or organ issues",
                    "Effective Duration": "varies (days to persistent)"
                },
                "premolar": {
                    "Composition": "body part; tooth between canine and molar",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, cavities, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "premolars": {
                    "Composition": "body part; teeth between canines and molars",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, cavities, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "pubis": {
                    "Composition": "body part; pubic bone",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or inflammation",
                    "Effective Duration": "varies (days to persistent)"
                },
                "pube": {
                    "Composition": "body part; pubic region",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, irritation, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "rib": {
                    "Composition": "body part; bone in ribcage",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, fracture, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "ribcage": {
                    "Composition": "body part; skeletal structure around chest",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, fracture, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "ribs": {
                    "Composition": "body part; bones in ribcage",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, fracture, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "scalp": {
                    "Composition": "body part; skin on head",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, irritation, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "scrot": {
                    "Composition": "body part; scrotum, external sac of testes",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, swelling, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "shoulder": {
                    "Composition": "body part; joint connecting arm to torso",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, arthritis, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "shoulderblade": {
                    "Composition": "body part; scapula",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or muscle strain",
                    "Effective Duration": "varies (days to persistent)"
                },
                "shoulders": {
                    "Composition": "body part; joints connecting arms to torso",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, arthritis, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "spine": {
                    "Composition": "body part; vertebral column",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or degenerative conditions",
                    "Effective Duration": "varies (days to persistent)"
                },
                "sole": {
                    "Composition": "body part; bottom of foot",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "soles": {
                    "Composition": "body part; bottoms of feet",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "tendon": {
                    "Composition": "body part; connective tissue linking muscle to bone",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, tendinitis, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "thumb": {
                    "Composition": "body part; first digit of hand",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or arthritis",
                    "Effective Duration": "varies (days to persistent)"
                },
                "thumbs": {
                    "Composition": "body part; first digits of hands",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or arthritis",
                    "Effective Duration": "varies (days to persistent)"
                },
                "toe": {
                    "Composition": "body part; digit of foot",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "toes": {
                    "Composition": "body part; digits of feet",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, injury, or infection",
                    "Effective Duration": "varies (days to persistent)"
                },
                "trapezius": {
                    "Composition": "body part; upper back and neck muscle",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, strain, or stiffness",
                    "Effective Duration": "varies (days to persistent)"
                },
                "tricep": {
                    "Composition": "body part; muscle on back of upper arm",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, strain, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "triceps": {
                    "Composition": "body part; muscles on back of upper arms",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, strain, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "wrist": {
                    "Composition": "body part; joint connecting hand to arm",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "pain, carpal tunnel, or injury",
                    "Effective Duration": "varies (days to persistent)"
                },
                "amoxicillin": {
                    "Composition": "medication; penicillin antibiotic",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "allergic reactions, diarrhea, nausea",
                    "Effective Duration": "6-12 hours (dose-dependent)"
                },
                "alimox": {
                    "Composition": "medication; amoxicillin (brand name variant)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "allergic reactions, diarrhea, nausea",
                    "Effective Duration": "6-12 hours (dose-dependent)"
                },
                "amox": {
                    "Composition": "medication; amoxicillin (abbreviation)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "allergic reactions, diarrhea, nausea",
                    "Effective Duration": "6-12 hours (dose-dependent)"
                },
                "antibiotic": {
                    "Composition": "medication; drugs targeting bacterial infections",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "allergic reactions, digestive upset, resistance risk",
                    "Effective Duration": "varies (hours to days, dose-dependent)"
                },
                "anticholinergics": {
                    "Composition": "medication; drugs blocking acetylcholine",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "dry mouth, constipation, blurred vision",
                    "Effective Duration": "varies (hours to days, dose-dependent)"
                },
                "dolo": {
                    "Composition": "medication; paracetamol/acetaminophen (brand name)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "liver damage (overdose), allergic reactions",
                    "Effective Duration": "4-6 hours"
                },
                "enzoheal": {
                    "Composition": "medication; enzyme-based (trypsin, bromelain, rutoside)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "digestive upset, allergic reactions",
                    "Effective Duration": "6-8 hours"
                },
                "metrogyl": {
                    "Composition": "medication; metronidazole (brand name)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "nausea, metallic taste, alcohol interaction",
                    "Effective Duration": "8-12 hours"
                },
                "novamox": {
                    "Composition": "medication; amoxicillin (brand name)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "allergic reactions, diarrhea, nausea",
                    "Effective Duration": "6-12 hours (dose-dependent)"
                },
                "painkiller": {
                    "Composition": "medication; analgesics (e.g., paracetamol, ibuprofen)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "digestive upset, liver/kidney damage (overuse)",
                    "Effective Duration": "4-8 hours (varies by type)"
                },
                "painkillers": {
                    "Composition": "medication; analgesics (e.g., paracetamol, ibuprofen)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "digestive upset, liver/kidney damage (overuse)",
                    "Effective Duration": "4-8 hours (varies by type)"
                },
                "pantoprezol": {
                    "Composition": "medication; pantoprazole (proton pump inhibitor)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "headache, diarrhea, nutrient absorption issues",
                    "Effective Duration": "12-24 hours"
                },
                "soframycin": {
                    "Composition": "medication; framycetin (topical antibiotic)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "skin irritation, allergic reactions",
                    "Effective Duration": "6-12 hours (topical application)"
                },
                "soframycyin": {
                    "Composition": "medication; framycetin (topical antibiotic)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "skin irritation, allergic reactions",
                    "Effective Duration": "6-12 hours (topical application)"
                },
                "vicks": {
                    "Composition": "medication; topical ointment (camphor, menthol, eucalyptus)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "skin irritation, allergic reactions",
                    "Effective Duration": "4-8 hours (topical)"
                },
                "vics": {
                    "Composition": "medication; topical ointment (camphor, menthol, eucalyptus)",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "skin irritation, allergic reactions",
                    "Effective Duration": "4-8 hours (topical)"
                },
                "bacteria": {
                    "Composition": "pathogen; single-celled microorganisms",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "infections, fever, inflammation",
                    "Effective Duration": "varies (days to weeks)"
                },
                "chemical": {
                    "Composition": "substance; synthetic or natural compounds",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "toxicity, irritation, or allergic reactions",
                    "Effective Duration": "varies (immediate to persistent)"
                },
                "dirt": {
                    "Composition": "contaminant; soil, dust, or organic matter",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "infections, irritation, or contamination",
                    "Effective Duration": "varies (until cleaned)"
                },
                "dust": {
                    "Composition": "contaminant; fine particulate matter",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "respiratory irritation, allergies",
                    "Effective Duration": "varies (until cleared)"
                },
                "pesticide": {
                    "Composition": "chemical; substances to control pests",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "toxicity, neurological issues, or irritation",
                    "Effective Duration": "varies (hours to persistent)"
                },
                "pesticides": {
                    "Composition": "chemical; substances to control pests",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "toxicity, neurological issues, or irritation",
                    "Effective Duration": "varies (hours to persistent)"
                },
                "poison": {
                    "Composition": "substance; toxic chemical or compound",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "toxicity, organ damage, or death",
                    "Effective Duration": "varies (immediate to persistent)"
                },
                "poisoning": {
                    "Composition": "condition; exposure to toxic substance",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "nausea, organ damage, or neurological issues",
                    "Effective Duration": "varies (hours to persistent)"
                },
                "spoilage": {
                    "Composition": "condition; food degradation by microbes or oxidation",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "food poisoning, digestive upset",
                    "Effective Duration": "varies (until consumed or discarded)"
                },
                "spoiled": {
                    "Composition": "condition; food degraded by microbes or oxidation",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "food poisoning, digestive upset",
                    "Effective Duration": "varies (until consumed or discarded)"
                },
                "spoiling": {
                    "Composition": "condition; ongoing food degradation",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "food poisoning, digestive upset",
                    "Effective Duration": "varies (until consumed or discarded)"
                },
                "spoilt": {
                    "Composition": "condition; food degraded by microbes or oxidation",
                    "Nutrition": "none",
                    "Contaminants/Side Effects": "food poisoning, digestive upset",
                    "Effective Duration": "varies (until consumed or discarded)"
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