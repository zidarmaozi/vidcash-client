let target = document.documentElement;
let body = document.body;
let fileInput = document.getElementById("selectedFile");
target.addEventListener('dragover', (e) => {
    if ($(".clickListenerFile")[0]) {
        e.preventDefault();
        body.classList.add('dragging');
    }
});
target.addEventListener('dragleave', () => {
    body.classList.remove('dragging');
});
target.addEventListener('drop', (e) => {
    if ($(".clickListenerFile")[0]) {
        e.preventDefault();
        body.classList.remove('dragging');
        fileInput.files = e.dataTransfer.files;
        upload();
    }
});
window.addEventListener('paste', e => {
    fileInput.files = e.clipboardData.files;
    upload();
});
document.getElementsByClassName("clickListenerFile")[0].onchange = function () {
    upload();
}

function handleClick() {
    if ($(".clickListenerFile")[0]) {
        $(".clickListenerFile").click();
    }
}

const mimeMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/heic': 'heic',
    'image/avif': 'avif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'video/x-msvideo': 'avi',
    'video/x-matroska': 'mkv',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/aac': 'aac',
    'audio/webm': 'weba'
};

function upload() {
    var fileInput = $("#selectedFile")[0].files[0];
    var errorDiv = $(".upload-error");

    // clear any previous error messages
    errorDiv.hide().text('');

    if (fileInput) {
        // validate file type
        if (fileInput.type !== 'video/mp4' && fileInput.type !== 'video/quicktime') {
            if (mimeMap[fileInput.type]) {
                $("#fileTypeModal").show();
            } else {
                $("#unsupportedModal").show();
            }
            $("#selectedFile").val(''); // reset the file input
            return;
        }

        // validate file size (100MB = 100 * 1024 * 1024 bytes)
        var maxFileSize = 100 * 1024 * 1024; // 100MB
        if (fileInput.size > maxFileSize) {
            errorDiv.text("Error: too large, please upload a file less than 100MB").show();
            return;
        }
        var formData = new FormData($('form')[0]);
        $("#selectedFile").removeClass("clickListenerFile");
        $(".box-upload").addClass("animate");

        var visitorId = localStorage.getItem('visitorId') || "";

        $.ajax({
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        $(".box-upload").html(percentComplete + "%");
                        if (percentComplete === 100) {
                            $(".box-upload").html("Processing");
                        }
                    }
                }, false);
                return xhr;
            },
            url: `https://videy.co/api/upload?visitorId=${encodeURIComponent(visitorId)}`,
            type: 'POST',
            context: this,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (result) {
                localStorage.setItem('uploader', true);

                // Buat URL object untuk parsing parameter
                const url = new URL(result.link);
                const videoId = url.searchParams.get("id"); // Ambil nilai id

                // Redirect ke URL baru dengan hanya video ID
                window.location.href = "https://videyin.web.app/v/?id=" + encodeURIComponent(videoId);
            },

            error: function () {
                $(".box-upload").html("Upload a Video");
                $(".box-upload").removeClass("animate");
            }

        });
    }
}