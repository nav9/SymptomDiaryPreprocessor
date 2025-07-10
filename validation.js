$(document).ready(function() {
    let validationData = null;
    let config = null;

    // --- Event Listeners ---
    window.addEventListener('beforeunload', (e) => {
        if (validationData) { // Only show prompt if there's data
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    $('#upload-validation-file').on('change', handleFileUpload);
    $(document).on('click', '.validate-line-btn', handleLineValidation);

    $('#save-validation-btn').on('click', handleSaveProgress);
    
    $('#proceed-btn').on('click', () => {
        // Logic to save final validated data and move to the next page
        sessionStorage.setItem('symptomDataForDefinition', JSON.stringify(validationData));
        window.location.href = 'define.html';
    });

    function escapeForRegexClass(str) {
        if (!str) return '';
        return str.replace(/([\]\\^-])/g, '\\$1');
    }    


    // --- Core Functions ---

    function initialize() {
        const dataFromSession = sessionStorage.getItem('symptomDataForValidation');
        if (dataFromSession) {
            structuredData = JSON.parse(dataFromSession);
            $('#data-view').removeClass('hidden');
            $('#no-data-view').addClass('hidden');
            renderValidationUI();
        } else {
            // Show upload prompt if no data
            $('#no-data-view').removeClass('hidden');
            $('#data-view').addClass('hidden');
        }
    }
    
    function preprocessRawData(files) {
        let allLines = [];
        files.forEach(file => {
            const year = extractYear(file.name, config.yearFormat);
            const lines = file.content.split(/\r?\n/);
            allLines.push({ type: 'file_header', content: file.name, year: year });
            lines.forEach((line, index) => {
                if (line.trim()) {
                    allLines.push({ originalLine: line, year: year, status: 'unprocessed' });
                }
            });
        });
        return allLines;
    }

    function renderValidationUI() {
        const outputContainer = $('#validation-output');
        outputContainer.empty();
        let errorCount = 0;
        let lastTimestamp = null;

        structuredData.forEach((item, index) => {
            let error = null;
            
            // Validation Logic
            if (item.timestamp) {
                const currentTimestamp = moment(item.timestamp);
                if (!currentTimestamp.isValid()) {
                    error = { message: "Invalid timestamp format." };
                } else if (lastTimestamp && currentTimestamp.isBefore(lastTimestamp)) {
                    // NEW: Chronological Check
                    error = { message: "Time is out of order." };
                } else {
                    lastTimestamp = currentTimestamp; // Update last valid timestamp
                }
            }
            
            if (error) {
                errorCount++;
                outputContainer.append(createInvalidRow(item, index, error));
            } else {
                outputContainer.append(createValidRow(item, index));
            }
        });
        updateErrorSummary(errorCount);
    }

    function parseLine(line, currentDay, year, config) {
        // FIX: Create RegExp safely from the string stored in the config object
        const ignoreCharsRegex = config.ignoreChars ? new RegExp(`[${escapeForRegexClass(config.ignoreChars)}]+$`) : null;
        const cleanLine = ignoreCharsRegex ? line.replace(ignoreCharsRegex, '').trim() : line.trim();
        
        // Observation
        if (config.obsChar && cleanLine.startsWith(config.obsChar)) {
            return { status: 'success', type: 'observation', data: { text: cleanLine.substring(config.obsChar.length).trim() } };
        }

        // Date
        const dateMoment = moment(`${cleanLine} ${year}`, `${config.dateFormat} YYYY`, true);
        if (dateMoment.isValid()) {
            return { status: 'success', type: 'date', data: { dateObject: dateMoment, text: dateMoment.format('dddd, MMMM Do YYYY') } };
        }
        
        // Time Entry
        const timeMatch = cleanLine.match(/^(\d{1,2}:\d{2})/);
        if (timeMatch && currentDay) {
            const timeStr = timeMatch[1];
            const dataStr = cleanLine.substring(timeStr.length).trim();
            const timestamp = currentDay.clone().set({ hour: timeStr.split(':')[0], minute: timeStr.split(':')[1] });
            
            if (timestamp.isValid()) {
                 // FIX: Create separators regex safely
                 const separatorsRegex = config.separators ? new RegExp(`[${escapeForRegexClass(config.separators)}]`) : new RegExp(`\\s+`);
                 const content = dataStr.split(separatorsRegex).map(s => s.trim()).filter(Boolean);
                 return { status: 'success', type: 'entry', data: { timestamp: timestamp.toISOString(), display: timestamp.format('h:mm a'), content: content } };
            }
        }
        
        return { status: 'error', message: 'Unknown format' };
    }

    // --- UI Creation ---
    
    function createValidRow(item) {
        let contentHtml = '';
        if (item.timestamp) {
            const displayTime = moment(item.timestamp).format('MMM D, HH:mm');
            const badges = item.data.map(d => `<span class="chip">${d}</span>`).join(' ');
            contentHtml = `<strong>${displayTime}</strong> &rarr; ${badges}`;
        } else if (item.observations) {
            contentHtml = `<em class="text-gray">// ${item.observations.join('; ')}</em>`;
        }
        return `<div class="validation-row">
                    <div class="line-status"><i class="icon icon-check"></i></div>
                    <div class="line-content">${contentHtml}</div>
                </div>`;
    }

    function createInvalidRow(item, index, error) {
        // For now, we show the error and the original line that created this entry.
        // A more advanced version could allow editing the timestamp/data directly.
        const displayTime = item.timestamp ? moment(item.timestamp).format('MMM D, HH:mm') : 'N/A';
        const badges = item.data ? item.data.map(d => `<span class="chip">${d}</span>`).join(' ') : (item.observations || []).join('; ');
        
        return `<div class="validation-row has-error" data-index="${index}">
                    <div class="line-status"><i class="icon icon-close"></i></div>
                    <div class="line-content">
                         <strong>${displayTime}</strong> &rarr; ${badges}
                    </div>
                    <div class="line-error">${error.message}</div>
                </div>`;
    }
    
    function updateErrorSummary(errorCount) {
        // (Same as before)
         const summary = $('#error-summary');
        if (errorCount === 0) {
            summary.removeClass('toast-error').addClass('toast-success').html('<i class="fa-solid fa-thumbs-up"></i> All data is valid!');
            $('#proceed-btn').removeClass('hidden');
        } else {
            summary.removeClass('toast-success').addClass('toast-error').html(`<i class="fa-solid fa-triangle-exclamation"></i> ${errorCount} entries have errors.`);
            $('#proceed-btn').addClass('hidden');
        }
    }
    
    // --- Event Handlers ---

    function handleLineValidation() {
        const row = $(this).closest('.validation-row');
        const index = row.data('index');
        const input = row.find('.form-input');
        const newText = input.val();
        
        validationData[index].originalLine = newText;
        renderValidationUI(); // Re-render the whole UI to re-evaluate all lines in context
    }

    function handleSaveProgress() {
        const dataToSave = {
            config: config,
            validationData: validationData
        };
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {type : 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SymptomDiary_Validation_${moment().format('YYYY-MM-DD')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const savedState = JSON.parse(e.target.result);
            config = savedState.config;
            validationData = savedState.validationData;
            
            $('#data-view').removeClass('hidden');
            $('#no-data-view').addClass('hidden');
            renderValidationUI();
        };
        reader.readAsText(file);
    }

    function extractYear(filename, format) {
        if (!format) return new Date().getFullYear().toString();
        const regexStr = format.replace('YYYY', '(\\d{4})');
        const match = filename.match(new RegExp(regexStr));
        return match ? match[1] : new Date().getFullYear().toString();
    }
    
    // --- Initializer Call ---
    initialize();
});