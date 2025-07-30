const ValidatorService = (function(dateParser, logger, lineRecognizerService) {

    function validate(lines) {
        // STEP 1: RECOGNIZE and CLASSIFY every line from its raw text.
        let lastDateIsValid = false;
        const recognizedLines = lines.map(line => {
            const result = lineRecognizerService.recognizeLine(line.rawText, lastDateIsValid);
            // Update the line object with its true type
            line.type = result.type;
            line.reason = result.reason || '';
            
            if (line.type === 'date') lastDateIsValid = true;
            else if (line.type !== 'time' && line.type !== 'comment') lastDateIsValid = false;
            
            return line;
        });

        // STEP 2: GROUP the now-classified lines.
        const dateGroups = groupLinesByDate(recognizedLines);
        
        // STEP 3: VALIDATE the groups for chronological order.
        const dateOrder = detectDateOrder(dateGroups);
        validateDateOrder(dateGroups, dateOrder);
        validateTimeEntries(dateGroups);

        // STEP 4: FLATTEN the groups back into a single array for rendering.
        const validatedData = Object.values(dateGroups).flatMap(group => [group.dateLine, ...group.entries]);
        
        return { validatedData, dateOrder };
    }

    function groupLinesByDate(lines) {
        const groups = {};
        let currentGroup = null;

        lines.forEach(line => {
            if (line.type === 'date') {
                currentGroup = { dateLine: line, entries: [], dateObj: null };
                // Use the unique ID for the key to prevent duplicates
                groups[line.id] = currentGroup;
            } else if (currentGroup) {
                currentGroup.entries.push(line);
            } else {
                // This line is an orphan. The controller will handle auto-correcting it.
                if (!groups['__orphaned__']) {
                    groups['__orphaned__'] = {
                        dateLine: { type: 'header', rawText: 'Orphaned Entries (No Associated Date)', id: 'orphan-header' },
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
        Object.values(dateGroups).forEach(group => {
            // Clear any old time-order errors first for this group
            group.entries.forEach(entry => {
                if (entry.reason === 'Time is out of order. Times within a day must be ascending.') {
                   clearError(entry);
                }
            });

            const timeEntries = group.entries.filter(e => e.type === 'time');
            if (timeEntries.length < 2) return; // No need to sort if 0 or 1 time entries

            // Create a sorted copy of the entries for comparison
            const sortedEntries = [...timeEntries].sort((a, b) => {
                const timeAData = dateParser.extractTimeAndText(a.rawText);
                const timeBData = dateParser.extractTimeAndText(b.rawText);
                if (!timeAData || !timeBData) return 0;
                const timeA = parseInt(timeAData.hours, 10) * 60 + parseInt(timeAData.minutes, 10);
                const timeB = parseInt(timeBData.hours, 10) * 60 + parseInt(timeBData.minutes, 10);
                return timeA - timeB;
            });

            // Compare the sorted order with the original order
            timeEntries.forEach((originalEntry, index) => {
                const sortedEntry = sortedEntries[index];
                if (originalEntry.id !== sortedEntry.id) {
                    flagError(originalEntry, 'Time is out of order. Times within a day must be ascending.');
                }
            });
        });
        // The nested loop that was here has been removed.
    }

    function flagError(item, reason) {
        item.type = 'error';
        item.reason = reason;
    }

    function clearError(item) {
        // This call will now work because lineRecognizerService is correctly injected.
        const result = lineRecognizerService.recognizeLine(item.rawText, true);
        item.type = result.type;
        item.reason = result.reason || ''; // Ensure reason is not undefined
    }

    return { 
        validate,
        groupLinesByDate
    };
})(DateParser, logger, LineRecognizerService);