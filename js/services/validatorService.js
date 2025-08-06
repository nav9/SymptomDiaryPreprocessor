/**
 * @file validatorService.js
 * @description Structures and validates data for Step 2.
 */
const ValidatorService = (function(dateParser, lineRecognizerService) {

    /**
     * Phase 1: Structures raw lines into a logical format with associated dates.
     * @param {Array<Object>} rawLines - The array of {id, rawText} objects from Step 1.
     * @param {number} year - The context year for parsing dates.
     * @returns {Array<Object>} A new array of structured data objects.
     */
    function structureData(rawLines, year) {
        const structuredData = [];
        let currentDate = ""; // Tracks the current date string (e.g., "20 oct")

        rawLines.forEach(line => {
            const { id, rawText } = line;
            const result = lineRecognizerService.recognizeLine(rawText, currentDate !== "");
            
            let entry = { id, date: currentDate };

            if (result.type === 'date') {
                currentDate = rawText; // Set the new current date
                entry.date = currentDate;
                entry.time = rawText; // For display purposes, the date line is its own "time"
            } else if (result.type === 'time') {
                entry.time = rawText;
            } else if (result.type === 'comment') {
                entry.note = rawText;
            } else { // 'error'
                entry.unrecognized = rawText;
            }
            structuredData.push(entry);
        });
        return structuredData;
    }

    /**
     * Phase 2: Validates the structured data for date/time order and validity.
     * @param {Array<Object>} structuredData - The output from structureData.
     * @param {number} year - The context year.
     * @returns {{validatedData: Array<Object>, totalErrors: number}}
     */
    function validateChronology(structuredData, year) {
        const dateGroups = groupStructuredDataByDate(structuredData, year);

        // Date validation first
        const isAscending = detectDateOrder(dateGroups);
        validateDateOrder(dateGroups, isAscending);

        // Then time validation within each group
        validateTimeEntries(dateGroups);

        // Flatten back to a single array and count errors
        let totalErrors = 0;
        const validatedData = Object.values(dateGroups).flatMap(group => {
            group.entries.forEach(entry => { if (entry.error) totalErrors++; });
            return group.entries;
        });
        
        return { validatedData, totalErrors };
    }

    // --- Helper Functions ---

    function groupStructuredDataByDate(data, year) {
        const groups = {};
        data.forEach(entry => {
            if (!groups[entry.date]) {
                const dateObj = dateParser.parseDate(entry.date, year);
                groups[entry.date] = { dateObj, entries: [] };
            }
            groups[entry.date].entries.push(entry);
        });
        return groups;
    }

    function detectDateOrder(dateGroups) {
        const dates = Object.values(dateGroups)
            .map(g => g.dateObj)
            .filter(Boolean); // Filter out invalid/empty dates
        if (dates.length < 2) return true; // Default to ascending
        let ascCount = 0;
        for (let i = 1; i < dates.length; i++) {
            if (dates[i] > dates[i-1]) ascCount++;
        }
        return (ascCount / (dates.length - 1)) >= 0.5; // True if 50% or more are ascending
    }

    function validateDateOrder(dateGroups, isAscending) {
        const sortedDates = Object.values(dateGroups)
            .map(g => g.dateObj)
            .filter(Boolean)
            .sort((a, b) => a.getTime() - b.getTime());
        
        if (!isAscending) sortedDates.reverse();

        Object.values(dateGroups).forEach((group, index) => {
            // Check for invalid dates (e.g., "30 feb")
            if (!group.dateObj) {
                group.entries.forEach(entry => entry.error = "Invalid date format or value.");
                return; // Skip order check for invalid dates
            }
            // Check for out-of-order dates
            if (group.dateObj.getTime() !== sortedDates[index]?.getTime()) {
                group.entries.forEach(entry => entry.error = `Date is out of order (expected ${isAscending ? 'ascending' : 'descending'}).`);
            }
        });
    }

    function validateTimeEntries(dateGroups) {
        Object.values(dateGroups).forEach(group => {
            const timeEntries = group.entries.filter(e => e.time && !dateParser.isLineJustDate(e.time));
            if (timeEntries.length < 2) return;

            const sortedTimes = [...timeEntries].sort((a, b) => {
                const timeA = dateParser.extractTimeAndText(a.time);
                const timeB = dateParser.extractTimeAndText(b.time);
                if (!timeA || !timeB) return 0;
                return (parseInt(timeA.hours, 10) * 60 + parseInt(timeA.minutes, 10)) -
                       (parseInt(timeB.hours, 10) * 60 + parseInt(timeB.minutes, 10));
            });

            timeEntries.forEach((entry, index) => {
                if (entry.id !== sortedTimes[index].id) {
                    entry.error = "Time is out of order.";
                }
            });
        });
    }

    return { structureData, validateChronology };

})(DateParser, LineRecognizerService);