$(document).ready(function() {
    let uploadedFiles = [];
    let dummyData = `Health2024.txt|
1 jun;
6:15 woke;
7:35 brushed;
8:59 rice. chickpeas, bep, chicken;
9:20 nap;
// This is a test observation
10:45 woke. rt;
22:00 sleep;

2 jun;
4:15 woke. mild rt;
6:59 rice, jackfruit seed. invalid-line-example;
8:45 woke. rt;`;

    // --- File Input ---
    $('#drop-zone, #file-list').on('click', () => $('#file-input').trigger('click'));
    $('#file-input').on('change', (e) => handleFiles(e.target.files));
    $('#drop-zone').on('dragover', (e) => {
        e.preventDefault();
        $('#drop-zone').addClass('bg-dark');
    }).on('dragleave drop', (e) => {
        e.preventDefault();
        $('#drop-zone').removeClass('bg-dark');
        if (e.type === 'drop') handleFiles(e.originalEvent.dataTransfer.files);
    });

    function handleFiles(files) {
        uploadedFiles = Array.from(files);
        let fileNames = uploadedFiles.map(f => `<span class="chip"><i class="fa-solid fa-file mr-1"></i>${f.name}</span>`).join(' ');
        $('#file-list').html(fileNames || '<p class="text-gray">No files selected.</p>');
    }

    // --- Dummy Data ---
    $('#dummy-data-btn').on('click', function() {
        const parts = dummyData.split('|');
        const file = new File([parts[1]], parts[0], { type: "text/plain" });
        handleFiles([file]);
        $('#file-list').append('<span class="chip bg-primary">Using Dummy Data</span>');
    });

    // --- Processing ---
    $('#process-btn').on('click', function() {
        if (uploadedFiles.length === 0) {
            alert("Please select files or use dummy data first.");
            return;
        }

        const config = {
            yearFormat: $('#year-format').val(),
            dateFormat: $('#date-format').val(),
            timeFormat: $('#time-format').val(),
            obsChar: $('#observation-char').val(),
            separators: $('#separator-chars').val(),
            ignoreChars: $('#ignore-chars').val()
        };

        const fileReadPromises = uploadedFiles.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve({ name: file.name, content: e.target.result });
                reader.onerror = e => reject(e);
                reader.readAsText(file);
            });
        });

        Promise.all(fileReadPromises).then(filesData => {
            const dataToValidate = {
                config: config,
                files: filesData
            };
            // Use sessionStorage to pass data to the next page
            sessionStorage.setItem('symptomDataForValidation', JSON.stringify(dataToValidate));
            window.location.href = 'validate.html';
        }).catch(error => {
            console.error("Error reading files:", error);
            alert("Could not read one or more files.");
        });
    });
});