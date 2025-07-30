/**
 * @file validatorService.js
 * @description Performs deep chronological and structural validation on data from Step 1.
 */
const ValidatorService = (function(dateParser, logger, lineRecognizerService) {

    function validate(structuredLines) {
        const dateGroups = groupLinesByDate(structuredLines);
        const dateOrder = detectDateOrder(dateGroups);
        
        validateDateOrder(dateGroups, dateOrder);
        validateTimeEntries(dateGroups);

        const validatedData = Object.values(dateGroups).flatMap(group => [group.dateLine, ...group.entries]);
        
        return { validatedData, dateOrder };
    }

    function groupLinesByDate(lines) {
        const groups = {};
        let currentGroup = null;
        lines.forEach(line => {
            if (line.type === 'date') {
                currentGroup = { dateLine: line, entries: [], dateObj: null };
                groups[line.rawText] = currentGroup;
            } else if (currentGroup) {
                currentGroup.entries.push(line);
            } else {
                if (!groups['__orphaned__']) {
                    groups['__orphaned__'] = {
                        dateLine: { type: 'error', rawText: 'Orphaned Entries', reason: 'These lines appeared before any valid date.' },
                        entries: []
                    };
                }
                groups['__orphaned__'].entries.push(line);
            }
        });
        return groups;
    }
    
    function detectDateOrder(dateGroups) {
        const dates = Object.values(dateGroups).map(group => {
            const year = new Date().getFullYear();
            // This call will now work correctly because dateParser is the correct object.
            const dateObj = dateParser.parseDate(group.dateLine.rawText, year);
            group.dateObj = dateObj;
            return dateObj;
        }).filter(Boolean);

        if (dates.length < 2) return 'asc';
        let ascCount = 0, descCount = 0;
        for (let i = 1; i < dates.length; i++) {
            if (dates[i] > dates[i-1]) ascCount++;
            else if (dates[i] < dates[i-1]) descCount++;
        }
        return ascCount > descCount ? 'asc' : 'desc';
    }
    
    function validateDateOrder(dateGroups, dateOrder) {
        // This function uses dateParser internally, so the fix above makes it work.
        const sortedKeys = Object.keys(dateGroups).sort((a, b) => {
            const dateA = dateGroups[a].dateObj;
            const dateB = dateGroups[b].dateObj;
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime();
        });

        const sortedGroupArray = sortedKeys.map(key => dateGroups[key]);
        const expectedOrder = (dateOrder === 'asc') ? sortedGroupArray : [...sortedGroupArray].reverse();

        Object.values(dateGroups).forEach((group, index) => {
            if (group.dateLine.rawText !== expectedOrder[index]?.dateLine.rawText) {
                flagError(group.dateLine, `This date is out of order. This year's dates are mostly in ${dateOrder}ending order.`);
            } else {
                clearError(group.dateLine);
            }
            if (!group.dateObj) {
                 flagError(group.dateLine, `Invalid date format or value (e.g., 'Apr 31').`);
            }
        });
    }

    function validateTimeEntries(dateGroups) {
        // This function uses dateParser internally, so the fix above makes it work.
        Object.values(dateGroups).forEach(group => {
            const timeEntries = group.entries.filter(e => e.type === 'time');
            if (timeEntries.length < 2) return;
            const sortedEntries = [...timeEntries].sort((a, b) => {
                const timeA = dateParser.extractTimeAndText(a.rawText);
                const timeB = dateParser.extractTimeAndText(b.rawText);
                // Use temp dates for comparison
                const dateA = new Date(2000, 0, 1, parseInt(timeA.hours, 10), parseInt(timeA.minutes, 10));
                const dateB = new Date(2000, 0, 1, parseInt(timeB.hours, 10), parseInt(timeB.minutes, 10));
                return dateA.getTime() - dateB.getTime();
            });
            timeEntries.forEach((entry, index) => {
                if (entry.rawText !== sortedEntries[index].rawText) {
                    flagError(entry, 'Time is out of order. Times within a day must be ascending.');
                } else {
                    clearError(entry);
                }
            });
        });
    }

    function flagError(item, reason) {
        item.type = 'error';
        item.reason = reason;
    }

    function clearError(item) {
        // This call will now work because lineRecognizerService is correctly injected.
        const result = lineRecognizerService.recognizeLine(item.rawText, true);
        item.type = result.type;
        item.reason = result.reason;
    }

    return { 
        validate,
        groupLinesByDate
    };
})(DateParser, logger, LineRecognizerService);