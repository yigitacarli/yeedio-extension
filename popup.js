// popup.js — Yeedio v2
document.addEventListener('DOMContentLoaded', () => {
    const { t } = window.yeedioI18n;
    const speedSlider = document.getElementById('speed-slider');
    const speedInput = document.getElementById('speed-input');
    const speedDown = document.getElementById('speed-down');
    const speedUp = document.getElementById('speed-up');
    const speedPresets = document.getElementById('speed-presets');

    const volumeSlider = document.getElementById('volume-slider');
    const volumeInput = document.getElementById('volume-input');
    const volumePresets = document.getElementById('volume-presets');

    const statusDisplay = document.getElementById('status');
    const activeTabTitle = document.getElementById('active-tab-title');
    const activeTabIcon = document.getElementById('active-tab-icon');
    const openOptions = document.getElementById('open-options');

    const SPEED_MIN = 0.25;
    const SPEED_MAX = 16.0;
    const VOLUME_MAX = 600;

    let applyTimer = null;
    let currentTabId = null;

    openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

    function paintFill(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const pct = ((parseFloat(slider.value) - min) / (max - min)) * 100;
        slider.style.setProperty('--fill', pct + '%');
    }

    function setStatus(text, kind) {
        statusDisplay.textContent = text;
        statusDisplay.classList.remove('ok', 'warn', 'err');
        if (kind) statusDisplay.classList.add(kind);
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) return;
        currentTabId = tabs[0].id;
        const tab = tabs[0];

        if (tab.title) {
            activeTabTitle.textContent = tab.title;
            activeTabTitle.title = tab.title;
        } else {
            activeTabTitle.textContent = t('unknownTab');
        }

        if (tab.favIconUrl && /^https?:/.test(tab.favIconUrl)) {
            activeTabIcon.src = tab.favIconUrl;
            activeTabIcon.hidden = false;
            activeTabIcon.onerror = () => { activeTabIcon.hidden = true; };
        }

        ensureContentScript(currentTabId, (ok) => {
            if (!ok) {
                setStatus(t('cannotAccessPage'), 'err');
                return;
            }
            chrome.tabs.sendMessage(currentTabId, { type: 'GET_STATE' }, (response) => {
                if (chrome.runtime.lastError || !response) {
                    setStatus(t('noVideo'), 'warn');
                    return;
                }
                if (response.speed !== undefined) updateSpeedUI(clampSpeed(response.speed));
                if (response.volume !== undefined) updateVolumeUI(clampVolume(response.volume));
                showResolution(response.resolution);
            });
        });
    });

    // Tabs opened before an install or update may not have the content script yet.
    function ensureContentScript(tabId, callback) {
        chrome.tabs.sendMessage(tabId, { type: 'GET_STATE' }, (response) => {
            if (!chrome.runtime.lastError && response) {
                callback(true);
                return;
            }
            chrome.scripting.executeScript(
                { target: { tabId, allFrames: true }, files: ['content.js'] },
                () => {
                    if (chrome.runtime.lastError) {
                        callback(false);
                        return;
                    }
                    setTimeout(() => callback(true), 60);
                }
            );
        });
    }

    function clampSpeed(val) {
        val = parseFloat(val);
        if (isNaN(val)) return 1.0;
        return Math.min(Math.max(Math.round(val * 100) / 100, SPEED_MIN), SPEED_MAX);
    }

    function clampVolume(val) {
        val = parseInt(val, 10);
        if (isNaN(val)) return 100;
        return Math.min(Math.max(val, 0), VOLUME_MAX);
    }

    function updateSpeedUI(v) {
        speedSlider.value = v;
        speedInput.value = v.toFixed(2);
        paintFill(speedSlider);
        speedPresets.querySelectorAll('.chip').forEach((btn) => {
            btn.classList.toggle('active', parseFloat(btn.dataset.speed) === v);
        });
    }

    function updateVolumeUI(v) {
        volumeSlider.value = v;
        volumeInput.value = v;
        paintFill(volumeSlider);
        volumePresets.querySelectorAll('.chip').forEach((btn) => {
            btn.classList.toggle('active', parseInt(btn.dataset.volume, 10) === v);
        });
    }

    function scheduleApply() {
        clearTimeout(applyTimer);
        applyTimer = setTimeout(saveAndApply, 120);
    }

    function saveAndApply() {
        const speed = clampSpeed(speedSlider.value);
        const volume = clampVolume(volumeSlider.value);
        updateSpeedUI(speed);
        updateVolumeUI(volume);

        chrome.storage.local.set({ speed, volume });

        if (!currentTabId) return;
        chrome.tabs.sendMessage(
            currentTabId,
            { type: 'UPDATE_SETTINGS', speed, volume },
            (response) => {
                if (chrome.runtime.lastError || !response) {
                    setStatus(t('noVideo'), 'warn');
                    return;
                }
                showResolution(response.resolution);
            }
        );
    }

    function showResolution(resolution) {
        if (resolution && resolution.width > 0) {
            setStatus(`${t('resolution')}: ${resolution.width}\u00D7${resolution.height}`, 'ok');
        } else {
            setStatus(t('detectingResolution'), 'warn');
        }
    }

    speedSlider.addEventListener('input', () => {
        updateSpeedUI(clampSpeed(speedSlider.value));
        scheduleApply();
    });
    speedInput.addEventListener('change', () => {
        updateSpeedUI(clampSpeed(speedInput.value));
        scheduleApply();
    });
    speedDown.addEventListener('click', () => {
        updateSpeedUI(clampSpeed(parseFloat(speedSlider.value) - 0.25));
        scheduleApply();
    });
    speedUp.addEventListener('click', () => {
        updateSpeedUI(clampSpeed(parseFloat(speedSlider.value) + 0.25));
        scheduleApply();
    });
    speedPresets.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        updateSpeedUI(clampSpeed(btn.dataset.speed));
        scheduleApply();
    });

    volumeSlider.addEventListener('input', () => {
        updateVolumeUI(clampVolume(volumeSlider.value));
        scheduleApply();
    });
    volumeInput.addEventListener('change', () => {
        updateVolumeUI(clampVolume(volumeInput.value));
        scheduleApply();
    });
    volumePresets.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        updateVolumeUI(clampVolume(btn.dataset.volume));
        scheduleApply();
    });

    chrome.storage.local.get(['speed', 'volume'], (data) => {
        updateSpeedUI(clampSpeed(data.speed ?? 1.0));
        updateVolumeUI(clampVolume(data.volume ?? 100));
    });

    chrome.runtime.onMessage.addListener((request, sender) => {
        if (sender.tab?.id === currentTabId && request.type === 'RESOLUTION_CHANGED' && request.width > 0) {
            showResolution(request);
        }
    });
});
