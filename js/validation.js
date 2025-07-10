document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION & REGEX ---
    const SEPARATORS = ['.', ','];
    const TIME_REGEX = /^(\d{1,2})[:.](\d{2})/;
    const DATE_REGEX = /^(\d{1,2})\s+([a-zA-Z]{3,})/;
    const DATETIME_REGEX = new RegExp(`^(${DATE_REGEX.source})[,\\s]+(${TIME_REGEX.source})`);

    // --- GLOBAL STATE ---
    let dataByYear = {}; // { "2024": [entryObj1, entryObj2], ... }

    // --- DOM REFERENCES ---
    const loadingState = document.getElementById('loading-state');
    const mainValidator = document.getElementById('main-validator');
    const yearSelector = document.getElementById('year-selector');
    const contentContainer = document.getElementById('content-container');
    const proceedBtn = document.getElementById('proceed-btn');
    const nextErrorBtn = document.getElementById('next-error-btn');
    const prevErrorBtn = document.getElementById('prev-error-btn');
    const problemCounter = document.getElementById('problem-counter');
    const saveAllBtn = document.getElementById('save-all-btn');
    const loadValidationBtn = document.getElementById('load-validation-btn');
    const validationFileInput = document.getElementById('validation-file-input');

    // --- NEW: Overlay References and Helpers ---
    const overlay = document.getElementById('processing-overlay');
    const overlayMessage = document.getElementById('processing-message');

    function showProcessingOverlay(message) {
        overlayMessage.textContent = message;
        overlay.classList.add('active');
    }

    function hideProcessingOverlay() {
        overlay.classList.remove('active');
    }

    // --- PARSING ENGINE ---

    /**
     * Parses a single line of text with context from previous lines.
     * @param {string} line - The text line to parse.
     * @param {object} context - { lastDate: moment, lastTimestamp: moment }
     * @returns {object} A parsed entry object (valid or error).
     */
    function parseLine(line, context) {
        line = line.trim();
        const id = `entry-${Date.now()}-${Math.random()}`;
        if (!line) return { type: 'error', originalLine: '', errors: ['Empty line.'], id };
        if (line.startsWith('//')) return { type: 'observation', content: line.substring(2).trim(), id, ...context };

        const dateTimeMatch = line.match(DATETIME_REGEX);
        const timeMatch = line.match(TIME_REGEX);

        let timestamp, eventText, tags;
        const currentYear = context.lastDate ? context.lastDate.year() : new Date().getFullYear();

        if (dateTimeMatch) {
            // Full "DD MMM, HH:mm text" format
            const dateStr = `${dateTimeMatch[1]} ${currentYear} ${dateTimeMatch[4]}:${dateTimeMatch[5]}`;
            timestamp = moment(dateStr, "D MMM YYYY H:m");
            eventText = line.substring(dateTimeMatch[0].length).trim();
        } else if (timeMatch) {
            // "HH:mm text" format, uses context date
            if (!context.lastDate) return { type: 'error', originalLine: line, errors: ["Time found before any date. Add a date like 'DD MMM' to this or a previous line."], id };
            timestamp = context.lastDate.clone().hour(timeMatch[1]).minute(timeMatch[2]);
            eventText = line.substring(timeMatch[0].length).trim();
        } else {
            // Unrecognized format
            return { type: 'error', originalLine: line, errors: ["Unrecognized format. Line should start with a time ('HH:mm') or date and time ('DD MMM, HH:mm')."], id };
        }

        if (!timestamp.isValid()) return { type: 'error', originalLine: line, errors: ['Invalid date or time.'], id };

        tags = eventText.split(new RegExp(`[${SEPARATORS.join('')}]`)).map(t => t.trim()).filter(Boolean);
        return { type: 'entry', timestamp, tags, originalLine: line, id };
    }

    /** Parses a whole block of raw text into structured objects. */
    function parseFullText(rawText, year) {
        const lines = rawText.replace(/;/g, '\n').split('\n');
        let results = [];
        let context = { lastDate: null, lastTimestamp: null };
        let currentDayStr = '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const dateMatch = trimmedLine.match(DATE_REGEX);
            if (dateMatch && trimmedLine.length < 10) { // Likely just a date line
                 const newDate = moment(`${trimmedLine} ${year}`, "D MMM YYYY");
                 if(newDate.isValid()) {
                    context.lastDate = newDate;
                    currentDayStr = newDate.format('D MMM');
                    // We can choose to add this as a special entry or just use it as context.
                    // For simplicity, we just update context.
                    continue;
                 }
            }
            
            const parsed = parseLine(trimmedLine, context);
            if(parsed.type === 'entry') {
                context.lastDate = parsed.timestamp.clone().startOf('day');
                context.lastTimestamp = parsed.timestamp;
            } else if(parsed.type === 'observation') {
                parsed.associatedTimestamp = context.lastTimestamp;
            }
            results.push(parsed);
        }
        return results;
    }

    // --- UI RENDERING & MANIPULATION ---

    /** Renders the content for a single year. */
    function renderYearContent(year) {
        contentContainer.innerHTML = ''; // Clear previous content
        const yearData = dataByYear[year] || [];
        if (yearData.length === 0) {
            contentContainer.innerHTML = `<div class="empty"><p class="empty-title h5">No data for ${year}</p></div>`;
        } else {
            yearData.forEach(item => {
                const element = createEntryElement(item);
                contentContainer.appendChild(element);
            });
        }
        updateGlobalState();
    }
    
    /** Creates an HTML element for any entry (valid, error, observation). */
    function createEntryElement(item) {
        const div = document.createElement('div');
        div.className = `entry-container ${item.type === 'error' ? 'entry-invalid' : 'entry-valid'}`;
        div.dataset.id = item.id;

        const isError = item.type === 'error';
        const contentHtml = isError 
            ? `<div class="entry-content">
                   <textarea class="form-input" rows="2">${item.originalLine}</textarea>
                   <div class="error-message"><i class="fa-solid fa-triangle-exclamation"></i> ${item.errors.join('<br>')}</div>
               </div>`
            : `<div class="entry-content">
                   ${createReadOnlyElement(item)}
               </div>`;

        div.innerHTML = `
            ${contentHtml}
            <div class="entry-controls">
                <button class="btn btn-sm" data-action="move-up" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                <button class="btn btn-sm" data-action="move-down" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
                <button class="btn btn-sm btn-primary" data-action="add-below" title="Add Line Below"><i class="fa-solid fa-plus"></i></button>
                ${!isError ? `<button class="btn btn-sm btn-secondary" data-action="edit" title="Edit"><i class="fa-solid fa-pencil"></i></button>` : ''}
                <button class="btn btn-sm btn-error" data-action="delete" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        return div;
    }
    
    /** Helper to create the readonly display part. */
    function createReadOnlyElement(item) {
        let iconClass, displayLabel, content;
        if (item.type === 'entry') {
            iconClass = 'fa-clock';
            displayLabel = item.timestamp.format('D MMM, HH:mm');
            content = item.tags.join(', ');
        } else { // Observation
            iconClass = 'fa-comment-dots';
            displayLabel = 'Obsv';
            content = item.content;
        }
        return `
            <div class="input-group">
                <span class="input-group-addon" title="${displayLabel}">
                    <i class="fa-solid ${iconClass} mr-2"></i> ${displayLabel}
                </span>
                <input type="text" class="form-input" value="${content.replace(/"/g, '"')}" readonly>
            </div>`;
    }

    // --- GLOBAL STATE & NAVIGATION ---

    function updateGlobalState() {
        let totalErrors = 0;
        Object.values(dataByYear).forEach(yearData => {
            totalErrors += yearData.filter(item => item.type === 'error').length;
        });

        problemCounter.textContent = `${totalErrors} Problems`;
        problemCounter.className = totalErrors > 0 ? 'has-errors' : 'no-errors';
        
        proceedBtn.disabled = totalErrors > 0;
        nextErrorBtn.disabled = totalErrors <= 1;
        prevErrorBtn.disabled = totalErrors <= 1;
    }

    function navigateErrors(direction) {
        const allErrors = [];
        document.querySelectorAll('.entry-invalid').forEach(el => {
            // Find which year this error belongs to
            const year = Object.keys(dataByYear).find(y => dataByYear[y].some(item => item.id === el.dataset.id));
            if (year) allErrors.push({ element: el, year: year });
        });

        if (allErrors.length === 0) return;

        const currentFocus = document.activeElement.closest('.entry-invalid');
        let currentIndex = allErrors.findIndex(err => err.element === currentFocus);
        
        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % allErrors.length;
        } else {
            nextIndex = (currentIndex - 1 + allErrors.length) % allErrors.length;
        }
        
        const nextError = allErrors[nextIndex];

        // Switch year if necessary
        if (yearSelector.value !== nextError.year) {
            yearSelector.value = nextError.year;
            renderYearContent(nextError.year); // Re-render to ensure the element exists
        }
        
        // Use timeout to ensure element is visible after re-render
        setTimeout(() => {
            const elementToFocus = document.querySelector(`.entry-invalid[data-id="${nextError.element.dataset.id}"]`);
            if (elementToFocus) {
                elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
                elementToFocus.querySelector('textarea').focus();
            }
        }, 100);
    }
    
    // --- EVENT HANDLING ---

    contentContainer.addEventListener('click', e => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const entryDiv = button.closest('.entry-container');
        const id = entryDiv.dataset.id;
        const year = yearSelector.value;
        const yearData = dataByYear[year];
        const index = yearData.findIndex(item => item.id === id);

        if (index === -1) return;

        switch(action) {
            case 'delete':
                yearData.splice(index, 1);
                renderYearContent(year);
                break;
            case 'edit':
                const itemToEdit = yearData[index];
                itemToEdit.type = 'error'; // Temporarily make it an error to get the textarea
                itemToEdit.originalLine = itemToEdit.originalLine || '';
                itemToEdit.errors = ['Editing...'];
                renderYearContent(year);
                setTimeout(() => document.querySelector(`[data-id="${id}"] textarea`).focus(), 0);
                break;
            case 'add-below':
                const newError = { type: 'error', originalLine: '', errors: ['New entry. Please provide details.'], id: `entry-${Date.now()}` };
                yearData.splice(index + 1, 0, newError);
                renderYearContent(year);
                setTimeout(() => document.querySelector(`[data-id="${newError.id}"] textarea`).focus(), 0);
                break;
            case 'move-up':
                if (index > 0) {
                    [yearData[index - 1], yearData[index]] = [yearData[index], yearData[index - 1]];
                    renderYearContent(year);
                }
                break;
            case 'move-down':
                if (index < yearData.length - 1) {
                    [yearData[index], yearData[index + 1]] = [yearData[index + 1], yearData[index]];
                    renderYearContent(year);
                }
                break;
        }
    });

    contentContainer.addEventListener('change', e => {
        if (e.target.tagName === 'TEXTAREA') {
            const entryDiv = e.target.closest('.entry-container');
            const id = entryDiv.dataset.id;
            const year = yearSelector.value;
            const yearData = dataByYear[year];
            const index = yearData.findIndex(item => item.id === id);
            if (index === -1) return;

            const context = {
                lastDate: (yearData[index-1] && yearData[index-1].timestamp) ? yearData[index-1].timestamp.clone().startOf('day') : null,
                lastTimestamp: (yearData[index-1]) ? yearData[index-1].timestamp : null
            };
            
            const revalidatedItem = parseLine(e.target.value, context);
            revalidatedItem.id = id; // Preserve ID
            yearData[index] = revalidatedItem;
            
            renderYearContent(year); // Re-render the whole year to reflect change
        }
    });

    // --- INITIALIZATION & FILE HANDLING ---
    
    function init() {
        const dataFromSession = sessionStorage.getItem('symptomDataForValidation');
        if (!dataFromSession) {
            loadingState.innerHTML = `<p class="empty-title h5">No data found.</p><p class="empty-subtitle">Please <a href="index.html">go back</a> or load a validation file.</p>`;
            return;
        }
        
        loadingState.style.display = 'none';
        mainValidator.style.display = 'block';

        const rawDataByYear = JSON.parse(dataFromSession).reduce((acc, file) => {
            acc[file.year] = (acc[file.year] || '') + file.content + '\n';
            return acc;
        }, {});
        
        // Use the overlay for the initial, potentially large, parsing job
        showProcessingOverlay('Parsing initial data...');
        // Use timeout to ensure overlay renders before synchronous parsing blocks the main thread
        setTimeout(() => {
            try {
                loadDataIntoApp(rawDataByYear);
            } finally {
                hideProcessingOverlay();
            }
        }, 50);
    }
    
    function loadDataIntoApp(rawDataByYear) {
        yearSelector.innerHTML = '';
        const sortedYears = Object.keys(rawDataByYear).sort((a,b) => b-a);
        
        for (const year of sortedYears) {
            dataByYear[year] = parseFullText(rawDataByYear[year], year);
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelector.appendChild(option);
        }

        if (sortedYears.length > 0) {
            renderYearContent(sortedYears[0]);
        }
        updateGlobalState();
    }
    
    async function handleValidationFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        showProcessingOverlay(`Loading ${files.length} validation file(s)...`);

        try {
            const filesByYear = {};
            for (const file of files) {
                const match = file.name.match(/Validation_(\d{4})\.txt$/);
                if (match) {
                    const year = match[1];
                    if (!filesByYear[year] || file.lastModified > filesByYear[year].lastModified) {
                        filesByYear[year] = file;
                    }
                }
            }

            const readPromises = Object.entries(filesByYear).map(([year, file]) => 
                file.text().then(content => ({ year, content }))
            );
            
            const newFilesData = await Promise.all(readPromises);
            
            const rawDataByYear = {};
            newFilesData.forEach(({ year, content }) => {
                rawDataByYear[year] = content;
            });

            // Now parse and load the new data
            loadDataIntoApp(rawDataByYear);

        } catch (error) {
            console.error('Error reading validation files:', error);
            alert('An error occurred while reading the files. Please check the console.');
        } finally {
            hideProcessingOverlay();
            event.target.value = ''; // Reset file input
        }
    }

    function saveAllData() {
        showProcessingOverlay('Generating and saving files...');
        // Use a timeout to allow the overlay to show before the synchronous loop starts
        setTimeout(() => {
            try {
                // ... (The existing synchronous logic for saving files)
                const sortedYears=Object.keys(dataByYear).sort((a,b)=>b-a);for(const year of sortedYears){let fileContent=`// Symptom Diary - Validated Data for ${year}\n// Saved on ${moment().format("YYYY-MM-DD HH:mm")}\n\n`;const yearContentDiv=document.getElementById(`content-container`);if(!yearContentDiv)continue;let lastDate=null;dataByYear[year].forEach(item=>{if(item.type==='entry'){const entryMoment=item.timestamp;if(entryMoment.isValid()){if(!lastDate||!entryMoment.isSame(lastDate,"day")){fileContent+=`\n${entryMoment.format("D MMM")}\n`}
lastDate=entryMoment;fileContent+=`${entryMoment.format("H:mm")} ${item.tags.join(', ')}\n`}}else if(item.type==='observation'){fileContent+=`//${item.content}\n`}});const blob=new Blob([fileContent],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download=`SymptomDiary_Validation_${year}.txt`,a.click(),URL.revokeObjectURL(url)}alert("Validated data has been saved for all available years.");
            } finally {
                hideProcessingOverlay();
            }
        }, 50);
    }    

    // Bind event listeners
    yearSelector.addEventListener('change', e => renderYearContent(e.target.value));
    nextErrorBtn.addEventListener('click', () => navigateErrors('next'));
    prevErrorBtn.addEventListener('click', () => navigateErrors('prev'));
    saveAllBtn.addEventListener('click', saveAllData);
    loadValidationBtn.addEventListener('click', () => validationFileInput.click());
    validationFileInput.addEventListener('change', handleValidationFileUpload);

    init();
});