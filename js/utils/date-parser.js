const DateParser = (function() {
    const MONTH_MAP = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function parseDayMonth(str) {
        const monthMatch = str.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
        if (monthMatch) {
            const day = parseInt(monthMatch[1], 10);
            const month = MONTH_MAP[monthMatch[2].toLowerCase()];
            if (day >= 1 && day <= 31 && month !== undefined) {
                return { day, month };
            }
        }
        return null;
    }

    function isLineJustDate(str) {
        return parseDayMonth(str) !== null && !/(\d{1,2}:\d{2})/.test(str);
    }
    
    /**
     * Extracts time parts and text from a string like "09:00 data".
     * It does NOT validate the time parts, just extracts them.
     * @param {string} str The input string.
     * @returns {{hours: string, minutes: string, text: string, error: string|null}|null}
     */
    function extractTimeAndText(str) {
        // The regex is correct, but the handling of its output needs to be fixed.
        const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(.*)$/);
        
        if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            // match[3] will be undefined if seconds are not present.
            const seconds = match[3] ? parseInt(match[3], 10) : 0;
            // match[4] will always be the rest of the string, even if it's empty.
            const text = match[4] || '';

            // Validate the time right here.
            if (hours > 23 || minutes > 59 || seconds > 59) {
                return { error: `Invalid time value: ${match[1]}:${match[2]}` };
            }

            return {
                hours: match[1], // Return original string for display consistency
                minutes: match[2],
                text: text.trim(),
                error: null
            };
        }
        return null;
    }
    
    // The rest of the functions are correct and do not need changes.
    function buildISOString(year, month, day, hours, minutes) {
        // ... unchanged ...
    }
    
    function formatDateForDisplay(isoString) {
        if (!isoString) return 'Invalid Date';
        try {
            const d = new Date(isoString);
            if (isNaN(d)) return 'Invalid Date';             
            const day = d.getDate();
            const month = MONTH_NAMES[d.getMonth()];
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');            
            return `${day} ${month} ${year} ${hours}:${minutes}`;
        } catch (e) {return 'Invalid Date';}
    }
    
    return { parseDayMonth, isLineJustDate, extractTimeAndText, buildISOString, formatDateForDisplay };
})();