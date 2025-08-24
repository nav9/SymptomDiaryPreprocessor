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

    /**
     * NEW: Displays a toast notification with an undo action.
     * @param {string} message - The message to display.
     * @param {function} undoCallback - The function to execute when the undo button is clicked.
     */
    function showUndoNotification(message, undoCallback) {
        const toastId = `undo-toast-${Date.now()}`;
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-bg-dark border-0 undo-toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                        <button class="btn btn-sm btn-link text-info p-0 ms-2 undo-action-btn">Undo</button>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`;
        
        $('#undo-notification-area').append(toastHtml);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 6000 });
        
        $(`#${toastId} .undo-action-btn`).on('click', function() {
            undoCallback();
            toast.hide();
        });

        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
        
        toast.show();
    }
    

return { showLoading, hideLoading, showMergeConflictModal, showUndoNotification };
})();
