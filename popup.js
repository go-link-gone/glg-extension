document.addEventListener('DOMContentLoaded', () => {
    const initialState = document.getElementById('state-initial');
    const loadingState = document.getElementById('state-loading');
    const resultState = document.getElementById('state-result');
    const tabUrlInput = document.getElementById('tab-url');
    const generateButton = document.getElementById('generate-btn');
    const backButton = document.getElementById('back-btn');
    const resultText = document.getElementById('result-text');

    function setState(stateName) {
        initialState.classList.toggle('hidden', stateName !== 'initial');
        loadingState.classList.toggle('hidden', stateName !== 'loading');
        resultState.classList.toggle('hidden', stateName !== 'result');
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs && tabs[0];
        const currentUrl = activeTab?.url || 'Unable to read the current tab URL.';

        tabUrlInput.value = currentUrl;
        generateButton.disabled = !activeTab?.url;
    });

    generateButton.addEventListener('click', () => {
        setState('loading');

        // Temporaryly simulate API call with a timeout
        window.setTimeout(() => {
            resultText.textContent = 'Please call the backend API.';
            setState('result');
        }, 900);
    });

    backButton.addEventListener('click', () => {
        setState('initial');
    });
});
