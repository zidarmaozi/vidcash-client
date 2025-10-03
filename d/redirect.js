(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');
    const via = urlParams.get('v');
    
    if (!videoId) {
        document.body.innerHTML = 'Redirecting to vidcash.cc';
        return window.location.replace('https://vidcash.cc');
    }

    localStorage.setItem(window.videoIdKey, videoId);
    localStorage.setItem(window.videoOpenTimestamp, Date.now());
    if (via) {
        localStorage.setItem(window.videoViaKey, via);
    }

    if (window.location.hostname.startsWith('localhost')) {
        return window.location.href = `/`;
    }

    return window.location.href = 'https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https%3A%2F%2Fvidey.in&ved=2ahUKEwiWlMWNnOGPAxWfUGcHHZgOFZwQFnoECBcQAQ&usg=AOvVaw3dno9XhZ65qWUkagsMzSWF';
})();