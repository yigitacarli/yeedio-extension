(() => {
    'use strict';

    if (window.__yeedioInjected) return;
    window.__yeedioInjected = true;

    const SPEED_MIN = 0.25;
    const SPEED_MAX = 16.0;
    const VOLUME_MAX = 600;

    let settings = { speed: 1.0, volume: 100 };
    let audioCtx = null;
    let activeVideo = null;
    let enforceTimer = null;
    let settingRateProgrammatically = false;

    // A media element can only be connected to one MediaElementSourceNode.
    const videoGraphs = new WeakMap();

    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    function findVideo() {
        const videos = Array.from(document.querySelectorAll('video'));
        if (videos.length === 0) return null;

        const score = (v) => {
            const area = v.clientWidth * v.clientHeight;
            const playing = !v.paused && !v.ended && v.readyState > 2 ? 1e9 : 0;
            const visible = v.clientWidth > 0 && v.clientHeight > 0 ? 1 : 0;
            return playing + (visible ? area : 0);
        };

        return videos.reduce((best, v) => (score(v) > score(best) ? v : best));
    }

    function ensureAudioGraph(video) {
        let graph = videoGraphs.get(video);
        if (graph) return graph.gain;

        try {
            if (!audioCtx) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return null;
                audioCtx = new Ctx();
            }
            const source = audioCtx.createMediaElementSource(video);
            const gain = audioCtx.createGain();
            source.connect(gain);
            gain.connect(audioCtx.destination);

            videoGraphs.set(video, { source, gain });

            // Chrome may suspend an AudioContext until the page receives a gesture.
            video.addEventListener('play', () => {
                if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
            });
            document.addEventListener('click', () => {
                if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
            }, { capture: true, once: false });

            return gain;
        } catch (err) {
            console.warn('Yeedio: AudioContext init failed.', err);
            return null;
        }
    }

    function applySpeed(video, speed) {
        const s = clamp(speed, SPEED_MIN, SPEED_MAX);
        settings.speed = s;
        if (!video) return;
        settingRateProgrammatically = true;
        try {
            video.playbackRate = s;
        } finally {
            setTimeout(() => { settingRateProgrammatically = false; }, 0);
        }
        updateEnforcer();
    }

    function applyVolume(video, volume) {
        settings.volume = clamp(volume, 0, VOLUME_MAX);
        if (!video) return;
        // Keep using the same graph after a video has been routed through Web Audio.
        if (settings.volume !== 100 || videoGraphs.has(video)) {
            const gain = ensureAudioGraph(video);
            if (gain) gain.gain.value = settings.volume / 100;
        }
    }

    // Some players reset playbackRate when they rebuild their controls.
    function updateEnforcer() {
        const needsEnforcement = settings.speed !== 1.0;
        if (needsEnforcement && !enforceTimer) {
            enforceTimer = setInterval(() => {
                const v = findVideo();
                if (v && Math.abs(v.playbackRate - settings.speed) > 0.001) {
                    applySpeed(v, settings.speed);
                }
            }, 1000);
        } else if (!needsEnforcement && enforceTimer) {
            clearInterval(enforceTimer);
            enforceTimer = null;
        }
    }

    function attachVideoListeners(video) {
        if (!video || video.dataset.yeedioWired === 'true') return;

        video.addEventListener('ratechange', () => {
            if (settingRateProgrammatically) return;
            if (settings.speed !== 1.0 && Math.abs(video.playbackRate - settings.speed) > 0.001) {
                applySpeed(video, settings.speed);
            }
        });

        // Some sites reuse the same video element between playlist items.
        video.addEventListener('loadeddata', () => applyAll());
        video.addEventListener('loadedmetadata', () => notifyResolution());

        video.dataset.yeedioWired = 'true';
    }

    function watchResolution(video) {
        if (!video || video.dataset.yeedioResWatch === 'true') return;
        video.addEventListener('resize', () => notifyResolution());
        video.dataset.yeedioResWatch = 'true';
    }

    function getResolution() {
        const v = activeVideo || findVideo();
        return v && v.videoWidth > 0
            ? { width: v.videoWidth, height: v.videoHeight }
            : null;
    }

    function applyAll() {
        activeVideo = findVideo();
        if (!activeVideo) return;
        applySpeed(activeVideo, settings.speed);
        applyVolume(activeVideo, settings.volume);
        attachVideoListeners(activeVideo);
        watchResolution(activeVideo);
        notifyResolution();
    }

    function notifyResolution() {
        const res = getResolution();
        if (res) {
            chrome.runtime.sendMessage({ type: 'RESOLUTION_CHANGED', ...res }).catch(() => {});
        }
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'GET_STATE') {
            const video = findVideo();
            if (!video) return false; // let the frame with the video answer
            activeVideo = video;
            sendResponse({
                speed: settings.speed,
                volume: settings.volume,
                resolution: getResolution()
            });
            return false;
        }

        if (request.type === 'UPDATE_SETTINGS') {
            const video = findVideo();
            if (!video) return false;
            activeVideo = video;
            if (request.speed !== undefined) applySpeed(video, request.speed);
            if (request.volume !== undefined) applyVolume(video, request.volume);
            attachVideoListeners(video);
            watchResolution(video);
            sendResponse({ success: true, resolution: getResolution() });
            return false;
        }

        if (request.type === 'ADJUST') {
            const video = findVideo();
            if (!video) return false;
            activeVideo = video;
            if (request.speedDelta) {
                applySpeed(video, Math.round((settings.speed + request.speedDelta) * 100) / 100);
            }
            if (request.volumeDelta) {
                applyVolume(video, Math.round(settings.volume + request.volumeDelta));
            }
            sendResponse({ success: true, speed: settings.speed, volume: settings.volume });
            return false;
        }

        return false;
    });

    function restoreSettings(cb) {
        chrome.storage.local.get(['speed', 'volume'], (data) => {
            settings.speed = clamp(data.speed ?? 1.0, SPEED_MIN, SPEED_MAX);
            settings.volume = clamp(data.volume ?? 100, 0, VOLUME_MAX);
            if (cb) cb();
        });
    }

    function init() {
        restoreSettings(applyAll);
        updateEnforcer();
    }

    // YouTube's player can change without a full page load.
    window.addEventListener('yt-navigate-finish', () => setTimeout(init, 300));

    // Handle video elements added by other single-page applications.
    const observer = new MutationObserver(() => {
        clearTimeout(observer._t);
        observer._t = setTimeout(() => {
            const v = findVideo();
            if (v && v !== activeVideo) {
                restoreSettings(applyAll);
            } else if (v && Math.abs(v.playbackRate - settings.speed) > 0.001) {
                applySpeed(v, settings.speed);
            }
        }, 300);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
