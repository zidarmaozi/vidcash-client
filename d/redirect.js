(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');
    
    if (!videoId) {
        document.body.innerHTML = 'Redirecting to vidcash.cc';
        return window.location.replace('https://vidcash.cc');
    }

    localStorage.setItem(window.videoIdKey, videoId);
    localStorage.setItem(window.videoOpenTimestamp, Date.now());
    return window.location.href = 'https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https%3A%2F%2Fvidey.in&ved=2ahUKEwiWlMWNnOGPAxWfUGcHHZgOFZwQFnoECBcQAQ&usg=AOvVaw3dno9XhZ65qWUkagsMzSWF';
})();