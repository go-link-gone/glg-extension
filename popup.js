document.addEventListener('DOMContentLoaded', () => {
    const tabUrlInput = document.getElementById('tab-url');
    const generateButton = document.getElementById('generate-btn');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs && tabs[0];
        const currentUrl = activeTab?.url || 'Unable to read the current tab URL.';

        tabUrlInput.value = currentUrl;
        generateButton.disabled = !activeTab?.url;
    });
});
