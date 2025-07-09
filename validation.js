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


    // --- Core Functions ---

    function initialize() {
        const dataFromSession = sessionStorage.getItem('symptomDataForValidation');
        if (dataFromSession) {
            const parsedData = JSON.parse(dataFromSession);
            config = parsedData.config;
            validationData = preprocessRawData(parsedData.files);
            $('#data-view').removeClass('hidden');
            $('#no-data-view').addClass('hidden');
            renderValidationUI();
        } else {
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
        let currentDay = null;
        let errorCount = 0;

        validationData.forEach((item, index) => {
            if (item.type === 'file_header') {
                outputContainer.append(`<div class="tile tile-centered p-2" style="background:#505d70;"><div class="tile-content text-bold">${item.content}</div></div>`);
                currentDay = null; // Reset date context for new file
                return;
            }

            const parsed = parseLine(item.originalLine, currentDay, item.year, config);
            
            if(parsed.status === 'success') {
                if(parsed.type === 'date') currentDay = parsed.data.dateObject;
                item.status = 'valid';
                item.parsed = parsed;
                outputContainer.append(createValidRow(item));
            } else {
                item.status = 'invalid';
                errorCount++;
                outputContainer.append(createInvalidRow(item, index));
            }
        });
        updateErrorSummary(errorCount);
    }

    function parseLine(line, currentDay, year, config) {
        const cleanLine = line.replace(new RegExp(`[${config.ignoreChars}]+$`), '').trim();

        // Observation
        if (cleanLine.startsWith(config.obsChar)) {
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
                 const content = dataStr.split(new RegExp(`[${config.separators}]`)).map(s => s.trim()).filter(Boolean);
                 return { status: 'success', type: 'entry', data: { timestamp: timestamp.toISOString(), display: timestamp.format('h:mm a'), content: content } };
            }
        }
        
        return { status: 'error', message: 'Unknown format' };
    }

    // --- UI Creation ---
    
    function createValidRow(item) {
        let contentHtml = '';
        if (item.parsed.type === 'date') {
            contentHtml = `<strong class="text-primary">${item.parsed.data.text}</strong>`;
        } else if (item.parsed.type === 'observation') {
            contentHtml = `<em class="text-gray">// ${item.parsed.data.text}</em>`;
        } else if (item.parsed.type === 'entry') {
            const badges = item.parsed.data.content.map(c => `<span class="chip">${c}</span>`).join(' ');
            contentHtml = `<strong>${item.parsed.data.display}</strong> &rarr; ${badges}`;
        }
        return `<div class="validation-row">
                    <div class="line-status"><i class="icon icon-check"></i></div>
                    <div class="line-content">${contentHtml}</div>
                </div>`;
    }

    function createInvalidRow(item, index) {
        return `<div class="validation-row has-error" data-index="${index}">
                    <div class="line-status"><i class="icon icon-edit"></i></div>
                    <div class="line-content input-group">
                        <input class="form-input" type="text" value="${item.originalLine}">
                        <button class="btn btn-primary input-group-btn validate-line-btn">Validate</button>
                    </div>
                </div>`;
    }
    
    function updateErrorSummary(errorCount) {
        const summary = $('#error-summary');
        if (errorCount === 0) {
            summary.removeClass('toast-error').addClass('toast-success').html('<i class="fa-solid fa-thumbs-up"></i> All lines are valid!');
            $('#proceed-btn').removeClass('hidden');
        } else {
            summary.removeClass('toast-success').addClass('toast-error').html(`<i class="fa-solid fa-triangle-exclamation"></i> ${errorCount} line(s) need correction.`);
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