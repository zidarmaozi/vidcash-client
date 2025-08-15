// Impor modul Firebase yang diperlukan
import { db } from './config.js';
import { doc, getDoc, runTransaction, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Elemen UI ---
const videoPlayer = document.getElementById('videoPlayer');
const messageArea = document.getElementById('message-area');
const shareButton = document.getElementById('shareButton');
const downloadButton = document.getElementById('downloadButton');
const copyLinkButton = document.getElementById('copyLinkButton');
const reportButton = document.getElementById('reportButton');

// --- Variabel Konfigurasi Global ---
let appConfig = {
    cpm: 10000,
    requiredPlayTime: 10,
    validClickLevel: 5,
    clicksPerIP: 3
};

// --- Variabel Global untuk State Halaman ---
const urlParams = new URLSearchParams(window.location.search);
const videoIdFromParam = urlParams.get('id');
let videoDocPath = null;
let videoOwnerUid = null;
let videoSourceUrl = null;
let viewLoggedForThisSession = false;
let playTimeCounter = 0;
let playIntervalId;
let isMonetizationReady = false;

// --- Inisialisasi Tampilan ---
document.getElementById('copyright-year').textContent = new Date().getFullYear();

// --- Fungsi Bantuan (Helpers) ---
function displayMessage(message, type = "info") {
    messageArea.innerHTML = `
        <div class="p-3 rounded-md text-center ${type === 'success' ? 'bg-green-100 text-green-700' : type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
            ${message}
        </div>`;
}

// --- Logika Inti ---
async function loadGlobalConfig() {
    try {
        const configDocRef = doc(db, "config", "app-settings");
        const configDocSnap = await getDoc(configDocRef);
        if (configDocSnap.exists()) {
            appConfig = { ...appConfig, ...configDocSnap.data() };
        }
    } catch (error) {
        console.error("Gagal memuat konfigurasi:", error);
    }
}

async function loadVideoMetadata_Optimized() {
    if (!videoIdFromParam) return false;
    try {
        const metadataRef = doc(db, "videos_metadata", videoIdFromParam);
        const metadataSnap = await getDoc(metadataRef);

        if (!metadataSnap.exists()) {
            console.warn(`Metadata untuk videoId "${videoIdFromParam}" tidak ditemukan.`);
            return false;
        }

        const metadata = metadataSnap.data();
        videoOwnerUid = metadata.ownerUid;
        videoDocPath = metadata.videoDocPath;

        if (!videoOwnerUid || !videoDocPath) {
            console.error("Data ownerUid atau videoDocPath tidak lengkap di metadata.");
            return false;
        }

        return true;

    } catch (error) {
        console.error("Error saat mengambil metadata video:", error);
        return false;
    }
}

async function logView() {
    if (viewLoggedForThisSession || !isMonetizationReady) return;

    viewLoggedForThisSession = true;
    console.log("[LOG] Memulai transaksi untuk mencatat view...");

    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const thisMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    try {
        const videoRef = doc(db, videoDocPath);
        const userBalanceRef = doc(db, `users/${videoOwnerUid}`);
        const earningsFromThisView = appConfig.cpm / 1000;

        await runTransaction(db, async (transaction) => {
            const dailyViewsField = `daily_stats.${todayDateString}.views`;
            const dailyEarningsField = `daily_stats.${todayDateString}.earnings`;
            const monthlyViewsField = `monthly_stats.${thisMonthString}.views`;
            const monthlyEarningsField = `monthly_stats.${thisMonthString}.earnings`;

            transaction.update(videoRef, {
                views: increment(1),
                earnings: increment(earningsFromThisView),
                lastViewedAt: serverTimestamp(),
                [dailyViewsField]: increment(1),
                [dailyEarningsField]: increment(earningsFromThisView),
                [monthlyViewsField]: increment(1),
                [monthlyEarningsField]: increment(earningsFromThisView)
            });

            transaction.update(userBalanceRef, {
                balance: increment(earningsFromThisView)
            });
        });

        console.log("[SUCCESS] Transaksi berhasil: View, statistik harian, bulanan, dan saldo telah diperbarui.");

    } catch (error) {
        console.error("[ERROR] Transaksi Gagal:", error);
        viewLoggedForThisSession = false; // Izinkan coba lagi jika gagal
    }
}


// --- Event Listeners ---
copyLinkButton.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        copyLinkButton.textContent = 'Copied!';
        setTimeout(() => { copyLinkButton.textContent = 'Copy Link'; }, 2000);
    }).catch(err => console.error('Gagal menyalin link:', err));
});

downloadButton.addEventListener('click', () => {
    if (!videoSourceUrl) {
        alert('Video belum siap untuk diunduh.');
        return;
    }
    const a = document.createElement('a');
    a.href = videoSourceUrl;
    a.download = `${videoIdFromParam || 'video'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

shareButton.addEventListener('click', async () => {
    const shareData = { title: 'Videyin', text: 'Tonton video ini!', url: window.location.href };
    try {
        if (navigator.share) await navigator.share(shareData);
        else alert('Share tidak didukung di browser ini. Silakan salin link.');
    } catch (err) {
        console.error('Error sharing:', err);
    }
});

reportButton.addEventListener('click', () => {
    alert('Fitur "Report" sedang dalam pengembangan. Terima kasih atas pengertian Anda.');
});

/**
 * --- FUNGSI DIPERBARUI ---
 * Logika validasi clicksPerIP dan validClickLevel dikembalikan sesuai permintaan.
 */
videoPlayer.onplaying = () => {
    if (!isMonetizationReady || viewLoggedForThisSession) return;
    clearInterval(playIntervalId);
    playTimeCounter = 0;

    playIntervalId = setInterval(() => {
        playTimeCounter++;
        if (playTimeCounter >= appConfig.requiredPlayTime && !viewLoggedForThisSession) {
            clearInterval(playIntervalId);

            // 1. Validasi berdasarkan IP (melalui localStorage)
            const viewLog = JSON.parse(localStorage.getItem('videyin_view_log')) || {};
            const videoTimestamps = viewLog[videoIdFromParam] || [];
            const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
            const recentViews = videoTimestamps.filter(ts => ts > twentyFourHoursAgo);

            if (recentViews.length >= appConfig.clicksPerIP) {
                console.warn(`Batas view per IP (${appConfig.clicksPerIP}) tercapai.`);
                viewLoggedForThisSession = true;
                return;
            }

            // 2. Jika lolos IP check, catat view attempt ini ke localStorage
            // Ini menghabiskan satu "kesempatan" view untuk IP ini.
            recentViews.push(Date.now());
            viewLog[videoIdFromParam] = recentViews;
            localStorage.setItem('videyin_view_log', JSON.stringify(viewLog));

            // 3. Lakukan validasi level (probabilitas)
            const level = appConfig.validClickLevel;
            const probability = level / 10.0;
            const randomValue = Math.random();

            console.log(`Waktu tonton ${appConfig.requiredPlayTime}s tercapai. Level: ${level}, Peluang: ${probability}, Acak: ${randomValue.toFixed(2)}`);

            if (randomValue < probability) {
                console.log("VALIDASI PELUANG BERHASIL. Mencatat view.");
                logView();
            } else {
                console.log("VALIDASI PELUANG GAGAL. View tidak dicatat.");
            }

            // 4. Tandai sesi ini sudah selesai divalidasi, baik berhasil maupun gagal,
            // untuk mencegah multiple attempts dalam satu kali putar video.
            viewLoggedForThisSession = true;
        }
    }, 1000);
};
videoPlayer.onpause = () => clearInterval(playIntervalId);
videoPlayer.onended = () => clearInterval(playIntervalId);

async function initializePage_Optimized() {
    if (!videoIdFromParam) {
        displayMessage("ID Video tidak ditemukan di URL.", "error");
        if (videoPlayer.parentElement) videoPlayer.parentElement.classList.add('hidden');
        return;
    }

    console.log("Mencoba memuat video dari CDN...");
    videoSourceUrl = `https://cdn.videy.co/${videoIdFromParam}.mp4`;
    videoPlayer.src = videoSourceUrl;
    videoPlayer.load();
    if (videoPlayer.parentElement) videoPlayer.parentElement.classList.remove('hidden');

    try {
        const [_, metadataResult] = await Promise.all([
            loadGlobalConfig(),
            loadVideoMetadata_Optimized()
        ]);

        isMonetizationReady = metadataResult;

        if (isMonetizationReady) {
            console.log("Metadata ditemukan. Monetisasi diaktifkan untuk video ini.");
        } else {
            console.warn("Metadata tidak ditemukan. Video tetap diputar, namun monetisasi dinonaktifkan.");
            // displayMessage("Video ini tidak dimonetisasi.", "info");
        }

    } catch (error) {
        console.error("Terjadi error saat mengambil data monetisasi:", error);
        isMonetizationReady = false;
        displayMessage("Gagal memuat data monetisasi.", "error");
    }
}

// Jalankan semuanya dengan fungsi yang sudah dioptimalkan
initializePage_Optimized();
