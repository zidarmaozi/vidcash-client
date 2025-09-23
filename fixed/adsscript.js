(function () {
    const videoId = localStorage.getItem(window.videoIdKey);
    const videoTs = localStorage.getItem(window.videoOpenTimestamp);
    if (!videoId || !videoTs) {
        document.body.innerHTML = 'Redirecting to vidcash.cc';
        return window.location.replace('https://vidcash.cc');
    }

    // check if it already 30 minutes
    if (openDuration > 30 * 60 * 1000) {
        localStorage.removeItem(window.videoIdKey);
        localStorage.removeItem(window.videoOpenTimestamp);

        document.body.innerHTML = 'Redirecting to vidcash.cc';
        return window.location.replace('https://vidcash.cc');
    }
})();