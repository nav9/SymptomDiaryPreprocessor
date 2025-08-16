const uiService = (function() {
    const loadingModal = $('#loading-modal');
    const loadingText = $('#loading-modal-text');

    function showLoading(text = 'Processing...') {
        loadingText.text(text);
        loadingModal.show();
    }

    function hideLoading() {
        loadingModal.hide();
    }
    
/**
     * Shows a modal to ask the user whether to merge or replace data.
     * @param {function(string)} callback - A function that will be called with the user's choice ('merge' or 'replace').
     */
function showMergeConflictModal(callback) {
    if (!mergeModalInstance) {
        const modalEl = document.getElementById('merge-conflict-modal');
        if (modalEl) {
            mergeModalInstance = new bootstrap.Modal(modalEl);
        } else {
            console.error("Merge conflict modal not found in DOM.");
            return;
        }
    }

    // Use .one() to ensure the click handlers are only triggered once per showing
    $('#merge-confirm-replace').one('click', function() {
        callback('replace');
        mergeModalInstance.hide();
    });

    $('#merge-confirm-merge').one('click', function() {
        callback('merge');
        mergeModalInstance.hide();
    });

    mergeModalInstance.show();
}

return { showLoading, hideLoading, showMergeConflictModal };
})();
