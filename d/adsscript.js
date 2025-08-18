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