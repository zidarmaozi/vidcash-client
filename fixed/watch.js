function renderPage() {
    // Ganti dengan URL API Laravel Anda yang sudah live
    const LARAVEL_API_URL = 'https://vidcash.cc/api';

    // --- Elemen UI ---
    const videoPlayer = document.getElementById('videoPlayer');
    const messageArea = document.getElementById('message-area');
    const relatedVideosContainer = document.getElementById('related-videos');


    // --- Variabel State ---
    const videoId = localStorage.getItem(window.videoIdKey);
    let viewRecorded = false;
    let watchTimer;

    //menampilkan link video di textarea
    const videoLink = document.getElementById('videoLink');
    const videoUrl = `https://videy.in/d/?id=${videoId}`;
    videoLink.value = videoUrl;
    //copy to clipboard
    document.querySelector('.copy-in').addEventListener('click', function () {
        videoLink.select();
        videoLink.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');
        alert('Link video telah disalin ke clipboard!');
    });

    // --- Fungsi Utama ---

    // 1. Ambil pengaturan dari Laravel
    async function getSettings() {
        try {
            const response = await fetch(`${LARAVEL_API_URL}/service/settings/${videoId}`);
            if (!response.ok) throw new Error('Gagal mengambil pengaturan.');

            const settings = await response.json();

            // === CONSOLE LOG UNTUK PENGATURAN ===
            // //console.log("Pengaturan Diterima dari Server Laravel:", {
            //     "Waktu Tonton (detik)": settings.watch_time_seconds,
            //     "Pendapatan per View (Rp)": settings.cpm,
            //     "Batas View per IP": settings.ip_view_limit,
            //     "Level Validasi": settings.default_validation_level
            // });
            // ===================================

            return settings;
        } catch (error) {
            //console.error(error);
            return null;
        }
    }

    // 1. Ambil pengaturan dari Laravel
    async function getRelatedVideos() {
        try {
            const response = await fetch(`${LARAVEL_API_URL}/service/related-videos/${videoId}`);
            if (!response.ok) throw new Error('Gagal mengambil video terkait.');

            const videos = await response.json();
            return videos;
        } catch (error) {
            //console.error(error);
            return null;
        }
    }

    // 2. Kirim permintaan untuk mencatat view ke Laravel
    async function recordView() {
        if (viewRecorded) return;
        viewRecorded = true;
        // //console.log("Mengirim permintaan untuk mencatat view...");

        try {
            const response = await fetch(`${LARAVEL_API_URL}/service/record-view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Via': localStorage.getItem(window.videoViaKey) || '1',
                    ...xH
                },
                body: JSON.stringify({ video_code: videoId })
            });

            const result = await response.json();

            // === CONSOLE LOG UNTUK STATUS VIEW ===
            // if (response.ok) {
            //     //console.log("%cVIEW VALID: Berhasil dicatat oleh server.", "color: green; font-weight: bold;");
            // } else {
            //     // Tampilkan detail dari server
            //     //console.warn(`%cVIEW TIDAK VALID: Server menolak.`, "color: orange; font-weight: bold;");
            //     //console.log("Detail dari Server:", result.debug);
            // }
            // =====================================

        } catch (error) {
            //console.error("Gagal mengirim data view:", error);
        }
    }

    // 3. Fungsi Report Video
    async function reportVideo(videoCode, description = '') {
        try {
            const response = await fetch(`${LARAVEL_API_URL}/report-video`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    video_code: videoCode,
                    description: description
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Report submitted:', data.message);
                return { success: true, message: data.message };
            } else {
                console.error('Report failed:', data);
                return { success: false, errors: data.errors };
            }
        } catch (error) {
            console.error('Network error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // 4. Fungsi untuk mengirim report langsung
    async function handleReportClick() {
        const reportBtn = document.getElementById('reportBtn');
        if (!reportBtn || reportBtn.disabled) return;

        // Disable button dan ubah text
        reportBtn.disabled = true;
        reportBtn.textContent = 'Mengirim...';

        try {
            // Kirim report tanpa deskripsi
            const result = await reportVideo(videoId, '');

            if (result.success) {
                // Ubah text menjadi "Reported!"
                reportBtn.textContent = 'Reported!';
                reportBtn.style.backgroundColor = '#28a745';
                reportBtn.style.color = 'white';
            } else {
                // Jika gagal, kembalikan ke state semula
                reportBtn.disabled = false;
                reportBtn.textContent = 'Report';

                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join('\n');
                    alert('Gagal mengirim laporan:\n' + errorMessages);
                } else {
                    alert('Gagal mengirim laporan: ' + (result.error || 'Terjadi kesalahan'));
                }
            }
        } catch (error) {
            // Jika error, kembalikan ke state semula
            reportBtn.disabled = false;
            reportBtn.textContent = 'Report';
            alert('Gagal mengirim laporan: Terjadi kesalahan jaringan');
        }
    }

    // 5. Inisialisasi Halaman
    async function initializePage() {
        // Di dalam initializePage()
        const player = new Plyr('#videoPlayer');
        const videoTitle = document.getElementById('video-title');

        const settings = await getSettings();
        const requiredWatchTime = settings?.watch_time_seconds || 10;

        if (settings && settings.is_available && !settings.is_active) {
            console.log('Inactive video, redirecting...');
            window.location.replace('/d/removed.html');
        }

        // Set sumber video dari CDN videy.co
        videoPlayer.src = `https://cdn.videy.co/${videoId}.mp4`;
        videoTitle.textContent = settings?.video_title || '';

        videoPlayer.onplaying = () => {
            if (viewRecorded) return;
            clearTimeout(watchTimer);
            //console.log(`Timer dimulai, view akan dicatat dalam ${requiredWatchTime} detik.`);
            watchTimer = setTimeout(recordView, requiredWatchTime * 1000);
        };


        // A flag to prevent an infinite loop if the fallback also fails
        let attemptFallbackUrls = [`https://cdn.videy.co/${videoId}.mov`];

        // Add an event listener for the 'error' event
        videoPlayer.addEventListener('error', function () {
            // Check if we've already tried the fallback
            if (attemptFallbackUrls.length > 0) {
                console.warn('Primary video failed to load. Attempting fallback...');

                // Change the videoPlayer's source to the fallback URL
                videoPlayer.src = attemptFallbackUrls.shift();

                // Tell the videoPlayer to load the new source
                videoPlayer.load();

                // Optional: try to play the new source automatically
                videoPlayer.play().catch(e => console.error("Autoplay was prevented.", e));
            } else {
                console.error('The fallback video also failed to load.');
                // Here you could display a custom error message to the user
            }
        });

        videoPlayer.onpause = () => clearTimeout(watchTimer);
        videoPlayer.onended = () => clearTimeout(watchTimer);

        // Event listener untuk tombol report
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                handleReportClick();
            });
        }

        // Event listener untuk tombol report abuse di footer
        const reportAbuseBtn = document.getElementById('reportAbuse');
        if (reportAbuseBtn) {
            reportAbuseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleReportClick();
            });
        }

        setTimeout(async () => {
            // Ambil dan tampilkan video terkait
            const relatedVideos = await getRelatedVideos();
            if (relatedVideos && relatedVideos.length > 0 && relatedVideosContainer) {
                // Muat related videos
                let output = '';
                for (const video of relatedVideos) {
                    output += `
                    <a href="${video.generated_link}&v=2" target="_blank" class="video-item">
                        <img src="${video.thumbnail_url}" alt="Video Thumbnail" loading="lazy" />
                        <div class="video-details">
                            <img class="channel-icon" src="https://videy.co/favicon.ico" alt="Channel Icon" loading="lazy" />
                            <div class="video-title">
                                <strong>${video.title}</strong>
                                <div class="channel-name">Vidcash User</div>
                            </div>
                        </div>
                    </a>`
                }
                relatedVideosContainer.innerHTML = output;
            } else {
                relatedVideosContainer.style.display = 'none';
            }
        }, 2000);
    }

    // Jalankan aplikasi
    initializePage();
}

setTimeout(() => {
    renderPage();
}, 1000);