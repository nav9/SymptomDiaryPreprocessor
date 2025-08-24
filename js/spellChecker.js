/**
 * @file spellChecker.js
 * @description A custom, browser-friendly spell-checking service.
 * It's initialized with an array of word lists and can be extended.
 */
const SpellCheckerService = (function() {

    function SpellChecker(dictionaries = []) {
        this.dictionary = new Set();
        if (dictionaries.length > 0) {
            this._loadDictionaries(dictionaries);
        }
    }

    /**
     * Internal method to load word lists into the main dictionary set.
     * @param {Array<Array<string>>} dictionaries - An array of word lists.
     */
    SpellChecker.prototype._loadDictionaries = function(dictionaries) {
        dictionaries.forEach(dict => {
            if (Array.isArray(dict)) {
                dict.forEach(word => {
                    this.dictionary.add(word.toLowerCase());
                });
            }
        });
    };

    /**
     * Public method to add a new dictionary (an array of words) to the existing set.
     * Useful for adding custom "ignored words".
     * @param {Array<string>} dict - An array of words to add.
     */
    SpellChecker.prototype.addDictionary = function(dict) {
        if (Array.isArray(dict)) {
            dict.forEach(word => {
                this.dictionary.add(word.toLowerCase());
            });
        }
    };
    
    /**
     * Public method to remove an array of words from the dictionary.
     * Useful for the "undo" functionality.
     * @param {Array<string>} wordsToRemove - An array of words to remove.
     */
    SpellChecker.prototype.removeWords = function(wordsToRemove) {
        if (Array.isArray(wordsToRemove)) {
            wordsToRemove.forEach(word => {
                this.dictionary.delete(word.toLowerCase());
            });
        }
    };

    /**
     * Checks if a single word is in the dictionary.
     * Handles case-insensitivity and hyphenated words.
     * @param {string} word - The word to check.
     * @returns {boolean} - True if the word is considered correct, false otherwise.
     */
    SpellChecker.prototype.check = function(word) {
        const cleanWord = word.toLowerCase();

        // Direct check
        if (this.dictionary.has(cleanWord)) {
            return true;
        }

        // Handle hyphenated words (e.g., "offline-first")
        if (cleanWord.includes('-')) {
            // Check if every part of the hyphenated word is valid
            return cleanWord.split('-').every(part => this.check(part));
        }

        return false;
    };

    return SpellChecker;

})();