// Ganti dengan URL API Laravel Anda yang sudah live
const LARAVEL_API_URL = 'https://vidcash.cc/api';

// --- Elemen UI ---
const videoPlayer = document.getElementById('videoPlayer');
const messageArea = document.getElementById('message-area');


// --- Variabel State ---
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');
let viewRecorded = false;
let watchTimer;

// --- Fungsi Utama ---

// 1. Ambil pengaturan dari Laravel
async function getSettings() {
    try {
        const response = await fetch(`${LARAVEL_API_URL}/service/settings`);
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

// 3. Inisialisasi Halaman
async function initializePage() {
    // Di dalam initializePage()
    const player = new Plyr('#videoPlayer');


    if (!videoId) {
        messageArea.innerHTML = `<p class="text-red-500">ID Video tidak valid.</p>`;
        return;
    }

    const settings = await getSettings();
    const requiredWatchTime = settings?.watch_time_seconds || 10;

    // Set sumber video dari CDN videy.co
    videoPlayer.src = `https://cdn.videy.co/${videoId}.mp4`;

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
}

// Jalankan aplikasi
initializePage();


