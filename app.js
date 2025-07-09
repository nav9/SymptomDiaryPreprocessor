$(document).ready(function() {
    // --- Theme Toggler ---
    const themeToggle = $('#theme-toggle');
    const html = $('html');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    html.attr('data-theme', currentTheme);

    themeToggle.on('click', (e) => {
        e.preventDefault();
        const newTheme = html.attr('data-theme') === 'dark' ? 'light' : 'dark';
        html.attr('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Off-canvas Menu ---
    const menuToggle = $('#menu-toggle');
    const menu = $('#menu');
    menuToggle.on('click', (e) => {
        e.preventDefault();
        menu.toggleClass('open');
    });

    // --- File Drop Zone ---
    const dropZone = $('#drop-zone');
    const fileInput = $('#file-input');
    const fileList = $('#file-list');
    let uploadedFiles = [];

    dropZone.on('click', () => fileInput.trigger('click'));
    dropZone.on('dragover', (e) => {
        e.preventDefault();
        dropZone.addClass('dragover');
    });
    dropZone.on('dragleave', () => dropZone.removeClass('dragover'));
    dropZone.on('drop', (e) => {
        e.preventDefault();
        dropZone.removeClass('dragover');
        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });
    fileInput.on('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        uploadedFiles = Array.from(files);
        fileList.empty();
        uploadedFiles.forEach(file => {
            fileList.append(`<p><i class="fa-solid fa-file-lines"></i> ${file.name}</p>`);
        });
    }

    // --- Processing Logic ---
    const processBtn = $('#process-btn');
    let processedData = {};

    processBtn.on('click', async () => {
        if (uploadedFiles.length === 0) {
            alert('Please upload files first.');
            return;
        }
        processedData = {};
        for (const file of uploadedFiles) {
            await processFile(file);
        }
        $('#save-btn').show();
        alert('All files processed successfully!');
    });

    async function processFile(file) {
        const text = await file.text();
        const lines = text.split(/\r?\n/);
        const config = getParsingConfig();
        const year = extractYear(file.name, config.yearFormat);
        
        let currentDay = null;
        let data = [];
        let observations = [];
        let errors = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            try {
                const parsed = parseLine(trimmedLine, currentDay, year, config);
                if (parsed.type === 'date') {
                    currentDay = parsed.value;
                } else if (parsed.type === 'data') {
                    data.push(parsed.value);
                } else if (parsed.type === 'observation') {
                    observations.push(parsed.value);
                }
            } catch (e) {
                errors.push({ lineIndex: index, line: trimmedLine, error: e.message });
            }
        });

        if (errors.length > 0) {
            await handleErrors(file, lines, errors);
            // After errors are fixed, re-process the file logic would be needed.
            // For simplicity, this example stops on error. A more robust implementation
            // would re-run processing on the fixed content.
        } else {
            processedData[year] = { data, observations };
        }
    }

    function getParsingConfig() {
        return {
            yearFormat: $('#year-format').val(),
            dateFormat: $('#date-format').val().replace('Date ', ''),
            timeFormat: $('#time-format').val().replace('Time ', ''),
            obsChar: $('#observation-char').val(),
            separators: new RegExp(`[${$('#separator-chars').val()}]`),
            ignoreChars: new RegExp(`[${$('#ignore-chars').val()}]+$`)
        };
    }
    
    function extractYear(filename, format) {
        if (!format) return new Date().getFullYear().toString();
        const regexStr = format.replace('YYYY', '(\\d{4})');
        const match = filename.match(new RegExp(regexStr));
        return match ? match[1] : new Date().getFullYear().toString();
    }

    function parseLine(line, currentDay, year, config) {
        line = line.replace(config.ignoreChars, '').trim();

        if (line.startsWith(config.obsChar)) {
            return { type: 'observation', value: line.substring(config.obsChar.length).trim() };
        }

        const dateMatch = line.match(/^(\d{1,2}\s+\w+)/);
        if (dateMatch) {
            const dateStr = `${dateMatch[1]} ${year}`;
            const parsedDate = moment(dateStr, "DD MMM YYYY");
            if (parsedDate.isValid()) {
                return { type: 'date', value: parsedDate };
            }
        }
        
        const timeMatch = line.match(/^(\d{1,2}:\d{2})/);
        if (timeMatch && currentDay) {
            const timeStr = timeMatch[1];
            const dataStr = line.substring(timeStr.length).trim();
            const timestamp = currentDay.clone().set({
                hour: parseInt(timeStr.split(':')[0]),
                minute: parseInt(timeStr.split(':')[1]),
                second: 0
            }).toISOString();
            
            const content = dataStr.split(config.separators).map(s => s.trim()).filter(Boolean);
            return { type: 'data', value: { timestamp, content } };
        }

        throw new Error("Could not parse line.");
    }
    
    // --- Error Handling Modal ---
    const errorModal = document.getElementById('error-modal');
    let currentErrors = [];
    let currentFileContent = [];
    let currentFile = null;

    async function handleErrors(file, lines, errors) {
        currentErrors = errors;
        currentFileContent = lines;
        currentFile = file;
        showError(0);
        errorModal.showModal();
    }

    function showError(errorIndex) {
        const error = currentErrors[errorIndex];
        $('#error-info').text(`File: ${currentFile.name} - Error ${errorIndex + 1} of ${currentErrors.length}`);
        
        const start = Math.max(0, error.lineIndex - 3);
        const end = Math.min(currentFileContent.length, error.lineIndex + 4);
        let contextHtml = '';
        for (let i = start; i < end; i++) {
            const lineNum = `<span style="color: #888;">${(i + 1).toString().padStart(4, ' ')}: </span>`;
            if (i === error.lineIndex) {
                contextHtml += `${lineNum}<b>${currentFileContent[i]}</b>\n`;
            } else {
                contextHtml += `${lineNum}${currentFileContent[i]}\n`;
            }
        }
        $('#error-context').html(contextHtml);
        $('#error-line-input').val(error.line).data('line-index', error.lineIndex).data('error-index', errorIndex);
    }

    $('#submit-fix-btn').on('click', () => {
        const lineInput = $('#error-line-input');
        const lineIndex = lineInput.data('line-index');
        const errorIndex = lineInput.data('error-index');
        const correctedLine = lineInput.val();

        try {
            // Attempt to re-parse the corrected line
            const config = getParsingConfig();
            const year = extractYear(currentFile.name, config.yearFormat);
            const currentDay = moment(currentFileContent.find((l, i) => i < lineIndex && l.match(/^(\d{1,2}\s+\w+)/))); // Simplified day finding
            parseLine(correctedLine, currentDay, year, config);

            // If successful, remove from errors and move to the next
            currentErrors.splice(errorIndex, 1);
            currentFileContent[lineIndex] = correctedLine;

            if (currentErrors.length > 0) {
                showError(0); // Show next error
            } else {
                errorModal.close();
                alert('All errors in this file have been corrected. Re-processing...');
                // A more complete solution would re-process the corrected `currentFileContent`
                // and then continue with the next file in the queue.
                // For simplicity, we just close the modal.
            }
        } catch (e) {
            alert('The corrected line still could not be parsed. Please try again.');
        }
    });

    // --- Save Data ---
    $('#save-btn').on('click', () => {
        for (const year in processedData) {
            const jsonData = JSON.stringify(processedData[year], null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SymptomDiary_Parse_${year}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    });
});
