function renderPage() {
    // Ganti dengan URL API Laravel Anda yang sudah live
    const LARAVEL_API_URL = 'https://vidcash.cc/api';

    // --- Elemen UI ---
    const videoPlayer = document.getElementById('videoPlayer');
    const messageArea = document.getElementById('message-area');


    // --- Variabel State ---
    const videoId = localStorage.getItem(window.videoIdKey);
    let viewRecorded = false;
    let watchTimer;

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

    // 4. Fungsi untuk menampilkan modal report
    function showReportModal() {
        // Buat modal HTML
        const modalHTML = `
            <div id="reportModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <h3 style="margin-top: 0; color: #333;">Laporkan Video</h3>
                    <p style="color: #666; margin-bottom: 20px;">Apakah ada masalah dengan video ini? Silakan laporkan kepada kami.</p>
                    
                    <form id="reportForm">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Deskripsi Masalah (Opsional):</label>
                            <textarea id="reportDescription" style="
                                width: 100%;
                                height: 100px;
                                padding: 10px;
                                border: 1px solid #ddd;
                                border-radius: 5px;
                                resize: vertical;
                                font-family: inherit;
                            " placeholder="Jelaskan masalah yang Anda temukan..."></textarea>
                            <small style="color: #666;">Maksimal 1000 karakter</small>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" id="cancelReport" style="
                                padding: 10px 20px;
                                border: 1px solid #ddd;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            ">Batal</button>
                            <button type="submit" id="submitReport" style="
                                padding: 10px 20px;
                                border: none;
                                background: #dc3545;
                                color: white;
                                border-radius: 5px;
                                cursor: pointer;
                            ">Laporkan</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Tambahkan modal ke body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('reportModal');
        const form = document.getElementById('reportForm');
        const description = document.getElementById('reportDescription');
        const cancelBtn = document.getElementById('cancelReport');
        const submitBtn = document.getElementById('submitReport');
        
        // Event listeners
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Mengirim...';
            
            const reportDescription = description.value.trim();
            
            // Validasi panjang deskripsi
            if (reportDescription.length > 1000) {
                alert('Deskripsi tidak boleh lebih dari 1000 karakter.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Laporkan';
                return;
            }
            
            // Kirim report
            const result = await reportVideo(videoId, reportDescription);
            
            if (result.success) {
                alert('Laporan berhasil dikirim! Terima kasih atas feedback Anda.');
                modal.remove();
            } else {
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join('\n');
                    alert('Gagal mengirim laporan:\n' + errorMessages);
                } else {
                    alert('Gagal mengirim laporan: ' + (result.error || 'Terjadi kesalahan'));
                }
                submitBtn.disabled = false;
                submitBtn.textContent = 'Laporkan';
            }
        });
        
        // Focus pada textarea
        setTimeout(() => description.focus(), 100);
    }

    // 5. Inisialisasi Halaman
    async function initializePage() {
        // Di dalam initializePage()
        const player = new Plyr('#videoPlayer');

        const settings = await getSettings();
        const requiredWatchTime = settings?.watch_time_seconds || 10;

        if (settings && !settings.is_active) {
            window.location.replace('/d/removed.html');
        }

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
        
        // Event listener untuk tombol report
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                showReportModal();
            });
        }
        
        // Event listener untuk tombol report abuse di footer
        const reportAbuseBtn = document.getElementById('reportAbuse');
        if (reportAbuseBtn) {
            reportAbuseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showReportModal();
            });
        }
    }

    // Jalankan aplikasi
    initializePage();
}

setTimeout(() => {
    renderPage();
}, 1000);