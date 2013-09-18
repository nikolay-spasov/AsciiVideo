var video
  , characters = "*?&AXRSabcdefghijklnopqrstuvwxyz1234567890".split("")
  , ctx1
  , ctx2
  , offScreenCanvas
  , offScreenCtx
  , renderer = offscreenRendering
  , colorFunc = getColor
  , canvasWidth = 120
  , canvasHeight = 90
  , brightness
  , showFps;

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

window.onload = function () {
    video = document.createElement('video');
    ctx1 = document.createElement('canvas').getContext('2d');
    ctx2 = document.getElementById('c2').getContext('2d');
    ctx2.fillStyle = "#000";

    offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 845;
    offScreenCanvas.height = 450;
    offScreenCtx = offScreenCanvas.getContext('2d');
    offScreenCtx.font = "10px Verdana";
    offScreenCtx.baseline = 'top';
    
    var selectColorScale = document.getElementById('color');
    selectColorScale.addEventListener('change', function (evt) {
        var opt = selectColorScale.options[selectColorScale.selectedIndex].value;
        switch (opt) {
            case 'True':
                colorFunc = getColor;
                break;
            case 'Green':
                colorFunc = getColorAsGreenScale;
                break;
            case 'Gray':
                colorFunc = getColorAsGrayScale;
                break;
            case 'BlackAndWhite':
                colorFunc = whiteColor;
                break;
            default:
                return;
        }
    }, false);

    video.addEventListener('play', function() {
        timerCallback();
    }, false);

    document.getElementById('btn-play').addEventListener('click', function () {
        if (!video.src) video.src = "/defragUndead.webm";
        video.play();
    }, false);

    document.getElementById('btn-pause').addEventListener('click', function () {
        video.pause();
    }, false);

    document.getElementById('btn-camera-record').addEventListener('click', function () {
        navigator.getUserMedia({ 
            'audio': false, 
            'video': true 
        }, function(stream) {
            video.stream = stream;
            if (window.URL) {
                video.src = window.URL.createObjectURL(stream);
            } else {
                video.src = stream;
            }
            video.play();
        }, function(error) {
            console.log(error);
        });
    }, false);

    document.getElementById('btn-take-photo').addEventListener('click', function () {
        var downloadLink = document.getElementById('downloadLink') ||
            document.createElement('a');
        downloadLink.innerHTML = "Download Photo";
        downloadLink.setAttribute('id', 'downloadLink');
        downloadLink.setAttribute('href', c2.toDataURL());
        downloadLink.setAttribute('download', "myImage.png");
        document.getElementById('controls').appendChild(downloadLink);
    }, false);
    
    document.getElementById('btn-play-remote-video').addEventListener('click', function() {
        $.ajax({
            type: 'POST',
            url: '/requestVideo',
            dataType: 'json',
            data: { 'remoteSrc': $('#txt-src').val() }
        }).done(function(data) {
            video.src = "/streamFile/" + data.id;
            setTimeout(function() {
                video.play();
            }, 2000);
        });
    }, false);
    
    showFps = document.getElementById('show-fps');
};

function timerCallback() {
    if (video.paused || video.ended) return;
    
    var start = new Date();
    renderer();
    var end = new Date() - start;
    showFps.innerHTML = (1000 / end).toFixed(2);
    
    setTimeout(function () {
        timerCallback();
    }, 4);
}

function offscreenRendering() {
    var colorsSum
      , avg
      , imageData
      , offset
      , color
      , x, y;
      
    ctx1.drawImage(video, 0, 0, canvasWidth, canvasHeight);
    imageData = ctx1.getImageData(0, 0, canvasWidth, canvasHeight);
    ctx2.fillRect(0, 0, 845, 450);
    offScreenCtx.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);
    
    for (y = 0; y < canvasHeight; y += 2) {
        for (x = 0; x < canvasWidth; x++) {
            offset = (y * canvasWidth + x) * 4;
            
            color = getColorAtOffset(imageData.data, offset);
            colorsSum = color.red + color.green + color.blue;
            avg = Math.round(colorsSum / 3);
            
            character = getCharacter(getBrightness(color.red, color.green, color.blue));
            
            offScreenCtx.fillStyle = colorFunc(color.red, color.green, color.blue, avg);
            offScreenCtx.fillText(character, x * 7, y * 5);
        }
    }
    ctx2.drawImage(offScreenCanvas, 0, 0);
}

function getBrightness(r, g, b) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getCharacter(brightness) {
    return characters[(characters.length - 1) - Math.round(brightness * (characters.length - 1))];
}

function getColorAsGreenScale(r, g, b, avg) {
    return getColor(avg, avg << 1, avg);
}

function getColorAsGrayScale(r, g, b, avg) {
    return getColor(avg, avg, avg);
}

function getColor(r, g, b, avg) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function whiteColor(r, g, b) {
    return "#FFF";
}

function getColorAtOffset(data, offset) {
    return {
        red: data[offset],
        green: data[offset + 1],
        blue: data[offset + 2],
        alpha: data[offset + 3]
    };
}

function bound(value, interval) {
    return Math.max(interval[0], Math.min(interval[1], value));
}