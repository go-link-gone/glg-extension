document.addEventListener('DOMContentLoaded', () => {
    const initialState = document.getElementById('state-initial');
    const loadingState = document.getElementById('state-loading');
    const resultState = document.getElementById('state-result');
    const tabUrlInput = document.getElementById('tab-url');
    const generateButton = document.getElementById('generate-btn');
    const backButton = document.getElementById('back-btn');
    const copyButton = document.getElementById('copy-btn');
    const resultText = document.getElementById('result-text');
    const qrWrap = document.getElementById('qr-wrap');
    const qrImage = document.getElementById('qr-image');
    let latestShortUrl = '';

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
        latestShortUrl = '';
        copyButton.disabled = true;
        copyButton.textContent = 'Copy';
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

            latestShortUrl = data?.shortUrl || '';
            resultText.textContent = latestShortUrl || 'No shortUrl in response';
            copyButton.disabled = !latestShortUrl;

            if (data?.qrCode) {
                qrImage.src = `data:image/png;base64,${data.qrCode}`;
                qrWrap.classList.remove('hidden');
            } else {
                qrWrap.classList.add('hidden');
            }

            setState('result');
        } catch (err) {
            resultText.textContent = `Error: ${err.message}`;
            copyButton.disabled = true;
            qrWrap.classList.add('hidden');
            setState('result');
        }
    });

    copyButton.addEventListener('click', async () => {
        if (!latestShortUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(latestShortUrl);
            copyButton.textContent = 'Copied!';
            window.setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 1200);
        } catch (_err) {
            copyButton.textContent = 'Failed';
            window.setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 1200);
        }
    });

    backButton.addEventListener('click', () => {
        setState('initial');
    });
});
