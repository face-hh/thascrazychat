let timer;
let vidSrc;

async function init() {
    // 5
    const tempVar = await chrome.storage.local.get(["timer"]);
    const tempVar2 = await chrome.storage.local.get(["vidSrc"]);

    timer = tempVar || 5;
    vidSrc = tempVar2 || 'https://tcc-server.creeperita09.repl.co:3000/xqc.mp4';
}

init();

chrome.tabs.onUpdated.addListener((tab, changeInfo) => {
    if (changeInfo.url?.includes('youtube.com/watch?v=')) {

        chrome.scripting.executeScript({
            target: { tabId: tab },
            function: start,
            args: [timer, vidSrc]
        });

    }
});

chrome.runtime.onMessage.addListener(message => {
    if (message.secondsToSkip) {
        timer = Number(message.secondsToSkip);
        chrome.storage.local.set({ timer });
    }
    if (message.streamer) {
        vidSrc = message.streamer;
        chrome.storage.local.set({ vidSrc });
    }
});

function start(timer, vidSrc) {
    const alreadyExistingEl = document.querySelector('#video-reaction-inserted');
    if (alreadyExistingEl) alreadyExistingEl.remove();

    const videoElement = document.createElement("video");
    videoElement.id = 'video-reaction-inserted'
    videoElement.src = vidSrc;
    videoElement.controls = false;
    videoElement.style.width = "25%";
    videoElement.style.height = "50%";
    videoElement.style.position = "relative";

    // Find an appropriate location on the page to append the video element
    const targetElement = document.querySelector("#movie_player > div.html5-video-container");

    if (!targetElement) return console.log('Ignored task, currently not running inside player.');

    watchForEnd();
    const volumePanel = document.querySelector('.ytp-volume-panel');

    let prevValue = volumePanel.getAttribute('aria-valuetext');

    videoElement.volume = toVolume(prevValue) / 100

    const observer = new MutationObserver(mutationsList => {
        const mutation = mutationsList.find(m => m.type === 'attributes' && m.attributeName === 'aria-valuetext');

        if (!mutation) return;

        const newValueContent = volumePanel.getAttribute('aria-valuetext');
        const newValue = toVolume(newValueContent);

        if (newValueContent === prevValue) return;
        videoElement.volume = newValue / 100

        prevValue = newValueContent;
    });

    observer.observe(volumePanel, { attributes: true });

    targetElement.addEventListener('click', () => {
        pauseVideo()
    })
    document.addEventListener('keydown', (event) => {
        if (event?.key === ' ') {
            pauseVideo()
        }
        // handle skips
        const currentTime = videoElement.currentTime;

        if (event?.key === 'ArrowLeft') {
            videoElement.currentTime = currentTime - timer;
        }

        if (event?.key === 'ArrowRight') {
            videoElement.currentTime = currentTime + timer;
        }
    });

    targetElement.appendChild(videoElement);
    videoElement.play();

    function pauseVideo() {
        if (videoElement.paused) {
            return videoElement.play();
        }

        videoElement.pause();
    }

    function toVolume(content) {
        return content.match(/\d+(\.\d+)?/g)?.[0]
    }
    function watchForEnd() {
        const interval = setInterval(() => {
            const currentDuration = document.querySelector('span.ytp-time-current')
            const totalDuration = document.querySelector('span.ytp-time-duration');
            const videoPlayer = document.querySelector("#movie_player > div.html5-video-container > video");

            // if video ended or video player is closed, remove & pause element.
            if (
                currentDuration.textContent === totalDuration.textContent
                ||
                !videoPlayer.src
            ) {
                clearInterval(interval);
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
                videoElement.remove();
            }
        }, 500)
    }
}
