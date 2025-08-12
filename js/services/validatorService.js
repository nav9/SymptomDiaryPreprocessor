/**
 * @file validatorService.js
 * @description Structures and validates data for Step 2.
 */
const ValidatorService = (function(dateParser, lineRecognizerService) {

    function structureData(rawLines) {
        const structuredData = [];
        let currentDate = "";

        rawLines.forEach(line => {
            const { id, rawText, isEditing } = line; // Capture the isEditing flag
            const result = lineRecognizerService.recognizeLine(rawText, currentDate !== "");
            
            // Preserve the isEditing state in the new object
            let entry = { id, rawText, date: currentDate, error: null, isEditing: isEditing || false };

            switch(result.type) {
                case 'date':
                    currentDate = rawText;
                    entry.date = currentDate;
                    entry.isDateLine = true; 
                    break;
                case 'time':
                    entry.time = rawText;
                    break;
                case 'comment':
                    entry.note = rawText;
                    break;
                case 'error':
                default:
                    entry.unrecognized = rawText;
                    break;
            }
            structuredData.push(entry);
        });
        return structuredData;
    }

    function validateChronology(data, year) {
        data.forEach(entry => entry.error = null);

        const dateGroups = groupDataByDate(data, year);
        const isAscending = detectDateOrder(dateGroups);

        validateDateOrderAndValidity(dateGroups, isAscending, year);
        validateTimeOrderAndValidity(dateGroups);
        
        const validatedData = Array.from(dateGroups.values()).flatMap(group => group.entries);
        const totalErrors = validatedData.filter(entry => entry.error).length;
        
        return { validatedData, totalErrors };
    }

    // --- Helper Functions for Validation ---

    function groupDataByDate(data, year) {
        const groups = new Map();
        data.forEach(entry => {
            const dateKey = entry.date || ""; 
            if (!groups.has(dateKey)) {
                const dateObj = dateKey ? dateParser.parseDate(dateKey, year) : null;
                groups.set(dateKey, { dateObj, entries: [] });
            }
            groups.get(dateKey).entries.push(entry);
        });
        return groups;
    }

    function detectDateOrder(dateGroups) {
        const dates = Array.from(dateGroups.values()).map(g => g.dateObj).filter(Boolean);
        if (dates.length < 2) return true;
        let ascCount = 0;
        for (let i = 1; i < dates.length; i++) {
            if (dates[i] > dates[i - 1]) ascCount++;
        }
        return (ascCount / (dates.length - 1)) >= 0.5;
    }

    // function validateDateOrder(dateGroups, isAscending) {
    //     const sortedDates = Object.values(dateGroups)
    //         .map(g => g.dateObj)
    //         .filter(Boolean)
    //         .sort((a, b) => a.getTime() - b.getTime());
        
    //     if (!isAscending) sortedDates.reverse();

    //     Object.values(dateGroups).forEach((group, index) => {
    //         // Check for invalid dates (e.g., "30 feb")
    //         if (!group.dateObj) {
    //             group.entries.forEach(entry => entry.error = "Invalid date format or value.");
    //             return; // Skip order check for invalid dates
    //         }
    //         // Check for out-of-order dates
    //         if (group.dateObj.getTime() !== sortedDates[index]?.getTime()) {
    //             group.entries.forEach(entry => entry.error = `Date is out of order (expected ${isAscending ? 'ascending' : 'descending'}).`);
    //         }
    //     });
    // }

    function validateDateOrderAndValidity(dateGroups, isAscending, year) {
        // Handle groups without a date first (e.g., initial comments).
        if (dateGroups.has("")) {
            dateGroups.get("").entries.forEach(entry => {
                if(entry.unrecognized) entry.error = "Unrecognized format. Must be a comment, a date (e.g., 'dd mmm'), or a time entry (e.g., 'hh:mm text').";
            });
        }
        
        // Filter to get only the groups that should have a date.
        const validDateGroups = Array.from(dateGroups.values()).filter(g => g.dateObj);

        // Create a correctly sorted array of Date objects to compare against.
        const sortedDateObjs = validDateGroups.map(g => g.dateObj).sort((a, b) => a.getTime() - b.getTime());
        if (!isAscending) sortedDateObjs.reverse();

        // Compare each group's date to its expected position in the sorted list.
        validDateGroups.forEach((group, index) => {
            const dateLineEntry = group.entries.find(e => e.isDateLine);
            if (!dateLineEntry) return;

            // Check 1: Is the date value valid (e.g., "30 Feb")?
            if (isNaN(group.dateObj.getTime())) {
                dateLineEntry.error = "Invalid date value (e.g., '30 Feb' is not a real date).";
                return;
            }

            // Check 2: Does the date at this position match the expected sorted date?
            if (group.dateObj.getTime() !== sortedDateObjs[index]?.getTime()) {
                const orderText = isAscending ? 'ascending' : 'descending';
                dateLineEntry.error = `Date is out of order (expected ${orderText}).`;
            }
        });
    }

    function validateTimeOrderAndValidity(dateGroups) {
        dateGroups.forEach(group => {
            if (!group.dateObj || isNaN(group.dateObj.getTime())) return;

            const timeEntries = group.entries.filter(e => e.time);
            
            timeEntries.forEach(entry => {
                const timeData = dateParser.extractTimeAndText(entry.time);
                if (!timeData) {
                    entry.error = "Unrecognized time format. Expected '[~]hh:mm text'.";
                } else if (timeData.error) {
                    entry.error = timeData.error;
                }
            });

            const validTimeEntries = timeEntries.filter(e => !e.error);
            if (validTimeEntries.length < 2) return;

            // CORRECTED LOGIC: Iterate and compare with the previous entry.
            for (let i = 1; i < validTimeEntries.length; i++) {
                const prevEntry = validTimeEntries[i - 1];
                const currentEntry = validTimeEntries[i];

                const timeAData = dateParser.extractTimeAndText(prevEntry.time);
                const timeBData = dateParser.extractTimeAndText(currentEntry.time);

                const timeA = parseInt(timeAData.hours, 10) * 60 + parseInt(timeAData.minutes, 10);
                const timeB = parseInt(timeBData.hours, 10) * 60 + parseInt(timeBData.minutes, 10);

                if (timeB < timeA) {
                    // Only the current entry is marked as being out of order.
                    currentEntry.error = "Time is out of chronological order for this day.";
                }
            }
        });
    }

    return { structureData, validateChronology };

})(DateParser, LineRecognizerService);