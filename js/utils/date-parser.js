const DateParser = (function() {
    // Extremely simplified parser. A real implementation would use a library or more robust regex.
    function parseDate(str) {
        // Try YYYY-MM-DD format
        let d = new Date(str);
        if (!isNaN(d)) return d;
        
        // Try "2 jan" format (assuming current year)
        const monthMatch = str.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
        if (monthMatch) {
            const day = parseInt(monthMatch[1], 10);
            const monthStr = monthMatch[2].toLowerCase();
            const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(monthStr);
            if (monthIndex > -1) {
                const year = new Date().getFullYear();
                return new Date(year, monthIndex, day);
            }
        }
        return null;
    }

    function isLineJustDate(str) {
        // Simple check: if parsing it works and it has no time format, assume it's just a date line.
        const d = parseDate(str);
        return d !== null && !/(\d{1,2}:\d{2})/.test(str);
    }
    
    function extractTimeAndText(str) {
        const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(.*)/);
        if(match) {
            return {
                hours: parseInt(match[1], 10),
                minutes: parseInt(match[2], 10),
                seconds: match[3] ? parseInt(match[3], 10) : 0,
                text: match[4].trim()
            };
        }
        return null;
    }

    return { parseDate, isLineJustDate, extractTimeAndText };
})();