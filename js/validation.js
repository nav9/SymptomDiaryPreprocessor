document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const SEPARATORS = ['.', ','];
    const TIME_REGEX = /^(\d{1,2})[:.](\d{2})/; // Matches "4:15" or "14.30"
    const DATE_REGEX = /^(\d{1,2})\s+([a-zA-Z]{3,})/; // Matches "2 jun" or "31 may"

    // --- GLOBAL STATE ---
    let parsedDataByYear = {}; // Holds the final structured data for each year

    // --- DOM REFERENCES ---
    const loadingState = document.getElementById('loading-state');
    const mainValidator = document.getElementById('main-validator');
    const yearTabs = document.getElementById('year-tabs');
    const tabContentContainer = document.getElementById('tab-content-container');
    const proceedBtn = document.getElementById('proceed-btn');
    const nextErrorBtn = document.getElementById('next-error-btn');
    const prevErrorBtn = document.getElementById('prev-error-btn');
    const saveAllBtn = document.getElementById('save-all-btn');

    // --- PARSING & VALIDATION ENGINE ---

    /**
     * The main parsing function for a block of text for a given year.
     * @param {string} rawText - The raw diary text.
     * @param {string} year - The year for this data.
     * @returns {Array} An array of parsed entry/observation/error objects.
     */
    function parseSymptomData(rawText, year) {
        try {
            // 1. Pre-processing: Handle semicolons and clean up lines.
            const lines = rawText
                .replace(/;/g, '\n') // Replace all semicolons with newlines
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            let results = [];
            let currentDate = null;
            let lastTimestamp = null;
            let lastDayEntry = null; // To check date order

            for (const line of lines) {
                // 3. Handle Observations/Comments
                if (line.startsWith('//')) {
                    results.push({
                        type: 'observation',
                        content: line.substring(2).trim(),
                        associatedTimestamp: lastTimestamp,
                        id: `obs-${Date.now()}-${Math.random()}`
                    });
                    continue;
                }

                const dateMatch = line.match(DATE_REGEX);
                const timeMatch = line.match(TIME_REGEX);

                // 2. Parse Date Lines
                if (dateMatch) {
                    const day = dateMatch[1];
                    const month = dateMatch[2];
                    const dateString = `${day} ${month} ${year}`;
                    const newDate = moment(dateString, "D MMM YYYY");

                    if (!newDate.isValid()) {
                        results.push(createErrorBlock(`Invalid date format: "${line}"`));
                        continue;
                    }
                    
                    // Validation: Check for descending date order
                    if (currentDate && newDate.isAfter(currentDate)) {
                         results.push(createErrorBlock(`Date out of order: ${newDate.format('D MMM')} appears after ${currentDate.format('D MMM')}`, line));
                    }
                    // Validation: Check for duplicate dates
                    if (currentDate && newDate.isSame(currentDate, 'day')) {
                         results.push(createErrorBlock(`Duplicate date entry: ${newDate.format('D MMM')}`, line));
                    }

                    currentDate = newDate;
                    lastDayEntry = { date: currentDate, timeEntries: [] };
                    // We don't add the date line itself, it's context for subsequent time lines
                } 
                // 2. Parse Time Lines
                else if (timeMatch) {
                    if (!currentDate) {
                        results.push(createErrorBlock(`Time entry found before any date: "${line}"`));
                        continue;
                    }
                    const hour = timeMatch[1];
                    const minute = timeMatch[2];
                    const eventText = line.substring(timeMatch[0].length).trim();
                    
                    const timestamp = currentDate.clone().hour(hour).minute(minute);
                    if (!timestamp.isValid()) {
                        results.push(createErrorBlock(`Invalid time format: "${line}"`));
                        continue;
                    }

                    // Validation: Check for ascending time order within a day
                    if (lastTimestamp && timestamp.isBefore(lastTimestamp) && timestamp.isSame(lastTimestamp, 'day')) {
                        results.push(createErrorBlock(`Time out of order: ${timestamp.format('HH:mm')} appears after ${lastTimestamp.format('HH:mm')}`, line));
                    }
                    lastTimestamp = timestamp;

                    // Split tags by separators
                    const separatorRegex = new RegExp(`[${SEPARATORS.join('')}]`);
                    const tags = eventText.split(separatorRegex).map(t => t.trim()).filter(t => t);

                    results.push({
                        type: 'entry',
                        timestamp: timestamp,
                        tags: tags,
                        originalLine: line,
                        id: `entry-${Date.now()}-${Math.random()}`
                    });
                } 
                // 4. Handle Unparseable Lines
                else {
                    results.push(createErrorBlock(`Unrecognized line format: "${line}"`));
                }
            }
             // Final validation pass (e.g., check for missing dates) can be added here
            return results;

        } catch (e) {
            console.error("A critical error occurred during parsing:", e);
            return [createErrorBlock(`A fatal error occurred during parsing. Check console for details. Error: ${e.message}`)];
        }
    }

    /** Helper to create a standardized error object. */
    function createErrorBlock(errorMessage, content = '') {
        return { type: 'error', content: content, errors: [errorMessage], id: `err-${Date.now()}-${Math.random()}` };
    }


    // --- UI RENDERING ---

    /** Renders the entire validation UI from the parsed data. */
    function renderUI() {
        yearTabs.innerHTML = '';
        tabContentContainer.innerHTML = '';
        let firstYear = true;

        for (const year in parsedDataByYear) {
            // Create Tab
            const tabItem = document.createElement('li');
            tabItem.className = `tab-item ${firstYear ? 'active' : ''}`;
            tabItem.innerHTML = `<a href="#" data-year="${year}">Year ${year}</a>`;
            yearTabs.appendChild(tabItem);

            // Create Tab Content Pane
            const tabContent = document.createElement('div');
            tabContent.id = `content-${year}`;
            tabContent.className = `p-2 ${firstYear ? '' : 'd-none'}`;
            
            const dataForYear = parsedDataByYear[year];
            dataForYear.forEach(item => {
                let element;
                if (item.type === 'error') {
                    element = createInvalidEntryElement(item);
                } else {
                    element = createValidEntryElement(item);
                }
                tabContent.appendChild(element);
            });

            tabContentContainer.appendChild(tabContent);
            firstYear = false;
        }
        addEventListenersToUI();
        updateGlobalState();
    }
    
    /** Creates an HTML element for a successfully parsed entry or observation. */
    function createValidEntryElement(item) {
        const div = document.createElement('div');
        div.className = 'entry-container entry-valid form-group';
        div.dataset.id = item.id;

        const iconClass = item.type === 'entry' ? 'fa-clock' : 'fa-comment-dots';
        const displayTime = item.timestamp ? item.timestamp.format('D MMM, HH:mm') : (item.associatedTimestamp ? `(near ${item.associatedTimestamp.format('HH:mm')})` : '');
        const content = item.type === 'entry' ? item.tags.join(', ') : item.content;

        div.innerHTML = `
            <div class="input-group">
                <span class="input-group-addon">
                    <i class="fa-solid ${iconClass}"></i> ${displayTime}
                </span>
                <input type="text" class="form-input" value="${content}" readonly>
                <span class="input-group-addon">
                    <i class="fa-solid fa-check-circle valid"></i>
                </span>
            </div>`;
        return div;
    }

    /** Creates an HTML element for a line/block that failed parsing. */
    function createInvalidEntryElement(item) {
        const div = document.createElement('div');
        div.className = 'entry-container entry-invalid error-block form-group';
        div.dataset.id = item.id;

        div.innerHTML = `
            <textarea class="form-input" rows="3">${item.content}</textarea>
            <div class="error-message"><i class="fa-solid fa-triangle-exclamation"></i> ${item.errors.join('<br>')}</div>
            <button class="btn btn-primary btn-sm mt-1 revalidate-btn">Validate</button>
        `;
        return div;
    }

    /** Check page state and enable/disable buttons. */
    function updateGlobalState() {
        const totalErrors = document.querySelectorAll('.error-block').length;
        if (totalErrors === 0) {
            proceedBtn.disabled = false;
            proceedBtn.classList.remove('btn-secondary');
            proceedBtn.classList.add('btn-primary');
            // Hide error navigation if no errors
            nextErrorBtn.disabled = true;
            prevErrorBtn.disabled = true;

        } else {
            proceedBtn.disabled = true;
            proceedBtn.classList.add('btn-secondary');
            proceedBtn.classList.remove('btn-primary');
            nextErrorBtn.disabled = false;
            prevErrorBtn.disabled = false;
        }
    }


    // --- EVENT HANDLERS ---

    function addEventListenersToUI() {
        // Tab switching
        yearTabs.querySelectorAll('a').forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                const year = e.target.dataset.year;
                // Update active tab
                yearTabs.querySelector('.active').classList.remove('active');
                e.target.parentElement.classList.add('active');
                // Update active content
                tabContentContainer.querySelectorAll('div[id^="content-"]').forEach(c => c.classList.add('d-none'));
                document.getElementById(`content-${year}`).classList.remove('d-none');
            });
        });

        // Re-validate button
        document.querySelectorAll('.revalidate-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const errorContainer = e.target.closest('.error-block');
                const textarea = errorContainer.querySelector('textarea');
                const currentYear = yearTabs.querySelector('.active a').dataset.year;
                
                const parsedItems = parseSymptomData(textarea.value, currentYear);
                
                const hasErrors = parsedItems.some(item => item.type === 'error');

                if (!hasErrors && parsedItems.length > 0) {
                    // Success! Replace the error block with new valid entries.
                    const newElements = parsedItems.map(createValidEntryElement);
                    errorContainer.replaceWith(...newElements);
                } else {
                    // Still errors, just update the message.
                    const newErrorElement = createInvalidEntryElement(parsedItems[0]);
                    errorContainer.replaceWith(newErrorElement);
                    // We need to re-add the listener to the new button
                    newErrorElement.querySelector('.revalidate-btn').addEventListener('click', arguments.callee);
                }
                updateGlobalState();
            });
        });
    }

    function navigateErrors(direction) {
        const errors = Array.from(document.querySelectorAll('.error-block:not(.d-none)'));
        if (errors.length === 0) return;

        let current = document.activeElement.closest('.error-block');
        let currentIndex = errors.indexOf(current);

        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % errors.length;
        } else {
            nextIndex = (currentIndex - 1 + errors.length) % errors.length;
        }
        
        errors[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        errors[nextIndex].querySelector('textarea, input').focus();
    }

    function saveAllData() {
        // This function will reconstruct the text files from the current UI state
        // For simplicity in this example, it will only save successfully parsed data.
        for (const year in parsedDataByYear) {
            let fileContent = `// Symptom Diary - Validated Data for ${year}\n// Saved on ${moment().format('YYYY-MM-DD HH:mm')}\n\n`;
            
            const yearContentDiv = document.getElementById(`content-${year}`);
            if(!yearContentDiv) continue;

            let lastDate = null;
            
            // Go through each item in the UI for this year
            yearContentDiv.querySelectorAll('.entry-container').forEach(entryDiv => {
                // This is a simplified reconstruction. A more robust one would use the data model.
                const input = entryDiv.querySelector('input[type="text"]');
                if (input && entryDiv.classList.contains('entry-valid')) { // only save valid entries
                    const timeText = entryDiv.querySelector('.input-group-addon').textContent.trim();
                    const entryMoment = moment(timeText, 'D MMM, HH:mm');
                    if (entryMoment.isValid()) {
                         if(!lastDate || !entryMoment.isSame(lastDate, 'day')) {
                            fileContent += `\n${entryMoment.format('D MMM')}\n`;
                            lastDate = entryMoment;
                        }
                        fileContent += `${entryMoment.format('H:mm')} ${input.value}\n`;
                    }
                }
            });

            // Trigger download
            const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SymptomDiary_Validation_${year}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
        alert("Validated data has been saved for all years.");
    }

    // --- INITIALIZATION ---
    function init() {
        try {
            const dataFromSession = sessionStorage.getItem('symptomDataForValidation');
            if (!dataFromSession) {
                loadingState.innerHTML = '<p class="empty-title h5">No data found.</p><p class="empty-subtitle">Please <a href="index.html">go back to the upload page</a> to start.</p>';
                return;
            }

            const rawData = JSON.parse(dataFromSession);
            // Group data by year
            const dataByYear = rawData.reduce((acc, file) => {
                acc[file.year] = (acc[file.year] || '') + file.content + '\n';
                return acc;
            }, {});

            // Parse data for each year
            for (const year in dataByYear) {
                parsedDataByYear[year] = parseSymptomData(dataByYear[year], year);
            }
            
            loadingState.style.display = 'none';
            mainValidator.style.display = 'block';

            renderUI();

        } catch (e) {
            loadingState.innerHTML = `<div class="toast toast-error">A critical error occurred: ${e.message}. Please check the console and try again.</div>`;
            console.error("Initialization failed:", e);
        }
    }

    // Bind navigation buttons
    nextErrorBtn.addEventListener('click', () => navigateErrors('next'));
    prevErrorBtn.addEventListener('click', () => navigateErrors('prev'));
    saveAllBtn.addEventListener('click', saveAllData);

    // Start the application
    init();
});