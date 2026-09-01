document.addEventListener('DOMContentLoaded', () => {
    const { t } = window.yeedioI18n;
    const defaultSpeedInput = document.getElementById('default-speed');
    const defaultVolumeInput = document.getElementById('default-volume');
    const saveBtn = document.getElementById('save-btn');
    const statusDiv = document.getElementById('status');

    chrome.storage.local.get(['speed', 'volume'], (data) => {
        if (data.speed !== undefined) {
            defaultSpeedInput.value = data.speed;
        }
        if (data.volume !== undefined) {
            defaultVolumeInput.value = data.volume;
        }
    });

    saveBtn.addEventListener('click', () => {
        let speed = parseFloat(defaultSpeedInput.value);
        let volume = parseInt(defaultVolumeInput.value, 10);

        if (isNaN(speed) || speed < 0.25) speed = 0.25;
        if (speed > 16) speed = 16;

        if (isNaN(volume) || volume < 0) volume = 0;
        if (volume > 600) volume = 600;

        defaultSpeedInput.value = speed;
        defaultVolumeInput.value = volume;

        chrome.storage.local.set({
            speed,
            volume
        }, () => {
            statusDiv.textContent = t('settingsSaved');
            setTimeout(() => { statusDiv.textContent = ''; }, 2000);
        });
    });
});
