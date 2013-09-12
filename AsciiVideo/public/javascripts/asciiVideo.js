
var video
  , videoSources = [
      'test.mp4',
      'test2.webm',
      'defragUndead.webm',
      'starCraft.webm',
      'keyGenDance.webm'
  ]
  , characters = "*?&AXRSabcdefghijklmnopqrstuvwxyz".split("")
  , ctx1
  , ctx2
  , offScreenCanvas
  , offScreenCtx
  , renderer = offscreenRendering
  , colorFunc = getColor
  , canvasWidth = 160
  , canvasHeight = 120
  , imageData
  , x
  , y
  , offset
  , color
  , brightness
  , character;

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = { audio: false, video: true };

function userMediaSuccess(stream) {
    video.stream = stream;
    if (window.URL) {
        video.src = window.URL.createObjectURL(stream);
    } else {
        video.src = stream;
    }
    video.play();
}

function userMediaError(error) {
    console.log(error);
}

$(document).ready(function () {
    video = document.createElement('video');
    ctx1 = document.createElement('canvas').getContext('2d');
    ctx2 = document.getElementById('c2').getContext('2d');
    ctx2.fillStyle = "#000";

    offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 970;
    offScreenCanvas.height = 640;
    offScreenCtx = offScreenCanvas.getContext('2d');
    offScreenCtx.font = "10px Verdana";
    
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

    var btnPlay = document.getElementById('btn-play');
    var btnPause = document.getElementById('btn-pause');

    video.addEventListener('play', function () {
        timerCallback();
    }, false);

    btnPlay.addEventListener('click', function () {
        video.src = "/defragUndead.webm";
        video.play();
    }, false);

    btnPause.addEventListener('click', function () {
        video.pause();
    }, false);

    document.getElementById('btn-camera-record').addEventListener('click', function () {
        navigator.getUserMedia(constraints, userMediaSuccess, userMediaError);
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
    
    $('#btn-play-remote-video').on('click', function() {
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
    });
});

function timerCallback() {
    if (video.paused || video.ended) return;

    renderer();

    setTimeout(function () {
        timerCallback();
    }, 0);
}

function offscreenRendering() {
    ctx1.drawImage(video, 0, 0, 120, 90);
    imageData = ctx1.getImageData(0, 0, canvasWidth, canvasHeight);

    var c;
    
    ctx2.fillRect(0, 0, 845, 450);

    var frames = {};
    offScreenCtx.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);
    //var d = new Date();
    for (y = 0; y < canvasHeight; y += 2) {
        for (x = 0; x < canvasWidth; x++) {
            offset = (y * canvasWidth + x) * 4;

            color = getColorAtOffset(imageData.data, offset);

            if ((color.red + color.green + color.blue) < 50) continue;

            var contrastedColor = color;

            brightness = (0.299 * contrastedColor.red + 0.587 * contrastedColor.green + 0.114 * contrastedColor.blue) / 255;

            character = characters[(characters.length - 1) - Math.round(brightness * (characters.length - 1))];

            c = colorFunc(color.red, color.green, color.blue);
            if (!frames[c]) {
                frames[c] = [];
            }
            frames[c].push({ row: y * 5, col: x * 7, char: character });
        }
    }

    offScreenCtx.clearRect(0, 0, 845, 450);
    
    var key, i;
    for (key in frames) {
        offScreenCtx.strokeStyle = key;
        for (i = 0; i < frames[key].length; i++) {
            offScreenCtx.strokeText(frames[key][i].char, frames[key][i].col, frames[key][i].row);
        }
    }

    ctx2.drawImage(offScreenCanvas, 0, 0);
}

function getColorAsGreenScale(r, g, b) {
    var avg = Math.round((r + g + b) / 3);

    return getColor(avg, avg * 2, avg);
}

function getColorAsGrayScale(r, g, b) {
    var avg = Math.round((r + g + b) / 3);

    return getColor(avg, avg, avg);
}

function getColor(r, g, b) {
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