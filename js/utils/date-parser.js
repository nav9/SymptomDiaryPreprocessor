const DateParser = (function() {
    const MONTH_MAP = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function parseDate(str, year) {
        const dayMonth = parseDayMonth(str);
        if (dayMonth) {
            // Create the date in UTC to prevent local timezone from shifting the day.
            const d = new Date(Date.UTC(year, dayMonth.month, dayMonth.day));
            // Check for invalid dates like "31 Apr" which JS converts to "1 May"
            if (d.getUTCMonth() !== dayMonth.month) {
                return null; // The day was invalid for that month
            }
            return d;
        }
        
        // Fallback for other potential date formats that new Date() can handle.
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d;
        }
        
        return null;
    }

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
    
    function extractTimeAndText(str) {
        // The regex is correct, but the handling of its output needs to be fixed.
        const match = str.match(/^~?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(.*)$/);
        
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
    
    function buildISOString(year, month, day, hours, minutes) {
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return null;
        const d = new Date(Date.UTC(year, month, day, h, m));
        return d.toISOString();
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
    
    return { 
        parseDate, 
        parseDayMonth, 
        isLineJustDate, 
        extractTimeAndText, 
        buildISOString, 
        formatDateForDisplay 
    };
})();