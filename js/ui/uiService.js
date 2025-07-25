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
    
    // Add toast/notification functions here later

    return { showLoading, hideLoading };
})();
