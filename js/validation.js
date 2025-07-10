document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const SEPARATORS = ['.', ','];
    const TIME_REGEX = /^(\d{1,2})[:.](\d{2})/;
    const DATE_REGEX = /^(\d{1,2})\s+([a-zA-Z]{3,})/;
    const VALIDATION_FILENAME_REGEX = /Validation_(\d{4})\.txt$/;

    // --- GLOBAL STATE ---
    let dataByYear = {}; // Holds raw text content for each year

    // --- DOM REFERENCES ---
    const loadingState = document.getElementById('loading-state');
    const mainValidator = document.getElementById('main-validator');
    const yearTabs = document.getElementById('year-tabs');
    const tabContentContainer = document.getElementById('tab-content-container');
    const proceedBtn = document.getElementById('proceed-btn');
    const nextErrorBtn = document.getElementById('next-error-btn');
    const prevErrorBtn = document.getElementById('prev-error-btn');
    const saveAllBtn = document.getElementById('save-all-btn');
    const loadValidationBtn = document.getElementById('load-validation-btn');
    const validationFileInput = document.getElementById('validation-file-input');

    // --- PARSING & VALIDATION ENGINE (Unchanged from previous version) ---
    function parseSymptomData(rawText, year) {
        try {
            const lines = rawText.replace(/;/g, '\n').split('\n').map(line => line.trim()).filter(Boolean);
            let results = [];
            let currentDate = null;
            let lastTimestamp = null;

            for (const line of lines) {
                if (line.startsWith('//')) {
                    // For observations, we don't split by separators
                    results.push({ type: 'observation', content: line.substring(2).trim(), associatedTimestamp: lastTimestamp, id: `obs-${Date.now()}-${Math.random()}` });
                    continue;
                }
                const dateMatch = line.match(DATE_REGEX);
                const timeMatch = line.match(TIME_REGEX);

                if (dateMatch) {
                    const newDate = moment(`${dateMatch[0]} ${year}`, "D MMM YYYY");
                    if (!newDate.isValid()) { results.push(createErrorBlock(`Invalid date format: "${line}"`, line)); continue; }
                    if (currentDate && newDate.isAfter(currentDate)) { results.push(createErrorBlock(`Date out of order: ${newDate.format('D MMM')} appears after ${currentDate.format('D MMM')}`, line)); }
                    if (currentDate && newDate.isSame(currentDate, 'day')) { results.push(createErrorBlock(`Duplicate date entry: ${newDate.format('D MMM')}`, line)); }
                    currentDate = newDate;
                } else if (timeMatch) {
                    if (!currentDate) { results.push(createErrorBlock(`Time entry found before any date: "${line}"`, line)); continue; }
                    const timestamp = currentDate.clone().hour(timeMatch[1]).minute(timeMatch[2]);
                    if (!timestamp.isValid()) { results.push(createErrorBlock(`Invalid time format: "${line}"`, line)); continue; }
                    if (lastTimestamp && timestamp.isBefore(lastTimestamp) && timestamp.isSame(lastTimestamp, 'day')) { results.push(createErrorBlock(`Time out of order: ${timestamp.format('HH:mm')} after ${lastTimestamp.format('HH:mm')}`, line)); }
                    lastTimestamp = timestamp;
                    const eventText = line.substring(timeMatch[0].length).trim();
                    const tags = eventText.split(new RegExp(`[${SEPARATORS.join('')}]`)).map(t => t.trim()).filter(Boolean);
                    results.push({ type: 'entry', timestamp, tags, originalLine: line, id: `entry-${Date.now()}-${Math.random()}` });
                } else {
                    results.push(createErrorBlock(`Unrecognized line format: "${line}"`, line));
                }
            }
            return results;
        } catch (e) {
            console.error("A critical error occurred during parsing:", e);
            return [createErrorBlock(`A fatal error occurred during parsing. Check console. Error: ${e.message}`)];
        }
    }
    function createErrorBlock(errorMessage, content = '') { return { type: 'error', content: content || errorMessage, errors: [errorMessage], id: `err-${Date.now()}-${Math.random()}` }; }
    
    // --- UI RENDERING ---
    function processAndRender() {
        yearTabs.innerHTML = '';
        tabContentContainer.innerHTML = '';
        let firstYear = true;

        const sortedYears = Object.keys(dataByYear).sort((a, b) => b - a);

        for (const year of sortedYears) {
            const parsedData = parseSymptomData(dataByYear[year], year);
            
            const tabItem = document.createElement('li');
            tabItem.className = `tab-item ${firstYear ? 'active' : ''}`;
            tabItem.innerHTML = `<a href="#" data-year="${year}">Year ${year}</a>`;
            yearTabs.appendChild(tabItem);

            const tabContent = document.createElement('div');
            tabContent.id = `content-${year}`;
            tabContent.className = `p-2 ${firstYear ? '' : 'd-none'}`;
            
            parsedData.forEach(item => {
                const element = item.type === 'error' ? createInvalidEntryElement(item) : createValidEntryElement(item);
                tabContent.appendChild(element);
            });

            tabContentContainer.appendChild(tabContent);
            firstYear = false;
        }
        addEventListenersToUI();
        updateGlobalState();
        mainValidator.style.display = 'block';
        loadingState.style.display = 'none';
    }
    
    /** REVISED: Creates a cleaner HTML element for a valid entry or observation. */
    function createValidEntryElement(item) {
        const div = document.createElement('div');
        div.className = 'entry-container entry-valid form-group';
        div.dataset.id = item.id;

        let iconClass, displayLabel, content;
        
        if (item.type === 'entry') {
            iconClass = 'fa-clock';
            displayLabel = item.timestamp.format('D MMM, HH:mm');
            content = item.tags.join(', ');
        } else { // Observation
            iconClass = 'fa-comment-dots';
            displayLabel = 'Obsv';
            content = item.content; // Show the full, unsplit observation
        }

        div.innerHTML = `
            <div class="input-group">
                <span class="input-group-addon" title="${displayLabel}">
                    <i class="fa-solid ${iconClass} mr-2"></i> ${displayLabel}
                </span>
                <input type="text" class="form-input" value="${content.replace(/"/g, '"')}" readonly>
            </div>`;
        return div;
    }

    /** Unchanged: Creates an HTML element for a block that failed parsing. */
    function createInvalidEntryElement(item) {
        const div = document.createElement('div');
        div.className = 'entry-container entry-invalid error-block form-group';
        div.dataset.id = item.id;
        div.innerHTML = `
            <textarea class="form-input" rows="3">${item.content}</textarea>
            <div class="error-message"><i class="fa-solid fa-triangle-exclamation"></i> ${item.errors.join('<br>')}</div>
            <button class="btn btn-primary btn-sm mt-1 revalidate-btn">Validate</button>`;
        return div;
    }

    function updateGlobalState() {
        const totalErrors = document.querySelectorAll('.error-block').length;
        proceedBtn.disabled = totalErrors > 0;
        nextErrorBtn.disabled = totalErrors === 0;
        prevErrorBtn.disabled = totalErrors === 0;
    }

    // --- EVENT HANDLERS ---
    function addEventListenersToUI() { /* This function remains identical to previous version */
        yearTabs.querySelectorAll('a').forEach(tab=>{tab.addEventListener('click',e=>{e.preventDefault();const t=e.target.dataset.year;yearTabs.querySelector('.active').classList.remove('active'),e.target.parentElement.classList.add('active'),tabContentContainer.querySelectorAll('div[id^="content-"]').forEach(e=>e.classList.add('d-none')),document.getElementById(`content-${t}`).classList.remove('d-none')})}),document.querySelectorAll('.revalidate-btn').forEach(t=>{t.addEventListener('click',e=>{const t=e.target.closest('.error-block'),n=t.querySelector('textarea'),a=yearTabs.querySelector('.active a').dataset.year,r=parseSymptomData(n.value,a),o=r.some(e=>'error'===e.type);if(o||0===r.length){const e=createInvalidEntryElement(r[0]||createErrorBlock("Could not parse content.", n.value));t.replaceWith(e),e.querySelector('.revalidate-btn').addEventListener('click',arguments.callee)}else{const e=r.map(createValidEntryElement);t.replaceWith(...e)}updateGlobalState()})});
    }

    function navigateErrors(direction) { /* This function remains identical */
        const e=Array.from(document.querySelectorAll('.error-block:not(.d-none)')),t=document.activeElement.closest('.error-block'),n=e.indexOf(t),r='next'===(direction)?(n+1)%e.length:(n-1+e.length)%e.length;e.length>0&&(e[r].scrollIntoView({behavior:'smooth',block:'center'}),e[r].querySelector('textarea, input').focus());
    }
    
    function saveAllData() { /* This function remains identical */
        const sortedYears=Object.keys(dataByYear).sort((a,b)=>b-a);for(const year of sortedYears){let fileContent=`// Symptom Diary - Validated Data for ${year}\n// Saved on ${moment().format("YYYY-MM-DD HH:mm")}\n\n`;const yearContentDiv=document.getElementById(`content-${year}`);if(!yearContentDiv)continue;let lastDate=null;yearContentDiv.querySelectorAll(".entry-container").forEach(entryDiv=>{const input=entryDiv.querySelector('input[type="text"]');if(input&&entryDiv.classList.contains("entry-valid")){const timeText=entryDiv.querySelector(".input-group-addon").getAttribute("title");let entryMoment=moment(timeText,"D MMM, HH:mm");if("Obsv"===timeText){fileContent+=`//${input.value}\n`}else if(entryMoment.isValid()){lastDate&&!entryMoment.isSame(lastDate,"day")&&(fileContent+=`\n${entryMoment.format("D MMM")}\n`),lastDate||(fileContent+=`${entryMoment.format("D MMM")}\n`),lastDate=entryMoment,fileContent+=`${entryMoment.format("H:mm")} ${input.value}\n`}}});const blob=new Blob([fileContent],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download=`SymptomDiary_Validation_${year}.txt`,a.click(),URL.revokeObjectURL(url)}alert("Validated data has been saved for all available years.");
    }
    
    /** NEW: Handles loading previously saved validation files */
    async function handleValidationFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        mainValidator.style.display = 'none';
        loadingState.style.display = 'block';

        const filesByYear = {};
        for (const file of files) {
            const match = file.name.match(VALIDATION_FILENAME_REGEX);
            if (match) {
                const year = match[1];
                // If year not present, or current file is newer, add it
                if (!filesByYear[year] || file.lastModified > filesByYear[year].lastModified) {
                    filesByYear[year] = file;
                }
            }
        }

        const readPromises = Object.entries(filesByYear).map(([year, file]) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ year, content: e.target.result });
                reader.onerror = reject;
                reader.readAsText(file);
            });
        });

        try {
            const newFilesData = await Promise.all(readPromises);
            // Replace or add the content to our main data object
            newFilesData.forEach(({ year, content }) => {
                dataByYear[year] = content;
            });
            // Re-render the entire UI with the new/updated data
            processAndRender();
        } catch (error) {
            console.error('Error reading validation files:', error);
            alert('An error occurred while reading the files. Please check the console.');
            mainValidator.style.display = 'block'; // Show UI again
            loadingState.style.display = 'none';
        }

        // Reset file input to allow re-uploading the same file
        event.target.value = '';
    }

    // --- INITIALIZATION ---
    function init() {
        try {
            const dataFromSession = sessionStorage.getItem('symptomDataForValidation');
            if (!dataFromSession) {
                loadingState.innerHTML = '<p class="empty-title h5">No data found.</p><p class="empty-subtitle">Please <a href="index.html">go back to the upload page</a> or load a previously saved validation file.</p>';
                mainValidator.style.display = 'block'; // show the load button
                loadingState.style.display = 'none'; // hide the spinner
                return;
            }

            const rawData = JSON.parse(dataFromSession);
            dataByYear = rawData.reduce((acc, file) => {
                acc[file.year] = (acc[file.year] || '') + file.content + '\n';
                return acc;
            }, {});
            
            processAndRender();

        } catch (e) {
            loadingState.innerHTML = `<div class="toast toast-error">A critical error occurred: ${e.message}.</div>`;
            console.error("Initialization failed:", e);
        }
    }

    // Bind event listeners
    nextErrorBtn.addEventListener('click', () => navigateErrors('next'));
    prevErrorBtn.addEventListener('click', () => navigateErrors('prev'));
    saveAllBtn.addEventListener('click', saveAllData);
    loadValidationBtn.addEventListener('click', () => validationFileInput.click());
    validationFileInput.addEventListener('change', handleValidationFileUpload);

    // Start the application
    init();
});