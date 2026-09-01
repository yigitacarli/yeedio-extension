// Handles keyboard shortcuts and briefly shows the new value on the toolbar icon.

const SPEED_STEP = 0.25;
const VOLUME_STEP = 10;

function flashBadge(tabId, text) {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#39FF14' });
    chrome.action.setBadgeText({ tabId, text });
    setTimeout(() => {
        chrome.action.setBadgeText({ tabId, text: '' });
    }, 1200);
}

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab || !tab.id) return;

        const message = {};
        if (command === 'increase-speed') message.speedDelta = SPEED_STEP;
        else if (command === 'decrease-speed') message.speedDelta = -SPEED_STEP;
        else if (command === 'boost-volume-up') message.volumeDelta = VOLUME_STEP;
        else if (command === 'boost-volume-down') message.volumeDelta = -VOLUME_STEP;
        else return;

        chrome.tabs.sendMessage(tab.id, { type: 'ADJUST', ...message }, (response) => {
            if (chrome.runtime.lastError || !response) return;

            const patch = {};
            if (response.speed !== undefined) patch.speed = response.speed;
            if (response.volume !== undefined) patch.volume = response.volume;
            chrome.storage.local.set(patch);

            let label = '';
            if (response.speed !== undefined) label = `${response.speed}x`;
            else if (response.volume !== undefined) label = `${Math.round(response.volume)}%`;
            flashBadge(tab.id, label);
        });
    });
});
