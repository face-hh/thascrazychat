document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.addEventListener('click', function () {
        const secondsToSkip = document.getElementById('secs').value;
        const streamer = document.getElementById('streamer').value;

        chrome.runtime.sendMessage({
            secondsToSkip: secondsToSkip,
            streamer: streamer
        });
    });
});