window.appState = {
    currentStep: 1,
    isDirty: false,
    data: {
        step1: {
            rawFiles: [] // { fileName, content }
        },
        step2: {
            // Data grouped by original filename
            // e.g., 'Health2024.txt': [ { id, type, isoDate, phrases, error, ... } ]
            fileData: {}
        }
    }
};
