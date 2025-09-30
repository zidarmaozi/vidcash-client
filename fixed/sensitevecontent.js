// script.js

// Tunggu hingga seluruh halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function () {

    // 1. Ambil elemen-elemen yang dibutuhkan dari HTML
    const overlay = document.getElementById('sensitive-overlay');
    const confirmButton = document.getElementById('confirm-button');
    const mainContent = document.getElementById('main-content');

    // 2. Tentukan kunci untuk localStorage
    const storageKey = 'contentWarningConfirmed';

    // -----------------------------------------------------
    // BARU: Buat fungsi untuk memuat script iklan
    // -----------------------------------------------------
    function loadAdsScript() {
        // Cek dulu apakah script sudah pernah dimuat, agar tidak dobel
        if (document.querySelector('script[src="./d/iklan.js"]')) {
            console.log('Script iklan sudah dimuat.');
            return; // Hentikan fungsi jika script sudah ada
        }

        console.log('Memuat script iklan...');
        // Buat elemen <script> baru di memori
        const adScript = document.createElement('script');

        // Atur sumber (source) dari file script yang ingin dimuat
        adScript.src = './d/iklan.js'; // Ganti dengan path yang sesuai

        // Atur agar script dimuat secara asynchronous
        adScript.async = true;

        // Tambahkan elemen script yang baru dibuat ke dalam <head> dokumen
        document.head.appendChild(adScript);

        // Opsional: Anda bisa menambahkan logika setelah script selesai dimuat
        adScript.onload = function () {
            console.log('Script iklan berhasil dimuat dan dieksekusi.');
        };
    }

    // 3. Fungsi untuk menampilkan konten utama
    function showMainContent() {
        overlay.style.display = 'none';
    }

    // // 4. Periksa status di localStorage saat halaman dibuka
    // const isConfirmed = localStorage.getItem(storageKey);

    // if (isConfirmed === 'true') {
    //     showMainContent();
    //     // BARU: Langsung muat script iklan jika pengguna sudah pernah konfirmasi
    //     loadAdsScript();
    // } else {
    //     overlay.style.display = 'flex';
    // }

    // 5. Tambahkan event listener pada tombol konfirmasi
    confirmButton.addEventListener('click', function () {
        localStorage.setItem(storageKey, 'true');
        showMainContent();

        // -----------------------------------------------------------------
        // BARU: Panggil fungsi untuk memuat script iklan setelah tombol diklik
        // -----------------------------------------------------------------
        loadAdsScript();
    });
});