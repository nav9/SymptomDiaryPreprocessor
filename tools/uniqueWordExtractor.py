import tkinter as tk
from tkinter import filedialog
import re

def select_files():
    """Opens a dialog to select multiple text files."""
    root = tk.Tk()
    root.withdraw()
    filepaths = filedialog.askopenfilenames(
        title="Select Symptom Diary Text Files",
        filetypes=(("Text files", "*.txt"), ("All files", "*.*"))
    )
    return filepaths

def extract_unique_words(filepaths):
    """Extracts unique words from a list of text files."""
    unique_words = set()
    for filepath in filepaths:
        with open(filepath, 'r', encoding='utf-8') as file:
            text = file.read().lower()
            # Remove punctuation and numbers
            text = re.sub(r'[^\w\s]', '', text)
            text = re.sub(r'\d+', '', text)
            words = text.split()
            for word in words:
                unique_words.add(word.strip())
    return unique_words

def classify_words(unique_words):
    """Classifies unique words into predefined categories."""
    body_parts = [
        "abdomen", "adrenal glands", "anus", "appendix", "arm", "back", "bladder", 
        "bone marrow", "bones", "brain", "bronchi", "chest", "diaphragm", "ear", 
        "esophagus", "eye", "fallopian tubes", "gallbladder", "genitals", "hand", 
        "head", "heart", "hypothalamus", "joints", "kidney", "large intestine", 
        "larynx", "leg", "liver", "lungs", "lymph nodes", "mammary glands", "mesentery",
        "mouth", "muscle", "nasal cavity", "neck", "nose", "ovaries", "pancreas",
        "parathyroid glands", "pelvis", "pharynx", "pineal gland", "pituitary gland",
        "prostate", "rectum", "salivary glands", "skeletal muscles", "skin", 
        "small intestine", "spinal cord", "spleen", "stomach", "teeth", "throat", "tooth"
    ]
    symptoms = [
        "aching", "bloating", "blurred vision", "chills", "constipation", "cough",
        "cramping", "diarrhea", "dizziness", "fatigue", "fever", "headache", "heartburn",
        "insomnia", "itching", "light-headed", "nausea", "numbness", "pain", 
        "paresthesia", "shortness of breath", "sore throat", "sweating", "thirsty",
        "tingling", "tired", "vomiting", "weak"
    ]
    diseases = [
        "acquired immunodeficiency syndrome", "anemia", "arthritis", "aspergillosis",
        "asthma", "atherosclerosis", "bronchitis", "brucellosis", "cancer", "candidiasis",
        "celiac disease", "cholera", "chorioamnionitis", "chronic fatigue syndrome", 
        "common cold", "coronary artery disease", "crohn's disease", "dementia", "diabetes", 
        "diphtheria", "diverticulitis", "eczema", "epilepsy", "fibromyalgia", "flu", 
        "gastroenteritis", "giardiasis", "gout", "hepatitis", "hypertension", "influenza", 
        "leukemia", "lupus", "lyme disease", "malaria", "migraine", "multiple sclerosis",
        "pneumocystis", "pneumonia", "poliomyelitis", "psoriasis", "rheumatoid arthritis", 
        "smallpox", "stroke", "thyroid disease", "tuberculosis", "ulcerative colitis"
    ]
    foods = [
        "apple", "banana", "bread", "broccoli", "carrot", "cheese", "chicken",
        "chocolate", "coffee", "egg", "fish", "fruit", "juice", "meat", "milk",
        "nuts", "pasta", "potato", "rice", "salad", "sandwich", "soup", "tea",
        "vegetable", "water", "yogurt"
    ]
    pain_intensities = [
        "mild", "minor", "moderate", "moderately strong", "noticeable", "severe", "strong", 
        "very strong", "worst possible"
    ]
    medicines = [
        "acetaminophen", "adalimumab", "albuterol", "allopurinol", "alprazolam", 
        "amitriptyline", "amlodipine", "amoxicillin", "aspirin", "atenolol", 
        "atorvastatin", "azithromycin", "codeine", "diazepam", "furosemide", 
        "gabapentin", "hydrochlorothiazide", "ibuprofen", "insulin", "levothyroxine", 
        "lisinopril", "lorazepam", "losartan", "metformin", "metoprolol", "morphine",
        "naproxen", "omeprazole", "oxycodone", "paracetamol", "prednisone", 
        "sertraline", "simvastatin", "tramadol", "warfarin"
    ]
    quantities = [
        "a few", "a little", "all", "amount", "cup", "dozen", "few", "gram", "large", 
        "less", "little", "lots of", "many", "more", "most", "much", "piece", 
        "plenty of", "serving", "slice", "some", "tablespoon", "teaspoon", "ton"
    ]

    categorized_words = {
        "Body Parts": [],
        "Symptoms": [],
        "Diseases": [],
        "Foods": [],
        "Pain Intensities": [],
        "Medicines": [],
        "Quantities": [],
        "Uncategorized": []
    }

    for word in unique_words:
        categorized = False
        if word in body_parts:
            categorized_words["Body Parts"].append(word)
            categorized = True
        if word in symptoms:
            categorized_words["Symptoms"].append(word)
            categorized = True
        if word in diseases:
            categorized_words["Diseases"].append(word)
            categorized = True
        if word in foods:
            categorized_words["Foods"].append(word)
            categorized = True
        if word in pain_intensities:
            categorized_words["Pain Intensities"].append(word)
            categorized = True
        if word in medicines:
            categorized_words["Medicines"].append(word)
            categorized = True
        if word in quantities:
            categorized_words["Quantities"].append(word)
            categorized = True
        if not categorized:
            categorized_words["Uncategorized"].append(word)

    return categorized_words

def main():
    """Main function to run the program."""
    filepaths = select_files()
    if not filepaths:
        print("No files selected.")
        return

    unique_words = extract_unique_words(filepaths)
    categorized_words = classify_words(unique_words)

    for category, words in categorized_words.items():
        if words:
            print(f"\n--- {category} ---")
            print(", ".join(sorted(words)))

if __name__ == "__main__":
    main()
