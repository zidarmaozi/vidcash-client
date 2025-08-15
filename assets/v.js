var videoLink;
$(document).ready(function () {
    function getParameterByName(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        var results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    var paramValue = getParameterByName('id');
    if (paramValue) {
        var fileType = '.mp4';
        if (paramValue.length === 9 && paramValue[8] === '2') {
            fileType = '.mov';
        }
        videoLink = 'https://cdn.videy.co/' + paramValue + fileType;

        const video = document.getElementById('my-video');
        video.querySelector('source').setAttribute('src', videoLink);
        video.load(); // penting agar video dimuat ulang

        // Inisialisasi FluidPlayer
        fluidPlayer('my-video', {
            layoutControls: {
                fillToContainer: true,
                autoPlay: true
            },
            vastOptions: {
                adList: [
                    {
                        roll: "preRoll",
                        vastTag: "https://s.magsrv.com/v1/vast.php?idzone=5631394"
                    },
                    {
                        roll: "midRoll",
                        vastTag: "https://s.magsrv.com/v1/vast.php?idzone=5631408",
                        timer: 8
                    },
                    {
                        roll: "midRoll",
                        vastTag: "https://s.magsrv.com/v1/vast.php?idzone=5631410",
                        timer: 10
                    },
                    {
                        roll: "postRoll",
                        vastTag: "https://s.magsrv.com/v1/vast.php?idzone=5631394"
                    }
                ],
                nonLinearAdTag: "https://s.magsrv.com/splash.php?idzone=5631412"
            }
        });
    }


    // Logic untuk tombol download dengan iklan direct acak
    const downloadButton = document.getElementById('downloadVideoBtn');

    // DAFTAR URL IKLAN DIRECT ANDA DI SINI
    const directAdUrls = [
        "https://otieu.com/4/9411836", // Ganti dengan direct link Monetag Anda
        "https://filingattenuate.com/rfk49mgx7?key=91b9df8f4f67aed2cd6a70e0e903ee37"     // Ganti dengan direct link Adsterra Anda
    ];

    downloadButton.addEventListener('click', function () {
        // Memilih URL iklan secara acak dari daftar
        const randomIndex = Math.floor(Math.random() * directAdUrls.length);
        const selectedAdUrl = directAdUrls[randomIndex];

        // Membuka iklan direct di tab/jendela baru
        const adWindow = window.open(selectedAdUrl, '_blank');

        // Cek apakah videoLink sudah ada
        if (videoLink) {
            alert('Memulai unduhan video. Ini mungkin memakan waktu sebentar tergantung ukuran video.');

            fetch(videoLink)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `video-<span class="math-inline">\{paramValue\}</span>{fileType}`; // Nama file unduhan
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url); // Membersihkan URL Blob setelah digunakan
                })
                .catch(e => {
                    console.error('Download failed:', e);
                    alert('Gagal mengunduh video. Coba lagi atau laporkan masalah ini.');
                });
        } else {
            alert('Video tidak ditemukan. Tidak bisa mengunduh.');
        }
    });

});