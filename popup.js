document.addEventListener('DOMContentLoaded', () => {
    const initialState = document.getElementById('state-initial');
    const loadingState = document.getElementById('state-loading');
    const resultState = document.getElementById('state-result');
    const tabUrlInput = document.getElementById('tab-url');
    const generateButton = document.getElementById('generate-btn');
    const backButton = document.getElementById('back-btn');
    const resultText = document.getElementById('result-text');
    const qrWrap = document.getElementById('qr-wrap');
    const qrImage = document.getElementById('qr-image');

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

    const BACKEND_BASE = 'http://localhost:8080';

    generateButton.addEventListener('click', async () => {
        setState('loading');
        qrWrap.classList.add('hidden');
        qrImage.removeAttribute('src');

        const payload = { originalUrl: tabUrlInput.value };

        try {
            const resp = await fetch(`${BACKEND_BASE}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Server returned ${resp.status}: ${text}`);
            }

            const data = await resp.json();

            resultText.textContent = data?.shortUrl || 'No shortUrl in response';

            if (data?.qrCode) {
                qrImage.src = `data:image/png;base64,${data.qrCode}`;
                qrWrap.classList.remove('hidden');
            } else {
                qrWrap.classList.add('hidden');
            }

            setState('result');
        } catch (err) {
            resultText.textContent = `Error: ${err.message}`;
            qrWrap.classList.add('hidden');
            setState('result');
        }
    });

    backButton.addEventListener('click', () => {
        setState('initial');
    });
});
