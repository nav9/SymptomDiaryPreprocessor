const DateParser = (function() {
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
        // Updated Regex to be more flexible with spacing
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


        /**
     * Formats an ISO date string into "DD Mmm YYYY HH:mm" format.
     * @param {string} isoString - The date string from the data model.
     * @returns {string} The formatted date string for display.
     */
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
            } catch (e) {
                return 'Invalid Date';
            }
        }
        
        function formatTimeForEdit(isoString) {
            if (!isoString) return '';
            try {
                const d = new Date(isoString);
                if (isNaN(d)) return '';
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            } catch(e) {
                return '';
            }
        }

    return { parseDate, isLineJustDate, extractTimeAndText, formatDateForDisplay, formatTimeForEdit };
})();